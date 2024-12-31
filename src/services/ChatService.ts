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

  private static summarizeContext(messages: Array<{ role: string; content: string }>) {
    // Get last 10 messages for context
    const recentMessages = messages.slice(-10);
    
    // Create a condensed context string
    return recentMessages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');
  }

  static async sendOpenRouterMessage(
    messages: Array<{ role: string; content: string }>,
    bot: Bot
  ) {
    if (!bot.apiKey) {
      throw new Error("OpenRouter API key is missing");
    }

    const sanitizedMessages = messages.map(msg => ({
      ...msg,
      content: this.sanitizeText(msg.content)
    }));

    const context = this.summarizeContext(sanitizedMessages);
    const sanitizedInstructions = bot.instructions ? this.sanitizeText(bot.instructions) : '';

    const headers = {
      'Authorization': `Bearer ${this.sanitizeText(bot.apiKey)}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': this.sanitizeText(window.location.origin),
      'X-Title': 'SoiRa Chat Interface'
    };

    const response = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: bot.openRouterModel,
        messages: [
          {
            role: "system",
            content: `${sanitizedInstructions}\n\nPrevious context:\n${context}`,
          },
          // Only send the last message to save tokens
          sanitizedMessages[sanitizedMessages.length - 1],
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenRouter API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  static async sendGeminiMessage(
    messages: Array<{ role: string; content: string }>,
    bot: Bot
  ) {
    if (!bot.apiKey) {
      throw new Error("Gemini API key is missing");
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

      const context = this.summarizeContext(messages);
      const fullPrompt = `${bot.instructions}\n\nPrevious context:\n${context}\n\nCurrent message:\n${messages[messages.length - 1].content}`;

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