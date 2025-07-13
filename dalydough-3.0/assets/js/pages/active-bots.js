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
                        <th>Manual SL/TP</th>
                        <th>D-Size Scores</th>
                        <th>Trailing Profit</th>
                        <th>Close at Next TP</th>
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
    const currentScoreClass = bot.currentDScore >= 7 ? 'score-high' : bot.currentDScore >= 5 ? 'score-medium' : 'score-low';
    const entryScoreClass = bot.entryDScore >= 7 ? 'score-high' : bot.entryDScore >= 5 ? 'score-medium' : 'score-low';
    
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
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 0.75rem; color: var(--text-secondary); width: 20px;">SL:</span>
                        <input type="number" 
                               value="${bot.manualSL || ''}" 
                               placeholder="Auto"
                               style="width: 70px; padding: 0.25rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 0.75rem;"
                               onchange="updateManualSL('${bot.id}', this.value)"
                               onclick="event.stopPropagation()">
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 0.75rem; color: var(--text-secondary); width: 20px;">TP:</span>
                        <input type="number" 
                               value="${bot.manualTP || ''}" 
                               placeholder="Auto"
                               style="width: 70px; padding: 0.25rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 0.75rem;"
                               onchange="updateManualTP('${bot.id}', this.value)"
                               onclick="event.stopPropagation()">
                    </div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div class="recommendation-score ${currentScoreClass}" style="margin-bottom: 0.25rem;">
                            ${bot.currentDScore.toFixed(1)}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Current</div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div class="recommendation-score ${entryScoreClass}" style="margin-bottom: 0.25rem;">
                            ${bot.entryDScore.toFixed(1)}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Entry</div>
                    </div>
                </div>
            </td>
            <td style="text-align: center;">
                <label class="toggle-switch">
                    <input type="checkbox" ${bot.trailingProfitEnabled ? 'checked' : ''} 
                           onchange="toggleTrailingProfit('${bot.id}')"
                           onclick="event.stopPropagation()">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="toggle-switch">
                    <input type="checkbox" ${bot.closeAtNextTP ? 'checked' : ''} 
                           onchange="toggleCloseAtNextTP('${bot.id}')"
                           onclick="event.stopPropagation()">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); editBot('${bot.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); closeBot('${bot.id}')">Close</button>
                    <span style="color: var(--text-tertiary);">${isExpanded ? '▼' : '▶'}</span>
                </div>
            </td>
        </tr>
        ${isExpanded ? `<tr class="expanded-row"><td colspan="8">${createBotDetails(bot)}</td></tr>` : ''}
    `;
}

function createBotDetails(bot) {
    const currentTrades = bot.activeTrades || [];
    const nextReentries = generateNextReentries(bot);
    
    return `
        <div class="detailed-reentry-card">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1.5rem;">
                <!-- Current Open Trades -->
                <div>
                    <h4 style="margin-bottom: 0.75rem; color: var(--text-primary);">📊 Current Open Trades</h4>
                    <div class="table-container" style="max-height: 300px;">
                        <table style="min-width: auto;">
                            <thead>
                                <tr>
                                    <th style="padding: 0.5rem;">Trade ID</th>
                                    <th style="padding: 0.5rem;">Direction</th>
                                    <th style="padding: 0.5rem;">Lot Size</th>
                                    <th style="padding: 0.5rem;">Entry Price</th>
                                    <th style="padding: 0.5rem;">Current P&L</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${currentTrades.length === 0 ? `
                                    <tr>
                                        <td colspan="5" style="text-align: center; padding: 1rem; color: var(--text-secondary);">
                                            No open trades
                                        </td>
                                    </tr>
                                ` : currentTrades.map(trade => `
                                    <tr>
                                        <td style="padding: 0.5rem; font-size: 0.8rem;">${trade.id}</td>
                                        <td style="padding: 0.5rem;">
                                            <span class="trade-direction ${trade.direction}" style="
                                                padding: 0.25rem 0.5rem; 
                                                border-radius: 4px; 
                                                font-size: 0.75rem; 
                                                font-weight: 600;
                                                color: white;
                                                background-color: ${trade.direction === 'buy' ? 'var(--positive-green)' : 'var(--negative-red)'};
                                            ">
                                                ${trade.direction.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style="padding: 0.5rem; font-weight: 600;">${trade.lotSize}</td>
                                        <td style="padding: 0.5rem; font-family: monospace;">${trade.entryPrice.toFixed(5)}</td>
                                        <td style="padding: 0.5rem;">
                                            <span class="trade-pnl ${trade.currentPL >= 0 ? 'positive' : 'negative'}" style="
                                                font-weight: 600;
                                                color: ${trade.currentPL >= 0 ? 'var(--positive-green)' : 'var(--negative-red)'};
                                            ">
                                                ${formatCurrency(trade.currentPL)}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Next Re-entries -->
                <div>
                    <h4 style="margin-bottom: 0.75rem; color: var(--text-primary);">🔄 Next Re-entries</h4>
                    <div class="table-container" style="max-height: 300px;">
                        <table style="min-width: auto;">
                            <thead>
                                <tr>
                                    <th style="padding: 0.5rem;">Level</th>
                                    <th style="padding: 0.5rem;">Price</th>
                                    <th style="padding: 0.5rem;">Lot Size</th>
                                    <th style="padding: 0.5rem;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${nextReentries.length === 0 ? `
                                    <tr>
                                        <td colspan="4" style="text-align: center; padding: 1rem; color: var(--text-secondary);">
                                            No pending re-entries
                                        </td>
                                    </tr>
                                ` : nextReentries.map(reentry => `
                                    <tr>
                                        <td style="padding: 0.5rem; font-weight: 600;">${reentry.level}</td>
                                        <td style="padding: 0.5rem; font-family: monospace;">${reentry.price.toFixed(5)}</td>
                                        <td style="padding: 0.5rem; font-weight: 600;">${reentry.lotSize}</td>
                                        <td style="padding: 0.5rem;">
                                            <span class="status-indicator ${reentry.status === 'Ready' ? 'status-active' : reentry.status === 'Blocked' ? 'status-waiting' : 'status-scanning'}" style="
                                                padding: 0.25rem 0.5rem;
                                                border-radius: 12px;
                                                font-size: 0.7rem;
                                                font-weight: 600;
                                            ">
                                                ${reentry.status}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Bot Configuration Summary -->
            <div style="background: var(--bg-surface-2); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <h5 style="margin-bottom: 0.75rem; color: var(--text-primary);">⚙️ Bot Configuration</h5>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; font-size: 0.875rem;">
                    <div>
                        <span style="color: var(--text-secondary);">Type:</span>
                        <span style="color: var(--text-primary); margin-left: 0.5rem; font-weight: 600;">${bot.type}</span>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary);">Manual SL:</span>
                        <span style="color: var(--text-primary); margin-left: 0.5rem; font-weight: 600;">${bot.manualSL || 'Auto'}</span>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary);">Manual TP:</span>
                        <span style="color: var(--text-primary); margin-left: 0.5rem; font-weight: 600;">${bot.manualTP || 'Auto'}</span>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary);">Total Trades:</span>
                        <span style="color: var(--text-primary); margin-left: 0.5rem; font-weight: 600;">${currentTrades.length}</span>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary);">Entry D-Score:</span>
                        <span style="color: var(--text-primary); margin-left: 0.5rem; font-weight: 600;">${bot.entryDScore.toFixed(1)}/10</span>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary);">Current D-Score:</span>
                        <span style="color: var(--text-primary); margin-left: 0.5rem; font-weight: 600;">${bot.currentDScore.toFixed(1)}/10</span>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary);">Trailing Profit:</span>
                        <span style="color: ${bot.trailingProfitEnabled ? 'var(--positive-green)' : 'var(--text-secondary)'}; margin-left: 0.5rem; font-weight: 600;">
                            ${bot.trailingProfitEnabled ? '✅ Enabled' : '❌ Disabled'}
                        </span>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary);">Close at Next TP:</span>
                        <span style="color: ${bot.closeAtNextTP ? 'var(--warning-yellow)' : 'var(--text-secondary)'}; margin-left: 0.5rem; font-weight: 600;">
                            ${bot.closeAtNextTP ? '⚡ Yes' : '🔄 No'}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Strategy Notes -->
            <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-main); border-radius: 8px; border-left: 4px solid var(--accent-blue);">
                <strong style="color: var(--text-primary);">💡 Strategy Notes:</strong><br>
                <span style="color: var(--text-secondary); font-size: 0.875rem;">
                    ${bot.type} strategy with D-Size entry criteria (${bot.entryDScore.toFixed(1)}). 
                    Current market score: ${bot.currentDScore.toFixed(1)}/10.
                    ${bot.trailingProfitEnabled ? '<br>🎯 Trailing profit is active - TP levels adjust automatically.' : ''}
                    ${bot.closeAtNextTP ? '<br>⚡ Bot will close completely at next TP hit.' : ''}
                    ${bot.manualSL ? `<br>🛡️ Manual SL override: ${bot.manualSL}` : ''}
                    ${bot.manualTP ? `<br>🎯 Manual TP override: ${bot.manualTP}` : ''}
                </span>
            </div>
        </div>
    `;
}

// Generate mock next re-entries based on bot configuration
function generateNextReentries(bot) {
    const reentries = [];
    const currentPrice = bot.activeTrades?.[0]?.entryPrice || (Math.random() * 2 + 1);
    const baseDirection = bot.activeTrades?.[0]?.direction || 'buy';
    
    // Generate 3-5 potential re-entry levels
    const numReentries = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 1; i <= numReentries; i++) {
        const priceOffset = baseDirection === 'buy' ? -0.001 * i : 0.001 * i;
        const lotSizeMultiplier = Math.pow(1.5, i); // Increasing lot sizes
        const baseLotSize = 0.01;
        
        // Determine status based on various factors
        let status = 'Ready';
        if (Math.random() < 0.2) status = 'Blocked'; // 20% chance blocked by news/sleep
        if (Math.random() < 0.1) status = 'Pending'; // 10% chance pending conditions
        
        reentries.push({
            level: i,
            price: currentPrice + priceOffset,
            lotSize: (baseLotSize * lotSizeMultiplier).toFixed(2),
            status: status
        });
    }
    
    return reentries;
}

// New functions for manual SL/TP updates
function updateManualSL(botId, value) {
    const bot = appState.activeBots.find(b => b.id === botId);
    if (!bot) return;
    
    bot.manualSL = value ? parseFloat(value) : null;
    bot.lastUpdate = new Date().toISOString();
    
    console.log(`🛡️ Updated manual SL for ${bot.pair}: ${value || 'Auto'}`);
    
    // Show confirmation
    showNotification(`Manual SL updated for ${bot.pair}: ${value || 'Auto'}`, 'success');
}

function updateManualTP(botId, value) {
    const bot = appState.activeBots.find(b => b.id === botId);
    if (!bot) return;
    
    bot.manualTP = value ? parseFloat(value) : null;
    bot.lastUpdate = new Date().toISOString();
    
    console.log(`🎯 Updated manual TP for ${bot.pair}: ${value || 'Auto'}`);
    
    // Show confirmation
    showNotification(`Manual TP updated for ${bot.pair}: ${value || 'Auto'}`, 'success');
}

// Notification system (you can add this to your utils if not already present)
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem;
        color: var(--text-primary);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    if (type === 'success') {
        notification.style.borderLeft = '4px solid var(--positive-green)';
    } else if (type === 'error') {
        notification.style.borderLeft = '4px solid var(--negative-red)';
    } else {
        notification.style.borderLeft = '4px solid var(--accent-blue)';
    }
    
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Make functions globally available
window.updateManualSL = updateManualSL;
window.updateManualTP = updateManualTP;

console.log('✅ Enhanced Active Bots page loaded with manual SL/TP and detailed trade views');