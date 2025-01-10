import { Bot } from "@/hooks/useBots";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/integrations/supabase/client";

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

  private static async getQuizInstructions(bot: Bot): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("Quiz instructions: No authenticated user");
        return null;
      }

      // First check shared_bots table
      const { data: sharedBot } = await supabase
        .from('shared_bots')
        .select('*')
        .eq('bot_id', bot.id)
        .eq('quiz_mode', true)
        .maybeSingle();

      if (sharedBot) {
        const { data: quizResponse } = await supabase
          .from('quiz_responses')
          .select('combined_instructions')
          .eq('bot_id', sharedBot.bot_id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (quizResponse?.combined_instructions) {
          console.log("Quiz instructions found from shared bot");
          return quizResponse.combined_instructions;
        }
      }

      if (bot.quiz_mode) {
        const { data: quizResponse } = await supabase
          .from('quiz_responses')
          .select('combined_instructions')
          .eq('bot_id', bot.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (quizResponse?.combined_instructions) {
          console.log("Quiz instructions found from regular bot");
          return quizResponse.combined_instructions;
        }
      }

      console.log("No quiz instructions found");
      return null;
    } catch (error) {
      console.error("Error fetching quiz instructions:", error);
      return null;
    }
  }

  static async sendOpenRouterMessage(
    messages: Array<{ role: string; content: string }>,
    bot: Bot,
    abortSignal?: AbortSignal,
    onStream?: (chunk: string) => void
  ) {
    if (!bot.apiKey) {
      throw new Error("OpenRouter API key is missing");
    }

    if (!bot.openRouterModel) {
      throw new Error("OpenRouter model is not specified");
    }

    const sanitizedMessages = messages.map(msg => ({
      ...msg,
      content: this.sanitizeText(msg.content)
    }));

    const quizInstructions = await this.getQuizInstructions(bot);
    const instructionsToUse = quizInstructions || bot.instructions;
    const sanitizedInstructions = instructionsToUse ? this.sanitizeText(instructionsToUse) : '';

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
        stream: bot.stream ?? true,
        temperature: bot.temperature ?? 1,
        top_p: bot.top_p ?? 1,
        frequency_penalty: bot.frequency_penalty ?? 0,
        presence_penalty: bot.presence_penalty ?? 0,
        max_tokens: bot.max_tokens ?? 4096,
        response_format: bot.response_format || { type: "text" },
        ...(bot.tool_config && bot.tool_config.length > 0 && { tools: bot.tool_config }),
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        signal: abortSignal,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error("OpenRouter API endpoint not found. Please check your configuration.");
        } else if (response.status === 401) {
          throw new Error("Invalid OpenRouter API key. Please check your credentials.");
        } else {
          throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }
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
                  if (bot.response_format?.type === "json_object") {
                    try {
                      const jsonContent = JSON.parse(content);
                      onStream(jsonContent.response || content);
                    } catch {
                      onStream(content);
                    }
                  } else {
                    onStream(content);
                  }
                }
              }
            } catch (e) {
              console.warn('Error parsing streaming response:', e);
            }
          }
        }
      }
      
      if (bot.response_format?.type === "json_object") {
        try {
          const jsonResponse = JSON.parse(accumulatedResponse);
          return jsonResponse.response || accumulatedResponse;
        } catch {
          return accumulatedResponse;
        }
      }
      
      return accumulatedResponse;

    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return "Message cancelled by user.";
      }
      console.error("OpenRouter API error:", error);
      throw error;
    }
  }

  static async sendGeminiMessage(
    messages: Array<{ role: string; content: string }>,
    bot: Bot
  ) {
    if (!bot.apiKey) {
      throw new Error("API key is missing. Please check your configuration.");
    }

    const quizInstructions = await this.getQuizInstructions(bot);
    console.log("Quiz instructions status for Gemini:", quizInstructions ? "Found" : "Not found");

    const instructionsToUse = quizInstructions || bot.instructions;
    console.log("Instructions status for Gemini:", instructionsToUse ? "Using custom instructions" : "No instructions");

    try {
      const genAI = new GoogleGenerativeAI(bot.apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
          temperature: bot.temperature ?? 1,
          topP: bot.top_p ?? 1,
          maxOutputTokens: bot.max_tokens ?? 4096,
        }
      });

      const chat = model.startChat({
        history: [],
        generationConfig: {
          temperature: bot.temperature ?? 1,
          topP: bot.top_p ?? 1,
          maxOutputTokens: bot.max_tokens ?? 4096,
        },
      });

      const messagesWithInstructions = instructionsToUse
        ? [{ role: 'system', content: instructionsToUse }, ...messages]
        : messages;

      const fullPrompt = messagesWithInstructions.map(msg => 
        `${msg.role === "user" ? "User" : msg.role === "system" ? "System" : "Assistant"}: ${msg.content}`
      ).join("\n");

      const result = await chat.sendMessage(fullPrompt);
      const response = await result.response.text();
      return response;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("Failed to process message");
    }
  }
}