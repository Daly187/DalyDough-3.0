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

        throw new Error('Live data is not available.');

    } catch (error) {
        console.error('❌ Error fetching live market data:', error);
        throw error;
    }
}