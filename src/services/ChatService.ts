import { Bot } from "@/hooks/useBots";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
  role: string;
  content: string;
}

export const sendGeminiMessage = async (message: string, messages: Message[], bot: Bot): Promise<string> => {
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
};

export const sendOpenAIMessage = async (message: string, messages: Message[], bot: Bot): Promise<string> => {
  if (!bot.apiKey) {
    throw new Error("OpenAI API key is missing");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bot.apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        ...(bot.instructions ? [{ role: "system", content: bot.instructions }] : []),
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const sendClaudeMessage = async (message: string, messages: Message[], bot: Bot): Promise<string> => {
  if (!bot.apiKey) {
    throw new Error("Claude API key is missing");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": bot.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-opus-20240229",
      messages: [
        ...(bot.instructions ? [{ role: "system", content: bot.instructions }] : []),
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
};

export const sendOpenRouterMessage = async (message: string, messages: Message[], bot: Bot): Promise<string> => {
  if (!bot.apiKey) {
    throw new Error("OpenRouter API key is missing");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
        ...(bot.instructions ? [{ role: "system", content: bot.instructions }] : []),
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};