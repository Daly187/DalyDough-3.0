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

// Detailed Market Analysis Card - shows real data or placeholder
function createDetailedMarketAnalysisCard(trend) {
    const totalScore = parseFloat(trend.dsize) || 0;
    const canEnter = totalScore >= 7;
    
    return `
        <div class="detailed-scoring-card">
            <!-- Pair Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-surface-2); border-radius: 8px; border-left: 4px solid var(--accent-blue);">
                <div>
                    <h4 style="color: var(--text-primary); font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">${trend.pair}</h4>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Market Analysis</div>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.25rem;">Live Spot Price</div>
                    <div style="font-family: 'Monaco', 'Menlo', monospace; font-size: 1.4rem; font-weight: 700; color: var(--text-primary);">
                        ${trend.currentPrice ? trend.currentPrice.toFixed(5) : 'N/A'}
                    </div>
                    ${trend.dailyChange !== undefined ? `
                        <div style="font-size: 0.85rem; color: ${trend.dailyChange >= 0 ? 'var(--positive-green)' : 'var(--negative-red)'};">
                            ${trend.dailyChange >= 0 ? '↗' : '↘'} ${Math.abs(trend.dailyChange).toFixed(4)} (${trend.dailyChangePercent >= 0 ? '+' : ''}${trend.dailyChangePercent.toFixed(2)}%)
                        </div>
                    ` : '<div style="font-size: 0.85rem; color: var(--text-secondary);">No price data</div>'}
                </div>
            </div>

            <!-- D-Size Breakdown Table -->
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 0.75rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                    🎯 D-Size Breakdown
                    <span style="background: ${totalScore >= 8 ? 'var(--positive-green)' : totalScore >= 6 ? 'var(--warning-yellow)' : 'var(--negative-red)'}; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">
                        ${totalScore.toFixed(1)}/10
                    </span>
                </h4>
                
                ${!trend.breakdown || Object.keys(trend.breakdown).length === 0 ? `
                    <div style="text-align: center; padding: 2rem; color: var(--text-secondary); background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem; opacity: 0.5;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 6v6l4 2"></path>
                        </svg>
                        <p>No breakdown data available</p>
                        <p style="font-size: 0.85rem;">Waiting for API connection</p>
                    </div>
                ` : `
                    <div class="table-container" style="border: 1px solid var(--border-color); border-radius: 8px;">
                        <table style="min-width: auto; background: var(--bg-surface);">
                            <thead>
                                <tr style="background: var(--bg-surface-2);">
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Component</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Value</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Score</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Max</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(trend.breakdown).map(([key, component]) => `
                                    <tr style="border-bottom: 1px solid var(--border-color);">
                                        <td style="padding: 0.75rem 0.5rem; font-weight: 500; color: var(--text-primary);">
                                            ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        </td>
                                        <td style="padding: 0.75rem 0.5rem; color: var(--text-secondary); font-family: 'Monaco', 'Menlo', monospace; font-size: 0.875rem;">
                                            ${component.value || 'N/A'}
                                        </td>
                                        <td style="padding: 0.75rem 0.5rem; font-weight: 600; text-align: center; color: ${component.score > 0 ? 'var(--positive-green)' : 'var(--text-tertiary)'};">
                                            +${component.score || 0}
                                        </td>
                                        <td style="padding: 0.75rem 0.5rem; color: var(--text-secondary); text-align: center;">
                                            /${key === 'cotBias' || key === 'supportRetest' ? '2' : key === 'trendConfirmation' ? '3' : '1'}
                                        </td>
                                    </tr>
                                `).join('')}
                                <tr style="border-top: 2px solid var(--border-color); font-weight: 700; background: var(--bg-surface-2);">
                                    <td style="padding: 0.75rem 0.5rem; color: var(--text-primary);">Total D-Size</td>
                                    <td style="padding: 0.75rem 0.5rem;">-</td>
                                    <td style="padding: 0.75rem 0.5rem; color: var(--accent-blue); font-size: 1.1rem; text-align: center;">${trend.dsize}</td>
                                    <td style="padding: 0.75rem 0.5rem; color: var(--text-secondary); text-align: center;">/10</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `}
            </div>

            <!-- Entry Decision Summary -->
            <div style="margin-top: 1rem; padding: 1rem; background: ${canEnter ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border-radius: 6px; border-left: 4px solid ${canEnter ? 'var(--positive-green)' : 'var(--negative-red)'};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>Entry Decision:</strong> Score ≥ 7.0 required for new positions
                    </div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: ${canEnter ? 'var(--positive-green)' : 'var(--negative-red)'};">
                        ${trend.entryStatus || 'Block'}
                    </div>
                </div>
                ${!canEnter ? `
                    <div style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                        Need ${(7 - totalScore).toFixed(1)} more points to meet entry criteria
                    </div>
                ` : `
                    <div style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                        Trend Analysis: ${trend.trendAnalysis?.direction || 'neutral'} (${trend.trendAnalysis?.trendConfirmationScore || 0}/3 timeframes aligned)
                    </div>
                `}
            </div>

            <!-- Technical Summary -->
            <div style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-tertiary); text-align: center;">
                Last updated: ${trend.lastUpdated ? new Date(trend.lastUpdated).toLocaleString() : 'Never'} | 
                Source: ${trend.source || 'Unknown'}
            </div>
        </div>
    `;
}

// Market Event Listeners (keep unchanged)
function attachMarketEventListeners() {
    document.querySelectorAll('tr.is-expandable').forEach(row => {
        row.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
            
            const pairData = JSON.parse(row.dataset.pair);
            const pair = pairData.pair;
            
            if (appState.expandedTrendPair === pair) {
                appState.expandedTrendPair = null;
            } else {
                appState.expandedTrendPair = pair;
            }
            
            refreshCurrentPageContent();
        });
    });

    document.querySelectorAll('.sortable-header').forEach(header => {
        header.addEventListener('click', (e) => {
            const column = e.target.dataset.sort;
            if (appState.marketDataSort.column === column) {
                appState.marketDataSort.direction = appState.marketDataSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                appState.marketDataSort.column = column;
                appState.marketDataSort.direction = 'desc';
            }
            
            refreshCurrentPageContent();
        });
    });
}

function refreshCurrentPageContent() {
    if (appState.activePage === 'Dashboard') {
        document.getElementById('main-panel').innerHTML = createDashboardPage();
        attachEventListeners();
    } else if (appState.activePage === 'Meat Market') {
        switchPage('Meat Market');
    }
}

console.log('✅ Clean market components loaded (no mock data)');