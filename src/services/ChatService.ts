import { Bot } from "@/hooks/useBots";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class ChatService {
  private static sanitizeText(text: string): string {
    if (!text) return "";
    
    return text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2014/g, "--")
      .replace(/\u2013/g, "-")
      .replace(/\u2026/g, "...")
      .replace(/[^\x00-\x7F]/g, " ");
  }

  static async sendOpenRouterMessage(
    messages: Array<{ role: string; content: string }>,
    bots: Bot,
    abortSignal?: AbortSignal
  ) {
    if (!bots.api_key) {
      throw new Error("OpenRouter API key is missing");
    }

    const sanitizedMessages = messages.map(msg => ({
      ...msg,
      content: this.sanitizeText(msg.content)
    }));

    const sanitizedInstructions = bots.instructions ? this.sanitizeText(bots.instructions) : '';

    try {
      const headers = {
        'Authorization': `Bearer ${bots.api_key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Lovable Chat Interface'
      };

      // Determine if this is a memory operation
      const isMemoryOperation = bots.memory_enabled === true;
      
      // Select the appropriate model based on the operation type
      let modelToUse;
      if (isMemoryOperation && bots.memory_model) {
        modelToUse = bots.memory_model;
        console.log("Using memory model:", modelToUse);
      } else if (!isMemoryOperation && bots.open_router_model) {
        modelToUse = bots.open_router_model;
        console.log("Using chat model:", modelToUse);
      } else {
        throw new Error(isMemoryOperation ? 
          "Memory model not configured" : 
          "OpenRouter model not configured");
      }

      console.log("Bots configuration:", {
        model: bots.model,
        memory_model: bots.memory_model,
        open_router_model: bots.open_router_model,
        isMemoryOperation
      });

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        signal: abortSignal,
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            ...(sanitizedInstructions
              ? [{ role: 'system', content: sanitizedInstructions }]
              : []),
            ...sanitizedMessages,
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenRouter API error:', errorData);
        throw new Error(
          `OpenRouter API error: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Request was cancelled by user');
        return "Message cancelled by user.";
      }
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  static async sendGeminiMessage(
    messages: Array<{ role: string; content: string }>,
    bots: Bot
  ) {
    if (!bots.api_key) {
      throw new Error("Gemini API key is missing. Please check your bots configuration.");
    }

    try {
      const genAI = new GoogleGenerativeAI(bots.api_key);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const fullPrompt = `${bots.instructions}\n\nPrevious messages:\n${messages
        .map((msg) => `${msg.role === "user" ? "User" : bots.name}: ${msg.content}`)
        .join("\n")}`;

      const result = await chat.sendMessage(fullPrompt);
      const response = await result.response.text();
      return response;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(
        `Gemini API error: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      );
    }
  }
}