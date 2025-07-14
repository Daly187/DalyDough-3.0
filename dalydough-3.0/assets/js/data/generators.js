// Clean Data Generators - Remove All Mock Data - assets/js/data/generators.js

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

// Function to fetch live market data (rely on API only)
async function generateMarketDataWithScoring() {
    console.log('🔄 Fetching live market data from Supabase/FMP...');
    
    try {
        if (window.supabaseApi) {
            const liveData = await window.supabaseApi.getMarketDataWithScoring();
            
            if (liveData && liveData.length > 0) {
                console.log(`✅ Successfully loaded ${liveData.length} live market trends from FMP`);
                
                return liveData.map(trend => ({
                    ...trend,
                    trendAnalysis: analyzeTrend(trend.trendH4, trend.trendD1, trend.trendW1),
                    breakdown: trend.breakdown || {}
                }));
            }
        }
        
        console.warn('⚠️ No live data available');
        return [];
        
    } catch (error) {
        console.error('❌ Error fetching live market data:', error);
        return [];
    }
}

// Function to calculate D-Size (keep - this is logic)
function calculateDSize(breakdown) {
    if (!breakdown) return 0;
    
    return (breakdown.cotBias?.score || 0) + 
           (breakdown.trendConfirmation?.score || 0) + 
           (breakdown.adxStrength?.score || 0) + 
           (breakdown.supportRetest?.score || 0) + 
           (breakdown.priceStructure?.score || 0) + 
           (breakdown.spreadCheck?.score || 0);
}

// Empty active bots - will be populated when real bots are created
function generateActiveBots() {
    return [];
}

// COT data from API only
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
        
        console.warn('⚠️ No live COT data available');
        return [];
        
    } catch (error) {
        console.error('❌ Error fetching COT data:', error);
        return [];
    }
}

// Empty forex news - will be populated from API
function generateForexNews() {
    return [];
}

console.log('✅ Clean data generators loaded (no mock data)');