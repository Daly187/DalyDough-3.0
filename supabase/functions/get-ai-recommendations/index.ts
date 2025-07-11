/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// FIX: Use a URL import that Deno can understand
import { GoogleGenAI } from "https://esm.sh/@google/genai@^0.14.1";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in Supabase environment variables.");
    }

    const genAI = new GoogleGenAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { marketTrends } = await req.json();

    const prompt = `
      Based on the following market trend data, act as an expert forex trading analyst for the "DalyDough" platform.
      Identify the top 4 most promising trading opportunities for today.
      For each opportunity, provide a currency pair, a concise reason for the recommendation, a confidence score (1.0–10.0), and a score level ('high', 'medium', or 'low').

      Market Trends:
      ${JSON.stringify(marketTrends, null, 2)}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // The Gemini model is good at returning JSON, but we parse it safely.
    let recommendations;
    try {
        // Find the start and end of the JSON block
        const jsonString = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
        recommendations = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", text);
      throw new Error("The AI returned a response that was not in the expected JSON format.");
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error in get-ai-recommendations:", error.message || error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});