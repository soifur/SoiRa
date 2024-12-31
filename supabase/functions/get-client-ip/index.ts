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

  const clientIp = req.headers.get('cf-connecting-ip') || 
                  req.headers.get('x-forwarded-for') || 
                  'unknown';
                  
  return new Response(
    JSON.stringify({
      user_ip: clientIp,
    }),
    { 
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      } 
    },
  )
})