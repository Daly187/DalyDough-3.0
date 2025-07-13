// Risk Management Functions
function createGlobalRiskManager(totalPnL, isRiskBreach) {
    return `
        <div style="margin-bottom: 1.5rem; padding: 1rem; background: ${isRiskBreach ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'}; border-radius: 8px; border-left: 4px solid ${isRiskBreach ? 'var(--negative-red)' : 'var(--positive-green)'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <h4>🛡️ Global Risk Manager</h4>
                <div style="font-size: 1.2rem; font-weight: 700; color: ${totalPnL >= 0 ? 'var(--positive-green)' : 'var(--negative-red)'};">
                    Total P&L: ${formatCurrency(totalPnL)}
                </div>
            </div>
            ${isRiskBreach ? `
                <div style="color: var(--negative-red); font-weight: 600; margin-bottom: 0.5rem;">
                    ⚠️ RISK BREACH: Portfolio down ${Math.abs(totalPnL).toFixed(0)}+ dollars
                </div>
                <button class="btn btn-danger btn-sm" onclick="closeAllBots()">🚨 EMERGENCY CLOSE ALL BOTS</button>
            ` : `
                <div style="color: var(--text-secondary); font-size: 0.875rem;">
                    Risk levels are within acceptable limits. Portfolio performing well.
                </div>
            `}
        </div>
    `;
}

function calculateRiskMetrics() {
    const totalPnL = appState.activeBots.reduce((sum, bot) => sum + bot.totalPL, 0);
    const totalDrawdown = Math.min(0, totalPnL);
    const activeBotCount = appState.activeBots.length;
    const averagePnL = activeBotCount > 0 ? totalPnL / activeBotCount : 0;
    
    return {
        totalPnL,
        totalDrawdown,
        activeBotCount,
        averagePnL,
        isRiskBreach: totalPnL <= -500,
        riskLevel: totalPnL >= 0 ? 'Low' : totalPnL >= -200 ? 'Medium' : 'High'
    };
}

function updateRiskDisplay() {
    const metrics = calculateRiskMetrics();
    
    // Update any risk-related UI elements
    const riskElements = document.querySelectorAll('.risk-indicator');
    riskElements.forEach(element => {
        element.textContent = metrics.riskLevel;
        element.className = `risk-indicator risk-${metrics.riskLevel.toLowerCase()}`;
    });
}

console.log('✅ Risk manager loaded');