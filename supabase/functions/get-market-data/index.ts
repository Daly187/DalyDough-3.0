// supabase/functions/get-market-data/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

declare const Deno: any;

const FMP_API_KEY = Deno.env.get("FMP_API_KEY");

type Trend = "Up" | "Down" | "Neutral";

interface MarketTrend {
  pair: string;
  trendH4: Trend;
  trendD1: Trend;
  trendW1: Trend;
  setupQuality: 'A' | 'B' | 'C';
  conditions: {
    cot: boolean;
    adx: boolean;
    spread: boolean;
  };
  dsize: string;
  breakdown: Record<string, { score: number; value: string }>;
}

// Use FMP's actual symbol format (no slashes)
const tradingSymbols = [
  'AUDCAD', 'AUDCHF', 'AUDJPY', 'AUDNZD', 'AUDUSD', 'CADJPY', 'CHFJPY',
  'EURCAD', 'EURCHF', 'EURGBP', 'EURJPY', 'EURNZD', 'EURUSD', 'GBPAUD',
  'GBPCAD', 'GBPCHF', 'GBPJPY', 'GBPUSD', 'NZDCAD', 'NZDCHF', 'NZDJPY',
  'NZDUSD', 'USDCAD', 'USDCHF', 'USDJPY', 'XAUUSD'
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const safeFetch = async (url: string, retryCount = 0): Promise<any> => {
  try {
    console.log(`Fetching: ${url}`);
    const res = await fetch(url);
    
    if (res.status === 429) {
      if (retryCount < 3) {
        console.log(`Rate limited, retrying in ${(retryCount + 1) * 1000}ms...`);
        await delay((retryCount + 1) * 1000);
        return safeFetch(url, retryCount + 1);
      }
      throw new Error("Rate limit exceeded");
    }
    
    if (!res.ok) {
      console.error(`API error for ${url}: ${res.status} ${res.statusText}`);
      return null;
    }
    
    const data = await res.json();
    
    if (!data) {
      console.warn(`No data returned for ${url}`);
      return null;
    }
    
    if (data["Error Message"]) {
      console.error(`FMP Error for ${url}: ${data["Error Message"]}`);
      return null;
    }
    
    if (Array.isArray(data) && data.length === 0) {
      console.warn(`Empty array returned for ${url}`);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error(`Error fetching ${url}:`, e instanceof Error ? e.message : String(e));
    return null;
  }
}

const getTrend = (data: { close: number }[] | null): Trend => {
  if (!data || data.length < 2) return "Neutral";
  
  // FMP returns newest first for historical data
  const newest = data[0].close;
  const oldest = data[data.length - 1].close;
  
  const percentChange = ((newest - oldest) / oldest) * 100;
  
  if (percentChange > 0.1) return "Up";
  if (percentChange < -0.1) return "Down";
  return "Neutral";
};

const formatPairForDisplay = (symbol: string): string => {
  // Convert EURUSD to EUR/USD format for display
  if (symbol === 'XAUUSD') return 'XAU/USD';
  
  const commonCurrencies = ['EUR', 'GBP', 'USD', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'];
  
  for (const curr of commonCurrencies) {
    if (symbol.startsWith(curr) && symbol.length === 6) {
      const base = symbol.substring(0, 3);
      const quote = symbol.substring(3, 6);
      return `${base}/${quote}`;
    }
  }
  
  return symbol;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!FMP_API_KEY) {
      throw new Error("FMP_API_KEY environment variable not set.");
    }

    console.log("Starting market data fetch...");
    const fmpUrlBase = "https://financialmodelingprep.com/api";
    const results: MarketTrend[] = [];

    // Process symbols in smaller batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < tradingSymbols.length; i += batchSize) {
      const batch = tradingSymbols.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(tradingSymbols.length/batchSize)}`);
      
      const batchPromises = batch.map(async (symbol) => {
        try {
          // Add small delay between requests
          await delay(100);
          
          // Fetch historical price data for trends
          const [dailyCandles, h4Candles, weeklyCandles] = await Promise.all([
            safeFetch(`${fmpUrlBase}/v3/historical-chart/1day/${symbol}?apikey=${FMP_API_KEY}`),
            safeFetch(`${fmpUrlBase}/v3/historical-chart/4hour/${symbol}?apikey=${FMP_API_KEY}`),
            safeFetch(`${fmpUrlBase}/v3/historical-chart/1week/${symbol}?apikey=${FMP_API_KEY}`),
          ]);

          const breakdown: Record<string, { score: number; value: string }> = {};
          let totalScore = 0;

          // Simple volatility check (using daily candles)
          let volatilityScore = 0;
          if (dailyCandles && dailyCandles.length > 0) {
            const recent = dailyCandles.slice(0, 5);
            const avgRange = recent.reduce((sum, candle) => {
              return sum + ((candle.high - candle.low) / candle.close);
            }, 0) / recent.length;
            
            if (avgRange > 0.02) volatilityScore = 3;
            else if (avgRange > 0.01) volatilityScore = 2;
            else volatilityScore = 1;
            
            breakdown['Volatility'] = { 
              score: volatilityScore, 
              value: `${(avgRange * 100).toFixed(2)}%` 
            };
            totalScore += volatilityScore;
          }

          // Volume analysis (if available)
          let volumeScore = 1;
          if (dailyCandles && dailyCandles.length > 1) {
            const recentVolume = dailyCandles[0].volume || 0;
            const avgVolume = dailyCandles.slice(1, 6).reduce((sum, candle) => 
              sum + (candle.volume || 0), 0) / 5;
            
            if (recentVolume > avgVolume * 1.5) volumeScore = 3;
            else if (recentVolume > avgVolume * 1.2) volumeScore = 2;
            
            breakdown['Volume'] = { 
              score: volumeScore, 
              value: recentVolume > avgVolume ? 'Above Avg' : 'Below Avg' 
            };
            totalScore += volumeScore;
          }

          // Trend analysis
          const trendD1 = getTrend(dailyCandles?.slice(0, 5));
          const trendH4 = getTrend(h4Candles?.slice(0, 10));
          const trendW1 = getTrend(weeklyCandles?.slice(0, 3));
          
          let trendScore = 0;
          if (trendW1 === trendD1 && trendD1 === trendH4 && trendW1 !== "Neutral") {
            trendScore = 4;
          } else if (trendD1 === trendH4 && trendD1 !== "Neutral") {
            trendScore = 3;
          } else if (trendD1 !== "Neutral") {
            trendScore = 1;
          }
          
          breakdown['Trend Alignment'] = { 
            score: trendScore, 
            value: `${trendW1}/${trendD1}/${trendH4}` 
          };
          totalScore += trendScore;

          // Price momentum
          let momentumScore = 0;
          if (dailyCandles && dailyCandles.length >= 3) {
            const current = dailyCandles[0].close;
            const previous = dailyCandles[2].close;
            const change = ((current - previous) / previous) * 100;
            
            if (Math.abs(change) > 2) momentumScore = 3;
            else if (Math.abs(change) > 1) momentumScore = 2;
            else momentumScore = 1;
            
            breakdown['Price Momentum'] = { 
              score: momentumScore, 
              value: `${change > 0 ? '+' : ''}${change.toFixed(2)}%` 
            };
            totalScore += momentumScore;
          }

          const dsize = Math.min(totalScore, 10).toFixed(1);
          const setupQuality: 'A' | 'B' | 'C' = totalScore >= 8 ? 'A' : totalScore >= 6 ? 'B' : 'C';

          return {
            pair: formatPairForDisplay(symbol),
            trendH4,
            trendD1,
            trendW1,
            setupQuality,
            conditions: { 
              cot: Math.random() > 0.5, // Placeholder since COT data requires separate endpoint
              adx: volatilityScore > 1, 
              spread: true 
            },
            dsize,
            breakdown,
          };
        } catch (error) {
          console.error(`Error processing ${symbol}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter((r): r is MarketTrend => r !== null));
      
      // Add delay between batches
      if (i + batchSize < tradingSymbols.length) {
        await delay(1000);
      }
    }

    console.log(`Successfully processed ${results.length} symbols`);
    
    // Sort by D-size score
    results.sort((a, b) => parseFloat(b.dsize) - parseFloat(a.dsize));

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Critical error in get-market-data:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ 
      error: errorMessage,
      message: "Failed to fetch market data. Please check your FMP API key and try again."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});