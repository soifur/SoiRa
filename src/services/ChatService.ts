import { Bot } from "@/hooks/useBots";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/integrations/supabase/client";

export class ChatService {
  private static sanitizeText(text: string): string {
    if (!text) return "";
    
    // Replace smart quotes and other special characters with ASCII equivalents
    return text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2014/g, "--")
      .replace(/\u2013/g, "-")
      .replace(/\u2026/g, "...")
      .replace(/[^\x00-\x7F]/g, " "); // Replace any remaining non-ASCII chars with space
  }

  static async getUserMemory(sessionToken: string, botId: string) {
    const { data: chatHistory } = await supabase
      .from('chat_history')
      .select('messages')
      .eq('session_token', sessionToken)
      .eq('bot_id', botId)
      .eq('deleted', 'no')
      .order('created_at', { ascending: true });

    if (!chatHistory?.length) return "";

    // Combine relevant information from past conversations
    const memory = chatHistory.reduce((acc, chat) => {
      const messages = chat.messages as Array<{ role: string; content: string }>;
      return acc + messages.map(m => `${m.role}: ${m.content}\n`).join('');
    }, "");

    return `Previous conversation history:\n${memory}\n`;
  }

  static async sendOpenRouterMessage(
    messages: Array<{ role: string; content: string }>,
    bot: Bot,
    sessionToken?: string
  ) {
    if (!bot.apiKey) {
      throw new Error("OpenRouter API key is missing");
    }

    const sanitizedMessages = messages.map(msg => ({
      ...msg,
      content: this.sanitizeText(msg.content)
    }));

    const sanitizedInstructions = bot.instructions ? this.sanitizeText(bot.instructions) : '';
    const memory = sessionToken ? await this.getUserMemory(sessionToken, bot.id) : '';

    try {
      const headers = {
        'Authorization': `Bearer ${bot.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SoiRa Chat Interface'
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: bot.openRouterModel,
          messages: [
            ...(sanitizedInstructions
              ? [{ role: 'system', content: `${sanitizedInstructions}\n${memory}` }]
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
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  static async sendGeminiMessage(
    messages: Array<{ role: string; content: string }>,
    bot: Bot,
    sessionToken?: string
  ) {
    if (!bot.apiKey) {
      throw new Error("Gemini API key is missing. Please check your bot configuration.");
    }

    try {
      const genAI = new GoogleGenerativeAI(bot.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const memory = sessionToken ? await this.getUserMemory(sessionToken, bot.id) : '';
      
      const chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const fullPrompt = `${bot.instructions}\n${memory}\nPrevious messages:\n${messages
        .map((msg) => `${msg.role === "user" ? "User" : bot.name}: ${msg.content}`)
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