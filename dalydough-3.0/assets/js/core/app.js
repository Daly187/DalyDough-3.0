// Enhanced Application Core - Replace assets/js/core/app.js

// KPI Widget Functions
function updateKPIWidgets() {
    // Get connected MT5 accounts for dynamic KPI calculation
    const connectedAccounts = getMT5Accounts ? getMT5Accounts().filter(acc => acc.status === 'connected') : [];
    
    let totalEquity = 0;
    let totalBalance = 0;
    let totalPL = 0;
    
    if (connectedAccounts.length > 0) {
        totalEquity = connectedAccounts.reduce((sum, acc) => sum + acc.equity, 0);
        totalBalance = connectedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        totalPL = totalEquity - totalBalance;
    } else {
        // Fallback to demo data
        totalEquity = 11432.12;
        totalBalance = 10147.62;
        totalPL = 1284.50;
    }

    const kpiData = [
        { label: 'P/L Summary', value: formatCurrency(totalPL), positive: totalPL >= 0 },
        { label: 'Total Equity', value: formatCurrency(totalEquity), positive: null },
        { label: 'Total Balance', value: formatCurrency(totalBalance), positive: null },
        { label: 'Connected Accounts', value: `${connectedAccounts.length} MT5`, positive: connectedAccounts.length > 0 }
    ];

    const kpiContainer = document.getElementById('kpi-widgets');
    if (kpiContainer) {
        kpiContainer.innerHTML = kpiData.map(kpi => `
            <div class="kpi-widget">
                <span class="kpi-label">${kpi.label}</span>
                <span class="kpi-value ${kpi.positive === true ? 'positive' : kpi.positive === false ? 'negative' : ''}">${kpi.value}</span>
            </div>
        `).join('');
    }
}

// Launch manual bot function
function launchManualBot() {
    console.log('🚀 Opening manual bot launcher...');
    
    // Check if we have connected MT5 accounts
    const connectedAccounts = getMT5Accounts ? getMT5Accounts().filter(acc => acc.status === 'connected') : [];
    
    if (connectedAccounts.length === 0) {
        if (confirm('No MT5 accounts are currently connected.\n\nWould you like to connect a demo account first?')) {
            switchPage('Accounts');
            return;
        }
    }
    
    // Try to open in new window first
    const launcherWindow = window.open(
        './bot-launcher.html', 
        'botLauncher', 
        'width=1400,height=900,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no'
    );
    
    if (launcherWindow) {
        launcherWindow.focus();
        console.log('✅ Manual Bot Launcher opened in new window');
        if (typeof showNotification === 'function') {
            showNotification('Manual Bot Launcher opened in new window', 'success');
        }
    } else {
        // Fallback if popup blocked - navigate in same window
        console.log('Popup blocked, navigating in same window...');
        window.location.href = './bot-launcher.html';
    }
}

// Enhanced Application Initialization
function initApp() {
    console.log('🚀 Initializing Enhanced DalyDough 3.0...');
    
    // Initialize MT5 accounts state if not exists
    if (!appState.mt5Accounts) {
        appState.mt5Accounts = [];
        
        // Load from localStorage if available
        const savedAccounts = localStorage.getItem('mt5Accounts');
        if (savedAccounts) {
            try {
                appState.mt5Accounts = JSON.parse(savedAccounts);
                console.log(`📊 Loaded ${appState.mt5Accounts.length} saved MT5 accounts`);
            } catch (error) {
                console.warn('Failed to load saved MT5 accounts:', error);
                appState.mt5Accounts = [];
            }
        }
    }
    
    // Set up sidebar navigation
    document.querySelectorAll('.sidebar-nav-item a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = e.currentTarget.dataset.page;
            switchPage(pageName);
        });
    });

    // Initialize data
    appState.marketTrendsData = generateMarketDataWithScoring();
    appState.activeBots = generateActiveBots();
    appState.cotData = generateCOTData();
    appState.forexNews = generateForexNews();
    
    // Set up launch new bot button - CONFIGURED FOR MANUAL LAUNCHER
    const launchBtn = document.getElementById('launch-new-bot-btn');
    if (launchBtn) {
        launchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            launchManualBot();
        });
        console.log('✅ Launch button configured for manual bot launcher with MT5 account checking');
    }
    
    // Set up any other launch bot buttons that might appear dynamically
    document.addEventListener('click', (e) => {
        // Check if the clicked element or its text contains launch bot references
        if (e.target.textContent && (
            e.target.textContent.includes('Launch New Bot') || 
            e.target.textContent.includes('Launch Your First Bot') ||
            e.target.textContent.includes('Launch Bot')
        )) {
            // Only prevent default if it's not the main navigation
            if (e.target.id === 'launch-new-bot-btn' || 
                e.target.classList.contains('btn-primary')) {
                e.preventDefault();
                launchManualBot();
            }
        }
    });
    
    // Set up close all positions button
    const closeAllBtn = document.querySelector('.btn-danger');
    if (closeAllBtn && closeAllBtn.textContent.includes('Close All Positions')) {
        closeAllBtn.addEventListener('click', () => {
            if (typeof emergencyStopAll === 'function') {
                emergencyStopAll();
            } else {
                closeAllBots();
            }
        });
    }
    
    // Load initial page
    updateKPIWidgets();
    switchPage('Dashboard');
    
    // Set up auto-refresh intervals
    setInterval(updateKPIWidgets, 30000); // Refresh KPIs every 30 seconds
    
    // Auto Bot countdown timer (if auto bot functionality exists)
    setInterval(() => {
        if (appState.autoBot && appState.autoBot.enabled && appState.autoBot.nextScan) {
            if (typeof updateAutoBotDisplay === 'function') {
                updateAutoBotDisplay();
            }
        }
    }, 1000);
    
    // MT5 Account Status Monitor
    setInterval(() => {
        if (appState.mt5Accounts && appState.mt5Accounts.length > 0) {
            // Check for disconnected accounts and show warnings
            const disconnectedAccounts = appState.mt5Accounts.filter(acc => acc.status === 'disconnected');
            
            if (disconnectedAccounts.length > 0 && Math.random() > 0.95) { // 5% chance per check
                const accountNames = disconnectedAccounts.map(acc => acc.nickname).join(', ');
                console.warn(`⚠️ MT5 Account(s) disconnected: ${accountNames}`);
                
                if (typeof showNotification === 'function') {
                    showNotification(`MT5 Account disconnected: ${disconnectedAccounts[0].nickname}`, 'error');
                }
            }
        }
    }, 10000); // Check every 10 seconds
    
    console.log('✅ Enhanced DalyDough 3.0 initialized successfully!');
    console.log('🎯 Key Features:');
    console.log('   ✅ MT5 Account Management');
    console.log('   ✅ Demo Account Safety');
    console.log('   ✅ Real-time Account Monitoring');
    console.log('   ✅ Corrected Trend Scoring Logic');
    console.log('   ✅ 29 Currency Pairs + XAU/USD');
    console.log('   ✅ Real D-Size Algorithm');
    console.log('   ✅ Interactive Market Analysis');
    console.log('   ✅ Manual Bot Launcher');
    console.log('   ✅ Auto Bot Scanner');
    console.log('   ✅ COT Report Analysis');
    console.log('   ✅ Forex News Calendar');
    console.log('   ✅ Enhanced Risk Management');
    console.log('   ✅ Responsive Design');
    
    // Log MT5 account status
    const connectedCount = appState.mt5Accounts ? appState.mt5Accounts.filter(acc => acc.status === 'connected').length : 0;
    console.log(`📊 MT5 Accounts: ${connectedCount} connected, ${appState.mt5Accounts ? appState.mt5Accounts.length - connectedCount : 0} disconnected`);
}

// Global click handler for debugging
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-primary')) {
        console.log('🚀 Primary button clicked:', e.target.textContent);
    }
    if (e.target.classList.contains('btn-danger')) {
        console.log('⚠️ Danger button clicked:', e.target.textContent);
    }
});

// Enhanced emergency stop with MT5 account awareness
function emergencyStopAll(autoTriggered = false) {
    if (appState.activeBots.length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('No active bots to close', 'info');
        }
        return;
    }
    
    const totalPnL = appState.activeBots.reduce((sum, bot) => sum + bot.totalPL, 0);
    const connectedAccounts = getMT5Accounts ? getMT5Accounts().filter(acc => acc.status === 'connected') : [];
    const reason = autoTriggered ? 'Automatic risk management trigger' : 'Manual emergency stop';
    
    if (!autoTriggered) {
        const confirmMessage = `🚨 EMERGENCY STOP ALL BOTS?\n\nThis will immediately close ${appState.activeBots.length} active bots across ${connectedAccounts.length} connected MT5 accounts.\nCurrent Total P&L: ${formatCurrency(totalPnL)}\n\nReason: ${reason}\n\nThis action cannot be undone.`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
    }
    
    // Close all bots
    const closedBots = [...appState.activeBots];
    appState.activeBots = [];
    appState.expandedBotId = null;
    
    // Log the emergency stop
    console.log(`🚨 EMERGENCY STOP: Closed ${closedBots.length} bots across ${connectedAccounts.length} MT5 accounts. Reason: ${reason}`);
    
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
        alert(`${autoTriggered ? '🚨 AUTOMATIC RISK STOP' : '🛑 EMERGENCY STOP'}\n\nClosed ${closedBots.length} bots across ${connectedAccounts.length} MT5 accounts\nFinal P&L: ${formatCurrency(totalPnL)}\nReason: ${reason}\n\nAll positions have been closed to protect your accounts.`);
    }, 500);
}

// Make functions globally available
window.launchManualBot = launchManualBot;
window.emergencyStopAll = emergencyStopAll;
window.updateKPIWidgets = updateKPIWidgets;

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

console.log('🎯 Enhanced DalyDough 3.0 JavaScript loaded with MT5 account management!');