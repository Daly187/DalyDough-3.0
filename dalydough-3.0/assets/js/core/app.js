// Enhanced Application Core with Live Data Integration - assets/js/core/app.js

// KPI Widget Functions
function updateKPIWidgets() {
    // Get connected MT5 accounts for dynamic KPI calculation
    const connectedAccounts = (typeof getMT5Accounts === 'function') ? getMT5Accounts().filter(acc => acc.status === 'connected') : [];
    
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

// Generate Active Bots (missing function)
function generateActiveBots() {
    const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'XAU/USD', 'NZD/CHF'];
    const botTypes = ['Dynamic DCA', 'Static Grid', 'AI Trend'];
    
    return pairs.slice(0, Math.floor(Math.random() * 4) + 2).map((pair, index) => {
        const botType = botTypes[Math.floor(Math.random() * botTypes.length)];
        const totalPL = (Math.random() - 0.4) * 1000; // Slightly bias toward positive
        const entryDScore = Math.random() * 3 + 7; // 7-10 range
        const currentDScore = entryDScore + (Math.random() - 0.5) * 2; // Slight variation
        
        // Generate some mock trades
        const numTrades = Math.floor(Math.random() * 5) + 1;
        const activeTrades = [];
        
        for (let i = 0; i < numTrades; i++) {
            const direction = Math.random() > 0.5 ? 'buy' : 'sell';
            const entryPrice = Math.random() * 2 + 1;
            const currentPL = (Math.random() - 0.5) * 200;
            
            activeTrades.push({
                id: `trade_${Date.now()}_${i}`,
                botId: `bot_${index + 1}`,
                pair: pair,
                direction: direction,
                entryPrice: entryPrice,
                lotSize: (Math.random() * 0.1 + 0.01).toFixed(2),
                sl: direction === 'buy' ? entryPrice - 0.005 : entryPrice + 0.005,
                tp: direction === 'buy' ? entryPrice + 0.01 : entryPrice - 0.01,
                currentPL: currentPL,
                isReentry: i > 0,
                reentryLevel: i,
                entryTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                score: entryDScore,
                reason: `${botType} entry - D-Size: ${entryDScore.toFixed(1)}`
            });
        }
        
        return {
            id: `bot_${index + 1}`,
            pair: pair,
            type: botType,
            totalPL: totalPL,
            status: 'active',
            entryDScore: entryDScore,
            currentDScore: currentDScore,
            globalSL: Math.floor(Math.random() * 100) + 50,
            globalTP: Math.floor(Math.random() * 100) + 100,
            trailingProfitEnabled: Math.random() > 0.5,
            closeAtNextTP: Math.random() > 0.8,
            autoStopScore: 6.0,
            activeTrades: activeTrades,
            lastUpdate: new Date().toISOString()
        };
    });
}

// Generate Forex News (missing function)
function generateForexNews() {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
    const events = [
        'Non-Farm Payrolls', 'CPI Flash Estimate', 'GDP Quarterly', 'Interest Rate Decision',
        'Unemployment Rate', 'Retail Sales', 'Manufacturing PMI', 'Consumer Confidence',
        'Trade Balance', 'Industrial Production', 'PPI Monthly', 'Housing Starts'
    ];
    const impacts = ['High', 'Medium', 'Low'];
    
    const newsItems = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
        const currency = currencies[Math.floor(Math.random() * currencies.length)];
        const event = events[Math.floor(Math.random() * events.length)];
        const impact = impacts[Math.floor(Math.random() * impacts.length)];
        
        // Generate realistic times for today
        const hour = Math.floor(Math.random() * 16) + 6; // 6 AM to 10 PM
        const minute = Math.floor(Math.random() * 12) * 5; // 5-minute intervals
        
        // Generate realistic forecast/actual values
        const baseValue = Math.random() * 10;
        const forecast = baseValue.toFixed(1) + '%';
        const actual = Math.random() > 0.3 ? (baseValue + (Math.random() - 0.5) * 2).toFixed(1) + '%' : 'N/A';
        const previous = (baseValue + (Math.random() - 0.5) * 1).toFixed(1) + '%';
        
        newsItems.push({
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            currency: currency,
            event: event,
            impact: impact,
            forecast: forecast,
            actual: actual,
            previous: previous
        });
    }
    
    // Sort by time
    return newsItems.sort((a, b) => a.time.localeCompare(b.time));
}

// Enhanced data refresh function with live API integration
async function refreshMarketData() {
    console.log('🔄 Refreshing market data with live API integration...');
    
    const refreshButtons = document.querySelectorAll('.refresh-button');
    refreshButtons.forEach(btn => {
        btn.classList.add('refreshing');
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                <path d="M23 4v6h-6"></path>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Loading...
        `;
    });
    
    try {
        const newMarketData = await window.supabaseApi.getMarketDataWithScoring();
        appState.marketTrendsData = newMarketData;
        
        if (appState.activePage === 'COT Report') {
            appState.cotData = await window.supabaseApi.getCOTReportHistory();
        }
        
        if (typeof showNotification === 'function') {
            const liveDataCount = newMarketData.filter(d => d.breakdown && d.breakdown.adxStrength.description !== 'Fallback data').length;
            const message = liveDataCount > 0 ? 
                `📊 Refreshed with ${liveDataCount} live data points from FMP` :
                '🔄 Market data refreshed (using enhanced fallback data)';
            showNotification(message, 'success');
        }
        
    } catch (error) {
        console.error('❌ Error refreshing market data:', error);
        if (typeof showNotification === 'function') {
            showNotification('⚠️ Data refresh failed, using cached data', 'error');
        }
    } finally {
        setTimeout(() => {
            refreshButtons.forEach(btn => {
                btn.classList.remove('refreshing');
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M23 4v6h-6"></path>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    Refresh
                `;
            });
            
            if (appState.activePage === 'Dashboard' || appState.activePage === 'Meat Market') {
                switchPage(appState.activePage);
            }
        }, 1000);
    }
}

// Launch manual bot function
function launchManualBot() {
    console.log('🚀 Opening manual bot launcher...');
    const connectedAccounts = (typeof getMT5Accounts === 'function') ? getMT5Accounts().filter(acc => acc.status === 'connected') : [];
    
    if (connectedAccounts.length === 0) {
        if (confirm('No MT5 accounts are currently connected.\n\nWould you like to connect a demo account first?')) {
            switchPage('Accounts');
            return;
        }
    }
    
    const launcherWindow = window.open('./bot-launcher.html', 'botLauncher', 'width=1400,height=900,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no');
    
    if (launcherWindow) {
        launcherWindow.focus();
    } else {
        window.location.href = './bot-launcher.html';
    }
}

// Enhanced Application Initialization with API integration
async function initApp() {
    console.log('🚀 Initializing Enhanced DalyDough 3.0 with Live API Integration...');
    
    // Initialize MT5 accounts if not already done
    if (!appState.mt5Accounts) {
        appState.mt5Accounts = [];
        const savedAccounts = localStorage.getItem('mt5Accounts');
        if (savedAccounts) {
            try {
                appState.mt5Accounts = JSON.parse(savedAccounts);
            } catch (error) {
                appState.mt5Accounts = [];
            }
        }
    }
    
    document.querySelectorAll('.sidebar-nav-item a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = e.currentTarget.dataset.page;
            switchPage(pageName);
        });
    });

    if (typeof showNotification === 'function') {
        showNotification('🚀 Initializing live data connections...', 'info');
    }

    try {
        console.log('📊 Loading initial market data...');
        appState.marketTrendsData = await window.supabaseApi.getMarketDataWithScoring();
        
        console.log('🤖 Loading active bots...');
        appState.activeBots = generateActiveBots();
        
        console.log('📈 Loading COT data...');
        appState.cotData = await window.supabaseApi.getCOTReportHistory();
        
        console.log('📰 Loading forex news...');
        appState.forexNews = generateForexNews();
        
    } catch (error) {
        console.error('❌ Error during data initialization:', error);
        if (typeof showNotification === 'function') {
            showNotification('❌ Data initialization failed, using fallback data', 'error');
        }
        
        // Initialize with fallback data
        appState.activeBots = generateActiveBots();
        appState.forexNews = generateForexNews();
        appState.cotData = [];
    }
    
    const launchBtn = document.getElementById('launch-new-bot-btn');
    if (launchBtn) {
        launchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            launchManualBot();
        });
    }
    
    document.addEventListener('click', (e) => {
        if (e.target.textContent && e.target.textContent.includes('Launch') && e.target.classList.contains('btn-primary')) {
            e.preventDefault();
            launchManualBot();
        }
    });
    
    const closeAllBtn = document.querySelector('.btn-danger');
    if (closeAllBtn && closeAllBtn.textContent.includes('Close All Positions')) {
        closeAllBtn.addEventListener('click', () => {
            if (typeof emergencyStopAll === 'function') {
                emergencyStopAll();
            }
        });
    }
    
    updateKPIWidgets();
    switchPage('Dashboard');
    
    setInterval(updateKPIWidgets, 30000); 
    
    setInterval(async () => {
        if (appState.activePage === 'Dashboard' || appState.activePage === 'Meat Market') {
            try {
                appState.marketTrendsData = await window.supabaseApi.getMarketDataWithScoring();
                if (appState.activePage === 'Dashboard' || appState.activePage === 'Meat Market') {
                    switchPage(appState.activePage);
                }
            } catch (error) {
                console.warn('Auto-refresh failed:', error);
            }
        }
    }, 300000);
}

// Emergency stop function
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

// Global click handler for debugging
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-primary')) {
        console.log('🚀 Primary button clicked:', e.target.textContent);
    }
});

// Make functions globally available
window.launchManualBot = launchManualBot;
window.emergencyStopAll = emergencyStopAll;
window.updateKPIWidgets = updateKPIWidgets;
window.refreshMarketData = refreshMarketData;
window.generateActiveBots = generateActiveBots;
window.generateForexNews = generateForexNews;

// Start the application when DOM is ready and supabaseApi is available
function startApp() {
    if (window.supabaseApi) {
        initApp();
    } else {
        console.warn('Supabase API not ready, waiting...');
        setTimeout(startApp, 100); // Check again in 100ms
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

console.log('🎯 Enhanced DalyDough 3.0 JavaScript loaded!');