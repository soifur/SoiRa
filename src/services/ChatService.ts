import { Bot } from "@/hooks/useBots";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class ChatService {
  private static sanitizeText(text: string): string {
    // Replace smart quotes with straight quotes
    return text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      // Replace other problematic characters
      .replace(/[^\x00-\x7F]/g, char => {
        // Common replacements for non-ASCII characters
        const replacements: { [key: string]: string } = {
          "\u2014": "-",    // em dash
          "\u2013": "-",    // en dash
          "\u2018": "'",    // left single quote
          "\u2019": "'",    // right single quote
          "\u201C": '"',    // left double quote
          "\u201D": '"',    // right double quote
          "\u2026": "...",  // ellipsis
        };
        return replacements[char] || " ";
      });
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

    const sanitizedInstructions = bot.instructions ? this.sanitizeText(bot.instructions) : '';

    const response = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bot.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "SoiRa Chat Interface",
      },
      body: JSON.stringify({
        model: bot.openRouterModel,
        messages: [
          ...(sanitizedInstructions
            ? [
                {
                  role: "system",
                  content: sanitizedInstructions,
                },
              ]
            : []),
          ...sanitizedMessages,
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

      const fullPrompt = `${bot.instructions}\n\nPrevious messages:\n${messages
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