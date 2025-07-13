// Enhanced Market Components - Replace assets/js/shared/market-components.js

// Generate realistic spot price data for market analysis
function generateMarketSpotPrice(pair) {
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
    const change = (Math.random() - 0.5) * 0.02;
    const current = basePrice + change;
    const changePercent = (change / basePrice) * 100;
    
    return {
        current,
        change,
        changePercent,
        bid: current - 0.00015,
        ask: current + 0.00015,
        high: current + Math.random() * 0.01,
        low: current - Math.random() * 0.01
    };
}

// Generate key levels for market analysis
function generateMarketKeyLevels(pair) {
    const spotPrice = generateMarketSpotPrice(pair);
    const levels = [];
    
    // Generate both support and resistance levels
    for (let i = 1; i <= 5; i++) {
        // Support levels (below current price)
        const supportLevel = spotPrice.current - (i * 0.001 * Math.random() * 3);
        levels.push({
            level: i,
            price: supportLevel,
            type: 'Support',
            strength: ['Strong', 'Medium', 'Weak'][Math.floor(Math.random() * 3)],
            distance: Math.abs(spotPrice.current - supportLevel),
            timeframe: ['H4', 'D1', 'W1'][Math.floor(Math.random() * 3)]
        });
        
        // Resistance levels (above current price)
        const resistanceLevel = spotPrice.current + (i * 0.001 * Math.random() * 3);
        levels.push({
            level: i + 5,
            price: resistanceLevel,
            type: 'Resistance',
            strength: ['Strong', 'Medium', 'Weak'][Math.floor(Math.random() * 3)],
            distance: Math.abs(resistanceLevel - spotPrice.current),
            timeframe: ['H4', 'D1', 'W1'][Math.floor(Math.random() * 3)]
        });
    }
    
    return levels.sort((a, b) => a.distance - b.distance);
}

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
                            ${isExpanded ? `<tr class="expanded-row"><td colspan="7">${createDetailedMarketAnalysisCard(d)}</td></tr>` : ''}
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Enhanced Detailed Market Analysis Card with spot price and dual tables
function createDetailedMarketAnalysisCard(trend) {
    const totalScore = parseFloat(trend.dsize);
    const canEnter = totalScore >= 7;
    const spotPrice = generateMarketSpotPrice(trend.pair);
    const keyLevels = generateMarketKeyLevels(trend.pair);
    
    return `
        <div class="detailed-scoring-card">
            <!-- Pair Header with Spot Price -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-surface-2); border-radius: 8px; border-left: 4px solid var(--accent-blue);">
                <div>
                    <h4 style="color: var(--text-primary); font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">${trend.pair}</h4>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Market Analysis</div>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.25rem;">Live Spot Price</div>
                    <div style="font-family: 'Monaco', 'Menlo', monospace; font-size: 1.4rem; font-weight: 700; color: var(--text-primary);">
                        ${spotPrice.current.toFixed(5)}
                    </div>
                    <div style="font-size: 0.85rem; color: ${spotPrice.change >= 0 ? 'var(--positive-green)' : 'var(--negative-red)'};;">
                        ${spotPrice.change >= 0 ? '↗' : '↘'} ${Math.abs(spotPrice.change).toFixed(4)} (${spotPrice.changePercent >= 0 ? '+' : ''}${spotPrice.changePercent.toFixed(2)}%)
                    </div>
                    <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-tertiary);">
                        <span>Bid: ${spotPrice.bid.toFixed(5)}</span>
                        <span>Ask: ${spotPrice.ask.toFixed(5)}</span>
                    </div>
                </div>
            </div>

            <!-- Dual Tables Layout -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1.5rem;">
                
                <!-- Left Table: D-Size Breakdown -->
                <div>
                    <h4 style="margin-bottom: 0.75rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                        🎯 D-Size Breakdown
                        <span style="background: ${totalScore >= 8 ? 'var(--positive-green)' : totalScore >= 6 ? 'var(--warning-yellow)' : 'var(--negative-red)'}; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">
                            ${totalScore.toFixed(1)}/10
                        </span>
                    </h4>
                    <div class="table-container" style="max-height: 350px; border: 1px solid var(--border-color); border-radius: 8px;">
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
                                            ${component.value}
                                        </td>
                                        <td style="padding: 0.75rem 0.5rem; font-weight: 600; text-align: center; color: ${component.score > 0 ? 'var(--positive-green)' : 'var(--text-tertiary)'};">
                                            +${component.score}
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
                </div>

                <!-- Right Table: Key Market Levels -->
                <div>
                    <h4 style="margin-bottom: 0.75rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                        📊 Key Market Levels
                        <span style="background: var(--accent-blue); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">
                            Live
                        </span>
                    </h4>
                    <div class="table-container" style="max-height: 350px; border: 1px solid var(--border-color); border-radius: 8px;">
                        <table style="min-width: auto; background: var(--bg-surface);">
                            <thead>
                                <tr style="background: var(--bg-surface-2);">
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Type</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Price</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Distance</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Strength</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">TF</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${keyLevels.slice(0, 8).map(level => `
                                    <tr style="border-bottom: 1px solid var(--border-color);">
                                        <td style="padding: 0.75rem 0.5rem;">
                                            <span style="
                                                padding: 0.25rem 0.5rem;
                                                border-radius: 4px;
                                                font-size: 0.7rem;
                                                font-weight: 700;
                                                background: ${level.type === 'Support' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
                                                color: ${level.type === 'Support' ? 'var(--positive-green)' : 'var(--negative-red)'};
                                            ">
                                                ${level.type.substring(0, 3).toUpperCase()}
                                            </span>
                                        </td>
                                        <td style="padding: 0.75rem 0.5rem; font-family: monospace; font-weight: 600; color: var(--text-primary);">
                                            ${level.price.toFixed(5)}
                                        </td>
                                        <td style="padding: 0.75rem 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
                                            ${(level.distance * 10000).toFixed(1)} pips
                                        </td>
                                        <td style="padding: 0.75rem 0.5rem;">
                                            <span style="
                                                padding: 0.25rem 0.5rem;
                                                border-radius: 4px;
                                                font-size: 0.75rem;
                                                font-weight: 600;
                                                background: ${level.strength === 'Strong' ? 'rgba(34, 197, 94, 0.2)' : level.strength === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(107, 114, 128, 0.2)'};
                                                color: ${level.strength === 'Strong' ? 'var(--positive-green)' : level.strength === 'Medium' ? 'var(--warning-yellow)' : 'var(--text-tertiary)'};
                                            ">
                                                ${level.strength}
                                            </span>
                                        </td>
                                        <td style="padding: 0.75rem 0.5rem; font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;">
                                            ${level.timeframe}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Entry Decision Summary -->
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
                        <br>Nearest ${keyLevels[0].type}: ${keyLevels[0].price.toFixed(5)} (${(keyLevels[0].distance * 10000).toFixed(1)} pips away)
                    </div>
                `}
            </div>

            <!-- Technical Summary -->
            <div style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-tertiary); text-align: center;">
                Last updated: ${new Date(trend.lastUpdated).toLocaleString()} | 
                Spread: ${((spotPrice.ask - spotPrice.bid) * 10000).toFixed(1)} pips | 
                24h Range: ${spotPrice.low.toFixed(5)} - ${spotPrice.high.toFixed(5)}
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
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div class="last-update">
                            Last Update: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <button class="btn btn-secondary refresh-button" onclick="refreshMarketData()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M23 4v6h-6"></path>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-main); border-radius: 8px; border-left: 4px solid var(--accent-blue);">
                    <strong>🎯 D-Size Scoring Guide:</strong><br>
                    <span style="color: var(--text-secondary); font-size: 0.875rem;">
                        • <span style="color: var(--positive-green);">8.0-10.0</span> = Grade A setups (highest probability)<br>
                        • <span style="color: var(--accent-blue);">6.0-7.9</span> = Grade B setups (good probability)<br>
                        • <span style="color: var(--text-tertiary);">0.0-5.9</span> = Grade C setups (avoid trading)<br>
                        • <strong>Entry Threshold:</strong> 7.0+ required for new positions
                    </span>
                </div>
                
                ${createMarketTrendsTable(appState.marketTrendsData)}
            </div>
        `;
        attachMarketEventListeners();
    }
}

console.log('✅ Enhanced Market components loaded with spot prices and dual table analysis');