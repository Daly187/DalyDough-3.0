function createMeatMarketPage() {
    if (!appState.marketTrendsData) {
        appState.marketTrendsData = [];
    }

    return `
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
}

console.log('✅ Meat Market page loaded');