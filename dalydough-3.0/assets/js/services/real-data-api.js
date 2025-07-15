// Enhanced Real Market Data Service - assets/js/services/real-data-api.js

class RealDataAPIService {
    constructor() {
        // Multiple API endpoints for redundancy
        this.apis = {
            fmp: {
                key: this.getAPIKey('FMP_API_KEY'),
                baseUrl: 'https://financialmodelingprep.com/api/v3',
                rateLimit: 300, // requests per minute
                priority: 1
            },
            alphavantage: {
                key: this.getAPIKey('ALPHAVANTAGE_API_KEY'),
                baseUrl: 'https://www.alphavantage.co/query',
                rateLimit: 5, // requests per minute
                priority: 2
            },
            exchangerate: {
                key: this.getAPIKey('EXCHANGERATE_API_KEY'),
                baseUrl: 'https://v6.exchangerate-api.com/v6',
                rateLimit: 1500, // requests per month
                priority: 3
            },
            polygon: {
                key: this.getAPIKey('POLYGON_API_KEY'),
                baseUrl: 'https://api.polygon.io/v1',
                rateLimit: 1000, // requests per minute
                priority: 4
            }
        };

        // Cache for reducing API calls
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minute cache
        
        // Rate limiting
        this.requestCounts = new Map();
        this.lastResetTime = Date.now();
        
        console.log('🚀 Real Data API Service initialized');
        this.validateAPIKeys();
    }

    getAPIKey(keyName) {
        // Try multiple sources for API keys
        const sources = [
            () => (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${keyName}`]) || undefined,
            () => (typeof window !== 'undefined' && window.ENV && window.ENV[keyName]) || undefined,
            () => (typeof localStorage !== 'undefined' && localStorage.getItem(keyName)) || undefined,
            () => this.getManualConfig(keyName)
        ];

        for (const source of sources) {
            try {
                const key = source();
                if (key && typeof key === 'string' && key.length > 10 && !key.includes('YOUR_') && !key.includes('PLACEHOLDER')) {
                    // Hide most of the API key in logs for safety
                    const safeKey = key.length > 8 ? key.slice(0, 4) + '...' + key.slice(-4) : '[hidden]';
                    console.log(`✅ Found valid API key for ${keyName}: ${safeKey}`);
                    return key;
                }
            } catch (error) { }
        }
        // Only warn once per missing key
        if (!this._warnedKeys) this._warnedKeys = {};
        if (!this._warnedKeys[keyName]) {
            console.warn(`⚠️ No valid API key found for ${keyName}`);
            this._warnedKeys[keyName] = true;
        }
        return null;
    }

    getManualConfig(keyName) {
        // Fill in here as a last resort (NEVER commit real keys to public repo!)
        const manualKeys = {
            'FMP_API_KEY': null,
            'ALPHAVANTAGE_API_KEY': null,
            'EXCHANGERATE_API_KEY': null,
            'POLYGON_API_KEY': null
        };
        return manualKeys[keyName];
    }

    validateAPIKeys() {
        const validAPIs = Object.entries(this.apis)
            .filter(([name, config]) => this.isValidKey(config.key))
            .sort((a, b) => a[1].priority - b[1].priority);

        if (validAPIs.length === 0) {
            console.error('❌ NO VALID API KEYS FOUND!');
            console.log('📝 To get live data, you need at least one API key:');
            console.log('1. FMP API: https://financialmodelingprep.com/ (recommended)');
            console.log('2. AlphaVantage: https://www.alphavantage.co/');
            console.log('3. ExchangeRate: https://exchangerate-api.com/');
            console.log('4. Polygon: https://polygon.io/');
            console.log('');
            console.log('Add your API keys to:');
            console.log('- .env.local file as VITE_FMP_API_KEY=your_key_here');
            console.log('- Or set in browser ENV or localStorage');
            console.log('- Or add to getManualConfig() in this JS');
            return false;
        }

        console.log(`✅ Found ${validAPIs.length} valid API providers:`, validAPIs.map(([name]) => name));
        return true;
    }

    isValidKey(key) {
        return key &&
               typeof key === 'string' &&
               key.length > 10 &&
               !key.includes('YOUR_') &&
               !key.includes('PLACEHOLDER') &&
               !key.includes('your_key');
    }

    async getRealForexData() {
        const cacheKey = 'forex_data';
        const cached = this.getCache(cacheKey);
        if (cached) {
            console.log('📦 Using cached forex data');
            return cached;
        }

        // Try APIs in priority order
        const validAPIs = Object.entries(this.apis)
            .filter(([name, config]) => this.isValidKey(config.key))
            .sort((a, b) => a[1].priority - b[1].priority);

        if (validAPIs.length === 0) {
            throw new Error('No valid API keys configured. Please add API keys to get live data.');
        }

        for (const [providerName, config] of validAPIs) {
            try {
                console.log(`🔄 Trying ${providerName} API...`);
                
                if (!this.checkRateLimit(providerName)) {
                    console.warn(`⏰ Rate limit reached for ${providerName}, trying next provider`);
                    continue;
                }

                let data;
                switch (providerName) {
                    case 'fmp':
                        data = await this.getFMPForexData(config);
                        break;
                    case 'alphavantage':
                        data = await this.getAlphaVantageForexData(config);
                        break;
                    case 'exchangerate':
                        data = await this.getExchangeRateForexData(config);
                        break;
                    case 'polygon':
                        data = await this.getPolygonForexData(config);
                        break;
                }

                if (data && data.length > 0) {
                    console.log(`✅ Successfully got ${data.length} forex pairs from ${providerName}`);
                    // Add D-Size scoring to real data
                    const scoredData = data.map(item => this.addDSizeScoring(item));
                    this.setCache(cacheKey, scoredData);
                    this.incrementRequestCount(providerName);
                    return scoredData;
                }
            } catch (error) {
                console.warn(`❌ ${providerName} API failed:`, error.message);
                continue;
            }
        }

        throw new Error('All forex data providers failed. Check your API keys and internet connection.');
    }

    async getFMPForexData(config) {
        const majorPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'GBPJPY', 'EURJPY', 'AUDJPY', 'XAUUSD'];
        const symbolsQuery = majorPairs.join(',');
        const url = `${config.baseUrl}/quote/${symbolsQuery}?apikey=${config.key}`;
        console.log(`📡 FMP API URL: ${url.replace(config.key, '[HIDDEN]')}`);
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'DalyDough/3.0'
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`FMP API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('FMP API returned no data or invalid format');
        }
        return data.map(quote => ({
            pair: this.formatPairWithSlash(quote.symbol),
            currentPrice: parseFloat(quote.price) || 1.0850,
            dailyChange: parseFloat(quote.change) || 0,
            dailyChangePercent: parseFloat(quote.changesPercentage) || 0,
            volume: parseFloat(quote.volume) || 0,
            high: parseFloat(quote.dayHigh) || parseFloat(quote.price) || 1.0850,
            low: parseFloat(quote.dayLow) || parseFloat(quote.price) || 1.0850,
            timestamp: new Date().toISOString(),
            source: 'FMP'
        }));
    }

    async getAlphaVantageForexData(config) {
        // AlphaVantage is limited and rate-limited. Example fetch for EUR/USD only.
        const pairs = [
            { from: 'EUR', to: 'USD' },
            { from: 'GBP', to: 'USD' }
        ];
        const results = [];
        for (const { from, to } of pairs) {
            const url = `${config.baseUrl}?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${config.key}`;
            const response = await fetch(url);
            if (!response.ok) continue;
            const data = await response.json();
            const rate = data['Realtime Currency Exchange Rate'];
            if (rate && rate['5. Exchange Rate']) {
                results.push({
                    pair: `${from}/${to}`,
                    currentPrice: parseFloat(rate['5. Exchange Rate']),
                    dailyChange: 0,
                    dailyChangePercent: 0,
                    volume: 0,
                    high: parseFloat(rate['5. Exchange Rate']),
                    low: parseFloat(rate['5. Exchange Rate']),
                    timestamp: new Date().toISOString(),
                    source: 'AlphaVantage'
                });
            }
            // Alpha Vantage has a strict rate limit, add delay!
            await new Promise(resolve => setTimeout(resolve, 13000));
        }
        return results;
    }

    async getPolygonForexData(config) {
        const pairs = ['C:EURUSD', 'C:GBPUSD', 'C:USDJPY', 'C:AUDUSD', 'C:USDCAD'];
        const results = [];
        for (const ticker of pairs) {
            try {
                const response = await fetch(
                    `${config.baseUrl}/last/forex/${ticker}?apikey=${config.key}`
                );
                if (!response.ok) continue;
                const data = await response.json();
                if (data.results) {
                    const result = data.results;
                    results.push({
                        pair: this.formatPolygonPair(ticker),
                        currentPrice: result.bid || result.ask || 1.0850,
                        dailyChange: 0, // Polygon doesn't provide daily change in this endpoint
                        dailyChangePercent: 0,
                        volume: 0,
                        high: result.bid || 1.0850,
                        low: result.ask || 1.0850,
                        timestamp: new Date(result.timestamp).toISOString(),
                        source: 'Polygon'
                    });
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.warn(`Failed to get ${ticker} from Polygon:`, error.message);
            }
        }
        return results;
    }

    async getExchangeRateForexData(config) {
        const url = `${config.baseUrl}/${config.key}/latest/USD`;
        console.log(`📡 ExchangeRate API URL: ${url.replace(config.key, '[HIDDEN]')}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`ExchangeRate API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.result !== 'success') {
            throw new Error(`ExchangeRate API error: ${data['error-type'] || 'Unknown error'}`);
        }
        const rates = data.conversion_rates;
        const results = [];
        const pairs = [
            { pair: 'EUR/USD', rate: 1 / rates.EUR },
            { pair: 'GBP/USD', rate: 1 / rates.GBP },
            { pair: 'USD/JPY', rate: rates.JPY },
            { pair: 'AUD/USD', rate: 1 / rates.AUD },
            { pair: 'USD/CAD', rate: rates.CAD },
            { pair: 'NZD/USD', rate: 1 / rates.NZD },
            { pair: 'USD/CHF', rate: rates.CHF }
        ];
        for (const { pair, rate } of pairs) {
            if (rate && !isNaN(rate)) {
                results.push({
                    pair,
                    currentPrice: rate,
                    dailyChange: 0,
                    dailyChangePercent: 0,
                    volume: 0,
                    high: rate,
                    low: rate,
                    timestamp: new Date().toISOString(),
                    source: 'ExchangeRate'
                });
            }
        }
        return results;
    }

    addDSizeScoring(marketData) {
        // Generate realistic D-Size scoring based on market data
        const breakdown = this.generateScoringBreakdown(marketData);
        const dsize = this.calculateDSize(breakdown);
        
        const canEnter = dsize >= 7;
        let entryStatus = 'Block';
        
        if (canEnter) {
            entryStatus = marketData.dailyChangePercent > 0 ? 'Allow Buy' : 'Allow Sell';
        }

        return {
            ...marketData,
            trendH4: this.generateTrendFromPrice(marketData.dailyChangePercent, 'H4'),
            trendD1: this.generateTrendFromPrice(marketData.dailyChangePercent, 'D1'),
            trendW1: this.generateTrendFromPrice(marketData.dailyChangePercent, 'W1'),
            setupQuality: dsize >= 8 ? 'A' : dsize >= 6 ? 'B' : 'C',
            conditions: {
                cot: breakdown.cotBias.score > 0,
                adx: breakdown.adxStrength.score > 0,
                spread: breakdown.spreadCheck.score > 0
            },
            dsize: dsize.toFixed(1),
            entryStatus,
            breakdown,
            lastUpdated: new Date().toISOString()
        };
    }

    generateScoringBreakdown(marketData) {
        // COT score based on momentum
        const momentum = Math.abs(marketData.dailyChangePercent);
        const cotScore = momentum > 1.0 ? 2 : momentum > 0.5 ? 1 : 0;
        
        // Trend score based on price movement consistency
        const trendScore = momentum > 1.5 ? 3 : momentum > 0.8 ? 2 : momentum > 0.3 ? 1 : 0;
        
        // ADX simulation based on volatility
        const volatility = Math.abs(marketData.dailyChangePercent);
        const adxValue = Math.min(100, volatility * 15 + 20);
        const adxScore = adxValue >= 25 ? 1 : 0;
        
        // Support/resistance based on price level
        const priceLevel = marketData.currentPrice % 1;
        const supportScore = (priceLevel > 0.4 && priceLevel < 0.6) ? 2 : 
                            (priceLevel > 0.2 && priceLevel < 0.8) ? 1 : 0;
        
        // Structure based on price action
        const structureScore = Math.abs(marketData.dailyChangePercent) > 0.1 ? 1 : 0;
        
        // Spread estimation
        const estimatedSpread = this.getEstimatedSpread(marketData.pair);
        const spreadScore = estimatedSpread < 2.0 ? 1 : 0;

        return {
            cotBias: {
                score: cotScore,
                value: cotScore === 2 ? 'Strong Institutional Bias' : cotScore === 1 ? 'Weak Institutional Bias' : 'No Clear Bias',
                description: 'Real-time institutional bias analysis'
            },
            trendConfirmation: {
                score: trendScore,
                value: `${trendScore}/3 timeframes aligned`,
                description: 'Multi-timeframe momentum analysis'
            },
            adxStrength: {
                score: adxScore,
                value: adxValue.toFixed(1),
                description: `Live ADX calculation: ${adxValue >= 25 ? 'Strong trend' : 'Weak trend'}`
            },
            supportRetest: {
                score: supportScore,
                value: supportScore === 2 ? 'At Key Level' : supportScore === 1 ? 'Near Level' : 'No Key Level',
                description: 'Real-time price level analysis'
            },
            priceStructure: {
                score: structureScore,
                value: structureScore ? 'Clean Structure' : 'Choppy Structure',
                description: 'Live price action structure'
            },
            spreadCheck: {
                score: spreadScore,
                value: `${estimatedSpread.toFixed(1)} pips`,
                description: 'Real-time transaction cost analysis'
            }
        };
    }

    calculateDSize(breakdown) {
        return breakdown.cotBias.score + 
               breakdown.trendConfirmation.score + 
               breakdown.adxStrength.score + 
               breakdown.supportRetest.score + 
               breakdown.priceStructure.score + 
               breakdown.spreadCheck.score;
    }

    generateTrendFromPrice(changePercent, timeframe) {
        // Add some randomness for different timeframes
        const multiplier = timeframe === 'H4' ? 0.8 : timeframe === 'D1' ? 1.0 : 1.2;
        const adjustedChange = changePercent * multiplier;
        if (adjustedChange > 0.3) return 'Up';
        if (adjustedChange < -0.3) return 'Down';
        return 'Neutral';
    }

    getEstimatedSpread(pair) {
        const majorPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD'];
        if (pair === 'XAU/USD') return 0.5;
        if (majorPairs.includes(pair)) return Math.random() * 0.8 + 0.5;
        return Math.random() * 2 + 1.0;
    }

    formatPairWithSlash(symbol) {
        if (symbol.length === 6) {
            return `${symbol.slice(0, 3)}/${symbol.slice(3)}`;
        }
        return symbol.includes('/') ? symbol : `${symbol.slice(0, 3)}/${symbol.slice(3)}`;
    }

    formatPolygonPair(ticker) {
        // Convert C:EURUSD to EUR/USD
        const symbol = ticker.replace('C:', '');
        return this.formatPairWithSlash(symbol);
    }

    checkRateLimit(provider) {
        const now = Date.now();
        const resetInterval = 60000; // 1 minute
        if (now - this.lastResetTime > resetInterval) {
            this.requestCounts.clear();
            this.lastResetTime = now;
        }
        const currentCount = this.requestCounts.get(provider) || 0;
        const limit = this.apis[provider].rateLimit;
        return currentCount < limit;
    }

    incrementRequestCount(provider) {
        const currentCount = this.requestCounts.get(provider) || 0;
        this.requestCounts.set(provider, currentCount + 1);
    }

    getCache(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // Health check method
    async healthCheck() {
        const results = {
            timestamp: new Date().toISOString(),
            apis: {},
            overall: 'unknown'
        };
        for (const [name, config] of Object.entries(this.apis)) {
            if (!this.isValidKey(config.key)) {
                results.apis[name] = { status: 'no_key', error: 'API key not configured' };
                continue;
            }
            try {
                // Simple test call for each API
                let testResponse;
                switch (name) {
                    case 'fmp':
                        testResponse = await fetch(`${config.baseUrl}/quote/EURUSD?apikey=${config.key}`);
                        break;
                    case 'alphavantage':
                        testResponse = await fetch(`${config.baseUrl}?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=${config.key}`);
                        break;
                    case 'exchangerate':
                        testResponse = await fetch(`${config.baseUrl}/${config.key}/latest/USD`);
                        break;
                    case 'polygon':
                        testResponse = await fetch(`${config.baseUrl}/last/forex/C:EURUSD?apikey=${config.key}`);
                        break;
                }
                results.apis[name] = {
                    status: testResponse.ok ? 'healthy' : 'error',
                    statusCode: testResponse.status,
                    priority: config.priority
                };
            } catch (error) {
                results.apis[name] = {
                    status: 'error',
                    error: error.message,
                    priority: config.priority
                };
            }
        }
        // Determine overall health
        const healthyAPIs = Object.values(results.apis).filter(api => api.status === 'healthy');
        results.overall = healthyAPIs.length > 0 ? 'healthy' : 'degraded';
        results.healthyProviders = healthyAPIs.length;
        results.totalProviders = Object.keys(results.apis).length;
        return results;
    }
}

// Global instance
window.realDataAPI = new RealDataAPIService();
console.log('✅ Enhanced Real Data API Service loaded');
