// Enhanced Supabase API Service (Real Data Only) - assets/js/services/supabase-api.js

class SupabaseApiService {
    constructor() {
        this.supabaseUrl = 'https://ayvuvsitwsrcbkqcbjhn.supabase.co'; 
        this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dnV2c2l0d3NyY2JrcWNiamhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4ODQ4NDcsImV4cCI6MjAyNTQ2MDg0N30.CLD-AnK2M2h_gxFJPK12_2o3zIeQ2m1P4A1w2daC2kE';
        this.functionsUrl = `${this.supabaseUrl}/functions/v1`;
        
        // Aggressive caching for real data
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds cache
        
        console.log('🚀 Supabase API Service initialized (REAL DATA ONLY MODE)');
    }

    getCacheKey(functionName, data) {
        return `${functionName}-${JSON.stringify(data)}`;
    }

    isValidCache(cacheEntry) {
        return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.cacheTimeout;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getCache(key) {
        const cacheEntry = this.cache.get(key);
        return this.isValidCache(cacheEntry) ? cacheEntry.data : null;
    }

    async callFunction(functionName, data = null, useCache = true) {
        const cacheKey = this.getCacheKey(functionName, data);
        
        if (useCache) {
            const cachedData = this.getCache(cacheKey);
            if (cachedData) {
                console.log(`📦 Cache hit for ${functionName}`);
                return cachedData;
            }
        }
        
        try {
            console.log(`📡 Calling Supabase function: ${functionName} (REAL DATA ONLY)`);
            
            const response = await fetch(`${this.functionsUrl}/${functionName}`, {
                method: data ? 'POST' : 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.supabaseAnonKey}`,
                    'apikey': this.supabaseAnonKey
                },
                body: data ? JSON.stringify(data) : undefined
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Check if the response indicates failure to get real data
            if (result.error && result.error.includes('real')) {
                throw new Error(`Real data unavailable: ${result.message || result.error}`);
            }
            
            console.log(`✅ ${functionName} function response received`);
            
            if (useCache) {
                this.setCache(cacheKey, result);
            }
            
            return result;
        } catch (error) {
            console.error(`❌ Error calling ${functionName}:`, error);
            throw new Error(`Failed to get real data from ${functionName}: ${error.message}`);
        }
    }

    async getMarketDataWithScoring() {
        try {
            console.log('📊 Requesting REAL market data with D-Size scoring...');
            
            // First try the new real-data-only function
            try {
                const data = await this.callFunction('get-real-market-data');
                
                if (data.trends && Array.isArray(data.trends) && data.trends.length > 0) {
                    const realDataCount = data.metadata ? data.metadata.realDataCount : data.trends.filter(t => t.source !== 'placeholder').length;
                    
                    console.log(`📊 Received ${data.trends.length} market trends with ${realDataCount} real data points`);
                    
                    if (realDataCount === 0) {
                        throw new Error('No real market data available from any provider');
                    }
                    
                    return data.trends;
                } else {
                    throw new Error('Invalid market data structure received');
                }
            } catch (realDataError) {
                console.warn('⚠️ Real data function failed, trying legacy function:', realDataError.message);
                
                // Fallback to existing function but validate it has real data
                const legacyData = await this.callFunction('get-market-data-with-scoring');
                
                if (Array.isArray(legacyData) && legacyData.length > 0) {
                    // Check if any data is from real sources
                    const realDataCount = legacyData.filter(d => 
                        d.source === 'live' || 
                        d.source === 'FMP' || 
                        d.source === 'AlphaVantage' ||
                        d.source === 'ExchangeRate' ||
                        d.source === 'Fixer'
                    ).length;
                    
                    if (realDataCount === 0) {
                        throw new Error('Legacy function only returned mock data');
                    }
                    
                    console.log(`📊 Legacy function provided ${realDataCount} real data points out of ${legacyData.length} total`);
                    return legacyData;
                } else {
                    throw new Error('Legacy function returned invalid data');
                }
            }
        } catch (error) {
            console.error('❌ All market data sources failed:', error);
            
            // Instead of returning mock data, throw an error
            throw new Error(`REAL DATA UNAVAILABLE: ${error.message}. Please check API keys and internet connection.`);
        }
    }

    async getCOTReportHistory() {
        try {
            console.log('📈 Requesting REAL COT data...');
            
            // Try the real COT data function first
            try {
                const data = await this.callFunction('get-real-cot-data');
                
                if (Array.isArray(data) && data.length > 0) {
                    const realDataCount = data.filter(d => d.currency && d.history && d.history.length > 0).length;
                    
                    if (realDataCount === 0) {
                        throw new Error('No real COT data available from CFTC');
                    }
                    
                    console.log(`📈 Received real COT data for ${realDataCount} currencies`);
                    return data;
                } else {
                    throw new Error('Invalid COT data structure received');
                }
            } catch (realCOTError) {
                console.warn('⚠️ Real COT function failed, trying legacy:', realCOTError.message);
                
                // Fallback to existing COT function
                const legacyData = await this.callFunction('get-cot-report-history');
                
                if (Array.isArray(legacyData) && legacyData.length > 0) {
                    console.log(`📈 Legacy COT data for ${legacyData.length} currencies`);
                    return legacyData;
                } else {
                    throw new Error('Legacy COT function returned no data');
                }
            }
        } catch (error) {
            console.error('❌ All COT data sources failed:', error);
            throw new Error(`REAL COT DATA UNAVAILABLE: ${error.message}`);
        }
    }

    async getEconomicCalendar() {
        try {
            console.log('📅 Requesting REAL economic calendar data...');
            
            const data = await this.callFunction('get-economic-calendar');
            
            if (data.events && Array.isArray(data.events)) {
                const realEventCount = data.events.filter(e => 
                    e.source !== 'Mock' && 
                    e.source !== 'fallback'
                ).length;
                
                if (realEventCount === 0 && data.source === 'fallback') {
                    throw new Error('Only mock economic calendar data available');
                }
                
                console.log(`📅 Retrieved ${data.events.length} economic events (${realEventCount} real)`);
                return data;
            } else {
                throw new Error('Invalid economic calendar data structure');
            }
        } catch (error) {
            console.error('❌ Economic calendar data unavailable:', error);
            throw new Error(`REAL ECONOMIC DATA UNAVAILABLE: ${error.message}`);
        }
    }

    async getAIRecommendations() {
        try {
            console.log('🤖 Requesting AI recommendations...');
            
            const response = await this.callFunction('get-ai-recommendations');
            
            if (response && response.recommendations && Array.isArray(response.recommendations)) {
                console.log(`🤖 Received ${response.recommendations.length} AI recommendations`);
                return response.recommendations;
            } else {
                throw new Error('Invalid AI recommendations structure');
            }
        } catch (error) {
            console.error('❌ AI recommendations unavailable:', error);
            throw new Error(`AI RECOMMENDATIONS UNAVAILABLE: ${error.message}`);
        }
    }

    // Test connection with strict real data validation
    async testConnection() {
        try {
            console.log('🔍 Testing Supabase connection with real data validation...');
            const response = await this.callFunction('hello', null, false);
            
            if (response && response.status === 'SUCCESS') {
                console.log('✅ Supabase connection successful:', response);
                
                // Additional test: try to get actual market data
                try {
                    await this.getMarketDataWithScoring();
                    return {
                        success: true,
                        message: response.message,
                        timestamp: response.timestamp,
                        realDataAvailable: true
                    };
                } catch (dataError) {
                    return {
                        success: true,
                        message: response.message,
                        timestamp: response.timestamp,
                        realDataAvailable: false,
                        dataError: dataError.message
                    };
                }
            } else {
                throw new Error('Unexpected response structure');
            }
        } catch (error) {
            console.error('❌ Supabase connection failed:', error);
            return {
                success: false,
                error: error.message,
                realDataAvailable: false
            };
        }
    }

    // Health check for all real data sources
    async healthCheck() {
        const healthStatus = {
            timestamp: new Date().toISOString(),
            supabaseConnection: false,
            marketData: false,
            cotData: false,
            economicCalendar: false,
            overall: 'unhealthy'
        };

        try {
            // Test basic connection
            const connectionTest = await this.testConnection();
            healthStatus.supabaseConnection = connectionTest.success;

            // Test market data
            try {
                await this.getMarketDataWithScoring();
                healthStatus.marketData = true;
            } catch (error) {
                console.warn('Market data health check failed:', error.message);
            }

            // Test COT data
            try {
                await this.getCOTReportHistory();
                healthStatus.cotData = true;
            } catch (error) {
                console.warn('COT data health check failed:', error.message);
            }

            // Test economic calendar
            try {
                await this.getEconomicCalendar();
                healthStatus.economicCalendar = true;
            } catch (error) {
                console.warn('Economic calendar health check failed:', error.message);
            }

            // Determine overall health
            const healthyServices = [
                healthStatus.supabaseConnection,
                healthStatus.marketData,
                healthStatus.cotData,
                healthStatus.economicCalendar
            ].filter(Boolean).length;

            if (healthyServices >= 3) {
                healthStatus.overall = 'healthy';
            } else if (healthyServices >= 2) {
                healthStatus.overall = 'degraded';
            } else {
                healthStatus.overall = 'unhealthy';
            }

            console.log(`🏥 Health check complete: ${healthyServices}/4 services healthy`);
            return healthStatus;

        } catch (error) {
            console.error('❌ Health check failed:', error);
            healthStatus.error = error.message;
            return healthStatus;
        }
    }

    // Method to display API key setup instructions
    displayAPIKeyInstructions() {
        const instructions = `
🔑 REAL DATA API SETUP REQUIRED

To get real market data, you need to set up API keys in your Supabase environment:

1. Financial Modeling Prep (Recommended):
   - Get free API key: https://financialmodelingprep.com/
   - Set environment variable: FMP_API_KEY

2. Alpha Vantage (Alternative):
   - Get free API key: https://www.alphavantage.co/
   - Set environment variable: ALPHAVANTAGE_API_KEY

3. ExchangeRate-API (Backup):
   - Get free API key: https://exchangerate-api.com/
   - Set environment variable: EXCHANGERATE_API_KEY

4. Fixer.io (Additional):
   - Get API key: https://fixer.io/
   - Set environment variable: FIXER_API_KEY

⚙️ In Supabase Dashboard:
Settings → Environment Variables → Add the API keys

Without these keys, the application cannot fetch real market data.
        `;
        
        console.log(instructions);
        return instructions;
    }
}

// Create global instance
window.supabaseApi = new SupabaseApiService();

// Test connection and display setup instructions if needed
window.supabaseApi.testConnection().then(result => {
    if (result.success) {
        if (result.realDataAvailable) {
            console.log('✅ Supabase API Service connected with real data access');
        } else {
            console.warn('⚠️ Supabase connected but real data unavailable');
            console.log('📝 API Setup may be required...');
            window.supabaseApi.displayAPIKeyInstructions();
        }
    } else {
        console.error('❌ Supabase connection issue, real data mode requires connection');
        window.supabaseApi.displayAPIKeyInstructions();
    }
});

console.log('✅ Enhanced Supabase API Service loaded (REAL DATA ONLY)');