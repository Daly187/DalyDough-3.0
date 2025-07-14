// Enhanced Supabase API Service with Caching - assets/js/services/supabase-api.js

class SupabaseApiService {
    constructor() {
        // Update these URLs to match your Supabase project
        this.supabaseUrl = 'https://ayvuvsitwsrcbkqcbjhn.supabase.co'; 
        this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dnV2c2l0d3NyY2JrcWNiamhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4ODQ4NDcsImV4cCI6MjAyNTQ2MDg0N30.CLD-AnK2M2h_gxFJPK12_2o3zIeQ2m1P4A1w2daC2kE';
        this.functionsUrl = `${this.supabaseUrl}/functions/v1`;
        
        // Add caching to prevent API overload
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minute cache
        
        console.log('🚀 Enhanced SupabaseApiService initialized with caching');
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
        
        // Check cache first
        if (useCache) {
            const cachedData = this.getCache(cacheKey);
            if (cachedData) {
                console.log(`📦 Cache hit for ${functionName}`);
                return cachedData;
            }
        }
        
        try {
            console.log(`📡 Calling Supabase function: ${functionName}`);
            
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(`✅ ${functionName} function response:`, result);
            
            // Cache the result
            if (useCache) {
                this.setCache(cacheKey, result);
            }
            
            return result;
        } catch (error) {
            console.error(`❌ Error calling ${functionName}:`, error);
            throw error;
        }
    }

    async getMarketDataWithScoring() {
        try {
            const data = await this.callFunction('get-market-data-with-scoring');
            
            // Validate data structure
            if (Array.isArray(data) && data.length > 0) {
                console.log(`📊 Received ${data.length} market trends with enhanced FMP data`);
                
                // Count live vs fallback data
                const liveDataCount = data.filter(d => 
                    d.breakdown && 
                    d.breakdown.adxStrength && 
                    !d.breakdown.adxStrength.description.includes('Fallback')
                ).length;
                
                console.log(`🎯 Live FMP data: ${liveDataCount}/${data.length} pairs`);
                return data;
            } else {
                throw new Error('Invalid data structure received');
            }
        } catch (error) {
            console.warn('⚠️ Failed to get live market data, falling back to enhanced mock data');
            return this.generateEnhancedFallbackData();
        }
    }

    async getCOTReportHistory() {
        try {
            const data = await this.callFunction('get-cot-report-history');
            
            if (Array.isArray(data) && data.length > 0) {
                console.log(`📈 Received COT data for ${data.length} currencies`);
                return data;
            } else {
                throw new Error('Invalid COT data structure');
            }
        } catch (error) {
            console.warn('⚠️ Failed to get COT data, using enhanced fallback');
            return this.generateFallbackCOTData();
        }
    }

    async getAIRecommendations() {
        try {
            const response = await this.callFunction('get-ai-recommendations');
            
            if (response && response.recommendations && Array.isArray(response.recommendations)) {
                console.log(`🤖 Received ${response.recommendations.length} AI recommendations`);
                return response.recommendations;
            } else {
                throw new Error('Invalid AI recommendations structure');
            }
        } catch (error) {
            console.warn('⚠️ Failed to get AI recommendations, using enhanced fallback');
            return this.generateFallbackRecommendations();
        }
    }

    // Test connection to Supabase
    async testConnection() {
        try {
            console.log('🔍 Testing Supabase connection...');
            const response = await this.callFunction('hello', null, false); // Don't cache test calls
            
            if (response && response.status === 'SUCCESS') {
                console.log('✅ Supabase connection successful:', response);
                return {
                    success: true,
                    message: response.message,
                    timestamp: response.timestamp
                };
            } else {
                throw new Error('Unexpected response structure');
            }
        } catch (error) {
            console.error('❌ Supabase connection failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Fallback data generators...
    // (The rest of the fallback functions remain the same as in your original file)
}

// Create global instance with enhanced capabilities
window.supabaseApi = new SupabaseApiService();

// Test connection on initialization
window.supabaseApi.testConnection().then(result => {
    if (result.success) {
        console.log('✅ Supabase API Service connected and ready');
    } else {
        console.warn('⚠️ Supabase connection issue, fallback mode active');
    }
});

console.log('✅ Enhanced Supabase API Service loaded with caching and improved fallbacks');
// In assets/js/services/supabase-api.js - add this method
async getMarketDataWithScoring() {
    try {
        console.log('📡 Calling Supabase function: get-market-data-with-scoring');
        
        const response = await fetch(`${this.functionsUrl}/get-market-data-with-scoring`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.supabaseAnonKey}`,
                'apikey': this.supabaseAnonKey
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Function call failed: ${response.status} ${response.statusText}`);
            console.error('Error details:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Validate data structure
        if (Array.isArray(result) && result.length > 0) {
            const liveDataCount = result.filter(d => d.source === 'live').length;
            console.log(`📊 Received ${result.length} market trends (${liveDataCount} live)`);
            return result;
        } else {
            throw new Error('Invalid data structure received');
        }
        
    } catch (error) {
        console.warn('⚠️ Failed to get live market data, falling back to enhanced mock data');
        console.error('Error details:', error);
        
        // Return enhanced fallback data
        return this.generateEnhancedFallbackData();
    }
}