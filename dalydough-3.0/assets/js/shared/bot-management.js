// Bot Management Functions
function toggleBotExpansion(botId) {
    if (appState.expandedBotId === botId) {
        appState.expandedBotId = null;
    } else {
        appState.expandedBotId = botId;
    }
    
    // Refresh current page to show/hide expansion
    refreshCurrentPage();
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

console.log('✅ Bot management loaded');