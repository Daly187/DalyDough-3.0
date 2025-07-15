// Enhanced Navigation Functions - Replace assets/js/core/navigation.js

// ---- Global app state ----
window.appState = window.appState || {
    sidebarExpanded: true,
    activePage: 'Dashboard',
    marketTrendsData: null
};

// Sidebar toggle
function toggleSidebar() {
    window.appState.sidebarExpanded = !window.appState.sidebarExpanded;
    const container = document.getElementById('app-container');
    if (window.appState.sidebarExpanded) {
        container.classList.add('sidebar-expanded');
        container.classList.remove('sidebar-collapsed');
    } else {
        container.classList.remove('sidebar-expanded');
        container.classList.add('sidebar-collapsed');
    }
}

// Navigation/page switching
function switchPage(pageName) {
    console.log(`🔄 Switching to page: ${pageName}`);
    window.appState.activePage = pageName;

    // Update sidebar active state
    document.querySelectorAll('.sidebar-nav-item a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    // Update main content
    const mainPanel = document.getElementById('main-panel');
    if (!mainPanel) return;

    switch (pageName) {
        case 'Dashboard':
            mainPanel.innerHTML = createDashboardPage();
            attachEventListeners();
            break;
        case 'Accounts':
            mainPanel.innerHTML = createAccountsPage();
            attachAccountsEventListeners();
            break;
        case 'Meat Market':
            if (!window.appState.marketTrendsData) {
                window.appState.marketTrendsData = generateMarketDataWithScoring();
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
    // Example: attach event listeners for current page (add more as needed)
    attachMarketEventListeners && attachMarketEventListeners();
}

// -- Optional: On first page load, set correct sidebar state and main panel --
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('app-container');
    if (window.appState.sidebarExpanded) {
        container.classList.add('sidebar-expanded');
        container.classList.remove('sidebar-collapsed');
    } else {
        container.classList.remove('sidebar-expanded');
        container.classList.add('sidebar-collapsed');
    }
    // Show initial page
    switchPage(window.appState.activePage);
});

// Make functions globally available
window.toggleSidebar = toggleSidebar;
window.switchPage = switchPage;

console.log('✅ Enhanced Navigation loaded with Accounts page support');
