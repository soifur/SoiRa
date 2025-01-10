import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/types/chatTypes";

export class ChatService {
  static async sendOpenRouterMessage(
    messages: Message[],
    bot: Bot,
    signal?: AbortSignal,
  ): Promise<string> {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bot.api_key}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Lovable Chat",
        },
        body: JSON.stringify({
          model: bot.open_router_model || "openai/gpt-3.5-turbo",
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: bot.temperature || 1,
          max_tokens: bot.max_tokens || 4096,
          top_p: bot.top_p || 1,
          frequency_penalty: bot.frequency_penalty || 0,
          presence_penalty: bot.presence_penalty || 0,
        }),
        signal
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenRouter API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenRouter API error: ${error.message}`);
      }
      throw error;
    }
  }

  static async sendGeminiMessage(
    messages: Message[],
    bot: Bot
  ): Promise<string> {
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": bot.api_key,
        },
        body: JSON.stringify({
          contents: messages.map(msg => ({
            role: msg.role === "user" ? "USER" : "MODEL",
            parts: [{ text: msg.content }]
          })),
          generationConfig: {
            temperature: bot.temperature || 0.9,
            topK: 1,
            topP: bot.top_p || 1,
            maxOutputTokens: bot.max_tokens || 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || "";
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw error;
    }
  }
}