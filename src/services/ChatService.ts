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
    abortSignal?: AbortSignal,
    onStream?: (chunk: string) => void
  ) {
    console.log("=== OpenRouter Message Start ===");
    console.log("Bot config:", {
      id: bot.id,
      model: bot.model,
      openRouterModel: bot.openRouterModel,
      hasInstructions: !!bot.instructions,
      instructionsPreview: bot.instructions?.substring(0, 100),
      quizMode: bot.quiz_mode
    });

    if (!bot.apiKey) {
      console.error("OpenRouter API key missing for bot:", bot.id);
      throw new Error("OpenRouter API key is missing");
    }

    console.log("Incoming messages:", messages.map(m => ({
      role: m.role,
      contentPreview: m.content.substring(0, 50)
    })));

    const sanitizedMessages = messages.map(msg => ({
      ...msg,
      content: this.sanitizeText(msg.content)
    }));

    const sanitizedInstructions = bot.instructions ? this.sanitizeText(bot.instructions) : '';
    console.log("Sanitized instructions preview:", sanitizedInstructions.substring(0, 100));

    try {
      const headers = {
        'Authorization': `Bearer ${bot.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Lovable Chat Interface'
      };

      const requestBody = {
        model: bot.openRouterModel,
        messages: [
          ...(sanitizedInstructions
            ? [{ role: 'system', content: sanitizedInstructions }]
            : []),
          ...sanitizedMessages,
        ],
        stream: true
      };

      console.log("OpenRouter request configuration:", {
        model: requestBody.model,
        messageCount: requestBody.messages.length,
        hasSystemMessage: sanitizedInstructions ? "yes" : "no",
        systemMessagePreview: sanitizedInstructions ? sanitizedInstructions.substring(0, 50) : "none"
      });

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        signal: abortSignal,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenRouter API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error('Failed to process request');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      let accumulatedResponse = '';
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        buffer += chunk;
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(5).trim();
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                accumulatedResponse += content;
                if (onStream) {
                  onStream(content);
                }
              }
            } catch (e) {
              console.warn('Error parsing streaming response:', e);
            }
          }
        }
      }
      
      console.log("=== OpenRouter Message Complete ===", {
        responseLength: accumulatedResponse.length,
        responsePreview: accumulatedResponse.substring(0, 100)
      });
      
      return accumulatedResponse;

    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log("OpenRouter message cancelled by user");
        return "Message cancelled by user.";
      }
      console.error("OpenRouter error:", error);
      throw error;
    }
  }

  static async sendGeminiMessage(
    messages: Array<{ role: string; content: string }>,
    bot: Bot
  ) {
    console.log("=== Gemini Message Start ===");
    console.log("Bot config:", {
      id: bot.id,
      model: bot.model,
      hasInstructions: !!bot.instructions,
      instructionsPreview: bot.instructions?.substring(0, 100),
      quizMode: bot.quiz_mode
    });

    if (!bot.apiKey) {
      console.error("Gemini API key missing for bot:", bot.id);
      throw new Error("API key is missing. Please check your configuration.");
    }

    console.log("Incoming messages:", messages.map(m => ({
      role: m.role,
      contentPreview: m.content.substring(0, 50)
    })));

    try {
      const genAI = new GoogleGenerativeAI(bot.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const fullPrompt = messages.map(msg => 
        `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      ).join("\n");

      console.log("Gemini full prompt preview:", fullPrompt.substring(0, 200));

      const result = await chat.sendMessage(fullPrompt);
      const response = await result.response.text();

      console.log("=== Gemini Message Complete ===", {
        responseLength: response.length,
        responsePreview: response.substring(0, 100)
      });

      return response;
    } catch (error) {
      console.error("Gemini error:", error);
      throw new Error("Failed to process message");
    }
  }
}