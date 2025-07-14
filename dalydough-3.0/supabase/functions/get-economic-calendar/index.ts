// supabase/functions/get-economic-calendar/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

interface EconomicEvent {
  date: string;
  time: string;
  currency: string;
  event: string;
  importance: 'High' | 'Medium' | 'Low';
  forecast: string;
  previous: string;
  actual?: string;
  country: string;
  source: string;
}

interface FMPEconomicEvent {
  date: string;
  country: string;
  event: string;
  currency: string;
  previous: string;
  estimate: string;
  actual: string;
  change: string;
  changePercentage: string;
  impact: string;
}

interface ForexFactoryEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
}

class EconomicCalendarService {
  private fmpApiKey: string;
  private fmpBaseUrl = 'https://financialmodelingprep.com/api/v3';
  
  constructor(apiKey: string) {
    this.fmpApiKey = apiKey;
  }
  
  async getFMPEconomicCalendar(days: number = 7): Promise<EconomicEvent[]> {
    try {
      console.log(`📅 Fetching FMP economic calendar for next ${days} days...`);
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + days);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const url = `${this.fmpBaseUrl}/economic_calendar?from=${startDateStr}&to=${endDateStr}&apikey=${this.fmpApiKey}`;
      
      console.log(`🔗 FMP Economic Calendar URL: ${url.replace(this.fmpApiKey, '[HIDDEN]')}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`FMP Economic Calendar API error: ${response.status}`);
      }
      
      const data: FMPEconomicEvent[] = await response.json();
      console.log(`✅ FMP returned ${data.length} economic events`);
      
      // Transform FMP data to our format
      return data.map(event => ({
        date: event.date.split(' ')[0],
        time: this.extractTime(event.date),
        currency: event.currency || this.getCurrencyFromCountry(event.country),
        event: event.event,
        importance: this.mapImpactToImportance(event.impact),
        forecast: event.estimate || 'N/A',
        previous: event.previous || 'N/A',
        actual: event.actual || undefined,
        country: event.country,
        source: 'FMP'
      })).filter(event => event.currency && this.isForexRelevant(event.event));
      
    } catch (error) {
      console.error('❌ Error fetching FMP economic calendar:', error);
      return [];
    }
  }
  
  // Alternative: Parse Forex Factory (web scraping approach)
  async getForexFactoryCalendar(): Promise<EconomicEvent[]> {
    try {
      console.log('📅 Attempting to fetch Forex Factory calendar...');
      
      // Note: This is a simplified approach. In production, you'd want to use
      // a proper web scraping service or find an official API
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Forex Factory calendar URL (this would need to be properly scraped)
      const url = `https://nfs.faireconomy.media/ff_calendar_thisweek.json`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Forex Factory API error: ${response.status}`);
      }
      
      const data: ForexFactoryEvent[] = await response.json();
      console.log(`✅ Forex Factory returned ${data.length} events`);
      
      return data.map(event => ({
        date: event.date.split(' ')[0],
        time: this.extractTime(event.date),
        currency: this.getCurrencyFromCountry(event.country),
        event: event.title,
        importance: this.mapImpactToImportance(event.impact),
        forecast: event.forecast || 'N/A',
        previous: event.previous || 'N/A',
        country: event.country,
        source: 'ForexFactory'
      })).filter(event => event.currency);
      
    } catch (error) {
      console.error('❌ Error fetching Forex Factory calendar:', error);
      return [];
    }
  }
  
  // Get comprehensive economic calendar from multiple sources
  async getComprehensiveCalendar(): Promise<EconomicEvent[]> {
    const [fmpEvents, forexFactoryEvents] = await Promise.all([
      this.getFMPEconomicCalendar(),
      this.getForexFactoryCalendar()
    ]);
    
    // Combine and deduplicate events
    const allEvents = [...fmpEvents, ...forexFactoryEvents];
    const uniqueEvents = this.deduplicateEvents(allEvents);
    
    // Sort by date and time
    return uniqueEvents.sort((a, b) => {
      const dateTimeA = new Date(`${a.date} ${a.time}`);
      const dateTimeB = new Date(`${b.date} ${b.time}`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    });
  }
  
  private extractTime(dateTimeStr: string): string {
    const time = dateTimeStr.split(' ')[1];
    if (time) {
      return time.slice(0, 5); // HH:MM format
    }
    return '00:00';
  }
  
  private getCurrencyFromCountry(country: string): string {
    const countryToCurrency: Record<string, string> = {
      'US': 'USD', 'United States': 'USD', 'USA': 'USD',
      'EU': 'EUR', 'European Union': 'EUR', 'Germany': 'EUR', 'France': 'EUR',
      'UK': 'GBP', 'United Kingdom': 'GBP', 'Britain': 'GBP',
      'Japan': 'JPY', 'JP': 'JPY',
      'Australia': 'AUD', 'AU': 'AUD',
      'Canada': 'CAD', 'CA': 'CAD',
      'Switzerland': 'CHF', 'CH': 'CHF',
      'New Zealand': 'NZD', 'NZ': 'NZD'
    };
    
    return countryToCurrency[country] || 'USD';
  }
  
  private mapImpactToImportance(impact: string): 'High' | 'Medium' | 'Low' {
    const impactLower = impact.toLowerCase();
    if (impactLower.includes('high') || impactLower.includes('3')) return 'High';
    if (impactLower.includes('medium') || impactLower.includes('2')) return 'Medium';
    return 'Low';
  }
  
  private isForexRelevant(eventName: string): boolean {
    const forexKeywords = [
      'rate', 'gdp', 'employment', 'inflation', 'cpi', 'ppi', 'retail',
      'manufacturing', 'services', 'trade', 'balance', 'unemployment',
      'nonfarm', 'payrolls', 'pmi', 'consumer', 'producer', 'housing',
      'fed', 'bank', 'monetary', 'policy', 'fomc', 'ecb', 'boe'
    ];
    
    const eventLower = eventName.toLowerCase();
    return forexKeywords.some(keyword => eventLower.includes(keyword));
  }
  
  private deduplicateEvents(events: EconomicEvent[]): EconomicEvent[] {
    const seen = new Set<string>();
    return events.filter(event => {
      const key = `${event.date}-${event.time}-${event.event}-${event.currency}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  // Generate fallback economic events
  generateFallbackEvents(): EconomicEvent[] {
    const events: EconomicEvent[] = [
      {
        date: new Date().toISOString().split('T')[0],
        time: '08:30',
        currency: 'USD',
        event: 'Non-Farm Payrolls',
        importance: 'High',
        forecast: '180K',
        previous: '175K',
        country: 'US',
        source: 'Mock'
      },
      {
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        currency: 'EUR',
        event: 'CPI Flash Estimate',
        importance: 'High',
        forecast: '2.4%',
        previous: '2.2%',
        country: 'EU',
        source: 'Mock'
      },
      {
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        currency: 'GBP',
        event: 'BOE Interest Rate Decision',
        importance: 'High',
        forecast: '5.25%',
        previous: '5.25%',
        country: 'UK',
        source: 'Mock'
      }
    ];
    
    return events;
  }
}

// News impact analysis for trading decisions
function analyzeNewsImpact(events: EconomicEvent[]): {
  highImpactCount: number;
  affectedCurrencies: string[];
  tradingRecommendation: string;
} {
  const highImpactEvents = events.filter(e => e.importance === 'High');
  const affectedCurrencies = [...new Set(events.map(e => e.currency))];
  
  let recommendation = 'Normal trading conditions';
  
  if (highImpactEvents.length > 2) {
    recommendation = 'High volatility expected - trade with caution';
  } else if (highImpactEvents.length > 0) {
    recommendation = 'Moderate volatility expected - monitor key levels';
  }
  
  return {
    highImpactCount: highImpactEvents.length,
    affectedCurrencies,
    tradingRecommendation: recommendation
  };
}

serve(async (req) => {
  console.log(`📥 Received ${req.method} request to get-economic-calendar`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📅 Fetching REAL economic calendar data...');
    
    const fmpApiKey = Deno.env.get('FMP_API_KEY');
    
    if (!fmpApiKey) {
      console.log('⚠️ No FMP API key found, using fallback data');
      const calendarService = new EconomicCalendarService('');
      const fallbackEvents = calendarService.generateFallbackEvents();
      const impact = analyzeNewsImpact(fallbackEvents);
      
      return new Response(
        JSON.stringify({
          events: fallbackEvents,
          impact,
          source: 'fallback',
          lastUpdated: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    const calendarService = new EconomicCalendarService(fmpApiKey);
    const events = await calendarService.getComprehensiveCalendar();
    
    const impact = analyzeNewsImpact(events);
    
    console.log(`✅ Retrieved ${events.length} economic events`);
    console.log(`📊 Impact analysis: ${impact.highImpactCount} high-impact events`);
    
    return new Response(
      JSON.stringify({
        events,
        impact,
        source: 'live',
        lastUpdated: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('❌ Error in get-economic-calendar:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        function: 'get-economic-calendar',
        fallback: 'Using mock calendar data'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})