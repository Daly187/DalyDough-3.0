// Clean Market Components - assets/js/shared/market-components.js

// Create Market Trends Table - shows real data or empty state
function createMarketTrendsTable(data) {
    const sortIcon = (column) => {
        if (appState.marketDataSort.column !== column) return '';
        return appState.marketDataSort.direction === 'asc' ? '▲' : '▼';
    };

    // If no data, show empty state
    if (!data || data.length === 0) {
        return `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem; opacity: 0.5;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <path d="M9 9h.01"></path>
                    <path d="M15 9h.01"></path>
                </svg>
                <h3>No Market Data Available</h3>
                <p style="margin: 0.5rem 0 1.5rem 0;">Waiting for live API data connection</p>
                <button class="btn btn-primary" onclick="refreshMarketData()">
                    Retry Connection
                </button>
            </div>
        `;
    }

    const sortedData = [...data].sort((a, b) => {
        const { column, direction } = appState.marketDataSort;
        const asc = direction === 'asc' ? 1 : -1;

        switch (column) {
            case 'pair':
                return a.pair.localeCompare(b.pair) * asc;
            case 'setupQuality':
                const qualityOrder = { 'A': 3, 'B': 2, 'C': 1 };
                return (qualityOrder[a.setupQuality] - qualityOrder[b.setupQuality]) * asc;
            case 'dsize':
                return (parseFloat(a.dsize) - parseFloat(b.dsize)) * asc;
            default:
                return 0;
        }
    });

    return `
        <div class="table-container">
            <table class="market-table">
                <thead>
                    <tr>
                        <th class="sortable-header" data-sort="pair">Pair ${sortIcon('pair')}</th>
                        <th>Price / Change</th>
                        <th>Trend Analysis</th>
                        <th class="sortable-header" data-sort="setupQuality">Quality ${sortIcon('setupQuality')}</th>
                        <th>Market Conditions</th>
                        <th class="sortable-header" data-sort="dsize">D-Size ${sortIcon('dsize')}</th>
                        <th>Entry Signal</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedData.map(d => {
                        const isExpanded = appState.expandedTrendPair === d.pair;
                        const entryStatusClass = getEntryStatusClass(d.entryStatus || 'Block');
                        
                        return `
                            <tr class="is-expandable ${isExpanded ? 'active' : ''}" data-pair='${JSON.stringify(d).replace(/'/g, "&#39;")}'>
                                <td>${d.pair}</td>
                                <td>
                                    <div class="price-cell">
                                        <span class="current-price">${d.currentPrice ? d.currentPrice.toFixed(5) : 'N/A'}</span>
                                        ${d.dailyChange !== undefined ? `
                                            <div class="price-change ${d.dailyChange >= 0 ? 'positive' : 'negative'}">
                                                ${d.dailyChange >= 0 ? '↗' : '↘'} ${Math.abs(d.dailyChange).toFixed(4)} 
                                                (${d.dailyChangePercent >= 0 ? '+' : ''}${d.dailyChangePercent.toFixed(2)}%)
                                            </div>
                                        ` : '<div class="price-change">No data</div>'}
                                    </div>
                                </td>
                                <td class="trend-cell">
                                    <div class="trend-indicator">
                                        <div class="trend-timeframe">W1</div>
                                        ${getTrendIcon(d.trendW1 || 'Neutral')}
                                    </div>
                                    <div class="trend-indicator">
                                        <div class="trend-timeframe">D1</div>
                                        ${getTrendIcon(d.trendD1 || 'Neutral')}
                                    </div>
                                    <div class="trend-indicator">
                                        <div class="trend-timeframe">H4</div>
                                        ${getTrendIcon(d.trendH4 || 'Neutral')}
                                    </div>
                                </td>
                                <td><span class="setup-quality-pill quality-${d.setupQuality || 'C'}">${d.setupQuality || 'C'}</span></td>
                                <td class="conditions-cell">
                                    <span class="condition-icon ${d.conditions?.cot ? 'active' : ''}" title="COT Bias">${icons.brain}</span>
                                    <span class="condition-icon ${d.conditions?.adx ? 'active' : ''}" title="ADX Strength">${icons.bolt}</span>
                                    <span class="condition-icon ${d.conditions?.spread ? 'active' : ''}" title="Spread Check">${icons.resizeHorizontal}</span>
                                </td>
                                <td><span class="recommendation-score score-${Number(d.dsize) >= 8 ? 'high' : Number(d.dsize) >= 6 ? 'medium' : 'low'}">${d.dsize || '0.0'}</span></td>
                                <td>
                                    <div class="entry-status ${entryStatusClass}">
                                        ${getEntryStatusIcon(d.entryStatus || 'Block')} ${d.entryStatus || 'Block'}
                                    </div>
                                </td>
                            </tr>
                            ${isExpanded ? `<tr class="expanded-row"><td colspan="7">${createDetailedMarketAnalysisCard(d)}</td></tr>` : ''}
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}