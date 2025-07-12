// supabase/functions/get-cot-report-history/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

interface CotHistoryItem {
  date: string;
  longPosition: number;
  shortPosition: number;
  netPosition: number;
}

interface CotHistoryData {
  currency: string;
  history: CotHistoryItem[];
}

function generateCotHistory(): CotHistoryData[] {
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
  
  return currencies.map(currency => {
    const history: CotHistoryItem[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7));
      
      const baseLong = Math.floor(Math.random() * 100000) + 50000;
      const baseShort = Math.floor(Math.random() * 80000) + 40000;
      
      history.push({
        date: date.toISOString().split('T')[0],
        longPosition: baseLong,
        shortPosition: baseShort,
        netPosition: baseLong - baseShort
      });
    }
    
    return { currency, history };
  });
}

serve(async (req) => {
  console.log(`📥 Received ${req.method} request to get-cot-report-history`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📊 Generating COT data...');
    
    const cotData = generateCotHistory();
    
    return new Response(
      JSON.stringify(cotData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('❌ Error in get-cot-report-history:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        function: 'get-cot-report-history'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})