// Enhanced Supabase API Service - Replace or create new file: assets/js/services/supabase-api.js

class SupabaseApiService {
    constructor() {
        // Update these URLs to match your Supabase project
        this.supabaseUrl = 'https://your-project-id.supabase.co'; // Replace with your actual Supabase URL
        this.supabaseAnonKey = 'your-anon-key'; // Replace with your actual anon key
        this.functionsUrl = `${this.supabaseUrl}/functions/v1`;
        
        console.log('🚀 SupabaseApiService initialized');
    }

    async callFunction(functionName, data = null) {
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
            
            return result;
        } catch (error) {
            console.error(`❌ Error calling ${functionName}:`, error);
            throw error;
        }
    }

    async getMarketDataWithScoring() {
        try {
            const data = await this.callFunction('get-market-data-with-scoring');
            console.log(`📊 Received ${data.length} market trends with live FMP data`);
            return data;
        } catch (error) {
            console.warn('⚠️ Failed to get live data, falling back to mock data');
            return this.generateFallbackData();
        }
    }

    async getCOTReportHistory() {
        try {
            const data = await this.callFunction('get-cot-report-history');
            console.log(`📈 Received COT data for ${data.length} currencies`);
            return data;
        } catch (error) {
            console.warn('⚠️ Failed to get COT data, using fallback');
            return this.generateFallbackCOTData();
        }
    }

    async getAIRecommendations() {
        try {
            const data = await this.callFunction('get-ai-recommendations');
            console.log(`🤖 Received ${data.recommendations.length} AI recommendations`);
            return data.recommendations;
        } catch (error) {
            console.warn('⚠️ Failed to get AI recommendations, using fallback');
            return this.generateFallbackRecommendations();
        }
    }

    // Fallback data generators
    generateFallbackData() {
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
            
            return {
                pair,
                trendH4,
                trendD1,
                trendW1,
                setupQuality: dsize >= 8 ? 'A' : dsize >= 6 ? 'B' : 'C',
                conditions: {
                    cot: Math.random() > 0.5,
                    adx: Math.random() > 0.4,
                    spread: Math.random() > 0.3
                },
                dsize: dsize.toFixed(1),
                currentPrice: Math.random() * 2 + 1,
                dailyChange: (Math.random() - 0.5) * 0.02,
                dailyChangePercent: (Math.random() - 0.5) * 2,
                entryStatus: dsize >= 7 ? 'Allow Trade' : 'Block',
                breakdown: {
                    cotBias: { score: Math.floor(Math.random() * 3), value: 'Neutral Bias', description: 'Fallback data' },
                    trendConfirmation: { score: Math.floor(Math.random() * 4), value: `${Math.floor(Math.random() * 4)}/3 timeframes`, description: 'Fallback data' },
                    adxStrength: { score: Math.floor(Math.random() * 2), value: (Math.random() * 50 + 10).toFixed(1), description: 'Fallback data' },
                    supportRetest: { score: Math.floor(Math.random() * 3), value: 'No Support', description: 'Fallback data' },
                    priceStructure: { score: Math.floor(Math.random() * 2), value: 'Choppy Structure', description: 'Fallback data' },
                    spreadCheck: { score: 1, value: '1.5 pips', description: 'Fallback data' }
                },
                lastUpdated: new Date().toISOString()
            };
        }).sort((a, b) => parseFloat(b.dsize) - parseFloat(a.dsize));
    }

    generateFallbackCOTData() {
        const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
        
        return currencies.map(currency => {
            const history = [];
            const now = new Date();
            
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - (i * 7));
                
                const longPos = Math.floor(Math.random() * 100000) + 50000;
                const shortPos = Math.floor(Math.random() * 80000) + 40000;
                
                history.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    longPosition: longPos,
                    shortPosition: shortPos,
                    netPosition: longPos - shortPos
                });
            }
            
            return { currency, history };
        });
    }

    generateFallbackRecommendations() {
        const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'XAU/USD'];
        const reasons = [
            "Strong trend alignment across multiple timeframes",
            "Technical breakout with volume confirmation", 
            "Key support/resistance level provides clear entry",
            "Economic data supports continued momentum",
            "Institutional bias showing strong directional flow"
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
}

// Create global instance
window.supabaseApi = new SupabaseApiService();

console.log('✅ Supabase API Service loaded');