// File: supabase/functions/get-market-data/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers are required for the browser to allow the request
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Load secrets from environment
const FMP_API_KEY = Deno.env.get("FMP_API_KEY");

// Define a type for our results for better type safety
interface MarketData {
  pair: string;
  adx: number;
  score: number;
  score_level: "high" | "medium" | "low";
}

// Full trading pairs list
const tradingSymbols = [
  'AUDCAD', 'AUDCHF', 'AUDJPY', 'AUDNZD', 'AUDUSD', 'CADJPY', 'CHFJPY',
  'EURCAD', 'EURCHF', 'EURGBP', 'EURJPY', 'EURNZD', 'EURTRY', 'EURUSD', 'GBPAUD',
  'GBPCAD', 'GBPCHF', 'GBPJPY', 'GBPUSD', 'NZDCAD', 'NZDCHF', 'NZDJPY', 'NZDUSD',
  'USDCAD', 'USDCHF', 'USDJPY', 'USDTRY', 'USDZAR', 'XAUUSD'
];

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    if (!FMP_API_KEY) {
      throw new Error("FMP_API_KEY environment variable not set.");
    }
    
    // Create an array of promises to fetch all data in parallel
    const promises = tradingSymbols.map(async (symbol) => {
      try {
        const base = symbol.substring(0, 3);
        const quote = symbol.substring(3);
        const fmpSymbol = `${base}/${quote}`;

        const res = await fetch(
          `https://financialmodelingprep.com/api/v4/technical_indicator/daily/${fmpSymbol}?period=14&type=adx&apikey=${FMP_API_KEY}`
        );
        
        if (!res.ok) {
           console.error(`API error for ${symbol}: ${res.statusText}`);
           return null; // Skip this symbol on API error
        }

        const tech = await res.json();
        const adxValue = tech?.at(-1)?.adx || 0;

        // Dummy score calculation
        const score =
          (adxValue >= 20 ? 1 : 0) +
          (Math.random() > 0.5 ? 2 : 0) + // COT Bias
          (Math.random() > 0.5 ? 3 : 0) + // Trend confirmation
          (Math.random() > 0.5 ? 2 : 0) + // Entry zone
          (Math.random() > 0.5 ? 1 : 0) + // Price structure
          1; // Spread check

        return {
          pair: fmpSymbol,
          adx: adxValue,
          score,
          score_level: score >= 8 ? "high" : score >= 6 ? "medium" : "low",
        };
      } catch (e: unknown) { // FIX: Type the error as unknown
        // FIX: Check if the error is an instance of Error before accessing .message
        if (e instanceof Error) {
            console.error(`Error processing data for ${symbol}:`, e.message);
        } else {
            console.error(`An unknown error occurred for ${symbol}:`, e);
        }
        return null; // Return null if a specific symbol fails
      }
    });

    // Wait for all fetches to complete
    const results = (await Promise.all(promises)).filter(
      (r): r is MarketData => r !== null
    );

    // Sort by score and return top 10
    results.sort((a, b) => b.score - a.score);

    return new Response(
      JSON.stringify(results.slice(0, 10)), 
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) { // FIX: Type the error as unknown
    console.error(error);
    // FIX: Check if the error is an instance of Error before accessing .message
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});