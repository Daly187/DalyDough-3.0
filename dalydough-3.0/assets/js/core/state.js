// Application State
let appState = {
    activePage: 'Dashboard',
    expandedBotId: null,
    expandedTrendPair: null,
    marketDataSort: {
        column: 'dsize',
        direction: 'desc'
    },
    marketTrendsData: null,
    activeBots: [],
    sidebarExpanded: false,
    riskSettings: {
        stopLossType: 'dollar', // 'dollar' or 'percent'
        stopLossValue: 500, // $500 or 5%
        autoCloseEnabled: true
    },
    riskMonitoringInterval: null,
    autoBot: {
        enabled: false,
        scanning: false,
        nextScan: null,
        scanInterval: null,
        config: {
            minScore: 7.5,
            maxScore: 10.0,
            stopScore: 6.0,
            allowedPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
            scanInterval: 10,
            maxBots: 1
        },
        opportunities: []
    },
    cotData: [],
    forexNews: []
};

console.log('✅ Enhanced State initialized with risk management');