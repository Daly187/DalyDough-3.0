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
    
    // Set up launch new bot button
    const launchBtn = document.getElementById('launch-new-bot-btn');
    if (launchBtn) {
        launchBtn.addEventListener('click', () => {
            switchPage('Auto Bot');
        });
    }
    
    // Set up close all positions button
    const closeAllBtn = document.querySelector('.btn-danger');
    if (closeAllBtn && closeAllBtn.textContent.includes('Close All Positions')) {
        closeAllBtn.addEventListener('click', closeAllBots);
    }
    
    // Load initial page
    updateKPIWidgets();
    switchPage('Dashboard');
    
    // Set up auto-refresh intervals
    setInterval(updateKPIWidgets, 30000); // Refresh KPIs every 30 seconds
    
    // Auto Bot countdown timer
    setInterval(() => {
        if (appState.autoBot.enabled && appState.autoBot.nextScan) {
            updateAutoBotDisplay();
        }
    }, 1000);
    
    console.log('✅ DalyDough 3.0 initialized successfully!');
    console.log('🎯 Key Features:');
    console.log('   ✅ Corrected Trend Scoring Logic');
    console.log('   ✅ 29 Currency Pairs + XAU/USD');
    console.log('   ✅ Real D-Size Algorithm');
    console.log('   ✅ Interactive Market Analysis');
    console.log('   ✅ Auto Bot Scanner');
    console.log('   ✅ COT Report Analysis');
    console.log('   ✅ Forex News Calendar');
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

console.log('🎯 DalyDough 3.0 JavaScript loaded successfully!');