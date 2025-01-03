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
    bot: Bot,
    abortSignal?: AbortSignal
  ) {
    if (!bot.apiKey) {
      throw new Error("OpenRouter API key is missing");
    }

    const sanitizedMessages = messages.map(msg => ({
      ...msg,
      content: this.sanitizeText(msg.content)
    }));

    const sanitizedInstructions = bot.instructions ? this.sanitizeText(bot.instructions) : '';

    try {
      const headers = {
        'Authorization': `Bearer ${bot.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Lovable Chat Interface'
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        signal: abortSignal,
        body: JSON.stringify({
          model: bot.openRouterModel,
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
        console.error('OpenRouter API error response:', errorData);
        throw new Error(
          `OpenRouter API error: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      console.log("OpenRouter raw response:", data);
      
      // Validate the response structure
      if (!data || typeof data !== 'object') {
        console.error('Invalid response format - not an object:', data);
        throw new Error('Invalid response format from OpenRouter API: Response is not an object');
      }

      if (!Array.isArray(data.choices)) {
        console.error('Invalid response format - choices is not an array:', data);
        throw new Error('Invalid response format from OpenRouter API: Choices is not an array');
      }

      if (!data.choices[0] || !data.choices[0].message) {
        console.error('Invalid response format - no message in first choice:', data.choices[0]);
        throw new Error('Invalid response format from OpenRouter API: No message in response');
      }

      if (typeof data.choices[0].message.content !== 'string') {
        console.error('Invalid response format - content is not a string:', data.choices[0].message);
        throw new Error('Invalid response format from OpenRouter API: Message content is not a string');
      }

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
    bot: Bot
  ) {
    if (!bot.apiKey) {
      throw new Error("Gemini API key is missing. Please check your bot configuration.");
    }

    try {
      const genAI = new GoogleGenerativeAI(bot.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      // Combine messages into a single prompt
      const fullPrompt = messages.map(msg => 
        `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      ).join("\n");

      const result = await chat.sendMessage(fullPrompt);
      const response = await result.response.text();
      console.log("Gemini response:", response);
      return response;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(
        `Gemini API error: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      );
    }
  }
}