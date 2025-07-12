// supabase/functions/get-ai-recommendations/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

interface AiRecommendation {
  pair: string;
  reason: string;
  score: number;
  score_level: string;
}

function generateRecommendations(): AiRecommendation[] {
  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'XAU/USD'];
  const reasons = [
    "Strong trend alignment across multiple timeframes",
    "COT data shows institutional bullish bias",
    "Technical breakout with high volume confirmation",
    "Economic data supports continued momentum",
    "Key support/resistance levels provide clear entry"
  ];

  return pairs.map(pair => {
    const score = Math.random() * 4 + 6; // 6-10 range
    return {
      pair,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      score: parseFloat(score.toFixed(1)),
      score_level: score >= 8.5 ? 'high' : score >= 7.5 ? 'medium' : 'low'
    };
  }).sort((a, b) => b.score - a.score);
}

serve(async (req) => {
  console.log(`📥 Received ${req.method} request to get-ai-recommendations`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🤖 Generating AI recommendations...');
    
    const recommendations = generateRecommendations();
    
    return new Response(
      JSON.stringify({ recommendations }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('❌ Error in get-ai-recommendations:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        function: 'get-ai-recommendations'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})