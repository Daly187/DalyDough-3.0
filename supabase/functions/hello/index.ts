// supabase/functions/hello/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

console.log("🚀 Hello function starting up...")

serve(async (req) => {
  console.log(`📥 Received ${req.method} request to: ${req.url}`)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log("✅ Handling CORS preflight request")
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    console.log(`🔐 Auth header present: ${!!authHeader}`)
    
    const responseData = { 
      message: "🎉 Hello from DalyDough - Function is working!", 
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      hasAuth: !!authHeader,
      status: "SUCCESS",
      version: "3.0"
    }
    
    console.log("📤 Sending successful response:", responseData)
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    )
    
  } catch (error) {
    console.error("❌ Error in hello function:", error)
    
    const errorResponse = { 
      error: error.message,
      status: "ERROR",
      function: "hello",
      timestamp: new Date().toISOString()
    }
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    )
  }
})