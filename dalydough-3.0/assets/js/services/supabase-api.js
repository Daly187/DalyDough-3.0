// Updated Supabase API Service - Replace assets/js/services/supabase-api.js

export class SupabaseApiService {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        if (!this.supabase) {
            console.error("❌ SupabaseApiService did not receive a valid client.");
            return;
        }
        this.initialize();
    }

    async initialize() {
        try {
            console.log('🔄 Initializing Supabase session...');
            const { data, error } = await this.supabase.auth.getSession();
            if (error) throw new Error(`Error getting session: ${error.message}`);
            
            if (!data.session) {
                console.log('🔓 No active session, signing in anonymously.');
                await this.signInAnonymously();
            } else {
                console.log('✅ Session successfully retrieved.');
            }
        } catch (error) {
            console.error('❌ Error during Supabase initialization:', error);
        }
    }

    async signInAnonymously() {
        if (!this.supabase) return;
        try {
            const { error } = await this.supabase.auth.signInAnonymously();
            if (error) throw new Error(`Anonymous sign-in failed: ${error.message}`);
            console.log('✅ Signed in anonymously.');
        } catch (error) {
            console.error('❌ Anonymous sign-in error:', error.message);
        }
    }

    async getMarketDataWithScoring() {
        try {
            console.log('📊 Getting market data (prioritizing real data)...');
            
            // First, try to use the real data API service if available
            if (window.realDataAPI) {
                try {
                    console.log('🔄 Attempting to get live data from Real Data API...');
                    const realData = await window.realDataAPI.getRealForexData();
                    
                    if (realData && realData.length > 0) {
                        console.log(`✅ Got ${realData.length} live market data points from Real Data API`);
                        return realData;
                    }
                } catch (error) {
                    console.warn('⚠️ Real data API failed, trying Supabase function:', error.message);
                }
            } else {
                console.warn('⚠️ Real Data API service not available');
            }

            // Fallback to Supabase function
            console.log('🔄 Trying Supabase function as fallback...');
            const { data, error } = await this.supabase.functions.invoke('get-market-data-with-scoring');
            
            if (error) {
                console.error('❌ Supabase function error:', error);
                throw new Error(`Supabase function failed: ${error.message}`);
            }
            
            if (data && Array.isArray(data) && data.length > 0) {
                console.log(`✅ Got ${data.length} market data points from Supabase function`);
                return data;
            }

            throw new Error('No market data returned from Supabase function');
            
        } catch (error) {
            console.error('❌ All market data sources failed:', error);
            
            // Show user-friendly error message
            if (typeof window.showNotification === 'function') {
                window.showNotification('❌ Unable to fetch live market data. Please check your API keys.', 'error');
            }
            
            // Return empty array to prevent application crash
            return [];
        }
    }
    
    async getCOTReportHistory() {
        try {
            console.log('📈 Getting COT report data...');
            
            // Try real COT data first if available
            if (window.realDataAPI && typeof window.realDataAPI.getRealCOTData === 'function') {
                try {
                    const realCOTData = await window.realDataAPI.getRealCOTData();
                    if (realCOTData && realCOTData.length > 0) {
                        console.log(`✅ Got real COT data for ${realCOTData.length} currencies`);
                        return realCOTData;
                    }
                } catch (error) {
                    console.warn('⚠️ Real COT data failed, falling back to Supabase function:', error);
                }
            }

            // Fallback to Supabase function
            const { data, error } = await this.supabase.functions.invoke('get-cot-report-history');
            
            if (error) {
                console.error('❌ COT function error:', error);
                throw error;
            }
            
            return data?.cotReportHistory || [];
        } catch (error) {
            console.error('❌ Failed to get COT report history', error);
            return [];
        }
    }

    async getEconomicCalendar() {
        try {
            console.log('📅 Getting economic calendar...');
            
            const { data, error } = await this.supabase.functions.invoke('get-economic-calendar');
            
            if (error) {
                console.error('❌ Economic calendar function error:', error);
                throw error;
            }
            
            return data?.events || [];
        } catch (error) {
            console.error('❌ Failed to get economic calendar', error);
            return [];
        }
    }

    async testConnection() {
        try {
            console.log('🧪 Testing Supabase connection...');
            
            const { data, error } = await this.supabase.functions.invoke('hello');
            
            if (error) {
                console.error('❌ Connection test failed:', error);
                return { success: false, error: error.message };
            }
            
            console.log('✅ Supabase connection test successful:', data);
            return { success: true, data };
        } catch (error) {
            console.error('❌ Connection test error:', error);
            return { success: false, error: error.message };
        }
    }

    // Health check for all services
    async getSystemHealth() {
        const health = {
            timestamp: new Date().toISOString(),
            supabase: { status: 'unknown' },
            realDataAPI: { status: 'unknown' },
            overall: 'unknown'
        };

        // Test Supabase
        try {
            const supabaseTest = await this.testConnection();
            health.supabase = {
                status: supabaseTest.success ? 'healthy' : 'error',
                details: supabaseTest.success ? 'Connected' : supabaseTest.error
            };
        } catch (error) {
            health.supabase = {
                status: 'error',
                details: error.message
            };
        }

        // Test Real Data API
        if (window.realDataAPI) {
            try {
                const apiHealth = await window.realDataAPI.healthCheck();
                health.realDataAPI = {
                    status: apiHealth.overall,
                    details: `${apiHealth.healthyProviders}/${apiHealth.totalProviders} providers healthy`,
                    providers: apiHealth.apis
                };
            } catch (error) {
                health.realDataAPI = {
                    status: 'error',
                    details: error.message
                };
            }
        } else {
            health.realDataAPI = {
                status: 'not_initialized',
                details: 'Real Data API service not available'
            };
        }

        // Determine overall health
        const healthyServices = [health.supabase, health.realDataAPI]
            .filter(service => service.status === 'healthy').length;
        
        health.overall = healthyServices > 0 ? 'healthy' : 'degraded';
        health.healthyServices = healthyServices;
        health.totalServices = 2;

        return health;
    }
}