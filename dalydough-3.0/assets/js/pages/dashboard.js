function createDashboardPage() {
    if (!appState.marketTrendsData) {
        appState.marketTrendsData = generateMarketDataWithScoring();
    }

    const topTrends = appState.marketTrendsData.slice(0, 8);

    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Meat Market - Top Opportunities</h2>
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
            ${createMarketTrendsTable(topTrends)}
        </div>

        <div class="card">
            <div class="card-header">
                <h2 class="card-title">🤖 Active Bots Dashboard</h2>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="last-update">
                        ${appState.activeBots.length} bots running
                    </div>
                </div>
            </div>
            ${createActiveBotsSection()}
        </div>
        
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">System Status</h2>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div style="background: rgba(34, 197, 94, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--positive-green);">
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">✅ D-Size Algorithm</div>
                    <div style="color: var(--text-secondary); font-size: 0.875rem;">Active & Scoring</div>
                </div>
                <div style="background: rgba(34, 197, 94, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--positive-green);">
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">🎯 Trend Analysis</div>
                    <div style="color: var(--text-secondary); font-size: 0.875rem;">CORRECTED Logic</div>
                </div>
                <div style="background: rgba(34, 197, 94, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--positive-green);">
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">📊 Market Data</div>
                    <div style="color: var(--text-secondary); font-size: 0.875rem;">${appState.marketTrendsData?.length || 0} Pairs Active</div>
                </div>
                <div style="background: rgba(54, 124, 255, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--accent-blue);">
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">🤖 Ready to Trade</div>
                    <div style="color: var(--text-secondary); font-size: 0.875rem;">Launch New Bots</div>
                </div>
            </div>
        </div>
    `;
}

function createActiveBotsSection() {
    if (!appState.activeBots || appState.activeBots.length === 0) {
        return `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem; opacity: 0.5;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <path d="M9 9h.01"></path>
                    <path d="M15 9h.01"></path>
                </svg>
                <p>No active bots running</p>
                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="switchPage('Auto Bot')">Launch Your First Bot</button>
            </div>
        `;
    }

    const totalPnL = appState.activeBots.reduce((sum, bot) => sum + bot.totalPL, 0);
    const isRiskBreach = totalPnL <= -500; // Example threshold
    
    return `
        ${createGlobalRiskManager(totalPnL, isRiskBreach)}
        
        <!-- Quick Bot Controls for Dashboard -->
        <div style="margin-bottom: 1rem;">
            <h4 style="margin-bottom: 0.75rem;">🎛️ Quick Bot Controls</h4>
            <div class="table-container">
                <table style="min-width: 600px;">
                    <thead>
                        <tr>
                            <th>Bot</th>
                            <th>P&L</th>
                            <th>Trailing Profit</th>
                            <th>Close at Next TP</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appState.activeBots.map(bot => `
                            <tr>
                                <td>
                                    <div style="font-weight: 600;">${bot.pair}</div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${bot.type}</div>
                                </td>
                                <td>
                                    <span class="trade-pnl ${bot.totalPL >= 0 ? 'positive' : 'negative'}">
                                        ${formatCurrency(bot.totalPL)}
                                    </span>
                                </td>
                                <td style="text-align: center;">
                                    <label class="toggle-switch">
                                        <input type="checkbox" ${bot.trailingProfitEnabled ? 'checked' : ''} 
                                               onchange="toggleTrailingProfit('${bot.id}')">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </td>
                                <td style="text-align: center;">
                                    <label class="toggle-switch">
                                        <input type="checkbox" ${bot.closeAtNextTP ? 'checked' : ''} 
                                               onchange="toggleCloseAtNextTP('${bot.id}')">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </td>
                                <td>
                                    <button class="btn btn-secondary btn-sm" onclick="toggleBotExpansion('${bot.id}')">Details</button>
                                    <button class="btn btn-danger btn-sm" onclick="closeBot('${bot.id}')">Close</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Refresh market data function
function refreshMarketData() {
    console.log('🔄 Manually refreshing market data...');
    
    // Add spinning animation
    const refreshButtons = document.querySelectorAll('.refresh-button');
    refreshButtons.forEach(btn => btn.classList.add('refreshing'));
    
    // Simulate API call delay
    setTimeout(() => {
        appState.marketTrendsData = generateMarketDataWithScoring();
        
        if (appState.activePage === 'Dashboard' || appState.activePage === 'Meat Market') {
            switchPage(appState.activePage);
        }
        
        // Remove spinning animation
        refreshButtons.forEach(btn => btn.classList.remove('refreshing'));
    }, 800);
}

// Make refresh function globally available
window.refreshMarketData = refreshMarketData;

console.log('✅ Dashboard page loaded');