import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY')

serve(async (req) => {
  try {
    // Get the bot ID from the request body
    const { botId } = await req.json()
    
    if (!botId) {
      return new Response(
        JSON.stringify({ error: 'Bot ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Make request to ElevenLabs API to get signed URL
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${botId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': ELEVEN_LABS_API_KEY || '',
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify({ signed_url: data.signed_url }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})