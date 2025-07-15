// daly187/dalydough-3.0/DalyDough-3.0-main/dalydough-3.0/assets/js/services/supabase-api.js

// Export the class so it can be imported
export class SupabaseApiService {
  // The constructor now receives the already-created client from main.js
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    if (!this.supabase) {
        console.error("SupabaseApiService did not receive a valid client.");
        return;
    }
    this.initialize();
  }

  async initialize() {
    try {
      console.log('Initializing Supabase session...');
      const { data, error } = await this.supabase.auth.getSession();
      if (error) throw new Error(`Error getting session: ${error.message}`);
      
      if (!data.session) {
        console.log('No active session, signing in anonymously.');
        await this.signInAnonymously();
      } else {
        console.log('✅ Session successfully retrieved.');
      }
    } catch (error) {
      console.error('Error during Supabase initialization:', error);
    }
  }

  async signInAnonymously() {
    if (!this.supabase) return;
    try {
      const { error } = await this.supabase.auth.signInAnonymously();
      if (error) throw new Error(`Anonymous sign-in failed: ${error.message}`);
      console.log('✅ Signed in anonymously.');
    } catch (error) {
      console.error(error.message);
    }
  }

  async callFunction(functionName, options = {}) {
    if (!this.supabase) throw new Error("Supabase client not initialized.");
    
    const { data, error } = await this.supabase.functions.invoke(functionName, options);
    if (error) throw new Error(`Function call to '${functionName}' failed: ${error.message}`);
    
    return data;
  }

  async getMarketDataWithScoring() {
    try {
      const data = await this.callFunction('get-market-data-with-scoring');
      return data || [];
    } catch (error) {
      console.error('❌ Market data source failed:', error);
      throw error;
    }
  }
  
  async getCOTReportHistory() {
    try {
        const data = await this.callFunction('get-cot-report-history');
        return data || [];
    } catch (error) {
        console.error('Failed to get COT report history', error);
        return [];
    }
  }
}