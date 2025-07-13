// Navigation Functions
function toggleSidebar() {
    appState.sidebarExpanded = !appState.sidebarExpanded;
    const container = document.getElementById('app-container');
    if (appState.sidebarExpanded) {
        container.classList.add('sidebar-expanded');
    } else {
        container.classList.remove('sidebar-expanded');
    }
}

function switchPage(pageName) {
    console.log(`🔄 Switching to page: ${pageName}`);
    appState.activePage = pageName;
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-nav-item a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    // Update main content
    const mainPanel = document.getElementById('main-panel');
    
    switch (pageName) {
        case 'Dashboard':
            mainPanel.innerHTML = createDashboardPage();
            attachEventListeners();
            break;
        case 'Meat Market':
            if (!appState.marketTrendsData) {
                appState.marketTrendsData = generateMarketDataWithScoring();
            }
            mainPanel.innerHTML = createMeatMarketPage();
            attachMarketEventListeners();
            break;
        case 'Auto Bot':
            mainPanel.innerHTML = createAutoBotPage();
            attachAutoBotEventListeners();
            break;
        case 'Active Bots':
            mainPanel.innerHTML = createActiveBotsPage();
            attachEventListeners();
            break;
        case 'COT Report':
            mainPanel.innerHTML = createCOTReportPage();
            break;
        case 'Forex News':
            mainPanel.innerHTML = createForexNewsPage();
            attachNewsEventListeners();
            break;
        case 'Settings':
            mainPanel.innerHTML = createSettingsPage();
            break;
        case 'Statistics':
            mainPanel.innerHTML = createStatisticsPage();
            break;
        default:
            mainPanel.innerHTML = createPlaceholderPage(pageName);
    }
}

function createPlaceholderPage(pageName) {
    const descriptions = {
        'Active Bots': 'Manage all your active trading bots, view performance, and configure strategies.',
        'Statistics': 'Comprehensive trading statistics, performance metrics, and analytics.',
        'Settings': 'Application settings, API configurations, and user preferences.'
    };

    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">${pageName}</h2>
            </div>
            <div class="placeholder-content">
                <h3>Coming Soon</h3>
                <p class="text-secondary">${descriptions[pageName] || 'This feature is coming soon.'}</p>
                <button class="btn btn-primary" style="margin-top: 1rem;">Get Started</button>
            </div>
        </div>
    `;
}

function attachEventListeners() {
    // Market trends event listeners
    attachMarketEventListeners();
}

// Make functions globally available
window.toggleSidebar = toggleSidebar;
window.switchPage = switchPage;

console.log('✅ Navigation loaded');