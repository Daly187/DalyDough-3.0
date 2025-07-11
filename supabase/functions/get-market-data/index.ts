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

const tradingSymbols = [
  'AUD/CAD', 'AUD/CHF', 'AUD/JPY', 'AUD/NZD', 'AUD/USD', 'CAD/JPY', 'CHF/JPY',
  'EUR/CAD', 'EUR/CHF', 'EUR/GBP', 'EUR/JPY', 'EUR/NZD', 'EUR/USD', 'GBP/AUD',
  'GBP/CAD', 'GBP/CHF', 'GBP/JPY', 'GBP/USD', 'NZD/CAD', 'NZD/CHF', 'NZD/JPY',
  'NZD/USD', 'USD/CAD', 'USD/CHF', 'USD/JPY', 'XAU/USD'
];

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

const getTrend = (data: { close: number }[] | null): Trend => {
    if (!data || data.length < 2) return "Neutral";
    // API returns newest first, so we compare the last (oldest) to the first (newest)
    const startPrice = data[data.length - 1].close;
    const endPrice = data[0].close;
    if (endPrice > startPrice * 1.001) return "Up";
    if (endPrice < startPrice * 0.999) return "Down";
    return "Neutral";
};


serve(async (req: Request) => {
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

      // Correctly fetch different timeframes for indicators vs candles
      const [adxData, rsiData, macdData, dailyCandles, h4Candles, weeklyCandles] = await Promise.all([
        safeFetch(`${fmpUrlBase}/v3/technical_indicator/daily/${symbolForApi}?period=14&type=adx&apikey=${FMP_API_KEY}`),
        safeFetch(`${fmpUrlBase}/v3/technical_indicator/daily/${symbolForApi}?period=14&type=rsi&apikey=${FMP_API_KEY}`),
        safeFetch(`${fmpUrlBase}/v3/technical_indicator/daily/${symbolForApi}?type=macd&apikey=${FMP_API_KEY}`),
        safeFetch(`${fmpUrlBase}/v3/historical-chart/daily/${symbolForApi}?limit=5&apikey=${FMP_API_KEY}`),
        safeFetch(`${fmpUrlBase}/v3/historical-chart/4hour/${symbolForApi}?limit=5&apikey=${FMP_API_KEY}`),
        safeFetch(`${fmpUrlBase}/v3/historical-chart/weekly/${symbolForApi}?limit=5&apikey=${FMP_API_KEY}`),
      ]);

      const breakdown: Record<string, { score: number; value: string }> = {};
      let totalScore = 0;

      const adx = adxData?.at(0)?.adx || 0; // Use latest value from daily indicator
      let adxScore = 0;
      if (adx > 25) adxScore = 3; else if (adx > 20) adxScore = 1;
      breakdown['ADX > 25'] = { score: adxScore, value: adx.toFixed(2) };
      totalScore += adxScore;

      const rsi = rsiData?.at(0)?.rsi || 50; // Use latest value
      let rsiScore = 0;
      if (rsi > 70 || rsi < 30) rsiScore = 2; else rsiScore = 1;
      breakdown['RSI (Reversal)'] = { score: rsiScore, value: rsi.toFixed(2) };
      totalScore += rsiScore;

      const macd = macdData?.at(0); // Use latest value
      const macdLine = macd?.macd || 0;
      const signalLine = macd?.signal || 0;
      let macdScore = 0;
      if (macdLine > signalLine) macdScore = 2; else macdScore = 1;
      breakdown['MACD Signal'] = { score: macdScore, value: macdLine > signalLine ? 'Bullish' : 'Bearish' };
      totalScore += macdScore;

      const trendD1 = getTrend(dailyCandles);
      const trendH4 = getTrend(h4Candles);
      const trendW1 = getTrend(weeklyCandles);
      let trendScore = 0;
      if (trendW1 === trendD1 && trendD1 === trendH4 && trendW1 !== "Neutral") trendScore = 4;
      else if (trendD1 === trendH4 && trendD1 !== "Neutral") trendScore = 3;
      else if (trendD1 !== "Neutral") trendScore = 1;
      breakdown['Trend Alignment'] = { score: trendScore, value: `${trendW1}/${trendD1}/${trendH4}` };
      totalScore += trendScore;

      const dsize = totalScore.toFixed(1);
      const setupQuality = totalScore >= 8 ? 'A' : totalScore >= 6 ? 'B' : 'C';

      return {
        pair: fmpSymbol,
        trendH4,
        trendD1,
        trendW1,
        setupQuality,
        conditions: { cot: true, adx: adxScore > 1, spread: true },
        dsize,
        breakdown,
      };
    });

    const results = (await Promise.all(promises)).filter((r): r is MarketTrend => r !== null);
    results.sort((a, b) => parseFloat(b.dsize) - parseFloat(a.dsize));

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Critical error in get-market-data:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});