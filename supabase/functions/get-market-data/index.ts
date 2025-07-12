// supabase/functions/get-market-data/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

interface MarketTrend {
  pair: string;
  trendH4: 'Up' | 'Down' | 'Neutral';
  trendD1: 'Up' | 'Down' | 'Neutral';
  trendW1: 'Up' | 'Down' | 'Neutral';
  setupQuality: 'A' | 'B' | 'C';
  conditions: { cot: boolean; adx: boolean; spread: boolean; };
  dsize: string;
  breakdown: Record<string, { score: number; value: string }>;
}

function generateMarketData(): MarketTrend[] {
  const pairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
    'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'XAU/USD', 'GBP/CHF'
  ];
  
  const trends: ('Up' | 'Down' | 'Neutral')[] = ['Up', 'Down', 'Neutral'];
  
  return pairs.map(pair => {
    const dsize = (Math.random() * 10).toFixed(1);
    const score = parseFloat(dsize);
    
    return {
      pair,
      trendH4: trends[Math.floor(Math.random() * trends.length)],
      trendD1: trends[Math.floor(Math.random() * trends.length)],
      trendW1: trends[Math.floor(Math.random() * trends.length)],
      setupQuality: score >= 8 ? 'A' : score >= 6 ? 'B' : 'C',
      conditions: {
        cot: Math.random() > 0.5,
        adx: Math.random() > 0.4,
        spread: Math.random() > 0.6
      },
      dsize,
      breakdown: {
        'Trend Alignment': { score: Math.floor(Math.random() * 3), value: 'Strong' },
        'COT Sentiment': { score: Math.floor(Math.random() * 2), value: 'Bullish' },
        'ADX Strength': { score: Math.floor(Math.random() * 2), value: '45.2' }
      }
    };
  }).sort((a, b) => parseFloat(b.dsize) - parseFloat(a.dsize));
}

console.log("🚀 get-market-data function starting up...")

serve(async (req) => {
  console.log(`📥 Received ${req.method} request to get-market-data`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Generating market data...');
    
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    
    const marketData = generateMarketData();
    
    console.log(`✅ Generated ${marketData.length} market trends`);
    
    return new Response(
      JSON.stringify(marketData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('❌ Error in get-market-data:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        function: 'get-market-data'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})