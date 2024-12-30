import { Bot } from "@/hooks/useBots";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class ChatService {
  static async sendOpenRouterMessage(
    messages: Array<{ role: string; content: string }>,
    bot: Bot
  ) {
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
          ...(bot.instructions
            ? [
                {
                  role: "system",
                  content: bot.instructions,
                },
              ]
            : []),
          ...messages,
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
    return result.response.text();
  }
}