import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Standard CORS headers to allow browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Interface for the structured forex data we expect from APIs
interface ForexQuote {
  pair: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  high: number;
  low: number;
  timestamp: string;
  source: string;
}

class RealMarketDataService {
  private apiKeys: Record<string, string>;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 30000; // Cache data for 30 seconds

  constructor() {
    // Load API keys from environment variables
    this.apiKeys = {
      fmp: Deno.env.get('FMP_API_KEY') || '',
      alphavantage: Deno.env.get('ALPHAVANTAGE_API_KEY') || '',
      exchangerate: Deno.env.get('EXCHANGERATE_API_KEY') || '',
      fixer: Deno.env.get('FIXER_API_KEY') || ''
    };
    
    console.log('🚀 Real Market Data Service initialized');
    this.logAPIKeyStatus();
  }

  // Logs the status of the API keys to help with debugging
  private logAPIKeyStatus() {
    const keyStatus = Object.entries(this.apiKeys).map(([name, key]) => ({
      provider: name,
      hasKey: !!(key && key.length > 10), // Basic check for a valid-looking key
    }));
    
    console.log('🔑 API Key Status:', keyStatus);
    const validKeys = keyStatus.filter(k => k.hasKey).length;
    
    if (validKeys === 0) {
      console.error('❌ NO VALID API KEYS FOUND! Please set them as environment variables.');
    } else {
      console.log(`✅ Found ${validKeys} valid API key(s)`);
    }
  }

  // Gets data from cache if it's recent
  private getCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log(`📦 Using cached data for key: ${key}`);
      return cached.data;
    }
    return null;
  }

  // Saves data to the cache
  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Fetches real forex quotes from a list of providers
  async getRealForexQuotes(): Promise<ForexQuote[]> {
    const cacheKey = 'real_forex_quotes';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    // List of data providers to try in order of preference
    const providers = [
      { name: 'fmp', method: this.getFMPQuotes.bind(this) },
      { name: 'alphavantage', method: this.getAlphaVantageQuotes.bind(this) },
      { name: 'exchangerate', method: this.getExchangeRateQuotes.bind(this) },
      { name: 'fixer', method: this.getFixerQuotes.bind(this) }
    ];

    for (const provider of providers) {
      if (!this.apiKeys[provider.name]) {
        console.log(`⏭️ Skipping ${provider.name} - no API key`);
        continue;
      }

      try {
        console.log(`🔄 Trying data provider: ${provider.name}...`);
        const quotes = await provider.method();
        
        if (quotes && quotes.length > 0) {
          console.log(`✅ Successfully fetched ${quotes.length} quotes from ${provider.name}`);
          this.setCache(cacheKey, quotes);
          return quotes;
        }
      } catch (error) {
        console.error(`❌ ${provider.name} failed:`, error.message);
      }
    }

    // If all providers fail, throw an error
    throw new Error('All forex data providers failed. No real data is available.');
  }
  
  // Fetches quotes from FinancialModelingPrep
  private async getFMPQuotes(): Promise<ForexQuote[]> {
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'XAUUSD'];
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/${pairs.join(',')}?apikey=${this.apiKeys.fmp}`
    );

    if (!response.ok) throw new Error(`FMP API error: ${response.statusText}`);
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('FMP returned no data');

    return data.map((q: any) => ({
      pair: this.formatPair(q.symbol),
      price: parseFloat(q.price) || 0,
      change: parseFloat(q.change) || 0,
      changePercent: parseFloat(q.changesPercentage) || 0,
      volume: parseFloat(q.volume) || 0,
      high: parseFloat(q.dayHigh) || 0,
      low: parseFloat(q.dayLow) || 0,
      timestamp: new Date(q.timestamp * 1000).toISOString(),
      source: 'FMP'
    })).filter(q => q.price > 0);
  }

  // Fetches quotes from Alpha Vantage
  private async getAlphaVantageQuotes(): Promise<ForexQuote[]> {
    const pairs = [{ from: 'EUR', to: 'USD' }, { from: 'GBP', to: 'USD' }, { from: 'USD', to: 'JPY' }];
    const quotes: ForexQuote[] = [];

    for (const { from, to } of pairs) {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${this.apiKeys.alphavantage}`
      );
      if (!response.ok) continue;

      const data = await response.json();
      const rate = data['Realtime Currency Exchange Rate'];
      if (rate) {
        quotes.push({
          pair: this.formatPair(`${from}${to}`),
          price: parseFloat(rate['5. Exchange Rate']),
          change: 0, // Note: This API does not provide change data
          changePercent: 0,
          high: 0,
          low: 0,
          timestamp: new Date(rate['6. Last Refreshed']).toISOString(),
          source: 'AlphaVantage'
        });
      }
       // Alpha Vantage has a strict rate limit
      await new Promise(resolve => setTimeout(resolve, 13000));
    }
    
    if (quotes.length === 0) throw new Error('AlphaVantage returned no valid quotes');
    return quotes;
  }
  
  // Fetches quotes from ExchangeRate-API
  private async getExchangeRateQuotes(): Promise<ForexQuote[]> {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${this.apiKeys.exchangerate}/latest/USD`);
    if (!response.ok) throw new Error(`ExchangeRate-API error: ${response.statusText}`);
    
    const data = await response.json();
    if (data.result !== 'success') throw new Error(`ExchangeRate-API error: ${data['error-type']}`);
    
    const rates = data.conversion_rates;
    const timestamp = new Date(data.time_last_update_unix * 1000).toISOString();
    const quotes: ForexQuote[] = [];
    const relevantPairs = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
    
    for (const pair of relevantPairs) {
        if (rates[pair]) {
            quotes.push({
                pair: `USD/${pair}`,
                price: rates[pair],
                change: 0, // Note: This API does not provide change data
                changePercent: 0,
                high: 0,
                low: 0,
                timestamp: timestamp,
                source: 'ExchangeRate-API'
            });
        }
    }
    return quotes;
  }
  
  // Fetches quotes from Fixer.io
  private async getFixerQuotes(): Promise<ForexQuote[]> {
      const response = await fetch(
        `http://data.fixer.io/api/latest?access_key=${this.apiKeys.fixer}&base=USD&symbols=EUR,GBP,JPY,AUD,CAD,CHF,NZD`
      );
      if (!response.ok) throw new Error(`Fixer API error: ${response.statusText}`);
      
      const data = await response.json();
      if (!data.success) throw new Error(`Fixer API error: ${data.error?.info}`);

      const rates = data.rates;
      const timestamp = new Date(data.timestamp * 1000).toISOString();
      const quotes: ForexQuote[] = [];

      for(const pair in rates){
          quotes.push({
                pair: `USD/${pair}`,
                price: rates[pair],
                change: 0, // Note: This API does not provide change data
                changePercent: 0,
                high: 0,
                low: 0,
                timestamp: timestamp,
                source: 'Fixer.io'
          });
      }
      return quotes;
  }

  // Helper to format currency pair symbols consistently
  private formatPair(symbol: string): string {
    if (symbol.length === 6 && !symbol.includes('/')) {
      return `${symbol.slice(0, 3)}/${symbol.slice(3)}`;
    }
    return symbol;
  }
}

// Main server function that handles incoming requests
serve(async (req) => {
  console.log(`📥 Received ${req.method} request to get-real-market-data`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // No authentication/user check for dev public access!

    // Fetch the real market data
    const marketService = new RealMarketDataService();
    const realQuotes = await marketService.getRealForexQuotes();

    if (realQuotes.length === 0) {
      throw new Error("No real market data could be fetched from any provider.");
    }
    
    console.log(`✅ Returning ${realQuotes.length} real quotes.`);
    
    // Return the successful response
    return new Response(
      JSON.stringify({
        quotes: realQuotes,
        metadata: {
          quoteCount: realQuotes.length,
          timestamp: new Date().toISOString(),
          source: realQuotes[0]?.source // Show the source of the first quote
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('❌ Final error in get-real-market-data:', error);
    
    // Return an error response
    return new Response(
      JSON.stringify({ 
        error: 'Real market data unavailable',
        message: error.message,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 // Use 500 for a general server error
      }
    );
  }
});
