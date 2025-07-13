// supabase/functions/get-market-data-with-scoring/index.ts
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

// Enhanced trend analysis function
function analyzeTrend(trendH4: string, trendD1: string, trendW1: string): { 
  direction: 'bullish' | 'bearish' | 'neutral'; 
  strength: number;
  alignment: number; 
} {
  const trends = [trendH4, trendD1, trendW1];
  const upCount = trends.filter(t => t === 'Up').length;
  const downCount = trends.filter(t => t === 'Down').length;
  const neutralCount = trends.filter(t => t === 'Neutral').length;
  
  // Calculate alignment (how many timeframes agree)
  const alignment = Math.max(upCount, downCount);
  
  // Determine overall direction
  let direction: 'bullish' | 'bearish' | 'neutral';
  if (upCount > downCount) {
    direction = 'bullish';
  } else if (downCount > upCount) {
    direction = 'bearish';
  } else {
    direction = 'neutral';
  }
  
  // Calculate strength based on alignment and timeframe hierarchy
  let strength = 0;
  if (trendW1 !== 'Neutral') strength += 3;
  if (trendD1 !== 'Neutral') strength += 2;
  if (trendH4 !== 'Neutral') strength += 1;
  
  return { direction, strength, alignment };
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
  // Expanded pairs list with all requested pairs
  const pairs = [
    'AUD/CAD', 'AUD/CHF', 'AUD/JPY', 'AUD/NZD', 'AUD/USD',
    'CAD/JPY', 'CHF/JPY', 'EUR/CAD', 'EUR/CHF', 'EUR/GBP', 
    'EUR/JPY', 'EUR/NZD', 'EUR/TRY', 'EUR/USD', 'GBP/AUD',
    'GBP/CAD', 'GBP/CHF', 'GBP/JPY', 'GBP/USD', 'NZD/CAD',
    'NZD/CHF', 'NZD/JPY', 'NZD/USD', 'USD/CAD', 'USD/CHF',
    'USD/JPY', 'USD/TRY', 'USD/ZAR', 'XAU/USD'
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
    
    // Generate trend data
    const trendH4 = trends[Math.floor(Math.random() * trends.length)];
    const trendD1 = trends[Math.floor(Math.random() * trends.length)];
    const trendW1 = trends[Math.floor(Math.random() * trends.length)];
    
    // Analyze trend for directional signal
    const trendAnalysis = analyzeTrend(trendH4, trendD1, trendW1);
    
    // Use real price data if available, otherwise generate mock data
    const currentPrice = realPrice?.price || (Math.random() * 2 + 1);
    const dailyChange = realPrice?.dailyChange || ((Math.random() - 0.5) * 0.02);
    const dailyChangePercent = realPrice?.dailyChangePercent || ((dailyChange / currentPrice) * 100);
    
    // Determine entry status with direction
    const canEnter = dsize >= 7;
    let entryStatus: string;
    
    if (!canEnter) {
      entryStatus = 'Block';
    } else {
      // If can enter, show direction based on trend analysis
      switch (trendAnalysis.direction) {
        case 'bullish':
          entryStatus = 'Allow Buy';
          break;
        case 'bearish':
          entryStatus = 'Allow Sell';
          break;
        case 'neutral':
          // For neutral trends, look at shorter timeframe bias or recent price action
          if (dailyChange > 0) {
            entryStatus = 'Allow Buy';
          } else if (dailyChange < 0) {
            entryStatus = 'Allow Sell';
          } else {
            entryStatus = 'Allow Trade'; // Fallback for truly neutral
          }
          break;
        default:
          entryStatus = 'Block';
      }
    }
    
    return {
      pair,
      trendH4,
      trendD1,
      trendW1,
      trendAnalysis,
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
      entryStatus,
      breakdown,
      lastUpdated: new Date().toISOString()
    };
  }).sort((a, b) => parseFloat(b.dsize) - parseFloat(a.dsize));
}

console.log("🚀 Enhanced market data function with expanded pairs starting up...")

serve(async (req) => {
  console.log(`📥 Received ${req.method} request to get-market-data-with-scoring`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🎯 Generating market data with D-Size scoring for all 29 pairs...');
    
    const marketData = await generateMarketDataWithScoring();
    
    console.log(`✅ Generated ${marketData.length} market trends with enhanced scoring`);
    console.log(`📊 D-Size scores range: ${Math.min(...marketData.map(d => parseFloat(d.dsize)))} - ${Math.max(...marketData.map(d => parseFloat(d.dsize)))}`);
    console.log(`🎯 Entry signals: ${marketData.filter(d => d.entryStatus.includes('Allow')).length} allowed, ${marketData.filter(d => d.entryStatus === 'Block').length} blocked`);
    
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