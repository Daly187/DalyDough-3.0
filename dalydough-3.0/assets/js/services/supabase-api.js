// Enhanced Supabase API Service with Status Indicator - assets/js/services/supabase-api.js

class SupabaseApiService {
    constructor() {
        this.supabaseUrl = 'https://ayvuvsitwsrcbkqcbjhn.supabase.co';
        this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dnV2c2l0d3NyY2JrcWNiamhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4ODQ4NDcsImV4cCI6MjAyNTQ2MDg0N30.CLD-AnK2M2h_gxFJPK12_2o3zIeQ2m1P4A1w2daC2kE';
        this.functionsUrl = `${this.supabaseUrl}/functions/v1`;
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds cache
        this.updateStatus('connecting', 'Connecting to API...');
    }

    // Function to update the UI status indicator
    updateStatus(status, text) {
        const indicator = document.getElementById('supabase-status-indicator');
        if (indicator) {
            indicator.className = `status-${status}`;
            indicator.querySelector('.status-text').textContent = text;
        }
    }

    async testConnection() {
        try {
            // A simple function call to test if the API is reachable
            await this.callFunction('get-real-market-data', null, false);
            this.updateStatus('connected', 'Live Data Connected');
            console.log('✅ Supabase API connection successful.');
            return true;
        } catch (error) {
            this.updateStatus('error', 'API Connection Failed');
            console.error('❌ Supabase API connection test failed:', error);
            return false;
        }
    }

    getCacheKey(functionName, data) {
        return `${functionName}-${JSON.stringify(data)}`;
    }

    isValidCache(cacheEntry) {
        return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.cacheTimeout;
    }

    setCache(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
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
            if (useCache) this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error(`❌ Error calling ${functionName}:`, error);
            this.updateStatus('error', 'Data Fetch Failed');
            throw new Error(`Failed to get real data from ${functionName}: ${error.message}`);
        }
    }

    async getMarketDataWithScoring() {
        try {
            const data = await this.callFunction('get-real-market-data');
            if (data.trends && Array.isArray(data.trends) && data.trends.length > 0) {
                return data.trends;
            } else {
                throw new Error('Invalid market data structure received');
            }
        } catch (error) {
            console.error('❌ Market data source failed:', error);
            throw new Error(`REAL DATA UNAVAILABLE: ${error.message}.`);
        }
    }
}

// --- CRITICAL INITIALIZATION STEP ---
// This code ensures the API service is created and the app knows it's ready.
(async () => {
    try {
        console.log('🚀 Initializing Supabase API Service...');
        const supabaseApi = new SupabaseApiService();
        await supabaseApi.testConnection();
        // Assign the instance to the window object AFTER it's ready
        window.supabaseApi = supabaseApi;
        console.log('✅ Supabase API Service is now available on window.supabaseApi');
    } catch (e) {
        console.error('🔥🔥🔥 FATAL: Could not initialize Supabase API Service.', e);
        const indicator = document.getElementById('supabase-status-indicator');
        if (indicator) {
            indicator.className = 'status-error';
            indicator.querySelector('.status-text').textContent = 'Fatal API Error';
        }
    }
})();