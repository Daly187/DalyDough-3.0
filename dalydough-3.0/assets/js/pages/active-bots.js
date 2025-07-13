function createActiveBotsPage() {
    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">🤖 Active Bots Management</h2>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="last-update">
                        ${appState.activeBots.length} bots running
                    </div>
                    <button class="btn btn-primary" onclick="switchPage('Auto Bot')">Launch New Bot</button>
                </div>
            </div>
            ${createActiveBotsSection()}
        </div>
    `;
}

function createActiveBotsTable() {
    const bots = appState.activeBots;
    
    return `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Bot / Pair</th>
                        <th>Type</th>
                        <th>P&L</th>
                        <th>D-Size Score</th>
                        <th>Global Limits</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${bots.map(bot => createBotRow(bot)).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function createBotRow(bot) {
    const isExpanded = appState.expandedBotId === bot.id;
    const pnlClass = bot.totalPL >= 0 ? 'positive' : 'negative';
    const scoreClass = bot.currentDScore >= 7 ? 'score-high' : bot.currentDScore >= 5 ? 'score-medium' : 'score-low';
    
    return `
        <tr class="is-expandable ${isExpanded ? 'active' : ''}" onclick="toggleBotExpansion('${bot.id}')">
            <td>
                <div style="font-weight: 600; font-size: 1.1rem;">${bot.pair}</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">
                    Bot ID: ${bot.id}
                </div>
            </td>
            <td>${bot.type}</td>
            <td>
                <div style="font-weight: 600; font-family: 'Monaco', 'Menlo', monospace;" class="${pnlClass}">
                    ${formatCurrency(bot.totalPL)}
                </div>
            </td>
            <td>
                <div class="recommendation-score ${scoreClass}">
                    ${bot.currentDScore.toFixed(1)}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                    Entry: ${bot.entryDScore.toFixed(1)}
                </div>
            </td>
            <td>
                <div style="font-size: 0.875rem;">
                    <div>SL: $${bot.globalSL}</div>
                    <div>TP: $${bot.globalTP}</div>
                    ${bot.trailingProfitEnabled ? '<div style="color: var(--positive-green);">✓ Trailing</div>' : ''}
                </div>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); editBot('${bot.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); closeBot('${bot.id}')">Close</button>
                    <span style="color: var(--text-tertiary);">${isExpanded ? '▼' : '▶'}</span>
                </div>
            </td>
        </tr>
        ${isExpanded ? `<tr class="expanded-row"><td colspan="6">${createBotDetails(bot)}</td></tr>` : ''}
    `;
}

function createBotDetails(bot) {
    return `
        <div class="detailed-reentry-card">
            <h4>📋 Bot Configuration & Active Trades</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1.5rem;">
                <div>
                    <h5 style="margin-bottom: 0.75rem;">⚙️ Configuration</h5>
                    <table>
                        <tr><td>Bot Type:</td><td>${bot.type}</td></tr>
                        <tr><td>Entry D-Size:</td><td>${bot.entryDScore.toFixed(1)}/10</td></tr>
                        <tr><td>Current D-Size:</td><td class="${bot.currentDScore >= 7 ? 'success' : bot.currentDScore >= 5 ? 'warning' : 'error'}">${bot.currentDScore.toFixed(1)}/10</td></tr>
                        <tr><td>Global Stop Loss:</td><td>$${bot.globalSL}</td></tr>
                        <tr><td>Global Take Profit:</td><td>$${bot.globalTP}</td></tr>
                    </table>
                </div>
                
                <div>
                    <h5 style="margin-bottom: 0.75rem;">📊 Performance</h5>
                    <table>
                        <tr><td>Total P&L:</td><td class="${bot.totalPL >= 0 ? 'success' : 'error'}">${formatCurrency(bot.totalPL)}</td></tr>
                        <tr><td>Active Trades:</td><td>${bot.activeTrades.length}</td></tr>
                        <tr><td>Status:</td><td class="success">✅ Active</td></tr>
                        <tr><td>Last Update:</td><td>${new Date(bot.lastUpdate).toLocaleString()}</td></tr>
                    </table>
                </div>
            </div>

            <!-- Bot Control Toggles -->
            <div style="margin-bottom: 1.5rem;">
                <h5 style="margin-bottom: 0.75rem;">🎛️ Bot Controls</h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-toggle-item">
                        <div class="setting-label">
                            <span>Trailing Profit</span>
                            <div class="setting-description">Automatically adjust TP as price moves favorably</div>
                        </div>
                        <div class="setting-control-group">
                            <label class="toggle-switch">
                                <input type="checkbox" ${bot.trailingProfitEnabled ? 'checked' : ''} 
                                       onchange="toggleTrailingProfit('${bot.id}')">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-toggle-item">
                        <div class="setting-label">
                            <span>Close at Next TP</span>
                            <div class="setting-description">Close entire bot when next TP is hit</div>
                        </div>
                        <div class="setting-control-group">
                            <label class="toggle-switch">
                                <input type="checkbox" ${bot.closeAtNextTP ? 'checked' : ''} 
                                       onchange="toggleCloseAtNextTP('${bot.id}')">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <h5 style="margin-bottom: 0.75rem;">🔄 Active Trades</h5>
            <div class="trades-list">
                ${bot.activeTrades.map(trade => `
                    <div class="trade-item">
                        <div class="trade-info">
                            <span class="trade-type">${trade.pair}</span>
                            <span class="trade-direction ${trade.direction}">${trade.direction.toUpperCase()}</span>
                            <span class="trade-size">${trade.lotSize} lots</span>
                            <span class="trade-price">Entry: ${trade.entryPrice.toFixed(5)}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <span class="trade-pnl ${trade.currentPL >= 0 ? 'positive' : 'negative'}">
                                ${formatCurrency(trade.currentPL)}
                            </span>
                            <span class="trade-score">D-Size: ${trade.score.toFixed(1)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-surface-2); border-radius: 8px;">
                <strong>💡 Strategy Notes:</strong><br>
                <span style="color: var(--text-secondary); font-size: 0.875rem;">
                    ${bot.activeTrades[0]?.reason || 'Dynamic DCA strategy with D-Size exit criteria'}
                    ${bot.trailingProfitEnabled ? '<br>🎯 Trailing profit is active' : ''}
                    ${bot.closeAtNextTP ? '<br>⚡ Bot will close at next TP hit' : ''}
                </span>
            </div>
        </div>
    `;
}

console.log('✅ Active Bots page loaded');