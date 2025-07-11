// supabase/functions/get-cot-report-history/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

declare const Deno: any;

serve(async (_req) => {
  if (_req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const fmpKey = Deno.env.get("FMP_API_KEY");
    if (!fmpKey) throw new Error("FMP_API_KEY is not set.");

    const API_BASE = "https://financialmodelingprep.com/api";
    // For the free plan, we can only get a few weeks. For a paid plan, increase the 'from' date range.
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 45); // Go back ~6 weeks
    const from = fromDate.toISOString().split('T')[0];

    const currencies = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'];
    const promises = currencies.map(async (currency) => {
      const res = await fetch(`${API_BASE}/v4/commitment_of_traders_report/${currency}?from=${from}&apikey=${fmpKey}`);
      if (!res.ok) {
          console.error(`Failed to fetch COT for ${currency}: ${res.statusText}`);
          return { currency, history: [] };
      };
      const data = await res.json();
      return { currency, history: data.slice(0, 6) }; // Return latest 6 weeks
    });

    const results = await Promise.all(promises);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});