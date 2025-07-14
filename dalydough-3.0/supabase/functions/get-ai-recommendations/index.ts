/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log('🚀 get-ai-recommendations function for Gemini initializing...');

function createErrorResponse(message: string, status: number) {
  console.error(`❌ Error in get-ai-recommendations: ${message}`);
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: status,
  });
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!googleApiKey) {
      return createErrorResponse('GOOGLE_API_KEY is not set in environment variables.', 500);
    }

    const url = new URL(req.url);
    const pair = url.searchParams.get('pair');
    if (!pair) {
      return createErrorResponse('"pair" query parameter is required.', 400);
    }

    console.log(`🧠 Generating Gemini recommendation for ${pair}...`);

    const prompt = `You are a forex trading analyst. Based on current market conditions, should I buy, sell, or hold ${pair}? Respond with only one word: BUY, SELL, or HOLD.`;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${googleApiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 5,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return createErrorResponse(`Google API request failed: ${errorText}`, response.status);
    }

    const data = await response.json();
    const recommendation = data.candidates[0].content.parts[0].text.trim().toUpperCase();

    console.log(`✅ Gemini Recommendation for ${pair}: ${recommendation}`);

    return new Response(JSON.stringify({ pair, recommendation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return createErrorResponse(err.message, 500);
  }
});