import { Bot } from "@/hooks/useBots";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ContextManager, UserContext } from "@/utils/contextManager";

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

  private static async enrichPromptWithContext(
    messages: Array<{ role: string; content: string }>,
    context: UserContext,
    bot: Bot
  ): Promise<string> {
    const contextStr = `
Previous context:
${context.recentTopics ? `Recent topics discussed: ${context.recentTopics.join(', ')}` : ''}
${context.userPreferences?.name ? `User's name: ${context.userPreferences.name}` : ''}
${context.userPreferences?.interests ? `User's interests: ${context.userPreferences.interests.join(', ')}` : ''}
${context.keyInsights ? `Key insights: ${context.keyInsights.join(', ')}` : ''}

Instructions: Use this context to provide more personalized responses while keeping the conversation natural.
`;

    return `${bot.instructions}\n\n${contextStr}\n\nPrevious messages:\n${messages
      .map((msg) => `${msg.role === "user" ? "User" : bot.name}: ${msg.content}`)
      .join("\n")}`;
  }

  static async sendOpenRouterMessage(
    messages: Array<{ role: string; content: string }>,
    bot: Bot,
    clientId: string
  ) {
    if (!bot.apiKey) {
      throw new Error("OpenRouter API key is missing");
    }

    const context = await ContextManager.getContext(bot.id, clientId);
    const sanitizedMessages = messages.map(msg => ({
      ...msg,
      content: this.sanitizeText(msg.content)
    }));

    const sanitizedInstructions = bot.instructions ? this.sanitizeText(bot.instructions) : '';
    const enrichedPrompt = await this.enrichPromptWithContext(sanitizedMessages, context, bot);

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
            content: enrichedPrompt,
          },
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
    
    // Update context with the latest message
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const updatedContext = await ContextManager.processMessageForContext(
        lastMessage.content,
        context
      );
      await ContextManager.updateContext(bot.id, clientId, updatedContext);
    }

    return data.choices[0].message.content;
  }

  static async sendGeminiMessage(
    messages: Array<{ role: string; content: string }>,
    bot: Bot,
    clientId: string
  ) {
    if (!bot.apiKey) {
      throw new Error("Gemini API key is missing. Please check your bot configuration.");
    }

    try {
      const context = await ContextManager.getContext(bot.id, clientId);
      const enrichedPrompt = await this.enrichPromptWithContext(messages, context, bot);

      const genAI = new GoogleGenerativeAI(bot.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(enrichedPrompt);
      const response = await result.response.text();

      // Update context with the latest message
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const updatedContext = await ContextManager.processMessageForContext(
          lastMessage.content,
          context
        );
        await ContextManager.updateContext(bot.id, clientId, updatedContext);
      }

      return response;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(
        `Gemini API error: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      );
    }
  }
}