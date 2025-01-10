import { Bot } from "@/hooks/useBots";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/integrations/supabase/client";
import { extractContextFromMessages, mergeContexts } from "@/utils/contextProcessing";

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

  private static async getSharedBotSettings(botId: string) {
    try {
      const { data: sharedBot, error } = await supabase
        .from('shared_bots')
        .select('*')
        .eq('share_key', botId)
        .single();

      if (error) throw error;
      return sharedBot;
    } catch (error) {
      console.error('Error fetching shared bot settings:', error);
      return null;
    }
  }

  private static async updateMemoryContext(messages: any[], bot: Bot, clientId: string, sessionToken?: string) {
    if (!bot.memory_enabled && !bot.memory_enabled_model) {
      console.log('Memory updates are disabled');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const extractedContext = extractContextFromMessages(messages);
      
      // Handle global memory context
      if (bot.memory_enabled_model) {
        await supabase
          .from('user_context')
          .upsert({
            bot_id: bot.id,
            client_id: clientId,
            session_token: sessionToken,
            context: extractedContext,
            user_id: user?.id,
            is_global: true
          });
      }

      // Handle bot-specific memory context
      if (bot.memory_enabled) {
        await supabase
          .from('user_context')
          .upsert({
            bot_id: bot.id,
            client_id: clientId,
            session_token: sessionToken,
            context: extractedContext,
            user_id: user?.id,
            is_global: false
          });
      }
    } catch (error) {
      console.error('Error updating memory context:', error);
    }
  }

  private static async getCombinedContext(bot: Bot, clientId: string, sessionToken?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      let query = supabase
        .from('user_context')
        .select('combined_context')
        .eq('bot_id', bot.id)
        .eq('user_id', user.id);

      if (bot.memory_enabled && bot.memory_enabled_model) {
        // Get both global and bot-specific context
        query = query.or('is_global.eq.true,is_global.eq.false');
      } else if (bot.memory_enabled) {
        // Get only bot-specific context
        query = query.eq('is_global', false);
      } else if (bot.memory_enabled_model) {
        // Get only global context
        query = query.eq('is_global', true);
      } else {
        return null;
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.[0]?.combined_context || null;
    } catch (error) {
      console.error('Error fetching combined context:', error);
      return null;
    }
  }

  static async sendOpenRouterMessage(
    messages: Array<{ role: string; content: string }>,
    bot: Bot,
    abortSignal?: AbortSignal,
    clientId?: string,
    sessionToken?: string
  ): Promise<string> {
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

    // Get shared bot settings
    const sharedBotSettings = await this.getSharedBotSettings(bot.id);
    if (!sharedBotSettings) {
      throw new Error("Failed to fetch bot settings");
    }

    // Get combined context if memory is enabled
    const combinedContext = await this.getCombinedContext(bot, clientId || '', sessionToken);
    const contextMessage = combinedContext ? {
      role: 'system',
      content: `Previous context: ${JSON.stringify(combinedContext)}`
    } : null;

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
          ...(sanitizedInstructions ? [{ role: 'system', content: sanitizedInstructions }] : []),
          ...(contextMessage ? [contextMessage] : []),
          ...sanitizedMessages,
        ],
        temperature: bot.temperature ?? 1,
        top_p: bot.top_p ?? 1,
        frequency_penalty: bot.frequency_penalty ?? 0,
        presence_penalty: bot.presence_penalty ?? 0,
        max_tokens: bot.max_tokens ?? 4096,
        response_format: bot.response_format || { type: "text" },
        ...(bot.tool_config && bot.tool_config.length > 0 && { tools: bot.tool_config }),
      };

      console.log('OpenRouter request body:', requestBody);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        signal: abortSignal,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenRouter API error response:', errorData);
        if (response.status === 404) {
          throw new Error("OpenRouter API endpoint not found. Please check your configuration.");
        } else if (response.status === 401) {
          throw new Error("Invalid OpenRouter API key. Please check your credentials.");
        } else {
          throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content || content.trim() === "") {
        throw new Error("The bot returned an empty response. Please try again.");
      }

      if (bot.response_format?.type === "json_object") {
        try {
          const jsonResponse = JSON.parse(content);
          return jsonResponse.response || content;
        } catch {
          return content;
        }
      }

      return content;

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
    bot: Bot,
    clientId?: string,
    sessionToken?: string
  ) {
    if (!bot.apiKey) {
      throw new Error("API key is missing. Please check your configuration.");
    }

    // Update memory context if enabled
    if (bot.memory_enabled && clientId) {
      await this.updateMemoryContext(messages, bot, clientId, sessionToken);
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
}
