// Enhanced Bot Management Functions - Replace assets/js/shared/bot-management.js
function toggleBotExpansion(botId) {
    if (appState.expandedBotId === botId) {
        appState.expandedBotId = null;
    } else {
        appState.expandedBotId = botId;
    }
    
    // Refresh current page to show/hide expansion
    refreshCurrentPage();
}

// Generate realistic spot price data
function generateSpotPrice(pair) {
    const basePrices = {
        'EUR/USD': 1.0850,
        'GBP/USD': 1.2720,
        'USD/JPY': 149.85,
        'USD/CHF': 0.8745,
        'AUD/USD': 0.6685,
        'USD/CAD': 1.3580,
        'NZD/USD': 0.6125,
        'XAU/USD': 2035.50
    };
    
    const basePrice = basePrices[pair] || (Math.random() * 2 + 0.5);
    const change = (Math.random() - 0.5) * 0.02; // Random change between -1% to +1%
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

// Generate support/resistance levels based on trade direction
function generateSupportResistanceLevels(pair, trades) {
    if (!trades || trades.length === 0) return [];
    
    const primaryTrade = trades[0];
    const direction = primaryTrade.direction;
    const currentPrice = generateSpotPrice(pair).current;
    const levels = [];
    
    if (direction === 'buy') {
        // For buy positions, show support levels below current price
        for (let i = 1; i <= 5; i++) {
            const level = currentPrice - (i * 0.001 * Math.random() * 2);
            levels.push({
                level: i,
                price: level,
                type: 'Support',
                strength: ['Strong', 'Medium', 'Weak'][Math.floor(Math.random() * 3)],
                distance: Math.abs(currentPrice - level),
                timeframe: ['H4', 'D1', 'W1'][Math.floor(Math.random() * 3)]
            });
        }
    } else {
        // For sell positions, show resistance levels above current price
        for (let i = 1; i <= 5; i++) {
            const level = currentPrice + (i * 0.001 * Math.random() * 2);
            levels.push({
                level: i,
                price: level,
                type: 'Resistance',
                strength: ['Strong', 'Medium', 'Weak'][Math.floor(Math.random() * 3)],
                distance: Math.abs(level - currentPrice),
                timeframe: ['H4', 'D1', 'W1'][Math.floor(Math.random() * 3)]
            });
        }
    }
    
    return levels.sort((a, b) => a.distance - b.distance);
}

// Enhanced createBotDetails function with spot price and dual tables
function createBotDetails(bot) {
    const currentTrades = bot.activeTrades || [];
    const spotPrice = generateSpotPrice(bot.pair);
    const supportResistanceLevels = generateSupportResistanceLevels(bot.pair, currentTrades);
    
    return `
        <div class="detailed-trading-card">
            <!-- Pair Header with Spot Price -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-surface-2); border-radius: 8px; border-left: 4px solid var(--accent-blue);">
                <div>
                    <h4 style="color: var(--text-primary); font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">${bot.pair}</h4>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Bot ID: ${bot.id}</div>
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
                
                <!-- Left Table: Current Open Trades -->
                <div>
                    <h4 style="margin-bottom: 0.75rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                        📊 Open Trades
                        <span style="background: var(--accent-blue); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">
                            ${currentTrades.length} active
                        </span>
                    </h4>
                    <div class="table-container" style="max-height: 350px; border: 1px solid var(--border-color); border-radius: 8px;">
                        <table style="min-width: auto; background: var(--bg-surface);">
                            <thead>
                                <tr style="background: var(--bg-surface-2);">
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Trade ID</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Direction</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Lot Size</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Entry Price</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Current P&L</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${currentTrades.length === 0 ? `
                                    <tr>
                                        <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                                            <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.5;">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                                    <path d="M9 9h.01"></path>
                                                    <path d="M15 9h.01"></path>
                                                </svg>
                                                <span>No open trades</span>
                                            </div>
                                        </td>
                                    </tr>
                                ` : currentTrades.map((trade, index) => `
                                    <tr style="border-bottom: 1px solid var(--border-color);">
                                        <td style="padding: 0.75rem 0.5rem; font-size: 0.8rem; font-family: monospace;">${trade.id.split('_').pop()}</td>
                                        <td style="padding: 0.75rem 0.5rem;">
                                            <span style="
                                                padding: 0.25rem 0.6rem; 
                                                border-radius: 6px; 
                                                font-size: 0.75rem; 
                                                font-weight: 700;
                                                color: white;
                                                background: ${trade.direction === 'buy' ? 'var(--positive-green)' : 'var(--negative-red)'};
                                                text-transform: uppercase;
                                            ">
                                                ${trade.direction}
                                            </span>
                                        </td>
                                        <td style="padding: 0.75rem 0.5rem; font-weight: 600; font-family: monospace;">${trade.lotSize}</td>
                                        <td style="padding: 0.75rem 0.5rem; font-family: monospace; color: var(--text-primary);">${trade.entryPrice.toFixed(5)}</td>
                                        <td style="padding: 0.75rem 0.5rem;">
                                            <div style="
                                                font-weight: 700;
                                                font-family: monospace;
                                                color: ${trade.currentPL >= 0 ? 'var(--positive-green)' : 'var(--negative-red)'};
                                                display: flex;
                                                align-items: center;
                                                gap: 0.25rem;
                                            ">
                                                ${trade.currentPL >= 0 ? '↗' : '↘'}
                                                ${formatCurrency(trade.currentPL)}
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Trade Summary -->
                    ${currentTrades.length > 0 ? `
                        <div style="margin-top: 1rem; padding: 0.75rem; background: var(--bg-surface-2); border-radius: 6px; font-size: 0.85rem;">
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
                                <div>
                                    <div style="color: var(--text-secondary);">Total Lots</div>
                                    <div style="font-weight: 600; color: var(--text-primary);">${currentTrades.reduce((sum, t) => sum + t.lotSize, 0).toFixed(2)}</div>
                                </div>
                                <div>
                                    <div style="color: var(--text-secondary);">Avg Entry</div>
                                    <div style="font-weight: 600; color: var(--text-primary); font-family: monospace;">
                                        ${(currentTrades.reduce((sum, t) => sum + t.entryPrice, 0) / currentTrades.length).toFixed(5)}
                                    </div>
                                </div>
                                <div>
                                    <div style="color: var(--text-secondary);">Net P&L</div>
                                    <div style="font-weight: 600; color: ${bot.totalPL >= 0 ? 'var(--positive-green)' : 'var(--negative-red)'}; font-family: monospace;">
                                        ${formatCurrency(bot.totalPL)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Right Table: Support/Resistance Levels -->
                <div>
                    <h4 style="margin-bottom: 0.75rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                        🎯 ${currentTrades.length > 0 ? (currentTrades[0].direction === 'buy' ? 'Support' : 'Resistance') : 'Key'} Levels
                        <span style="background: var(--warning-yellow); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">
                            Live
                        </span>
                    </h4>
                    <div class="table-container" style="max-height: 350px; border: 1px solid var(--border-color); border-radius: 8px;">
                        <table style="min-width: auto; background: var(--bg-surface);">
                            <thead>
                                <tr style="background: var(--bg-surface-2);">
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Level</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Price</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Distance</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">Strength</th>
                                    <th style="padding: 0.75rem 0.5rem; font-size: 0.8rem;">TF</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${supportResistanceLevels.length === 0 ? `
                                    <tr>
                                        <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                                            <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.5;">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                                </svg>
                                                <span>No active trades to analyze</span>
                                            </div>
                                        </td>
                                    </tr>
                                ` : supportResistanceLevels.map(level => `
                                    <tr style="border-bottom: 1px solid var(--border-color);">
                                        <td style="padding: 0.75rem 0.5rem;">
                                            <div style="
                                                background: ${level.type === 'Support' ? 'var(--positive-green)' : 'var(--negative-red)'};
                                                color: white;
                                                width: 24px;
                                                height: 24px;
                                                border-radius: 50%;
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                                font-size: 0.8rem;
                                                font-weight: 700;
                                            ">
                                                ${level.level}
                                            </div>
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
                    
                    <!-- Levels Summary -->
                    ${supportResistanceLevels.length > 0 ? `
                        <div style="margin-top: 1rem; padding: 0.75rem; background: var(--bg-surface-2); border-radius: 6px; font-size: 0.85rem;">
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
                                <div>
                                    <div style="color: var(--text-secondary);">Nearest Level</div>
                                    <div style="font-weight: 600; color: var(--text-primary); font-family: monospace;">
                                        ${supportResistanceLevels[0].price.toFixed(5)}
                                    </div>
                                </div>
                                <div>
                                    <div style="color: var(--text-secondary);">Distance</div>
                                    <div style="font-weight: 600; color: var(--accent-blue);">
                                        ${(supportResistanceLevels[0].distance * 10000).toFixed(1)} pips
                                    </div>
                                </div>
                                <div>
                                    <div style="color: var(--text-secondary);">Type</div>
                                    <div style="font-weight: 600; color: ${supportResistanceLevels[0].type === 'Support' ? 'var(--positive-green)' : 'var(--negative-red)'};">
                                        ${supportResistanceLevels[0].type}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Bot Configuration Summary (Moved to bottom) -->
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
                    <div>
                        <span style="color: var(--text-secondary);">Last Update:</span>
                        <span style="color: var(--text-primary); margin-left: 0.5rem; font-weight: 600;">
                            ${new Date(bot.lastUpdate).toLocaleTimeString()}
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
                    ${currentTrades.length > 0 ? `<br>📊 Currently monitoring ${currentTrades.length} open position${currentTrades.length > 1 ? 's' : ''} with focus on ${currentTrades[0].direction === 'buy' ? 'support' : 'resistance'} levels.` : ''}
                </span>
            </div>
        </div>
    `;
}

// Toggle Functions for Bot Settings
function toggleTrailingProfit(botId) {
    const bot = appState.activeBots.find(b => b.id === botId);
    if (!bot) return;
    
    bot.trailingProfitEnabled = !bot.trailingProfitEnabled;
    bot.lastUpdate = new Date().toISOString();
    
    console.log(`🔄 Toggled trailing profit for ${bot.pair}: ${bot.trailingProfitEnabled ? 'ON' : 'OFF'}`);
    
    // Refresh display
    refreshCurrentPage();
}

function toggleCloseAtNextTP(botId) {
    const bot = appState.activeBots.find(b => b.id === botId);
    if (!bot) return;
    
    bot.closeAtNextTP = !bot.closeAtNextTP;
    bot.lastUpdate = new Date().toISOString();
    
    console.log(`🔄 Toggled close at next TP for ${bot.pair}: ${bot.closeAtNextTP ? 'ON' : 'OFF'}`);
    
    // Refresh display
    refreshCurrentPage();
}

function editBot(botId) {
    const bot = appState.activeBots.find(b => b.id === botId);
    if (!bot) return;
    
    // Create a simple edit dialog
    const newSL = prompt(`Edit Global Stop Loss for ${bot.pair}:`, bot.globalSL);
    const newTP = prompt(`Edit Global Take Profit for ${bot.pair}:`, bot.globalTP);
    
    if (newSL !== null && newTP !== null) {
        bot.globalSL = parseInt(newSL);
        bot.globalTP = parseInt(newTP);
        bot.lastUpdate = new Date().toISOString();
        
        // Refresh display
        refreshCurrentPage();
        
        console.log(`✅ Updated bot ${botId} - SL: $${newSL}, TP: $${newTP}`);
    }
}

function closeBot(botId) {
    const bot = appState.activeBots.find(b => b.id === botId);
    if (!bot) return;
    
    if (confirm(`Are you sure you want to close bot for ${bot.pair}?\n\nCurrent P&L: ${formatCurrency(bot.totalPL)}`)) {
        // Remove bot from active bots
        appState.activeBots = appState.activeBots.filter(b => b.id !== botId);
        
        // Clear expansion state
        if (appState.expandedBotId === botId) {
            appState.expandedBotId = null;
        }
        
        // Refresh display
        refreshCurrentPage();
        
        console.log(`🛑 Closed bot ${botId} for ${bot.pair}`);
        alert(`✅ Bot closed for ${bot.pair}\nFinal P&L: ${formatCurrency(bot.totalPL)}`);
    }
}

function closeAllBots() {
    if (appState.activeBots.length === 0) {
        alert('No active bots to close');
        return;
    }
    
    const totalPnL = appState.activeBots.reduce((sum, bot) => sum + bot.totalPL, 0);
    
    if (confirm(`⚠️ Emergency Stop All Bots?\n\nThis will close ${appState.activeBots.length} active bots.\nCurrent Total P&L: ${formatCurrency(totalPnL)}\n\nThis action cannot be undone.`)) {
        const closedBots = [...appState.activeBots];
        appState.activeBots = [];
        appState.expandedBotId = null;
        
        // Refresh display
        refreshCurrentPage();
        
        console.log(`🚨 Emergency stop: Closed ${closedBots.length} bots`);
        alert(`🛑 All bots closed!\n\nClosed ${closedBots.length} bots\nFinal P&L: ${formatCurrency(totalPnL)}`);
    }
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

// Helper function to refresh current page
function refreshCurrentPage() {
    if (appState.activePage === 'Dashboard') {
        document.getElementById('main-panel').innerHTML = createDashboardPage();
        attachEventListeners();
    } else if (appState.activePage === 'Active Bots') {
        switchPage('Active Bots');
    }
}

// Make functions globally available
window.toggleBotExpansion = toggleBotExpansion;
window.toggleTrailingProfit = toggleTrailingProfit;
window.toggleCloseAtNextTP = toggleCloseAtNextTP;
window.editBot = editBot;
window.closeBot = closeBot;
window.closeAllBots = closeAllBots;
window.updateManualSL = updateManualSL;
window.updateManualTP = updateManualTP;

console.log('✅ Enhanced Bot management loaded with spot prices, open trades table, and support/resistance levels');