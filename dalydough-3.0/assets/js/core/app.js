// KPI Widget Functions
function updateKPIWidgets() {
    const kpiData = [
        { label: 'P/L Summary', value: '+$1,284.50', positive: true },
        { label: 'Equity', value: '$11,432.12', positive: null },
        { label: 'Balance', value: '$10,147.62', positive: null },
        { label: 'Margin Use', value: '15.7%', positive: false }
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

// Initialize Application
function initApp() {
    console.log('🚀 Initializing DalyDough 3.0...');
    
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
        console.log('✅ Launch button configured for manual bot launcher');
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
    
    console.log('✅ DalyDough 3.0 initialized successfully!');
    console.log('🎯 Key Features:');
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
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
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

// Make launchManualBot globally available
window.launchManualBot = launchManualBot;

console.log('🎯 DalyDough 3.0 JavaScript loaded successfully!');