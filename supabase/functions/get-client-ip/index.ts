import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const clientIp = req.headers.get('cf-connecting-ip') || 
                  req.headers.get('x-forwarded-for') || 
                  'unknown';
                  
  return new Response(
    JSON.stringify({
      user_ip: clientIp,
    }),
    { headers: { "Content-Type": "application/json" } },
  )
})