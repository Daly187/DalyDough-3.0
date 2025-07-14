// Enhanced Real Data Service - assets/js/services/real-data-api.js

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
            fixer: {
                key: this.getAPIKey('FIXER_API_KEY'),
                baseUrl: 'https://api.fixer.io/v1',
                rateLimit: 100, // requests per month for free tier
                priority: 4
            }
        };

        // Cache for reducing API calls
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minute cache
        
        // Rate limiting
        this.requestCounts = new Map();
        this.lastResetTime = Date.now();
        
        console.log('🚀 Real Data API Service initialized with multiple providers');
        this.validateAPIKeys();
    }

    getAPIKey(keyName) {
        // Try multiple sources for API keys
        const sources = [
            () => process?.env?.[keyName],
            () => window?.ENV?.[keyName],
            () => localStorage.getItem(keyName),
            () => this.getFromConfig(keyName)
        ];

        for (const source of sources) {
            try {
                const key = source();
                if (key && key.length > 10) {
                    console.log(`✅ Found API key for ${keyName}`);
                    return key;
                }
            } catch (error) {
                // Continue to next source
            }
        }
        
        console.warn(`⚠️ No API key found for ${keyName}`);
        return null;
    }

    getFromConfig(keyName) {
        // Check if keys are embedded in a config object
        const configMappings = {
            'FMP_API_KEY': 'YOUR_FMP_API_KEY_HERE',
            'ALPHAVANTAGE_API_KEY': 'YOUR_ALPHAVANTAGE_API_KEY_HERE',
            'EXCHANGERATE_API_KEY': 'YOUR_EXCHANGERATE_API_KEY_HERE',
            'FIXER_API_KEY': 'YOUR_FIXER_API_KEY_HERE'
        };
        
        return configMappings[keyName];
    }

    validateAPIKeys() {
        const validAPIs = Object.entries(this.apis)
            .filter(([name, config]) => config.key && config.key.length > 10)
            .sort((a, b) => a[1].priority - b[1].priority);

        if (validAPIs.length === 0) {
            console.error('❌ NO VALID API KEYS FOUND! Please add at least one API key.');
            console.log('📝 Required API keys:');
            console.log('- FMP_API_KEY: Get from https://financialmodelingprep.com/');
            console.log('- ALPHAVANTAGE_API_KEY: Get from https://www.alphavantage.co/');
            console.log('- EXCHANGERATE_API_KEY: Get from https://exchangerate-api.com/');
            console.log('- FIXER_API_KEY: Get from https://fixer.io/');
            return false;
        }

        console.log(`✅ Found ${validAPIs.length} valid API providers:`, validAPIs.map(([name]) => name));
        return true;
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
            .filter(([name, config]) => config.key && config.key.length > 10)
            .sort((a, b) => a[1].priority - b[1].priority);

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
                    case 'fixer':
                        data = await this.getFixerForexData(config);
                        break;
                }

                if (data && data.length > 0) {
                    console.log(`✅ Successfully got ${data.length} forex pairs from ${providerName}`);
                    this.setCache(cacheKey, data);
                    this.incrementRequestCount(providerName);
                    return data;
                }
            } catch (error) {
                console.warn(`❌ ${providerName} API failed:`, error.message);
                continue;
            }
        }

        throw new Error('All forex data providers failed');
    }

    async getFMPForexData(config) {
        const majorPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'XAUUSD'];
        const symbolsQuery = majorPairs.join(',');
        
        const response = await fetch(
            `${config.baseUrl}/quote/${symbolsQuery}?apikey=${config.key}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'DalyDough/3.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        return data.map(quote => ({
            pair: this.formatPairWithSlash(quote.symbol),
            price: parseFloat(quote.price) || 1.0850,
            change: parseFloat(quote.change) || 0,
            changePercent: parseFloat(quote.changesPercentage) || 0,
            volume: parseFloat(quote.volume) || 0,
            high: parseFloat(quote.dayHigh) || parseFloat(quote.price) || 1.0850,
            low: parseFloat(quote.dayLow) || parseFloat(quote.price) || 1.0850,
            timestamp: new Date().toISOString(),
            source: 'FMP'
        }));
    }

    async getAlphaVantageForexData(config) {
        // Alpha Vantage requires individual calls for each pair
        const majorPairs = [
            { from: 'EUR', to: 'USD' },
            { from: 'GBP', to: 'USD' },
            { from: 'USD', to: 'JPY' },
            { from: 'AUD', to: 'USD' }
        ];

        const results = [];
        
        for (const { from, to } of majorPairs.slice(0, 2)) { // Limit to 2 to avoid rate limits
            try {
                const response = await fetch(
                    `${config.baseUrl}?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${config.key}`
                );

                if (!response.ok) {
                    throw new Error(`AlphaVantage API error: ${response.status}`);
                }

                const data = await response.json();
                const exchangeRate = data['Realtime Currency Exchange Rate'];
                
                if (exchangeRate) {
                    results.push({
                        pair: `${from}/${to}`,
                        price: parseFloat(exchangeRate['5. Exchange Rate']),
                        change: 0, // AlphaVantage doesn't provide this in this endpoint
                        changePercent: 0,
                        volume: 0,
                        high: parseFloat(exchangeRate['5. Exchange Rate']),
                        low: parseFloat(exchangeRate['5. Exchange Rate']),
                        timestamp: exchangeRate['6. Last Refreshed'],
                        source: 'AlphaVantage'
                    });
                }

                // Respect rate limits
                await new Promise(resolve => setTimeout(resolve, 12000)); // 12 seconds between calls
            } catch (error) {
                console.warn(`Failed to get ${from}/${to} from AlphaVantage:`, error.message);
            }
        }

        return results;
    }

    async getExchangeRateForexData(config) {
        const response = await fetch(`${config.baseUrl}/${config.key}/latest/USD`);
        
        if (!response.ok) {
            throw new Error(`ExchangeRate API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result !== 'success') {
            throw new Error('ExchangeRate API returned error');
        }

        const rates = data.conversion_rates;
        const results = [];

        // Convert to our format
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
            results.push({
                pair,
                price: rate,
                change: 0, // This API doesn't provide change data
                changePercent: 0,
                volume: 0,
                high: rate,
                low: rate,
                timestamp: new Date().toISOString(),
                source: 'ExchangeRate'
            });
        }

        return results;
    }

    async getFixerForexData(config) {
        const response = await fetch(`${config.baseUrl}/latest?access_key=${config.key}&base=USD&symbols=EUR,GBP,JPY,AUD,CAD,CHF,NZD`);
        
        if (!response.ok) {
            throw new Error(`Fixer API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(`Fixer API error: ${data.error?.info || 'Unknown error'}`);
        }

        const rates = data.rates;
        const results = [];

        // Convert to our format
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
            results.push({
                pair,
                price: rate,
                change: 0,
                changePercent: 0,
                volume: 0,
                high: rate,
                low: rate,
                timestamp: data.date,
                source: 'Fixer'
            });
        }

        return results;
    }

    async getRealCOTData() {
        const cacheKey = 'cot_data';
        const cached = this.getCache(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            console.log('📊 Fetching real COT data from CFTC...');
            
            // CFTC Commodity Codes for major currencies
            const currencyMappings = {
                'EUR': '099741', // Euro FX
                'GBP': '096742', // British Pound
                'JPY': '097741', // Japanese Yen
                'AUD': '232741', // Australian Dollar
                'CAD': '090741', // Canadian Dollar
                'CHF': '092741'  // Swiss Franc
            };

            const results = [];
            
            for (const [currency, code] of Object.entries(currencyMappings)) {
                try {
                    const cotData = await this.fetchCFTCData(code);
                    if (cotData && cotData.length > 0) {
                        results.push({
                            currency,
                            history: cotData.slice(0, 6).map(record => ({
                                date: this.formatCOTDate(record.report_date_as_yyyy_mm_dd),
                                longPosition: parseInt(record.asset_mgr_positions_long_all) + parseInt(record.lev_money_positions_long_all),
                                shortPosition: parseInt(record.asset_mgr_positions_short_all) + parseInt(record.lev_money_positions_short_all),
                                netPosition: (parseInt(record.asset_mgr_positions_long_all) + parseInt(record.lev_money_positions_long_all)) - 
                                           (parseInt(record.asset_mgr_positions_short_all) + parseInt(record.lev_money_positions_short_all))
                            }))
                        });
                    }
                } catch (error) {
                    console.warn(`Failed to get COT data for ${currency}:`, error.message);
                }
            }

            if (results.length > 0) {
                this.setCache(cacheKey, results);
                return results;
            }

            throw new Error('No COT data retrieved');
            
        } catch (error) {
            console.error('❌ Failed to get real COT data:', error);
            throw error;
        }
    }

    async fetchCFTCData(commodityCode) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 42); // 6 weeks

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        const url = `https://publicreporting.cftc.gov/resource/gpo6-6hjb.json?cftc_commodity_code=${commodityCode}&$where=report_date_as_yyyy_mm_dd >= '${startDateStr}' AND report_date_as_yyyy_mm_dd <= '${endDateStr}'&$order=report_date_as_yyyy_mm_dd DESC&$limit=6`;

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`CFTC API error: ${response.status}`);
        }

        return await response.json();
    }

    formatCOTDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    formatPairWithSlash(symbol) {
        if (symbol.length === 6) {
            return `${symbol.slice(0, 3)}/${symbol.slice(3)}`;
        }
        return symbol.includes('/') ? symbol : `${symbol.slice(0, 3)}/${symbol.slice(3)}`;
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
            if (!config.key || config.key.length < 10) {
                results.apis[name] = { status: 'no_key', error: 'API key not provided' };
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
                    case 'fixer':
                        testResponse = await fetch(`${config.baseUrl}/latest?access_key=${config.key}&base=USD&symbols=EUR`);
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

console.log('✅ Real Data API Service loaded');