// supabase/functions/mt5-integration/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

interface MT5Account {
  login: string;
  password: string;
  server: string;
  name: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  currency: string;
  leverage: number;
  connected: boolean;
}

interface MT5Position {
  ticket: number;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  profit: number;
  swap: number;
  commission: number;
  openTime: string;
  comment: string;
}

interface MT5OrderRequest {
  action: 'trade';
  symbol: string;
  volume: number;
  type: 'buy' | 'sell' | 'buy_limit' | 'sell_limit' | 'buy_stop' | 'sell_stop';
  price?: number;
  sl?: number;
  tp?: number;
  comment?: string;
  magic?: number;
}

interface MT5OrderResult {
  retcode: number;
  deal?: number;
  order?: number;
  volume?: number;
  price?: number;
  comment?: string;
}

class MT5APIService {
  private apiBaseUrl: string;
  private apiKey: string;
  
  constructor(apiUrl?: string, apiKey?: string) {
    // This would connect to your MT5 API bridge service
    this.apiBaseUrl = apiUrl || Deno.env.get('MT5_API_URL') || 'http://localhost:8080/api/mt5';
    this.apiKey = apiKey || Deno.env.get('MT5_API_KEY') || '';
  }
  
  async connectAccount(login: string, password: string, server: string): Promise<MT5Account> {
    try {
      console.log(`🔌 Connecting to MT5 account ${login} on ${server}...`);
      
      const response = await fetch(`${this.apiBaseUrl}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ login, password, server })
      });
      
      if (!response.ok) {
        throw new Error(`MT5 connection failed: ${response.status}`);
      }
      
      const accountInfo: MT5Account = await response.json();
      console.log(`✅ Connected to MT5 account: ${login}`);
      
      return accountInfo;
      
    } catch (error) {
      console.error(`❌ MT5 connection error:`, error);
      throw error;
    }
  }
  
  async getAccountInfo(login: string): Promise<MT5Account> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/account/${login}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get account info: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('❌ Error getting account info:', error);
      throw error;
    }
  }
  
  async getPositions(login: string): Promise<MT5Position[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/positions/${login}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get positions: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('❌ Error getting positions:', error);
      throw error;
    }
  }
  
  async sendOrder(login: string, order: MT5OrderRequest): Promise<MT5OrderResult> {
    try {
      console.log(`📈 Sending ${order.type} order for ${order.symbol}: ${order.volume} lots`);
      
      const response = await fetch(`${this.apiBaseUrl}/order/${login}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(order)
      });
      
      if (!response.ok) {
        throw new Error(`Order failed: ${response.status}`);
      }
      
      const result: MT5OrderResult = await response.json();
      console.log(`✅ Order executed: ${result.retcode}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error sending order:', error);
      throw error;
    }
  }
  
  async closePosition(login: string, ticket: number): Promise<MT5OrderResult> {
    try {
      console.log(`🔚 Closing position ${ticket}...`);
      
      const response = await fetch(`${this.apiBaseUrl}/close/${login}/${ticket}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Close position failed: ${response.status}`);
      }
      
      const result: MT5OrderResult = await response.json();
      console.log(`✅ Position closed: ${result.retcode}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error closing position:', error);
      throw error;
    }
  }
  
  async modifyPosition(login: string, ticket: number, sl?: number, tp?: number): Promise<MT5OrderResult> {
    try {
      console.log(`✏️ Modifying position ${ticket}...`);
      
      const response = await fetch(`${this.apiBaseUrl}/modify/${login}/${ticket}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ sl, tp })
      });
      
      if (!response.ok) {
        throw new Error(`Modify position failed: ${response.status}`);
      }
      
      const result: MT5OrderResult = await response.json();
      console.log(`✅ Position modified: ${result.retcode}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error modifying position:', error);
      throw error;
    }
  }
  
  // Demo/Mock implementation for testing
  generateMockAccount(login: string): MT5Account {
    return {
      login,
      password: '***',
      server: 'Demo-Server',
      name: 'Demo Account',
      balance: 10000,
      equity: 10000 + (Math.random() - 0.5) * 1000,
      margin: Math.random() * 500,
      freeMargin: 9500,
      marginLevel: 2000 + Math.random() * 1000,
      currency: 'USD',
      leverage: 500,
      connected: true
    };
  }
  
  generateMockPositions(): MT5Position[] {
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
    const positions: MT5Position[] = [];
    
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const type = Math.random() > 0.5 ? 'buy' : 'sell';
      const openPrice = 1.0500 + Math.random() * 0.1;
      const currentPrice = openPrice + (Math.random() - 0.5) * 0.01;
      const volume = Math.round(Math.random() * 100) / 100 + 0.01;
      
      positions.push({
        ticket: 12345678 + i,
        symbol,
        type,
        volume,
        openPrice,
        currentPrice,
        stopLoss: type === 'buy' ? openPrice - 0.005 : openPrice + 0.005,
        takeProfit: type === 'buy' ? openPrice + 0.01 : openPrice - 0.01,
        profit: (type === 'buy' ? currentPrice - openPrice : openPrice - currentPrice) * volume * 100000,
        swap: -0.5,
        commission: -0.7,
        openTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        comment: 'DalyDough Bot'
      });
    }
    
    return positions;
  }
}

// MT5 integration endpoints
serve(async (req) => {
  console.log(`📥 Received ${req.method} request to mt5-integration`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const mt5Service = new MT5APIService();
    
    switch (action) {
      case 'connect': {
        const { login, password, server } = await req.json();
        
        try {
          // Try real MT5 connection first
          const account = await mt5Service.connectAccount(login, password, server);
          return new Response(
            JSON.stringify({ success: true, account, source: 'real' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          // Fallback to mock for demo purposes
          console.log('🎭 Using mock MT5 account for demo...');
          const mockAccount = mt5Service.generateMockAccount(login);
          return new Response(
            JSON.stringify({ success: true, account: mockAccount, source: 'mock' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      case 'account_info': {
        const login = url.searchParams.get('login');
        if (!login) {
          throw new Error('Login required');
        }
        
        try {
          const account = await mt5Service.getAccountInfo(login);
          return new Response(
            JSON.stringify({ success: true, account, source: 'real' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          const mockAccount = mt5Service.generateMockAccount(login);
          return new Response(
            JSON.stringify({ success: true, account: mockAccount, source: 'mock' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      case 'positions': {
        const login = url.searchParams.get('login');
        if (!login) {
          throw new Error('Login required');
        }
        
        try {
          const positions = await mt5Service.getPositions(login);
          return new Response(
            JSON.stringify({ success: true, positions, source: 'real' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          const mockPositions = mt5Service.generateMockPositions();
          return new Response(
            JSON.stringify({ success: true, positions: mockPositions, source: 'mock' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      case 'send_order': {
        const { login, order } = await req.json();
        
        try {
          const result = await mt5Service.sendOrder(login, order);
          return new Response(
            JSON.stringify({ success: true, result, source: 'real' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          // Mock successful order for demo
          const mockResult: MT5OrderResult = {
            retcode: 10009, // TRADE_RETCODE_DONE
            deal: Math.floor(Math.random() * 1000000),
            order: Math.floor(Math.random() * 1000000),
            volume: order.volume,
            price: order.price || 1.0850,
            comment: 'Mock order executed'
          };
          return new Response(
            JSON.stringify({ success: true, result: mockResult, source: 'mock' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      case 'close_position': {
        const { login, ticket } = await req.json();
        
        try {
          const result = await mt5Service.closePosition(login, ticket);
          return new Response(
            JSON.stringify({ success: true, result, source: 'real' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          const mockResult: MT5OrderResult = {
            retcode: 10009,
            deal: Math.floor(Math.random() * 1000000),
            comment: 'Mock position closed'
          };
          return new Response(
            JSON.stringify({ success: true, result: mockResult, source: 'mock' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
    
  } catch (error) {
    console.error('❌ Error in mt5-integration:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        function: 'mt5-integration'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})