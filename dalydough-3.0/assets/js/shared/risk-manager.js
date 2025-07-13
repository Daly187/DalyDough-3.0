// Enhanced Risk Management Functions
function createGlobalRiskManager(totalPnL, isRiskBreach) {
    const riskSettings = appState.riskSettings || getDefaultRiskSettings();
    const accountBalance = 10147.62; // From your dashboard - could be dynamic
    const currentDrawdown = Math.min(0, totalPnL);
    const drawdownPercent = (Math.abs(currentDrawdown) / accountBalance) * 100;
    
    // Calculate risk thresholds
    const dollarThreshold = riskSettings.stopLossType === 'dollar' ? riskSettings.stopLossValue : 
                           (riskSettings.stopLossValue / 100) * accountBalance;
    const percentThreshold = riskSettings.stopLossType === 'percent' ? riskSettings.stopLossValue :
                            (riskSettings.stopLossValue / accountBalance) * 100;
    
    // Check if we're approaching or breaching risk limits
    const isApproachingLimit = Math.abs(currentDrawdown) >= (dollarThreshold * 0.8);
    const isBreachingLimit = Math.abs(currentDrawdown) >= dollarThreshold;
    
    let riskStatus = 'safe';
    let riskColor = 'var(--positive-green)';
    let riskMessage = 'Risk levels are within acceptable limits. Portfolio performing well.';
    
    if (isBreachingLimit) {
        riskStatus = 'breach';
        riskColor = 'var(--negative-red)';
        riskMessage = `🚨 RISK BREACH: Drawdown exceeds ${riskSettings.stopLossType === 'dollar' ? '$' + riskSettings.stopLossValue : riskSettings.stopLossValue + '%'} limit!`;
    } else if (isApproachingLimit) {
        riskStatus = 'warning';
        riskColor = 'var(--warning-yellow)';
        riskMessage = `⚠️ APPROACHING LIMIT: Close to ${riskSettings.stopLossType === 'dollar' ? '$' + riskSettings.stopLossValue : riskSettings.stopLossValue + '%'} risk threshold.`;
    }

    return `
        <!-- Enhanced Risk Management Panel -->
        <div style="margin-bottom: 1.5rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
            <!-- Risk Settings Header -->
            <div style="background: var(--bg-surface-2); padding: 1rem; border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                    <h4 style="color: var(--text-primary); font-weight: 600; margin: 0;">🛡️ Global Risk Manager</h4>
                    <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                        <!-- Stop Loss Type Toggle -->
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="color: var(--text-secondary); font-size: 0.875rem;">Stop Loss Type:</span>
                            <select id="stopLossType" onchange="updateStopLossType(this.value)" style="
                                padding: 0.25rem 0.5rem; 
                                background: var(--bg-main); 
                                border: 1px solid var(--border-color); 
                                border-radius: 4px; 
                                color: var(--text-primary);
                                font-size: 0.875rem;
                            ">
                                <option value="dollar" ${riskSettings.stopLossType === 'dollar' ? 'selected' : ''}>Dollar Amount</option>
                                <option value="percent" ${riskSettings.stopLossType === 'percent' ? 'selected' : ''}>% of Balance</option>
                            </select>
                        </div>
                        
                        <!-- Stop Loss Value Input -->
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="color: var(--text-secondary); font-size: 0.875rem;">
                                ${riskSettings.stopLossType === 'dollar' ? 'Max Loss $:' : 'Max Loss %:'}
                            </span>
                            <input type="number" 
                                   id="stopLossValue" 
                                   value="${riskSettings.stopLossValue}" 
                                   min="${riskSettings.stopLossType === 'dollar' ? '50' : '1'}"
                                   max="${riskSettings.stopLossType === 'dollar' ? '10000' : '50'}"
                                   step="${riskSettings.stopLossType === 'dollar' ? '50' : '0.5'}"
                                   onchange="updateStopLossValue(this.value)"
                                   style="
                                       width: 80px; 
                                       padding: 0.25rem 0.5rem; 
                                       background: var(--bg-main); 
                                       border: 1px solid var(--border-color); 
                                       border-radius: 4px; 
                                       color: var(--text-primary);
                                       font-size: 0.875rem;
                                   ">
                            <span style="color: var(--text-secondary); font-size: 0.875rem;">
                                ${riskSettings.stopLossType === 'dollar' ? '' : '%'}
                            </span>
                        </div>
                        
                        <!-- Auto-Close Toggle -->
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="color: var(--text-secondary); font-size: 0.875rem;">Auto-Close:</span>
                            <label class="toggle-switch">
                                <input type="checkbox" 
                                       id="autoCloseEnabled" 
                                       ${riskSettings.autoCloseEnabled ? 'checked' : ''} 
                                       onchange="toggleAutoClose(this.checked)">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <!-- Manual Emergency Stop -->
                        <button class="btn btn-danger btn-sm" onclick="emergencyStopAll()" style="margin-left: auto;">
                            🚨 EMERGENCY STOP
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Risk Status Display -->
            <div style="padding: 1rem; border-left: 4px solid ${riskColor}; background: ${riskStatus === 'breach' ? 'rgba(239, 68, 68, 0.1)' : riskStatus === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)'};">
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: center;">
                    <div>
                        <div style="color: var(--text-primary); font-weight: 600; margin-bottom: 0.25rem;">
                            ${riskMessage}
                        </div>
                        <div style="display: flex; gap: 2rem; flex-wrap: wrap; font-size: 0.875rem; color: var(--text-secondary);">
                            <span>Current P&L: <strong style="color: ${totalPnL >= 0 ? 'var(--positive-green)' : 'var(--negative-red)'};">${formatCurrency(totalPnL)}</strong></span>
                            <span>Drawdown: <strong style="color: ${drawdownPercent > 0 ? 'var(--negative-red)' : 'var(--text-primary)'};">${drawdownPercent.toFixed(1)}%</strong></span>
                            <span>Risk Limit: <strong style="color: var(--accent-blue);">
                                ${riskSettings.stopLossType === 'dollar' ? formatCurrency(dollarThreshold) : percentThreshold.toFixed(1) + '%'}
                            </strong></span>
                            <span>Auto-Close: <strong style="color: ${riskSettings.autoCloseEnabled ? 'var(--positive-green)' : 'var(--negative-red)'};">
                                ${riskSettings.autoCloseEnabled ? 'ON' : 'OFF'}
                            </strong></span>
                        </div>
                    </div>
                    
                    <!-- Risk Meter -->
                    <div style="text-align: center; min-width: 120px;">
                        <div style="color: var(--text-secondary); font-size: 0.75rem; margin-bottom: 0.25rem;">Risk Level</div>
                        <div style="
                            width: 80px; 
                            height: 80px; 
                            border-radius: 50%; 
                            border: 8px solid ${riskColor}; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center;
                            background: var(--bg-main);
                            margin: 0 auto;
                        ">
                            <div style="text-align: center;">
                                <div style="font-size: 0.75rem; color: var(--text-secondary);">Used</div>
                                <div style="font-size: 1.1rem; font-weight: 700; color: ${riskColor};">
                                    ${((Math.abs(currentDrawdown) / dollarThreshold) * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Progress Bar -->
                <div style="margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                        <span style="font-size: 0.75rem; color: var(--text-secondary);">Risk Progression</span>
                        <span style="font-size: 0.75rem; color: var(--text-secondary);">
                            ${formatCurrency(Math.abs(currentDrawdown))} / ${formatCurrency(dollarThreshold)}
                        </span>
                    </div>
                    <div style="
                        width: 100%; 
                        height: 8px; 
                        background: var(--bg-surface-2); 
                        border-radius: 4px; 
                        overflow: hidden;
                    ">
                        <div style="
                            height: 100%; 
                            background: linear-gradient(90deg, var(--positive-green) 0%, var(--warning-yellow) 60%, var(--negative-red) 100%);
                            width: ${Math.min(100, (Math.abs(currentDrawdown) / dollarThreshold) * 100)}%;
                            transition: width 0.3s ease;
                        "></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Default risk settings
function getDefaultRiskSettings() {
    return {
        stopLossType: 'dollar', // 'dollar' or 'percent'
        stopLossValue: 500, // $500 or 5%
        autoCloseEnabled: true
    };
}

// Risk management functions
function updateStopLossType(type) {
    if (!appState.riskSettings) {
        appState.riskSettings = getDefaultRiskSettings();
    }
    
    appState.riskSettings.stopLossType = type;
    
    // Convert value when switching types
    const accountBalance = 10147.62;
    if (type === 'percent' && appState.riskSettings.stopLossValue > 50) {
        // Convert from dollar to percent
        appState.riskSettings.stopLossValue = Math.min(50, (appState.riskSettings.stopLossValue / accountBalance) * 100);
    } else if (type === 'dollar' && appState.riskSettings.stopLossValue < 50) {
        // Convert from percent to dollar
        appState.riskSettings.stopLossValue = Math.max(50, (appState.riskSettings.stopLossValue / 100) * accountBalance);
    }
    
    // Update the input field
    const stopLossValueInput = document.getElementById('stopLossValue');
    if (stopLossValueInput) {
        stopLossValueInput.value = appState.riskSettings.stopLossValue.toFixed(type === 'percent' ? 1 : 0);
    }
    
    if (typeof showNotification === 'function') {
        showNotification(`Stop loss type changed to ${type === 'dollar' ? 'Dollar Amount' : 'Percentage of Balance'}`, 'info');
    }
    
    // Refresh current page to update display
    if (typeof refreshCurrentPage === 'function') {
        refreshCurrentPage();
    }
}

function updateStopLossValue(value) {
    if (!appState.riskSettings) {
        appState.riskSettings = getDefaultRiskSettings();
    }
    
    appState.riskSettings.stopLossValue = parseFloat(value);
    
    if (typeof showNotification === 'function') {
        showNotification(`Stop loss limit updated to ${appState.riskSettings.stopLossType === 'dollar' ? '$' + value : value + '%'}`, 'success');
    }
    
    // Check if we need to trigger emergency stop
    checkRiskBreach();
    
    // Refresh current page to update display
    if (typeof refreshCurrentPage === 'function') {
        refreshCurrentPage();
    }
}

function toggleAutoClose(enabled) {
    if (!appState.riskSettings) {
        appState.riskSettings = getDefaultRiskSettings();
    }
    
    appState.riskSettings.autoCloseEnabled = enabled;
    
    if (typeof showNotification === 'function') {
        showNotification(`Auto-close ${enabled ? 'enabled' : 'disabled'}`, enabled ? 'success' : 'info');
    }
    
    // Refresh current page to update display
    if (typeof refreshCurrentPage === 'function') {
        refreshCurrentPage();
    }
}

function checkRiskBreach() {
    if (!appState.riskSettings || !appState.riskSettings.autoCloseEnabled) {
        return false;
    }
    
    const totalPnL = appState.activeBots.reduce((sum, bot) => sum + bot.totalPL, 0);
    const accountBalance = 10147.62;
    const currentDrawdown = Math.abs(Math.min(0, totalPnL));
    
    const dollarThreshold = appState.riskSettings.stopLossType === 'dollar' ? 
                           appState.riskSettings.stopLossValue : 
                           (appState.riskSettings.stopLossValue / 100) * accountBalance;
    
    if (currentDrawdown >= dollarThreshold) {
        // Risk breach detected - trigger emergency stop
        emergencyStopAll(true); // true = auto-triggered
        return true;
    }
    
    return false;
}

function emergencyStopAll(autoTriggered = false) {
    if (appState.activeBots.length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('No active bots to close', 'info');
        }
        return;
    }
    
    const totalPnL = appState.activeBots.reduce((sum, bot) => sum + bot.totalPL, 0);
    const reason = autoTriggered ? 'Automatic risk management trigger' : 'Manual emergency stop';
    
    if (!autoTriggered) {
        const confirmMessage = `🚨 EMERGENCY STOP ALL BOTS?\n\nThis will immediately close ${appState.activeBots.length} active bots.\nCurrent Total P&L: ${formatCurrency(totalPnL)}\n\nReason: ${reason}\n\nThis action cannot be undone.`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
    }
    
    // Close all bots
    const closedBots = [...appState.activeBots];
    appState.activeBots = [];
    appState.expandedBotId = null;
    
    // Log the emergency stop
    console.log(`🚨 EMERGENCY STOP: Closed ${closedBots.length} bots. Reason: ${reason}`);
    
    // Show notification
    const notificationMessage = autoTriggered ? 
        `🚨 AUTO-STOP: Risk limit breached! Closed ${closedBots.length} bots. Final P&L: ${formatCurrency(totalPnL)}` :
        `🛑 EMERGENCY STOP: Manually closed ${closedBots.length} bots. Final P&L: ${formatCurrency(totalPnL)}`;
    
    if (typeof showNotification === 'function') {
        showNotification(notificationMessage, 'error');
    }
    
    // Refresh display
    if (typeof refreshCurrentPage === 'function') {
        refreshCurrentPage();
    }
    
    // Show detailed alert
    setTimeout(() => {
        alert(`${autoTriggered ? '🚨 AUTOMATIC RISK STOP' : '🛑 EMERGENCY STOP'}\n\nClosed ${closedBots.length} bots\nFinal P&L: ${formatCurrency(totalPnL)}\nReason: ${reason}\n\nAll positions have been closed to protect your account.`);
    }, 500);
}

function calculateRiskMetrics() {
    const totalPnL = appState.activeBots.reduce((sum, bot) => sum + bot.totalPL, 0);
    const totalDrawdown = Math.min(0, totalPnL);
    const activeBotCount = appState.activeBots.length;
    const averagePnL = activeBotCount > 0 ? totalPnL / activeBotCount : 0;
    const accountBalance = 10147.62;
    
    const riskSettings = appState.riskSettings || getDefaultRiskSettings();
    const dollarThreshold = riskSettings.stopLossType === 'dollar' ? 
                           riskSettings.stopLossValue : 
                           (riskSettings.stopLossValue / 100) * accountBalance;
    
    const riskUtilization = (Math.abs(totalDrawdown) / dollarThreshold) * 100;
    
    return {
        totalPnL,
        totalDrawdown,
        activeBotCount,
        averagePnL,
        accountBalance,
        dollarThreshold,
        riskUtilization,
        isRiskBreach: Math.abs(totalDrawdown) >= dollarThreshold,
        isApproachingLimit: Math.abs(totalDrawdown) >= (dollarThreshold * 0.8),
        riskLevel: riskUtilization <= 50 ? 'Low' : riskUtilization <= 80 ? 'Medium' : 'High'
    };
}

// Auto-check risk every 5 seconds when bots are active
function startRiskMonitoring() {
    if (appState.riskMonitoringInterval) {
        clearInterval(appState.riskMonitoringInterval);
    }
    
    appState.riskMonitoringInterval = setInterval(() => {
        if (appState.activeBots.length > 0) {
            checkRiskBreach();
        }
    }, 5000); // Check every 5 seconds
}

// Stop risk monitoring
function stopRiskMonitoring() {
    if (appState.riskMonitoringInterval) {
        clearInterval(appState.riskMonitoringInterval);
        appState.riskMonitoringInterval = null;
    }
}

// Notification system (enhanced version)
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

// Add CSS animations for notifications if they don't exist
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
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
}

// Make functions globally available
window.updateStopLossType = updateStopLossType;
window.updateStopLossValue = updateStopLossValue;
window.toggleAutoClose = toggleAutoClose;
window.emergencyStopAll = emergencyStopAll;
window.checkRiskBreach = checkRiskBreach;
window.showNotification = showNotification;

// Initialize risk monitoring when this script loads
if (typeof appState !== 'undefined') {
    startRiskMonitoring();
}

console.log('✅ Enhanced Risk manager loaded with global stop loss controls');