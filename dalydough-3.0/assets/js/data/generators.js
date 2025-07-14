// Updated Data Generators with Live API Integration - Replace assets/js/data/generators.js

// Enhanced trend analysis function with CORRECTED scoring
function analyzeTrend(trendH4, trendD1, trendW1) {
    const trends = [trendH4, trendD1, trendW1];
    const upCount = trends.filter(t => t === 'Up').length;
    const downCount = trends.filter(t => t === 'Down').length;
    const neutralCount = trends.filter(t => t === 'Neutral').length;
    
    // CORRECTED: Count only aligned timeframes in same direction
    let trendConfirmationScore = 0;
    
    if (upCount >= 2 && downCount === 0) {
        // Pure bullish alignment (2-3 Ups, rest Neutral)
        trendConfirmationScore = upCount;
    } else if (downCount >= 2 && upCount === 0) {
        // Pure bearish alignment (2-3 Downs, rest Neutral)
        trendConfirmationScore = downCount;
    } else if (upCount === 3) {
        // All bullish
        trendConfirmationScore = 3;
    } else if (downCount === 3) {
        // All bearish  
        trendConfirmationScore = 3;
    } else {
        // Mixed signals (conflicting directions) = 0 points
        trendConfirmationScore = 0;
    }
    
    // Calculate alignment (highest count of same direction)
    const alignment = Math.max(upCount, downCount, neutralCount);
    
    // Determine overall direction
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
        trendConfirmationScore  // Now correctly calculated!
    };
}

// Enhanced function to fetch live market data with FMP integration
async function generateMarketDataWithScoring() {
    console.log('🔄 Fetching live market data from Supabase/FMP...');
    
    try {
        // Try to get live data from Supabase function
        if (window.supabaseApi) {
            const liveData = await window.supabaseApi.getMarketDataWithScoring();
            
            if (liveData && liveData.length > 0) {
                console.log(`✅ Successfully loaded ${liveData.length} live market trends from FMP`);
                
                // Process the live data to ensure it has all needed properties
                return liveData.map(trend => ({
                    ...trend,
                    trendAnalysis: analyzeTrend(trend.trendH4, trend.trendD1, trend.trendW1),
                    // Ensure breakdown exists and has all components
                    breakdown: trend.breakdown || generateFallbackBreakdown(parseFloat(trend.dsize))
                }));
            }
        }
        
        console.warn('⚠️ Live data not available, using enhanced fallback data');
        return generateEnhancedFallbackData();
        
    } catch (error) {
        console.error('❌ Error fetching live market data:', error);
        console.log('🔄 Falling back to enhanced mock data');
        return generateEnhancedFallbackData();
    }
}

// Enhanced fallback data that mimics the live data structure
function generateEnhancedFallbackData() {
    return CURRENCY_PAIRS.map(pair => {
        // Generate trend data
        const trendH4 = TREND_VALUES[Math.floor(Math.random() * TREND_VALUES.length)];
        const trendD1 = TREND_VALUES[Math.floor(Math.random() * TREND_VALUES.length)];
        const trendW1 = TREND_VALUES[Math.floor(Math.random() * TREND_VALUES.length)];
        
        // Analyze trend for scoring and directional signal
        const trendAnalysis = analyzeTrend(trendH4, trendD1, trendW1);
        
        // Generate enhanced scoring breakdown 
        const breakdown = generateEnhancedScoringBreakdown(pair, trendAnalysis);
        const dsize = calculateDSize(breakdown);
        
        // Generate realistic price data
        const currentPrice = generateRealisticPrice(pair);
        const dailyChange = (Math.random() - 0.5) * 0.02;
        const dailyChangePercent = (dailyChange / currentPrice) * 100;
        
        // Determine entry status with direction
        const canEnter = dsize >= 7;
        let entryStatus;
        
        if (!canEnter) {
            entryStatus = 'Block';
        } else {
            // If can enter, show direction based on trend analysis
            switch (trendAnalysis.direction) {
                case 'bullish':
                    entryStatus = 'Allow Buy';
                    break;
                case 'bearish':
                    entryStatus = 'Allow Sell';
                    break;
                case 'neutral':
                    if (dailyChange > 0) {
                        entryStatus = 'Allow Buy';
                    } else if (dailyChange < 0) {
                        entryStatus = 'Allow Sell';
                    } else {
                        entryStatus = 'Allow Trade';
                    }
                    break;
                default:
                    entryStatus = 'Block';
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
            lastUpdated: new Date().toISOString()
        };
    }).sort((a, b) => parseFloat(b.dsize) - parseFloat(a.dsize));
}

// Generate realistic prices for different pairs
function generateRealisticPrice(pair) {
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

// Enhanced scoring breakdown generator
function generateEnhancedScoringBreakdown(pair, trendAnalysis) {
    const cotScore = Math.random() > 0.6 ? 2 : Math.random() > 0.3 ? 1 : 0;
    const trendScore = trendAnalysis.trendConfirmationScore;
    const adxValue = Math.random() * 50 + 10;
    const adxScore = adxValue >= 25 ? 1 : 0; // Real ADX threshold
    const supportScore = Math.random() > 0.5 ? 2 : Math.random() > 0.3 ? 1 : 0;
    const structureScore = Math.random() > 0.4 ? 1 : 0;
    const spreadValue = getEstimatedSpread(pair);
    const spreadScore = spreadValue < 2.0 ? 1 : 0;

    return {
        cotBias: {
            score: cotScore,
            value: cotScore === 2 ? 'Strong Institutional Bias' : cotScore === 1 ? 'Weak Institutional Bias' : 'No Clear Bias',
            description: 'Weekly directional bias from institutional positioning'
        },
        trendConfirmation: {
            score: trendScore,
            value: `${trendScore}/3 timeframes aligned (${trendAnalysis.direction})`,
            description: 'Multi-timeframe trend alignment analysis'
        },
        adxStrength: {
            score: adxScore,
            value: adxValue.toFixed(1),
            description: 'ADX ≥ 25 confirms strong trending market'
        },
        supportRetest: {
            score: supportScore,
            value: supportScore === 2 ? 'Valid Retest Level' : supportScore === 1 ? 'Near Key Level' : 'No Key Levels',
            description: 'Price proximity to significant support/resistance'
        },
        priceStructure: {
            score: structureScore,
            value: structureScore ? 'Clean Structure' : 'Choppy Structure',
            description: 'Higher highs/lower lows pattern confirmation'
        },
        spreadCheck: {
            score: spreadScore,
            value: `${spreadValue.toFixed(1)} pips`,
            description: 'Transaction cost analysis (lower is better)'
        }
    };
}

// Get estimated spread for different pairs
function getEstimatedSpread(pair) {
    const majorPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD'];
    const minorPairs = ['EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'GBP/CHF'];
    const exoticPairs = ['USD/TRY', 'USD/ZAR', 'EUR/TRY'];
    
    if (pair === 'XAU/USD') return Math.random() * 1 + 0.3; // Gold spreads
    if (majorPairs.includes(pair)) return Math.random() * 0.8 + 0.5; // 0.5-1.3 pips
    if (minorPairs.includes(pair)) return Math.random() * 1.5 + 1.0; // 1.0-2.5 pips  
    if (exoticPairs.includes(pair)) return Math.random() * 3 + 2.0; // 2.0-5.0 pips
    return Math.random() * 2 + 1.0; // Default 1.0-3.0 pips
}

// Fallback breakdown generator for when live data doesn't have complete breakdown
function generateFallbackBreakdown(dsize) {
    const targetScore = Math.round(dsize);
    let remaining = targetScore;
    
    const cotScore = Math.min(2, Math.max(0, Math.floor(Math.random() * 3)));
    remaining -= cotScore;
    
    const trendScore = Math.min(3, Math.max(0, Math.floor(Math.random() * Math.min(4, remaining + 1))));
    remaining -= trendScore;
    
    const adxScore = Math.min(1, Math.max(0, remaining > 0 ? (Math.random() > 0.5 ? 1 : 0) : 0));
    remaining -= adxScore;
    
    const supportScore = Math.min(2, Math.max(0, remaining));
    remaining -= supportScore;
    
    const structureScore = remaining > 0 ? 1 : 0;
    remaining -= structureScore;
    
    const spreadScore = remaining > 0 ? 1 : (Math.random() > 0.3 ? 1 : 0);
    
    return {
        cotBias: { score: cotScore, value: 'Estimated', description: 'Estimated bias' },
        trendConfirmation: { score: trendScore, value: `${trendScore}/3`, description: 'Estimated alignment' },
        adxStrength: { score: adxScore, value: (Math.random() * 40 + 15).toFixed(1), description: 'Estimated strength' },
        supportRetest: { score: supportScore, value: 'Estimated', description: 'Estimated levels' },
        priceStructure: { score: structureScore, value: 'Estimated', description: 'Estimated structure' },
        spreadCheck: { score: spreadScore, value: '1.5 pips', description: 'Estimated spread' }
    };
}

function calculateDSize(breakdown) {
    return breakdown.cotBias.score + 
           breakdown.trendConfirmation.score + 
           breakdown.adxStrength.score + 
           breakdown.supportRetest.score + 
           breakdown.priceStructure.score + 
           breakdown.spreadCheck.score;
}

// Enhanced active bots generator with more realistic data
function generateActiveBots() {
    const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'XAU/USD'];
    
    return pairs.map((pair, i) => {
        const totalPL = (Math.random() - 0.4) * 500;
        const entryDScore = Math.random() * 3 + 7;
        const currentDScore = Math.max(0, Math.min(10, entryDScore + (Math.random() - 0.5) * 2));
        
        // Generate multiple active trades per bot
        const numTrades = Math.floor(Math.random() * 4) + 1;
        const activeTrades = [];
        
        for (let j = 0; j < numTrades; j++) {
            const direction = j === 0 ? (Math.random() > 0.5 ? 'buy' : 'sell') : 
                             (activeTrades[0].direction === 'buy' ? 'buy' : 'sell');
            const entryPrice = generateRealisticPrice(pair);
            const lotSize = (0.01 * Math.pow(1.5, j)).toFixed(2);
            const tradePL = (Math.random() - 0.5) * 200;
            
            activeTrades.push({
                id: `${pair.replace('/', '')}_T${j + 1}_${Date.now()}`,
                botId: `bot_${i}`,
                pair,
                direction,
                entryPrice,
                lotSize: parseFloat(lotSize),
                sl: 500,
                tp: 1000,
                currentPL: tradePL,
                isReentry: j > 0,
                reentryLevel: j,
                entryTime: new Date(Date.now() - (j * 3600000)).toISOString(),
                score: entryDScore,
                reason: j === 0 ? 'Initial entry based on D-size criteria' : `Re-entry level ${j}`
            });
        }
        
        const calculatedPL = activeTrades.reduce((sum, trade) => sum + trade.currentPL, 0);
        
        return {
            id: `bot_${i}`,
            pair,
            type: BOT_TYPES[Math.floor(Math.random() * BOT_TYPES.length)],
            totalPL: calculatedPL,
            status: 'active',
            entryDScore,
            currentDScore,
            globalSL: Math.floor(Math.random() * 500) + 100,
            globalTP: Math.floor(Math.random() * 1000) + 200,
            manualSL: Math.random() > 0.7 ? Math.floor(Math.random() * 100) + 50 : null,
            manualTP: Math.random() > 0.7 ? Math.floor(Math.random() * 200) + 100 : null,
            trailingProfitEnabled: Math.random() > 0.5,
            closeAtNextTP: Math.random() > 0.7,
            activeTrades,
            lastUpdate: new Date().toISOString()
        };
    });
}

// Enhanced COT data generator with live API integration
async function generateCOTData() {
    console.log('📊 Fetching COT data...');
    
    try {
        if (window.supabaseApi) {
            const liveCOTData = await window.supabaseApi.getCOTReportHistory();
            
            if (liveCOTData && liveCOTData.length > 0) {
                console.log(`✅ Successfully loaded COT data for ${liveCOTData.length} currencies`);
                return liveCOTData;
            }
        }
        
        console.warn('⚠️ Live COT data not available, using fallback');
        return generateFallbackCOTData();
        
    } catch (error) {
        console.error('❌ Error fetching COT data:', error);
        return generateFallbackCOTData();
    }
}

function generateFallbackCOTData() {
    return COT_CURRENCIES.map(currency => {
        const history = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - (i * 7));
            
            const longPos = Math.floor(Math.random() * 100000) + 50000;
            const shortPos = Math.floor(Math.random() * 80000) + 40000;
            const netPos = longPos - shortPos;
            
            history.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                longPosition: longPos,
                shortPosition: shortPos,
                netPosition: netPos
            });
        }
        
        return { currency, history };
    });
}

// Enhanced forex news generator  
function generateForexNews() {
    return NEWS_EVENTS.map((item, i) => {
        const time = new Date();
        time.setHours(8 + i, Math.floor(Math.random() * 60));
        
        const forecast = Math.random() * 2 + 0.5;
        const actual = forecast + (Math.random() - 0.5) * 0.4;
        
        return {
            ...item,
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            forecast: forecast.toFixed(1) + '%',
            actual: actual.toFixed(1) + '%',
            previous: (forecast - 0.1).toFixed(1) + '%'
        };
    });
}

console.log('✅ Enhanced Data generators loaded with live API integration');