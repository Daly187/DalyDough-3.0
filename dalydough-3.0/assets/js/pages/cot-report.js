function createCOTReportPage() {
    if (!appState.cotData.length) {
        appState.cotData = [];
    }
  // Add empty state handling
    if (appState.cotData.length === 0) {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">📊 COT Report</h2>
                </div>
                <div style="text-align: center; padding: 3rem;">
                    <h3>No COT Data Available</h3>
                    <p>Waiting for API data connection</p>
                    <button class="btn btn-primary" onclick="refreshMarketData()">Retry Connection</button>
                </div>
            </div>
        `;
    }
    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">📊 COT Report - Large Speculators Positioning</h2>
                <div class="last-update">
                    Last Updated: ${new Date().toLocaleDateString()} (Weekly Report)
                </div>
            </div>
            
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-main); border-radius: 8px; border-left: 4px solid var(--accent-blue);">
                <strong>📈 How to Read COT Data:</strong><br>
                <span style="color: var(--text-secondary);">
                    • <span style="color: var(--positive-green);">Green bars</span> = Long positions (bullish sentiment)<br>
                    • <span style="color: var(--negative-red);">Red bars</span> = Short positions (bearish sentiment)<br>
                    • <strong>Net Position</strong> = Long - Short (positive = bullish bias, negative = bearish bias)
                </span>
            </div>

            <div class="cot-grid">
                ${appState.cotData.map(currencyData => `
                    <div class="card cot-currency-card">
                        <div class="cot-currency-header">
                            <h3>${currencyData.currency} - Large Speculators</h3>
                        </div>
                        
                        <div class="cot-history-row">
                            ${currencyData.history.map(week => {
                                const total = week.longPosition + week.shortPosition;
                                const longPercent = (week.longPosition / total) * 100;
                                const shortPercent = (week.shortPosition / total) * 100;
                                const netIsPositive = week.netPosition > 0;
                                
                                return `
                                    <div class="cot-week-col">
                                        <div class="cot-date">${week.date}</div>
                                        <div class="cot-bar">
                                            <div class="cot-long" style="flex-basis: ${longPercent}%;" title="Long: ${week.longPosition.toLocaleString()}"></div>
                                            <div class="cot-short" style="flex-basis: ${shortPercent}%;" title="Short: ${week.shortPosition.toLocaleString()}"></div>
                                        </div>
                                        <div class="cot-net ${netIsPositive ? 'positive' : 'negative'}">
                                            ${netIsPositive ? '+' : ''}${(week.netPosition / 1000).toFixed(0)}K
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

console.log('✅ COT Report page loaded');