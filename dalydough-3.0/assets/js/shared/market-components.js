// Create Market Trends Table
function createMarketTrendsTable(data) {
    const sortIcon = (column) => {
        if (appState.marketDataSort.column !== column) return '';
        return appState.marketDataSort.direction === 'asc' ? '▲' : '▼';
    };

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
                        const entryStatusClass = getEntryStatusClass(d.entryStatus);
                        
                        return `
                            <tr class="is-expandable ${isExpanded ? 'active' : ''}" data-pair='${JSON.stringify(d).replace(/'/g, "&#39;")}'>
                                <td>${d.pair}</td>
                                <td>
                                    <div class="price-cell">
                                        <span class="current-price">${d.currentPrice.toFixed(5)}</span>
                                        <div class="price-change ${d.dailyChange >= 0 ? 'positive' : 'negative'}">
                                            ${d.dailyChange >= 0 ? '↗' : '↘'} ${Math.abs(d.dailyChange).toFixed(4)} 
                                            (${d.dailyChangePercent >= 0 ? '+' : ''}${d.dailyChangePercent.toFixed(2)}%)
                                        </div>
                                    </div>
                                </td>
                                <td class="trend-cell">
                                    <div class="trend-indicator">
                                        <div class="trend-timeframe">W1</div>
                                        ${getTrendIcon(d.trendW1)}
                                    </div>
                                    <div class="trend-indicator">
                                        <div class="trend-timeframe">D1</div>
                                        ${getTrendIcon(d.trendD1)}
                                    </div>
                                    <div class="trend-indicator">
                                        <div class="trend-timeframe">H4</div>
                                        ${getTrendIcon(d.trendH4)}
                                    </div>
                                </td>
                                <td><span class="setup-quality-pill quality-${d.setupQuality}">${d.setupQuality}</span></td>
                                <td class="conditions-cell">
                                    <span class="condition-icon ${d.conditions.cot ? 'active' : ''}" title="COT Bias">${icons.brain}</span>
                                    <span class="condition-icon ${d.conditions.adx ? 'active' : ''}" title="ADX Strength">${icons.bolt}</span>
                                    <span class="condition-icon ${d.conditions.spread ? 'active' : ''}" title="Spread Check">${icons.resizeHorizontal}</span>
                                </td>
                                <td><span class="recommendation-score score-${Number(d.dsize) >= 8 ? 'high' : Number(d.dsize) >= 6 ? 'medium' : 'low'}">${d.dsize}</span></td>
                                <td>
                                    <div class="entry-status ${entryStatusClass}">
                                        ${getEntryStatusIcon(d.entryStatus)} ${d.entryStatus}
                                    </div>
                                </td>
                            </tr>
                            ${isExpanded ? `<tr class="expanded-row"><td colspan="7">${createDetailedScoringCard(d)}</td></tr>` : ''}
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Create Detailed Scoring Card
function createDetailedScoringCard(trend) {
    const totalScore = parseFloat(trend.dsize);
    const canEnter = totalScore >= 7;
    
    return `
        <div class="detailed-scoring-card">
            <h4>D-Size Breakdown for ${trend.pair}</h4>
            <table>
                <thead>
                    <tr>
                        <th>Component</th>
                        <th>Value</th>
                        <th>Score</th>
                        <th>Max</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(trend.breakdown).map(([key, component]) => `
                        <tr>
                            <td>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                            <td>${component.value}</td>
                            <td style="color: ${component.score > 0 ? 'var(--positive-green)' : 'var(--text-tertiary)'};">
                                +${component.score}
                            </td>
                            <td style="color: var(--text-secondary);">
                                /${key === 'cotBias' || key === 'supportRetest' ? '2' : key === 'trendConfirmation' ? '3' : '1'}
                            </td>
                        </tr>
                    `).join('')}
                    <tr style="border-top: 2px solid var(--border-color); font-weight: 700;">
                        <td>Total D-Size</td>
                        <td>-</td>
                        <td style="color: var(--accent-blue); font-size: 1.1rem;">${trend.dsize}</td>
                        <td style="color: var(--text-secondary);">/10</td>
                    </tr>
                </tbody>
            </table>
            <div style="margin-top: 1rem; padding: 1rem; background: ${canEnter ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border-radius: 6px; border-left: 4px solid ${canEnter ? 'var(--positive-green)' : 'var(--negative-red)'};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>Entry Decision:</strong> Score ≥ 7.0 required for new positions
                    </div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: ${canEnter ? 'var(--positive-green)' : 'var(--negative-red)'};">
                        ${trend.entryStatus}
                    </div>
                </div>
                ${!canEnter ? `
                    <div style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                        Need ${(7 - totalScore).toFixed(1)} more points to meet entry criteria
                    </div>
                ` : `
                    <div style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                        Trend Analysis: ${trend.trendAnalysis.direction} (${trend.trendAnalysis.trendConfirmationScore}/3 timeframes aligned)
                    </div>
                `}
            </div>
            <div style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-tertiary);">
                Last updated: ${new Date(trend.lastUpdated).toLocaleString()}
            </div>
        </div>
    `;
}

// Market Event Listeners
function attachMarketEventListeners() {
    // Table row expansion
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
            
            // Refresh the current page to show/hide expansion
            refreshCurrentPageContent();
        });
    });

    // Sortable headers
    document.querySelectorAll('.sortable-header').forEach(header => {
        header.addEventListener('click', (e) => {
            const column = e.target.dataset.sort;
            if (appState.marketDataSort.column === column) {
                appState.marketDataSort.direction = appState.marketDataSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                appState.marketDataSort.column = column;
                appState.marketDataSort.direction = 'desc';
            }
            
            // Refresh the current page to show new sort
            refreshCurrentPageContent();
        });
    });
}

function refreshCurrentPageContent() {
    if (appState.activePage === 'Dashboard') {
        document.getElementById('main-panel').innerHTML = createDashboardPage();
        attachEventListeners();
    } else if (appState.activePage === 'Meat Market') {
        document.getElementById('main-panel').innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Meat Market - Full Analysis</h2>
                    <div class="last-update">
                        Last Update: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
                ${createMarketTrendsTable(appState.marketTrendsData)}
            </div>
        `;
        attachMarketEventListeners();
    }
}

console.log('✅ Market components loaded');