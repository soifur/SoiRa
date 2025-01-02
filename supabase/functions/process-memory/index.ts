import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { botId, sessionToken, userId, clientId } = await req.json()
    console.log('Processing memory for:', { botId, sessionToken, userId, clientId })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get memory bot configuration
    const { data: memoryConfig } = await supabase
      .from('user_context')
      .select('context')
      .eq('bot_id', botId)
      .single()

    if (!memoryConfig?.context?.instructions) {
      console.log('No memory configuration found')
      return new Response(
        JSON.stringify({ error: 'No memory configuration found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch chat history
    const query = supabase
      .from('chat_history')
      .select('messages')
      .eq('bot_id', botId)
      .eq('deleted', 'no')

    if (userId) {
      query.eq('user_id', userId)
    } else if (sessionToken) {
      query.eq('session_token', sessionToken)
    } else {
      query.eq('client_id', clientId)
    }

    const { data: chatHistory, error: chatError } = await query

    if (chatError) {
      throw chatError
    }

    // Process messages
    const allMessages = chatHistory
      ?.flatMap(chat => chat.messages)
      ?.map((msg: any) => `${msg.role}: ${msg.content}`)
      ?.join('\n') || ''

    // Use OpenRouter to summarize the context
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${memoryConfig.context.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('SUPABASE_URL') || '',
        'X-Title': 'Memory Bot'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: memoryConfig.context.instructions || 'Summarize the conversation context.'
          },
          {
            role: 'user',
            content: `Please analyze and summarize these messages:\n\n${allMessages}`
          }
        ]
      })
    })

    const summarization = await response.json()
    const context = summarization.choices[0].message.content

    // Update user context
    const { error: updateError } = await supabase
      .from('user_context')
      .upsert({
        bot_id: botId,
        client_id: clientId,
        user_id: userId,
        session_token: sessionToken,
        context: { 
          ...memoryConfig.context,
          summary: context 
        },
        last_updated: new Date().toISOString()
      })

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true, context }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing memory:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})