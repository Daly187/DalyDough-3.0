// Enhanced Application Core with Live Data Integration - assets/js/core/app.js

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
    const connectedAccounts = getMT5Accounts ? getMT5Accounts().filter(acc => acc.status === 'connected') : [];
    
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

// Other functions...
function emergencyStopAll(autoTriggered = false) { /* ... your existing code ... */ }

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

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

console.log('🎯 Enhanced DalyDough 3.0 JavaScript loaded!');