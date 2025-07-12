import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

interface ScoringComponents {
  cotBias: { score: number; value: string; description: string };
  trendConfirmation: { score: number; value: string; description: string };
  adxStrength: { score: number; value: string; description: string };
  supportRetest: { score: number; value: string; description: string };
  priceStructure: { score: number; value: string; description: string };
  spreadCheck: { score: number; value: string; description: string };
}

interface FMPQuote {
  symbol: string;
  price: number;
  change: number;
  changesPercentage: number;
  dayLow: number;
  dayHigh: number;
  open: number;
  previousClose: number;
}

// FMP API Service
class FMPApiService {
  private apiKey: string;
  private baseUrl = 'https://financialmodelingprep.com/api/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getForexQuotes(symbols: string[]) {
    try {
      const fmpSymbols = symbols.map(this.convertToFMPSymbol);
      const symbolsQuery = fmpSymbols.join(',');
      
      console.log(`🔍 Fetching FMP data for: ${symbolsQuery}`);
      
      const response = await fetch(
        `${this.baseUrl}/quote/${symbolsQuery}?apikey=${this.apiKey}`
      );

      if (!response.ok) {
        console.warn(`FMP API error: ${response.status}, falling back to mock data`);
        return null;
      }

      const data: FMPQuote[] = await response.json();
      console.log(`✅ FMP returned ${data.length} quotes`);
      
      return data.map(quote => ({
        pair: this.convertFromFMPSymbol(quote.symbol),
        price: quote.price,
        dailyChange: quote.change,
        dailyChangePercent: quote.changesPercentage
      }));

    } catch (error) {
      console.warn('FMP API request failed, using mock data:', error);
      return null;
    }
  }

  private convertToFMPSymbol(pair: string): string {
    return pair.replace('/', '');
  }

  private convertFromFMPSymbol(symbol: string): string {
    if (symbol.length === 6) {
      return `${symbol.slice(0, 3)}/${symbol.slice(3)}`;
    }
    return symbol;
  }
}

// D-Size Scoring Functions
function generateScoringBreakdown(pair: string): ScoringComponents {
  // In production, this would analyze real market data
  const cotScore = Math.random() > 0.6 ? 2 : Math.random() > 0.3 ? 1 : 0;
  const trendScore = Math.floor(Math.random() * 4); // 0-3 based on timeframe alignment
  const adxValue = Math.random() * 50 + 10;
  const adxScore = adxValue >= 20 ? 1 : 0;
  const supportScore = Math.random() > 0.5 ? 2 : Math.random() > 0.3 ? 1 : 0;
  const structureScore = Math.random() > 0.4 ? 1 : 0;
  const spreadValue = Math.random() * 2 + 0.5;
  const spreadScore = spreadValue < 1.5 ? 1 : 0;

  return {
    cotBias: {
      score: cotScore,
      value: cotScore === 2 ? 'Strong Bias' : cotScore === 1 ? 'Weak Bias' : 'No Bias',
      description: 'Weekly directional bias from COT data'
    },
    trendConfirmation: {
      score: trendScore,
      value: `${trendScore}/3 timeframes aligned`,
      description: '+1 for each aligned timeframe (4H, 1D, 1W)'
    },
    adxStrength: {
      score: adxScore,
      value: adxValue.toFixed(1),
      description: 'ADX ≥ 20 confirms healthy trend'
    },
    supportRetest: {
      score: supportScore,
      value: supportScore === 2 ? 'Valid Retest' : supportScore === 1 ? 'Near Support' : 'No Support',
      description: 'Price near confirmed support level'
    },
    priceStructure: {
      score: structureScore,
      value: structureScore ? 'Clean Structure' : 'Choppy Structure',
      description: 'HH/HL or LH/LL pattern confirmed'
    },
    spreadCheck: {
      score: spreadScore,
      value: `${spreadValue.toFixed(1)} pips`,
      description: 'Spread < 1.5 pips ensures low-cost execution'
    }
  };
}

function calculateDSize(breakdown: ScoringComponents): number {
  return breakdown.cotBias.score + 
         breakdown.trendConfirmation.score + 
         breakdown.adxStrength.score + 
         breakdown.supportRetest.score + 
         breakdown.priceStructure.score + 
         breakdown.spreadCheck.score;
}

async function generateMarketDataWithScoring() {
  const pairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
    'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'XAU/USD', 'GBP/CHF'
  ];
  
  const trends: ('Up' | 'Down' | 'Neutral')[] = ['Up', 'Down', 'Neutral'];
  
  // Try to get real price data from FMP
  const fmpApiKey = Deno.env.get('FMP_API_KEY');
  let realPriceData = null;
  
  if (fmpApiKey) {
    console.log('🔍 Attempting to fetch real price data from FMP...');
    const fmpService = new FMPApiService(fmpApiKey);
    realPriceData = await fmpService.getForexQuotes(pairs);
    
    if (realPriceData) {
      console.log(`✅ Successfully fetched real prices for ${realPriceData.length} pairs`);
    }
  } else {
    console.log('⚠️ No FMP API key found, using mock price data');
  }
  
  const priceMap = new Map(realPriceData?.map(p => [p.pair, p]) || []);
  
  return pairs.map(pair => {
    const breakdown = generateScoringBreakdown(pair);
    const dsize = calculateDSize(breakdown);
    const realPrice = priceMap.get(pair);
    
    // Use real price data if available, otherwise generate mock data
    const currentPrice = realPrice?.price || (Math.random() * 2 + 1);
    const dailyChange = realPrice?.dailyChange || ((Math.random() - 0.5) * 0.02);
    const dailyChangePercent = realPrice?.dailyChangePercent || ((dailyChange / currentPrice) * 100);
    
    return {
      pair,
      trendH4: trends[Math.floor(Math.random() * trends.length)],
      trendD1: trends[Math.floor(Math.random() * trends.length)],
      trendW1: trends[Math.floor(Math.random() * trends.length)],
      setupQuality: dsize >= 8 ? 'A' : dsize >= 6 ? 'B' : 'C',
      conditions: {
        cot: breakdown.cotBias.score > 0,
        adx: breakdown.adxStrength.score > 0,
        spread: breakdown.spreadCheck.score > 0
      },
      dsize: dsize.toFixed(1),
      currentPrice,
      dailyChange,
      dailyChangePercent,
      breakdown,
      lastUpdated: new Date().toISOString()
    };
  }).sort((a, b) => parseFloat(b.dsize) - parseFloat(a.dsize));
}

console.log("🚀 Enhanced market data function starting up...")

serve(async (req) => {
  console.log(`📥 Received ${req.method} request to get-market-data-with-scoring`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🎯 Generating market data with D-Size scoring and real prices...');
    
    const marketData = await generateMarketDataWithScoring();
    
    console.log(`✅ Generated ${marketData.length} market trends with enhanced scoring`);
    console.log(`📊 D-Size scores range: ${Math.min(...marketData.map(d => parseFloat(d.dsize)))} - ${Math.max(...marketData.map(d => parseFloat(d.dsize)))}`);
    
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
    console.error('❌ Error in get-market-data-with-scoring:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        function: 'get-market-data-with-scoring'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})
EOF

# Create bot control functions
mkdir -p supabase/functions/update-bot-limits
cat > supabase/functions/update-bot-limits/index.ts << 'EOF'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { botId, type, value } = await req.json();
    
    console.log(`🤖 Updating bot ${botId} ${type.toUpperCase()} to ${value}`);
    
    // TODO: Send update to MT5 via your trading API
    // This would typically update the bot configuration in your database
    // and send a signal to MT5 to update the global SL/TP
    
    return new Response(
      JSON.stringify({ success: true, botId, type, value }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
EOF

mkdir -p supabase/functions/update-bot-config
cat > supabase/functions/update-bot-config/index.ts << 'EOF'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    const { botId } = body;
    
    console.log(`🤖 Updating bot ${botId} configuration:`, body);
    
    // TODO: Update bot configuration in your database
    // and send signal to MT5 if needed
    
    return new Response(
      JSON.stringify({ success: true, botId, updated: body }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
EOF

mkdir -p supabase/functions/close-bot-positions
cat > supabase/functions/close-bot-positions/index.ts << 'EOF'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { botId } = await req.json();
    
    console.log(`🚨 Closing all positions for bot ${botId}`);
    
    // TODO: Send close signal to MT5 for all positions of this bot
    
    return new Response(
      JSON.stringify({ success: true, botId, action: 'close_all' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})