// File: supabase/functions/get-market-data/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "shared/cors.ts";

declare const Deno: any;

// Load secrets from environment. This key MUST be set in your Supabase project dashboard.
const FMP_API_KEY = Deno.env.get("FMP_API_KEY");

// Define a type for our results for better type safety
interface MarketTrend {
  pair: string;
  trendH4: "Up" | "Down" | "Neutral";
  trendD1: "Up" | "Down" | "Neutral";
  setupQuality: 'A' | 'B' | 'C';
  conditions: {
    cot: boolean;
    adx: boolean;
    spread: boolean;
  };
  dsize: string; // The final score
  breakdown: Record<string, { score: number; value: string }>;
}

const tradingSymbols = [
  'AUD/CAD', 'AUD/CHF', 'AUD/JPY', 'AUD/NZD', 'AUD/USD', 'CAD/JPY', 'CHF/JPY',
  'EUR/CAD', 'EUR/CHF', 'EUR/GBP', 'EUR/JPY', 'EUR/NZD', 'EUR/USD', 'GBP/AUD',
  'GBP/CAD', 'GBP/CHF', 'GBP/JPY', 'GBP/USD', 'NZD/CAD', 'NZD/CHF', 'NZD/JPY',
  'NZD/USD', 'USD/CAD', 'USD/CHF', 'USD/JPY', 'XAU/USD'
];

// Helper to fetch data safely
const safeFetch = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`API error for ${url}: ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    if (!data || data.length === 0 || data["Error Message"]) {
      console.warn(`FMP returned no or error data for ${url}.`);
      return null;
    }
    return data;
  } catch (e) {
    console.error(`Error fetching ${url}:`, e instanceof Error ? e.message : String(e));
    return null;
  }
}

// Helper to determine trend from historical data
const getTrend = (data: { close: number }[] | null): "Up" | "Down" | "Neutral" => {
    if (!data || data.length < 2) return "Neutral";
    const startPrice = data[data.length - 1].close; // oldest
    const endPrice = data[0].close; // newest
    if (endPrice > startPrice * 1.001) return "Up";
    if (endPrice < startPrice * 0.999) return "Down";
    return "Neutral";
};


serve(async (req: Request) => {
  // This block handles the CORS preflight request from the browser. It's essential.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!FMP_API_KEY) {
      throw new Error("FMP_API_KEY environment variable not set.");
    }
    
    const fmpUrlBase = "https://financialmodelingprep.com/api";

    const promises = tradingSymbols.map(async (fmpSymbol) => {
      const symbolForApi = fmpSymbol.replace('/', '');
      
      const [adxData, rsiData, macdData, dailyCandles, h4Candles] = await Promise.all([
        safeFetch(`${fmpUrlBase}/v3/technical_indicator/daily/${symbolForApi}?period=14&type=adx&apikey=${FMP_API_KEY}`),
        safeFetch(`${fmpUrlBase}/v3/technical_indicator/daily/${symbolForApi}?period=14&type=rsi&apikey=${FMP_API_KEY}`),
        safeFetch(`${fmpUrlBase}/v3/technical_indicator/daily/${symbolForApi}?type=macd&apikey=${FMP_API_KEY}`),
        safeFetch(`${fmpUrlBase}/v3/historical-chart/daily/${symbolForApi}?limit=5&apikey=${FMP_API_KEY}`),
        safeFetch(`${fmpUrlBase}/v3/historical-chart/4hour/${symbolForApi}?limit=5&apikey=${FMP_API_KEY}`),
      ]);

      const breakdown: Record<string, { score: number; value: string }> = {};
      let totalScore = 0;

      const adx = adxData?.at(-1)?.adx || 0;
      let adxScore = 0;
      if (adx > 25) adxScore = 3;
      else if (adx > 20) adxScore = 1;
      breakdown['ADX > 25'] = { score: adxScore, value: adx.toFixed(2) };
      totalScore += adxScore;
      
      const rsi = rsiData?.at(-1)?.rsi || 50;
      let rsiScore = 0;
      if (rsi > 70 || rsi < 30) rsiScore = 2;
      else rsiScore = 1;
      breakdown['RSI (Reversal)'] = { score: rsiScore, value: rsi.toFixed(2) };
      totalScore += rsiScore;

      const macd = macdData?.at(-1);
      const macdLine = macd?.macd || 0;
      const signalLine = macd?.signal || 0;
      let macdScore = 0;
      if (macdLine > signalLine) macdScore = 2;
      else macdScore = 1;
      breakdown['MACD Signal'] = { score: macdScore, value: macdLine > signalLine ? 'Bullish' : 'Bearish' };
      totalScore += macdScore;

      const trendD1 = getTrend(dailyCandles);
      const trendH4 = getTrend(h4Candles);
      let trendScore = 0;
      if (trendD1 === trendH4 && trendD1 !== "Neutral") trendScore = 3;
      else if (trendD1 !== "Neutral") trendScore = 1;
      breakdown['Trend Alignment'] = { score: trendScore, value: `${trendH4}/${trendD1}` };
      totalScore += trendScore;

      const dsize = totalScore.toFixed(1);
      const setupQuality = totalScore >= 8 ? 'A' : totalScore >= 6 ? 'B' : 'C';

      return {
        pair: fmpSymbol,
        trendH4,
        trendD1,
        setupQuality,
        conditions: {
          cot: true,
          adx: adxScore > 1,
          spread: true,
        },
        dsize,
        breakdown,
      };
    });

    const results = (await Promise.all(promises)).filter(
      (r): r is MarketTrend => r !== null
    );

    results.sort((a, b) => parseFloat(b.dsize) - parseFloat(a.dsize));

    return new Response(
      JSON.stringify(results), 
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Critical error in get-market-data:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});