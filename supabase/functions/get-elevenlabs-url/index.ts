import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { botId } = await req.json()
    
    if (!botId) {
      throw new Error('Bot ID is required')
    }

    const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY')
    if (!ELEVEN_LABS_API_KEY) {
      throw new Error('ELEVEN_LABS_API_KEY is not set')
    }

    // Make request to ElevenLabs API to get signed URL
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${botId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': ELEVEN_LABS_API_KEY,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify({ signed_url: data.signed_url }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})