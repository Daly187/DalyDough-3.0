import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header (Supabase requires this)
    const authHeader = req.headers.get('authorization')
    
    return new Response(
      JSON.stringify({ 
        message: "🎉 Hello from DalyDough Fresh Start!", 
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        hasAuth: !!authHeader,
        status: "SUCCESS - Function is working perfectly!"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: "ERROR in function"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})