/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const fmpKey = Deno.env.get("FMP_API_KEY");
const API_BASE = "https://financialmodelingprep.com/api";
const currencies = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'];

serve(async (req) => {
  // This block is the key to fixing the CORS error
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!fmpKey) {
     return new Response(JSON.stringify({ error: "FMP API key not configured." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  try {
    const cotPromises = currencies.map(async (currency) => {
        try {
            const res = await fetch(`${API_BASE}/v4/commitment_of_traders_report_analysis/${currency}?apikey=${fmpKey}`);
            if (!res.ok) {
                 console.warn(`Failed to fetch COT for ${currency}: ${res.status}`);
                 return null;
            }
            const data = await res.json();
            if (!data || data.length === 0 || data["Error Message"]) {
                console.warn(`FMP returned no or error data for COT on ${currency}.`);
                return null;
            }

            const latestReport = data[0];
            return {
                currency,
                longPercent: latestReport.longPercent,
                shortPercent: latestReport.shortPercent,
                netPositions: latestReport.netPosition,
            };
        } catch (e) {
            console.error(`Error processing COT for ${currency}:`, e);
            return null;
        }
    });

    const cotData = (await Promise.all(cotPromises)).filter(d => d !== null);

    return new Response(JSON.stringify(cotData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error in get-cot-report function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});