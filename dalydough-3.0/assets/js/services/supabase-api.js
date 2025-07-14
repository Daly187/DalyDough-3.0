// dalydough-3.0/assets/js/services/supabase-api.js

class SupabaseApiService {
  constructor(supabaseUrl, supabaseKey) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    this.supabase = supabase.createClient(supabaseUrl, supabaseKey);
    this.initialize();
  }

  async initialize() {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      if (error) {
        throw new Error(`Error getting session: ${error.message}`);
      }
      if (!data.session) {
        await this.signInAnonymously();
      }
    } catch (error) {
      console.error('Error during initialization, redirecting to login:', error);
      // Optional: Redirect to a login page if anonymous sign-in fails or is not desired
      // window.location.href = '/login.html';
    }
  }

  async signInAnonymously() {
    try {
      const { error } = await this.supabase.auth.signInAnonymously();
      if (error) {
        throw new Error(`Anonymous sign-in failed: ${error.message}`);
      }
    } catch (error) {
      console.error(error.message);
      // Handle anonymous sign-in failure (e.g., show an error message)
    }
  }

  async callFunction(functionName, options = {}) {
    const { data, error } = await this.supabase.functions.invoke(functionName, options);
    if (error) {
      throw new Error(`Function call to '${functionName}' failed: ${error.message}`);
    }
    return data;
  }

  async getMarketDataWithScoring() {
    try {
      // Ensure this is calling the function that provides live data.
      const data = await this.callFunction('get-real-market-data');
      if (data && data.trends && Array.isArray(data.trends) && data.trends.length > 0) {
        return data.trends;
      } else {
        // This provides a fallback to the static data if live data fails or is empty.
        console.warn('Live market data is empty or invalid, attempting to fall back to static data.');
        return this.getStaticMarketData();
      }
    } catch (error) {
      console.error('❌ Market data source failed, falling back to static data:', error);
      return this.getStaticMarketData(); // Fallback to static data on error
    }
  }

  async getStaticMarketData() {
    try {
      const data = await this.callFunction('get-market-data'); // This function now gets data from a static file.
      if (data.marketData && Array.isArray(data.marketData) && data.marketData.length > 0) {
        return data.marketData;
      } else {
        throw new Error('Static market data is empty or invalid.');
      }
    } catch (error) {
      console.error('❌ Static market data fallback failed:', error);
      throw new Error(`STATIC DATA UNAVAILABLE: ${error.message}. Please try again later.`);
    }
  }
}

// Example of how to initialize and use the service
// const supabaseApiService = new SupabaseApiService('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY');
// supabaseApiService.getMarketDataWithScoring().then(marketData => {
//   console.log('Market Data:', marketData);
// }).catch(error => {
//   console.error(error.message);
// });