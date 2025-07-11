/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Required for Deno's secure env access
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Get your API key from Supabase env vars (stored in your dashboard)
const ai = new GoogleGenAI({ apiKey: Deno.env.get("API_KEY")! });

// Define structured schema expected from Gemini
const recommendationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      pair: { type: Type.STRING, description: "The currency pair, e.g., 'USD/CAD'." },
      reason: { type: Type.STRING, description: "A brief, compelling reason for the recommendation." },
      score: { type: Type.NUMBER, description: "A confidence score from 1.0 to 10.0." },
      score_level: { type: Type.STRING, description: "A qualitative score level: 'high', 'medium', or 'low'." },
    },
    required: ["pair", "reason", "score", "score_level"],
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { marketTrends } = await req.json();

    const prompt = `
      Based on the following market trend data, act as an expert forex trading analyst for the "DalyDough" platform.
      Identify the top 4 most promising trading opportunities for today.
      For each opportunity, provide:
      - Currency pair
      - Concise reason for the recommendation
      - Confidence score (1.0–10.0)
      - Score level: 'high' (>8.0), 'medium' (6.0–8.0), or 'low' (<6.0)

      Market Trends:
      ${JSON.stringify(marketTrends, null, 2)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recommendationSchema,
      },
    });

    const text = response.text.trim();
    let recommendations;

    try {
      recommendations = JSON.parse(text);
    } catch (parseError) {
      throw new Error("Gemini returned non-JSON response: " + text);
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
