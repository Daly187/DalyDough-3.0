// supabase/functions/get-real-market-data/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log('🚀 get-real-market-data function initializing...');

// Helper function to create a standardized error response
function createErrorResponse(message, status) {
  console.error(`❌ Error in get-real-market-data: ${message}`);
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: status,
  });
}

// Main function logic
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const fmpApiKey = Deno.env.get('FMP_API_KEY');
    if (!fmpApiKey) {
      return createErrorResponse('FMP_API_KEY is not set in environment variables.', 500);
    }
    
    const fmpUrl = `https://financialmodelingprep.com/api/v3/quote/EURUSD,GBPUSD,USDJPY?apikey=${fmpApiKey}`;
    
    console.log('📡 Fetching data from FMP...');
    const response = await fetch(fmpUrl);

    if (!response.ok) {
      const errorText = await response.text();
      return createErrorResponse(`FMP API request failed with status ${response.status}: ${errorText}`, response.status);
    }

    const data = await response.json();
    console.log('✅ Successfully fetched data from FMP.');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return createErrorResponse(err.message, 500);
  }
});