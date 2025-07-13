// SVG Icons
const icons = {
    arrowUp: `<svg viewBox="0 0 24 24" fill="currentColor" class="trend-up"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14l-6-6z"></path></svg>`,
    arrowDown: `<svg viewBox="0 0 24 24" fill="currentColor" class="trend-down"><path d="M12 16l-6-6 1.41-1.41L12 13.17l4.59-4.58L18 10l-6 6z"></path></svg>`,
    neutral: `<svg viewBox="0 0 24 24" fill="currentColor" class="trend-neutral"><path d="M4 11h16v2H4z"></path></svg>`,
    brain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.94.44c-.22-.67-.22-1.42 0-2.08.33-1 .67-2 .67-3 0-1-.33-2-.67-3-.22-.67-.22-1.42 0-2.08A2.5 2.5 0 0 1 9.5 2z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.94.44c.22-.67.22-1.42 0-2.08-.33-1-.67-2-.67-3 0-1 .33-2 .67-3 .22-.67-.22-1.42 0-2.08A2.5 2.5 0 0 0 14.5 2z"></path></svg>`,
    bolt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>`,
    resizeHorizontal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 8 21 12 17 16"></polyline><polyline points="7 8 3 12 7 16"></polyline><line x1="3" y1="12" x2="21" y2="12"></line></svg>`
};

// Utility Functions
function getTrendIcon(trend) {
    if (trend === 'Up') return icons.arrowUp;
    if (trend === 'Down') return icons.arrowDown;
    return icons.neutral;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(value);
}

// Helper function to get entry status styling class
function getEntryStatusClass(entryStatus) {
    if (entryStatus === 'Block') {
        return 'entry-block';
    } else if (entryStatus.includes('Allow')) {
        return 'entry-allow';
    }
    return 'entry-neutral';
}

// Helper function to get entry status icon
function getEntryStatusIcon(entryStatus) {
    if (entryStatus === 'Block') {
        return '✗';
    } else if (entryStatus === 'Allow Buy') {
        return '↗';
    } else if (entryStatus === 'Allow Sell') {
        return '↘';
    } else if (entryStatus.includes('Allow')) {
        return '✓';
    }
    return '—';
}

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

console.log('✅ Utils loaded');