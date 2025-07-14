function attachEventListeners() {
    // Central hub for all event listeners
    attachMarketEventListeners();

    // Add other page-specific listeners here if needed
    if (appState.activePage === 'Auto Bot') {
        attachAutoBotEventListeners();
    }
    if (appState.activePage === 'Active Bots') {
        // No specific listeners in the provided code, but can be added
    }
    if (appState.activePage === 'Forex News') {
        attachNewsEventListeners();
    }
    if(appState.activePage === 'Accounts'){
        attachAccountsEventListeners();
    }
}

function attachMarketEventListeners() {
    // Table row expansion for market data
    document.querySelectorAll('tr.is-expandable').forEach(row => {
        if (row.dataset.pair) { // Ensure it's a market row
            row.addEventListener('click', (e) => {
                // Don't trigger for buttons or inputs inside the row
                if (e.target.closest('button, input, a, .toggle-switch')) return;

                const pairData = JSON.parse(row.dataset.pair);
                const pair = pairData.pair;

                if (appState.expandedTrendPair === pair) {
                    appState.expandedTrendPair = null;
                } else {
                    appState.expandedTrendPair = pair;
                }
                refreshCurrentPageContent();
            });
        }
    });

    // Sortable headers for market data
    document.querySelectorAll('.sortable-header').forEach(header => {
        header.addEventListener('click', (e) => {
            const column = e.target.dataset.sort;
            if (!column) return;

            if (appState.marketDataSort.column === column) {
                appState.marketDataSort.direction = appState.marketDataSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                appState.marketDataSort.column = column;
                appState.marketDataSort.direction = 'desc';
            }
            refreshCurrentPageContent();
        });
    });
}

function refreshCurrentPageContent() {
    const page = appState.activePage;
    console.log(`♻️ Refreshing content for ${page}`);
    switchPage(page); // Re-render the current page
}

// Make functions globally available
window.attachEventListeners = attachEventListeners;
window.attachMarketEventListeners = attachMarketEventListeners;

console.log('✅ Event Listeners loaded');