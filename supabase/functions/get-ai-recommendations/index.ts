// supabase/functions/get-ai-recommendations/index.ts

import { GoogleGenAI } from "https://esm.sh/@google/generative-ai@0.14.1";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Define CORS headers directly in the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

declare const Deno: any;

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

    let recommendations;
    try {
        // A more robust way to find and parse the JSON array
        const jsonMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
        if (!jsonMatch) {
            throw new Error("No valid JSON array found in the AI response.");
        }
        recommendations = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", text);
      throw new Error("The AI returned a response that was not in the expected JSON format.");
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("❌ Error in get-ai-recommendations:", error.message || error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});