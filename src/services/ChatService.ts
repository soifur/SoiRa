import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";

export class ChatService {
  static async sendOpenRouterMessage(messages: any[], bot: Bot) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bot.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Lovbots Chat'
      },
      body: JSON.stringify({
        model: bot.openRouterModel || 'mistralai/mistral-7b-instruct',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get response from OpenRouter');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  static async sendGeminiMessage(messages: any[], bot: Bot) {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': bot.apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: messages.map(msg => 
              `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
            ).join('\n\n')
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
          stopSequences: []
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
      throw new Error(error.error?.message || 'Failed to get response from Gemini');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  static async saveChatHistory(chatId: string, botId: string, messages: any[], avatarUrl?: string) {
    try {
      const { data: existingChat } = await supabase
        .from('chat_history')
        .select('avatar_url')
        .eq('id', chatId)
        .single();

      const { error } = await supabase
        .from('chat_history')
        .upsert({
          id: chatId,
          bot_id: botId,
          messages: messages,
          avatar_url: existingChat?.avatar_url || avatarUrl, // Keep existing avatar URL if it exists
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving chat history:", error);
      throw error;
    }
  }
}