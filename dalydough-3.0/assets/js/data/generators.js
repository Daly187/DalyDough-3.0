// D-Size Scoring Functions with corrected trend scoring
function generateScoringBreakdown(pair, trendAnalysis) {
    const cotScore = Math.random() > 0.6 ? 2 : Math.random() > 0.3 ? 1 : 0;
    // Use the corrected trend confirmation score from trend analysis
    const trendScore = trendAnalysis.trendConfirmationScore;
    const adxValue = Math.random() * 50 + 10;
    const adxScore = adxValue >= 20 ? 1 : 0;
    const supportScore = Math.random() > 0.5 ? 2 : Math.random() > 0.3 ? 1 : 0;
    const structureScore = Math.random() > 0.4 ? 1 : 0;
    const spreadValue = Math.random() * 2 + 0.5;
    const spreadScore = spreadValue < 1.5 ? 1 : 0;

    return {
        cotBias: {
            score: cotScore,
            value: cotScore === 2 ? 'Strong Bias' : cotScore === 1 ? 'Weak Bias' : 'No Bias',
            description: 'Weekly directional bias from COT data'
        },
        trendConfirmation: {
            score: trendScore,
            value: `${trendScore}/3 timeframes aligned`,
            description: 'Points only for aligned timeframes (no conflicts)'
        },
        adxStrength: {
            score: adxScore,
            value: adxValue.toFixed(1),
            description: 'ADX ≥ 20 confirms healthy trend'
        },
        supportRetest: {
            score: supportScore,
            value: supportScore === 2 ? 'Valid Retest' : supportScore === 1 ? 'Near Support' : 'No Support',
            description: 'Price near confirmed support level'
        },
        priceStructure: {
            score: structureScore,
            value: structureScore ? 'Clean Structure' : 'Choppy Structure',
            description: 'HH/HL or LH/LL pattern confirmed'
        },
        spreadCheck: {
            score: spreadScore,
            value: `${spreadValue.toFixed(1)} pips`,
            description: 'Spread < 1.5 pips ensures low-cost execution'
        }
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

function generateMarketDataWithScoring() {
    return CURRENCY_PAIRS.map(pair => {
        // Generate trend data
        const trendH4 = TREND_VALUES[Math.floor(Math.random() * TREND_VALUES.length)];
        const trendD1 = TREND_VALUES[Math.floor(Math.random() * TREND_VALUES.length)];
        const trendW1 = TREND_VALUES[Math.floor(Math.random() * TREND_VALUES.length)];
        
        // Analyze trend for scoring and directional signal
        const trendAnalysis = analyzeTrend(trendH4, trendD1, trendW1);
        
        // Generate scoring breakdown using corrected trend score
        const breakdown = generateScoringBreakdown(pair, trendAnalysis);
        const dsize = calculateDSize(breakdown);
        
        // Generate price data
        const currentPrice = Math.random() * 2 + 1;
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
                    // For neutral trends, look at recent price action
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

// Generate enhanced mock active bots with new fields
function generateActiveBots() {
    const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'XAU/USD'];
    
    return pairs.map((pair, i) => {
        const totalPL = (Math.random() - 0.4) * 500;
        const entryDScore = Math.random() * 3 + 7;
        const currentDScore = entryDScore + (Math.random() - 0.5) * 2;
        
        // Generate multiple active trades per bot
        const numTrades = Math.floor(Math.random() * 4) + 1; // 1-4 trades
        const activeTrades = [];
        
        for (let j = 0; j < numTrades; j++) {
            const direction = j === 0 ? (Math.random() > 0.5 ? 'buy' : 'sell') : 
                             (activeTrades[0].direction === 'buy' ? 'buy' : 'sell'); // Keep same direction
            const entryPrice = 1.25000 + (Math.random() - 0.5) * 0.1;
            const lotSize = (0.01 * Math.pow(1.5, j)).toFixed(2); // Increasing lot sizes
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
                entryTime: new Date(Date.now() - (j * 3600000)).toISOString(), // Stagger entry times
                score: entryDScore,
                reason: j === 0 ? 'Initial entry based on D-size criteria' : `Re-entry level ${j}`
            });
        }
        
        // Calculate total P&L from all trades
        const calculatedPL = activeTrades.reduce((sum, trade) => sum + trade.currentPL, 0);
        
        return {
            id: `bot_${i}`,
            pair,
            type: BOT_TYPES[Math.floor(Math.random() * BOT_TYPES.length)],
            totalPL: calculatedPL,
            status: 'active',
            entryDScore,
            currentDScore: Math.max(0, Math.min(10, currentDScore)),
            globalSL: Math.floor(Math.random() * 500) + 100,
            globalTP: Math.floor(Math.random() * 1000) + 200,
            manualSL: Math.random() > 0.7 ? Math.floor(Math.random() * 100) + 50 : null, // 30% chance of manual SL
            manualTP: Math.random() > 0.7 ? Math.floor(Math.random() * 200) + 100 : null, // 30% chance of manual TP
            trailingProfitEnabled: Math.random() > 0.5,
            closeAtNextTP: Math.random() > 0.7,
            activeTrades,
            lastUpdate: new Date().toISOString()
        };
    });
}

// Generate COT data
function generateCOTData() {
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

// Generate forex news
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

console.log('✅ Data generators loaded');