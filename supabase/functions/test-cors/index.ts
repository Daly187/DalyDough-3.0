// File: supabase/functions/test-cors/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // This handles the browser's permission check
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // If permission is granted, this is the data we send back
  try {
    return new Response(
      JSON.stringify({ message: "Hello from your test function!" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});