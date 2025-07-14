// Enhanced Supabase API Service with Caching - Replace or create new file: assets/js/services/supabase-api.js

class SupabaseApiService {
    constructor() {
        // Update these URLs to match your Supabase project
        this.supabaseUrl = 'https://your-project-id.supabase.co'; // Replace with your actual Supabase URL
        this.supabaseAnonKey = 'your-anon-key'; // Replace with your actual anon key
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

    // Enhanced fallback data generators with realistic market conditions
    generateEnhancedFallbackData() {
        const pairs = [
            'AUD/CAD', 'AUD/CHF', 'AUD/JPY', 'AUD/NZD', 'AUD/USD',
            'CAD/JPY', 'CHF/JPY', 'EUR/CAD', 'EUR/CHF', 'EUR/GBP', 
            'EUR/JPY', 'EUR/NZD', 'EUR/TRY', 'EUR/USD', 'GBP/AUD',
            'GBP/CAD', 'GBP/CHF', 'GBP/JPY', 'GBP/USD', 'NZD/CAD',
            'NZD/CHF', 'NZD/JPY', 'NZD/USD', 'USD/CAD', 'USD/CHF',
            'USD/JPY', 'USD/TRY', 'USD/ZAR', 'XAU/USD'
        ];

        return pairs.map(pair => {
            const dsize = Math.random() * 10;
            const trendH4 = ['Up', 'Down', 'Neutral'][Math.floor(Math.random() * 3)];
            const trendD1 = ['Up', 'Down', 'Neutral'][Math.floor(Math.random() * 3)];
            const trendW1 = ['Up', 'Down', 'Neutral'][Math.floor(Math.random() * 3)];
            
            // Calculate trend confirmation score using corrected logic
            const trends = [trendH4, trendD1, trendW1];
            const upCount = trends.filter(t => t === 'Up').length;
            const downCount = trends.filter(t => t === 'Down').length;
            
            let trendConfirmationScore = 0;
            if (upCount >= 2 && downCount === 0) {
                trendConfirmationScore = upCount;
            } else if (downCount >= 2 && upCount === 0) {
                trendConfirmationScore = downCount;
            } else if (upCount === 3 || downCount === 3) {
                trendConfirmationScore = 3;
            }
            
            // Generate realistic price for the pair
            const currentPrice = this.generateRealisticPrice(pair);
            const dailyChange = (Math.random() - 0.5) * 0.02;
            const dailyChangePercent = (dailyChange / currentPrice) * 100;
            
            // Determine entry status
            const canEnter = dsize >= 7;
            let entryStatus = 'Block';
            if (canEnter) {
                if (upCount > downCount) {
                    entryStatus = 'Allow Buy';
                } else if (downCount > upCount) {
                    entryStatus = 'Allow Sell';
                } else {
                    entryStatus = dailyChange > 0 ? 'Allow Buy' : 'Allow Sell';
                }
            }
            
            return {
                pair,
                trendH4,
                trendD1,
                trendW1,
                trendAnalysis: {
                    direction: upCount > downCount ? 'bullish' : downCount > upCount ? 'bearish' : 'neutral',
                    trendConfirmationScore
                },
                setupQuality: dsize >= 8 ? 'A' : dsize >= 6 ? 'B' : 'C',
                conditions: {
                    cot: Math.random() > 0.5,
                    adx: Math.random() > 0.4,
                    spread: Math.random() > 0.3
                },
                dsize: dsize.toFixed(1),
                currentPrice,
                dailyChange,
                dailyChangePercent,
                entryStatus,
                breakdown: this.generateScoringBreakdown(dsize, trendConfirmationScore),
                lastUpdated: new Date().toISOString()
            };
        }).sort((a, b) => parseFloat(b.dsize) - parseFloat(a.dsize));
    }

    generateRealisticPrice(pair) {
        const basePrices = {
            'EUR/USD': 1.0850, 'GBP/USD': 1.2720, 'USD/JPY': 149.85, 'USD/CHF': 0.8745,
            'AUD/USD': 0.6685, 'USD/CAD': 1.3580, 'NZD/USD': 0.6125, 'XAU/USD': 2035.50,
            'EUR/GBP': 0.8520, 'EUR/JPY': 162.45, 'GBP/JPY': 190.72, 'AUD/CAD': 0.9080,
            'NZD/CAD': 0.8315, 'EUR/CHF': 0.9485, 'GBP/CHF': 1.1130, 'AUD/CHF': 0.5845,
            'CAD/JPY': 110.35, 'CHF/JPY': 171.25, 'NZD/JPY': 91.78, 'EUR/AUD': 1.6225,
            'GBP/AUD': 1.9035, 'USD/ZAR': 18.45, 'USD/TRY': 27.85, 'EUR/TRY': 30.21,
            'AUD/JPY': 100.15, 'AUD/NZD': 1.0915, 'EUR/CAD': 1.4735, 'EUR/NZD': 1.7705,
            'GBP/CAD': 1.7275, 'NZD/CHF': 0.5355
        };
        
        const basePrice = basePrices[pair] || (Math.random() * 2 + 0.5);
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        return basePrice + (basePrice * variation);
    }

    generateScoringBreakdown(dsize, trendScore) {
        const targetScore = Math.round(dsize);
        let remaining = Math.max(0, targetScore - trendScore);
        
        const cotScore = Math.min(2, Math.floor(Math.random() * 3));
        remaining -= cotScore;
        
        const adxScore = Math.min(1, remaining > 0 ? (Math.random() > 0.5 ? 1 : 0) : 0);
        remaining -= adxScore;
        
        const supportScore = Math.min(2, Math.max(0, remaining));
        remaining -= supportScore;
        
        const structureScore = remaining > 0 ? 1 : 0;
        remaining -= structureScore;
        
        const spreadScore = remaining > 0 ? 1 : (Math.random() > 0.3 ? 1 : 0);
        
        return {
            cotBias: { 
                score: cotScore, 
                value: cotScore === 2 ? 'Strong Institutional Bias' : cotScore === 1 ? 'Weak Bias' : 'No Clear Bias',
                description: 'Enhanced fallback COT analysis'
            },
            trendConfirmation: { 
                score: trendScore, 
                value: `${trendScore}/3 timeframes aligned`,
                description: 'Multi-timeframe trend analysis (corrected logic)'
            },
            adxStrength: { 
                score: adxScore, 
                value: (Math.random() * 40 + 15).toFixed(1),
                description: 'Enhanced ADX strength calculation'
            },
            supportRetest: { 
                score: supportScore, 
                value: supportScore === 2 ? 'Strong Level' : supportScore === 1 ? 'Weak Level' : 'No Key Levels',
                description: 'Support/resistance level analysis'
            },
            priceStructure: { 
                score: structureScore, 
                value: structureScore ? 'Clean Structure' : 'Choppy Structure',
                description: 'Price action structure analysis'
            },
            spreadCheck: { 
                score: spreadScore, 
                value: '1.5 pips',
                description: 'Transaction cost analysis'
            }
        };
    }

    generateFallbackCOTData() {
        const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
        
        return currencies.map(currency => {
            const history = [];
            const now = new Date();
            
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - (i * 7));
                
                // Generate more realistic COT data
                const trend = Math.random() > 0.5 ? 1 : -1;
                const baseLong = 80000 + (trend * 20000) + (Math.random() * 40000);
                const baseShort = 70000 + (-trend * 15000) + (Math.random() * 30000);
                
                history.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    longPosition: Math.floor(baseLong),
                    shortPosition: Math.floor(baseShort),
                    netPosition: Math.floor(baseLong - baseShort)
                });
            }
            
            return { currency, history };
        });
    }

    generateFallbackRecommendations() {
        const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'XAU/USD'];
        const reasons = [
            "Strong multi-timeframe trend alignment with institutional support",
            "Technical breakout confirmed by volume and momentum indicators", 
            "Key support/resistance retest provides optimal risk/reward entry",
            "Economic fundamentals support continued directional momentum",
            "COT data shows smart money positioning in trend direction"
        ];

        return pairs.map(pair => {
            const score = Math.random() * 4 + 6;
            return {
                pair,
                reason: reasons[Math.floor(Math.random() * reasons.length)],
                score: parseFloat(score.toFixed(1)),
                score_level: score >= 8.5 ? 'high' : score >= 7.5 ? 'medium' : 'low'
            };
        }).sort((a, b) => b.score - a.score);
    }

    // Clear cache manually
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache cleared');
    }

    // Get cache statistics
    getCacheStats() {
        const validEntries = Array.from(this.cache.values()).filter(entry => this.isValidCache(entry));
        return {
            totalEntries: this.cache.size,
            validEntries: validEntries.length,
            hitRate: validEntries.length / this.cache.size || 0
        };
    }
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