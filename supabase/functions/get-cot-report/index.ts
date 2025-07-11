// supabase/functions/get-cot-report/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Define CORS headers directly in the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

declare const Deno: any;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const fmpKey = Deno.env.get("FMP_API_KEY");
    if (!fmpKey) throw new Error("FMP_API_KEY not set.");

    const API_BASE = "https://financialmodelingprep.com/api";
    const currencies = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'];

    const cotPromises = currencies.map(async (currency) => {
      const res = await fetch(`${API_BASE}/v4/commitment_of_traders_report_analysis/${currency}?apikey=${fmpKey}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.length === 0) return null;
      const latestReport = data[0];
      return {
        currency,
        longPercent: latestReport.longPercent,
        shortPercent: latestReport.shortPercent,
        netPositions: latestReport.netPosition,
      };
    });
    const cotData = (await Promise.all(cotPromises)).filter(Boolean);
    return new Response(JSON.stringify(cotData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});