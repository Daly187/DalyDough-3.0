// Enhanced Data Generators with Robust Fallback Data - assets/js/data/generators.js

// Enhanced trend analysis function (keep - this is logic, not mock data)
function analyzeTrend(trendH4, trendD1, trendW1) {
    const trends = [trendH4, trendD1, trendW1];
    const upCount = trends.filter(t => t === 'Up').length;
    const downCount = trends.filter(t => t === 'Down').length;
    const neutralCount = trends.filter(t => t === 'Neutral').length;
    
    let trendConfirmationScore = 0;
    
    if (upCount >= 2 && downCount === 0) {
        trendConfirmationScore = upCount;
    } else if (downCount >= 2 && upCount === 0) {
        trendConfirmationScore = downCount;
    } else if (upCount === 3) {
        trendConfirmationScore = 3;
    } else if (downCount === 3) {
        trendConfirmationScore = 3;
    } else {
        trendConfirmationScore = 0;
    }
    
    const alignment = Math.max(upCount, downCount, neutralCount);
    
    let direction;
    if (upCount > downCount && upCount > neutralCount) {
        direction = 'bullish';
    } else if (downCount > upCount && downCount > neutralCount) {
        direction = 'bearish';
    } else {
        direction = 'neutral';
    }
    
    return { 
        direction, 
        alignment, 
        trendConfirmationScore
    };
}

// Enhanced fallback market data generation with realistic D-Size scoring
async function generateMarketDataWithScoring() {
    console.log('🔄 Generating enhanced fallback market data...');
    
    try {
        // Try to get live data first
        if (window.supabaseApi) {
            const liveData = await window.supabaseApi.getMarketDataWithScoring();
            
            if (liveData && liveData.length > 0) {
                console.log(`✅ Successfully loaded ${liveData.length} live market trends from API`);
                
                return liveData.map(trend => ({
                    ...trend,
                    trendAnalysis: analyzeTrend(trend.trendH4, trend.trendD1, trend.trendW1),
                    breakdown: trend.breakdown || {}
                }));
            }
        }
        
        console.warn('⚠️ No live data available, using enhanced fallback data');
        return generateEnhancedFallbackData();
        
    } catch (error) {
        console.error('❌ Error fetching live market data:', error);
        return generateEnhancedFallbackData();
    }
}

// Generate enhanced fallback data with realistic market conditions
function generateEnhancedFallbackData() {
    const pairs = [
        'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD',
        'NZD/USD', 'USD/CHF', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY',
        'AUD/CAD', 'AUD/JPY', 'CAD/JPY', 'CHF/JPY', 'EUR/CAD',
        'EUR/CHF', 'EUR/NZD', 'EUR/TRY', 'GBP/AUD', 'GBP/CAD',
        'GBP/CHF', 'NZD/CAD', 'NZD/CHF', 'NZD/JPY', 'USD/TRY',
        'USD/ZAR', 'XAU/USD', 'AUD/CHF', 'AUD/NZD'
    ];
    
    const trends = ['Up', 'Down', 'Neutral'];
    
    console.log(`📊 Generating enhanced fallback data for ${pairs.length} pairs`);
    
    const marketData = pairs.map(pair => {
        // Generate realistic price data
        const basePrice = getBasePriceForPair(pair);
        const dailyChange = (Math.random() - 0.5) * 0.02; // ±2% daily change
        const dailyChangePercent = (dailyChange / basePrice) * 100;
        const currentPrice = basePrice + dailyChange;
        
        // Generate trends with some correlation
        const trendH4 = trends[Math.floor(Math.random() * trends.length)];
        const trendD1 = Math.random() > 0.7 ? trends[Math.floor(Math.random() * trends.length)] : trendH4;
        const trendW1 = Math.random() > 0.8 ? trends[Math.floor(Math.random() * trends.length)] : trendD1;
        
        // Calculate trend analysis
        const trendAnalysis = analyzeTrend(trendH4, trendD1, trendW1);
        
        // Generate realistic breakdown
        const breakdown = generateRealisticBreakdown(pair, trendAnalysis, dailyChangePercent);
        
        // Calculate D-Size
        const dsize = calculateDSize(breakdown);
        
        // Determine entry status
        const canEnter = dsize >= 7;
        let entryStatus = 'Block';
        
        if (canEnter) {
            if (trendAnalysis.direction === 'bullish') {
                entryStatus = 'Allow Buy';
            } else if (trendAnalysis.direction === 'bearish') {
                entryStatus = 'Allow Sell';
            } else {
                entryStatus = Math.random() > 0.5 ? 'Allow Buy' : 'Allow Sell';
            }
        }
        
        return {
            pair,
            trendH4,
            trendD1,
            trendW1,
            trendAnalysis,
            setupQuality: dsize >= 8 ? 'A' : dsize >= 6 ? 'B' : 'C',
            conditions: {
                cot: breakdown.cotBias.score > 0,
                adx: breakdown.adxStrength.score > 0,
                spread: breakdown.spreadCheck.score > 0
            },
            dsize: dsize.toFixed(1),
            currentPrice,
            dailyChange,
            dailyChangePercent,
            entryStatus,
            breakdown,
            lastUpdated: new Date().toISOString(),
            source: 'enhanced_fallback'
        };
    });
    
    // Sort by D-Size (highest first)
    return marketData.sort((a, b) => parseFloat(b.dsize) - parseFloat(a.dsize));
}

// Generate realistic breakdown for each pair
function generateRealisticBreakdown(pair, trendAnalysis, changePercent) {
    // COT Bias (0-2 points)
    const cotBiasScore = Math.random() > 0.7 ? 2 : Math.random() > 0.4 ? 1 : 0;
    
    // Trend Confirmation (0-3 points) - based on actual trend analysis
    const trendConfirmationScore = trendAnalysis.trendConfirmationScore;
    
    // ADX Strength (0-1 points) - based on volatility
    const volatility = Math.abs(changePercent);
    const adxValue = Math.min(100, volatility * 10 + Math.random() * 30 + 15);
    const adxScore = adxValue >= 25 ? 1 : 0;
    
    // Support/Resistance Retest (0-2 points)
    const supportScore = Math.random() > 0.6 ? 2 : Math.random() > 0.3 ? 1 : 0;
    
    // Price Structure (0-1 points)
    const structureScore = Math.abs(changePercent) > 0.5 ? 1 : 0;
    
    // Spread Check (0-1 points)
    const estimatedSpread = getEstimatedSpread(pair);
    const spreadScore = estimatedSpread <= 2.0 ? 1 : 0;
    
    return {
        cotBias: {
            score: cotBiasScore,
            value: cotBiasScore === 2 ? 'Strong Institutional Bias' : 
                   cotBiasScore === 1 ? 'Weak Institutional Bias' : 'No Clear Bias',
            description: 'Large speculator positioning analysis'
        },
        trendConfirmation: {
            score: trendConfirmationScore,
            value: `${trendConfirmationScore}/3 timeframes aligned`,
            description: `Multi-timeframe trend analysis (${trendAnalysis.direction})`
        },
        adxStrength: {
            score: adxScore,
            value: adxValue.toFixed(1),
            description: `ADX strength indicator: ${adxValue >= 25 ? 'Strong trend' : 'Weak trend'}`
        },
        supportRetest: {
            score: supportScore,
            value: supportScore === 2 ? 'At Key Level' : 
                   supportScore === 1 ? 'Near Support/Resistance' : 'No Key Level',
            description: 'Support/resistance level analysis'
        },
        priceStructure: {
            score: structureScore,
            value: structureScore ? 'Clean Structure' : 'Choppy Structure',
            description: 'Price action structure quality'
        },
        spreadCheck: {
            score: spreadScore,
            value: `${estimatedSpread.toFixed(1)} pips`,
            description: `Transaction cost analysis: ${spreadScore ? 'Acceptable' : 'High cost'}`
        }
    };
}

// Function to calculate D-Size from breakdown
function calculateDSize(breakdown) {
    if (!breakdown) return 0;
    
    return (breakdown.cotBias?.score || 0) + 
           (breakdown.trendConfirmation?.score || 0) + 
           (breakdown.adxStrength?.score || 0) + 
           (breakdown.supportRetest?.score || 0) + 
           (breakdown.priceStructure?.score || 0) + 
           (breakdown.spreadCheck?.score || 0);
}

// Get base price for each currency pair
function getBasePriceForPair(pair) {
    const basePrices = {
        'EUR/USD': 1.0850, 'GBP/USD': 1.2720, 'USD/JPY': 149.85, 'USD/CHF': 0.8745,
        'AUD/USD': 0.6685, 'USD/CAD': 1.3580, 'NZD/USD': 0.6125, 'XAU/USD': 2035.50,
        'EUR/GBP': 0.8520, 'EUR/JPY': 162.45, 'GBP/JPY': 190.72, 'AUD/CAD': 0.9080,
        'AUD/JPY': 100.25, 'CAD/JPY': 110.45, 'CHF/JPY': 171.20, 'EUR/CAD': 1.4730,
        'EUR/CHF': 0.9485, 'EUR/NZD': 1.7720, 'EUR/TRY': 35.42, 'GBP/AUD': 1.9025,
        'GBP/CAD': 1.7280, 'GBP/CHF': 1.1130, 'NZD/CAD': 0.8320, 'NZD/CHF': 0.5355,
        'NZD/JPY': 91.80, 'USD/TRY': 32.65, 'USD/ZAR': 18.92, 'AUD/CHF': 0.5845,
        'AUD/NZD': 1.0920
    };
    
    return basePrices[pair] || (Math.random() * 2 + 0.5);
}

// Get estimated spread for each pair
function getEstimatedSpread(pair) {
    const majorPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD'];
    const minorPairs = ['EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/CAD', 'AUD/JPY', 'CAD/JPY'];
    
    if (pair === 'XAU/USD') return 0.5;
    if (majorPairs.includes(pair)) return Math.random() * 0.8 + 0.5; // 0.5-1.3 pips
    if (minorPairs.includes(pair)) return Math.random() * 1.0 + 1.0; // 1.0-2.0 pips
    return Math.random() * 2.0 + 1.5; // 1.5-3.5 pips for exotic pairs
}

// Generate active bots with realistic data
function generateActiveBots() {
    const activeBotPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD'];
    const botTypes = ['Dynamic DCA', 'Static Grid', 'AI Trend'];
    
    return activeBotPairs.map((pair, index) => {
        const entryDScore = Math.random() * 3 + 7; // 7-10 range
        const currentDScore = entryDScore + (Math.random() - 0.5) * 2; // Some drift
        const totalPL = (Math.random() - 0.3) * 500; // Slightly negative bias
        
        const activeTrades = [];
        const numTrades = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numTrades; i++) {
            const direction = Math.random() > 0.5 ? 'buy' : 'sell';
            const entryPrice = getBasePriceForPair(pair) + (Math.random() - 0.5) * 0.01;
            const currentPL = (Math.random() - 0.4) * 100;
            
            activeTrades.push({
                id: `trade_${Date.now()}_${i}`,
                botId: `bot_${pair.replace('/', '')}_${index}`,
                pair,
                direction,
                entryPrice,
                lotSize: (Math.random() * 0.05 + 0.01).toFixed(2),
                sl: null,
                tp: 100,
                currentPL,
                isReentry: i > 0,
                reentryLevel: i,
                entryTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                score: entryDScore,
                reason: `D-Size entry at ${entryDScore.toFixed(1)}`
            });
        }
        
        return {
            id: `bot_${pair.replace('/', '')}_${index}`,
            pair,
            type: botTypes[index % botTypes.length],
            totalPL,
            status: 'active',
            entryDScore,
            currentDScore,
            globalSL: 500,
            globalTP: 100,
            trailingProfitEnabled: Math.random() > 0.5,
            closeAtNextTP: Math.random() > 0.8,
            autoStopScore: 6.0,
            activeTrades,
            lastUpdate: new Date().toISOString()
        };
    });
}

// Enhanced COT data generation
async function generateCOTData() {
    console.log('📊 Generating enhanced COT data...');
    
    try {
        if (window.supabaseApi) {
            const liveCOTData = await window.supabaseApi.getCOTReportHistory();
            
            if (liveCOTData && liveCOTData.length > 0) {
                console.log(`✅ Successfully loaded COT data for ${liveCOTData.length} currencies`);
                return liveCOTData;
            }
        }
        
        console.warn('⚠️ No live COT data available, using enhanced fallback');
        return generateEnhancedCOTData();
        
    } catch (error) {
        console.error('❌ Error fetching COT data:', error);
        return generateEnhancedCOTData();
    }
}

// Generate enhanced COT fallback data
function generateEnhancedCOTData() {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
    
    return currencies.map(currency => {
        const history = [];
        const now = new Date();
        
        // Generate 6 weeks of data
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - (i * 7));
            
            // Create somewhat realistic institutional positioning
            const baseLong = Math.floor(Math.random() * 80000) + 60000;
            const baseShort = Math.floor(Math.random() * 70000) + 50000;
            
            // Add some trend/bias to make it more realistic
            const bias = currency === 'USD' ? 1.1 : currency === 'EUR' ? 0.9 : 1.0;
            const longPosition = Math.floor(baseLong * bias);
            const shortPosition = Math.floor(baseShort / bias);
            
            history.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                longPosition,
                shortPosition,
                netPosition: longPosition - shortPosition
            });
        }
        
        return { currency, history };
    });
}

// Enhanced forex news generation
function generateForexNews() {
    const newsEvents = [
        {
            time: '08:30',
            currency: 'USD',
            event: 'Non-Farm Payrolls',
            impact: 'High',
            forecast: '180K',
            actual: '185K',
            previous: '175K'
        },
        {
            time: '10:00',
            currency: 'EUR',
            event: 'CPI Flash Estimate',
            impact: 'High',
            forecast: '2.4%',
            actual: '',
            previous: '2.2%'
        },
        {
            time: '12:00',
            currency: 'GBP',
            event: 'BOE Interest Rate Decision',
            impact: 'High',
            forecast: '5.25%',
            actual: '',
            previous: '5.25%'
        },
        {
            time: '14:00',
            currency: 'USD',
            event: 'FOMC Meeting Minutes',
            impact: 'Medium',
            forecast: '',
            actual: '',
            previous: ''
        },
        {
            time: '09:30',
            currency: 'AUD',
            event: 'Employment Change',
            impact: 'Medium',
            forecast: '15K',
            actual: '',
            previous: '12K'
        }
    ];
    
    return newsEvents;
}

console.log('✅ Enhanced data generators loaded with comprehensive fallback data');

// Make functions globally available
window.generateMarketDataWithScoring = generateMarketDataWithScoring;
window.generateActiveBots = generateActiveBots;
window.generateCOTData = generateCOTData;
window.generateForexNews = generateForexNews;