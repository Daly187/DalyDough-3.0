function createAutoBotPage() {
    const { autoBot } = appState;
    const nextScanTime = autoBot.nextScan ? Math.max(0, Math.floor((autoBot.nextScan - Date.now()) / 1000)) : 0;
    const minutes = Math.floor(nextScanTime / 60);
    const seconds = nextScanTime % 60;

    return `
        <div class="auto-bot-config">
            <div class="config-section">
                <h3>🤖 Auto Bot Configuration</h3>
                
                <div class="form-group">
                    <label>Bot Status</label>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <label class="toggle-switch">
                            <input type="checkbox" id="auto-bot-enabled" ${autoBot.enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                        <span class="status-indicator ${autoBot.enabled ? (autoBot.scanning ? 'status-scanning' : 'status-active') : 'status-waiting'}">
                            ${autoBot.enabled ? (autoBot.scanning ? '🔍 Scanning Markets' : '✅ Active & Monitoring') : '⏸️ Stopped'}
                        </span>
                    </div>
                </div>

                <div class="form-group">
                    <label for="min-score">Minimum D-Size Score</label>
                    <input type="number" id="min-score" value="${autoBot.config.minScore}" step="0.1" min="6.0" max="9.0">
                </div>

                <div class="form-group">
                    <label for="max-score">Maximum D-Size Score</label>
                    <input type="number" id="max-score" value="${autoBot.config.maxScore}" step="0.1" min="7.0" max="10.0">
                </div>

                <div class="form-group">
                    <label for="stop-score">Auto-Stop Score</label>
                    <input type="number" id="stop-score" value="${autoBot.config.stopScore}" step="0.1" min="4.0" max="7.0">
                    <small style="color: var(--text-secondary);">Bot stops when D-Size drops to this level</small>
                </div>

                <div class="form-group">
                    <label for="max-bots">Max Concurrent Bots</label>
                    <input type="number" id="max-bots" value="${autoBot.config.maxBots}" min="1" max="5">
                </div>

                <div class="form-group">
                    <label>Allowed Pairs</label>
                    <div class="checkbox-group">
                        ${['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'XAU/USD', 'GBP/JPY'].map(pair => `
                            <div class="checkbox-item">
                                <input type="checkbox" id="pair-${pair.replace('/', '')}" value="${pair}" ${autoBot.config.allowedPairs.includes(pair) ? 'checked' : ''}>
                                <label for="pair-${pair.replace('/', '')}">${pair}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="config-section">
                <h3>⏰ Scanner Status</h3>
                
                <div style="text-align: center; margin: 2rem 0;">
                    <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                        Next Scan In:
                    </div>
                    <div class="countdown-timer" id="countdown-timer">
                        ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0;">
                    <div style="text-align: center; padding: 1rem; background: var(--bg-main); border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent-blue);">${autoBot.opportunities.length}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">Opportunities Found</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: var(--bg-main); border-radius: 8px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--positive-green);">${appState.activeBots.filter(b => b.type === 'Auto Bot').length}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">Active Auto Bots</div>
                    </div>
                </div>

                <button class="btn btn-primary" style="width: 100%;" onclick="runManualScan()">
                    🔍 Run Manual Scan
                </button>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Current Opportunities</h2>
                <div class="last-update">
                    Updated: ${new Date().toLocaleTimeString()}
                </div>
            </div>
            
            <div class="opportunities-table">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Pair</th>
                                <th>D-Size Score</th>
                                <th>Entry Signal</th>
                                <th>Quality</th>
                                <th>Trend Alignment</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${autoBot.opportunities.length === 0 ? `
                                <tr>
                                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                                        No opportunities found. Adjust criteria or wait for next scan.
                                    </td>
                                </tr>
                            ` : autoBot.opportunities.map(opp => `
                                <tr>
                                    <td style="font-weight: 600;">${opp.pair}</td>
                                    <td><span class="recommendation-score score-${Number(opp.dsize) >= 8 ? 'high' : 'medium'}">${opp.dsize}</span></td>
                                    <td><span class="entry-status entry-allow">${opp.entrySignal}</span></td>
                                    <td><span class="setup-quality-pill quality-${opp.quality}">${opp.quality}</span></td>
                                    <td style="text-align: center;">${opp.trendAlignment}/3</td>
                                    <td>
                                        <button class="btn btn-primary btn-sm" onclick="launchAutoBotForPair('${opp.pair}')">
                                            Launch Bot
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Auto Bot Functions
function startAutoBotScanning() {
    appState.autoBot.enabled = true;
    appState.autoBot.nextScan = Date.now() + (appState.autoBot.config.scanInterval * 60 * 1000);
    updateAutoBotDisplay();
    
    // Start the scanning interval
    if (appState.autoBot.scanInterval) {
        clearInterval(appState.autoBot.scanInterval);
    }
    
    appState.autoBot.scanInterval = setInterval(() => {
        runAutoBotScan();
    }, appState.autoBot.config.scanInterval * 60 * 1000);
    
    console.log('🤖 Auto Bot scanning started');
}

function stopAutoBotScanning() {
    appState.autoBot.enabled = false;
    appState.autoBot.scanning = false;
    appState.autoBot.nextScan = null;
    
    if (appState.autoBot.scanInterval) {
        clearInterval(appState.autoBot.scanInterval);
        appState.autoBot.scanInterval = null;
    }
    
    updateAutoBotDisplay();
    console.log('🛑 Auto Bot scanning stopped');
}

function runAutoBotScan() {
    console.log('🔍 Running Auto Bot scan...');
    appState.autoBot.scanning = true;
    
    if (!appState.marketTrendsData) {
        appState.marketTrendsData = generateMarketDataWithScoring();
    }
    
    // Filter opportunities based on criteria
    const opportunities = appState.marketTrendsData.filter(trend => {
        const score = parseFloat(trend.dsize);
        const meetsScore = score >= appState.autoBot.config.minScore && score <= appState.autoBot.config.maxScore;
        const isPairAllowed = appState.autoBot.config.allowedPairs.includes(trend.pair);
        const canEnter = trend.entryStatus.includes('Allow');
        
        return meetsScore && isPairAllowed && canEnter;
    }).map(trend => ({
        pair: trend.pair,
        dsize: trend.dsize,
        entrySignal: trend.entryStatus,
        quality: trend.setupQuality,
        trendAlignment: trend.trendAnalysis.trendConfirmationScore,
        lastScanned: new Date().toISOString()
    }));
    
    appState.autoBot.opportunities = opportunities;
    appState.autoBot.scanning = false;
    appState.autoBot.nextScan = Date.now() + (appState.autoBot.config.scanInterval * 60 * 1000);
    
    console.log(`✅ Auto Bot scan complete. Found ${opportunities.length} opportunities.`);
    
    // Auto-launch bots if opportunities found and under limit
    const currentAutoBots = appState.activeBots.filter(b => b.type === 'Auto Bot').length;
    if (opportunities.length > 0 && currentAutoBots < appState.autoBot.config.maxBots) {
        const topOpportunity = opportunities[0];
        launchAutoBotForPair(topOpportunity.pair);
    }
    
    updateAutoBotDisplay();
}

function runManualScan() {
    console.log('🔍 Running manual Auto Bot scan...');
    runAutoBotScan();
    
    if (appState.activePage === 'Auto Bot') {
        switchPage('Auto Bot');
    }
}

function launchAutoBotForPair(pair) {
    const opportunity = appState.autoBot.opportunities.find(o => o.pair === pair);
    if (!opportunity) {
        alert('Opportunity no longer available');
        return;
    }
    
    const currentAutoBots = appState.activeBots.filter(b => b.type === 'Auto Bot').length;
    if (currentAutoBots >= appState.autoBot.config.maxBots) {
        alert(`Maximum of ${appState.autoBot.config.maxBots} auto bots allowed`);
        return;
    }
    
    // Create new auto bot
    const newBot = {
        id: `auto_bot_${Date.now()}`,
        pair: pair,
        type: 'Auto Bot',
        totalPL: 0,
        status: 'active',
        entryDScore: parseFloat(opportunity.dsize),
        currentDScore: parseFloat(opportunity.dsize),
        globalSL: 500,
        globalTP: 1000,
        trailingProfitEnabled: true,
        closeAtNextTP: false,
        autoStopScore: appState.autoBot.config.stopScore,
        activeTrades: [{
            id: `auto_trade_${Date.now()}`,
            botId: `auto_bot_${Date.now()}`,
            pair: pair,
            direction: opportunity.entrySignal.includes('Buy') ? 'buy' : 'sell',
            entryPrice: Math.random() * 2 + 1,
            lotSize: 0.01,
            sl: 500,
            tp: 1000,
            currentPL: 0,
            isReentry: false,
            reentryLevel: 0,
            entryTime: new Date().toISOString(),
            score: parseFloat(opportunity.dsize),
            reason: `Auto Bot entry - D-Size: ${opportunity.dsize}, Signal: ${opportunity.entrySignal}`
        }],
        lastUpdate: new Date().toISOString()
    };
    
    appState.activeBots.push(newBot);
    
    // Remove opportunity from list
    appState.autoBot.opportunities = appState.autoBot.opportunities.filter(o => o.pair !== pair);
    
    alert(`🤖 Auto Bot launched for ${pair}\nD-Size: ${opportunity.dsize}\nSignal: ${opportunity.entrySignal}`);
    
    if (appState.activePage === 'Auto Bot') {
        switchPage('Auto Bot');
    }
}

function updateAutoBotDisplay() {
    if (appState.activePage === 'Auto Bot') {
        const countdownElement = document.getElementById('countdown-timer');
        if (countdownElement && appState.autoBot.nextScan) {
            const nextScanTime = Math.max(0, Math.floor((appState.autoBot.nextScan - Date.now()) / 1000));
            const minutes = Math.floor(nextScanTime / 60);
            const seconds = nextScanTime % 60;
            countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
}

function attachAutoBotEventListeners() {
    // Auto bot enable/disable toggle
    const enableToggle = document.getElementById('auto-bot-enabled');
    if (enableToggle) {
        enableToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                startAutoBotScanning();
            } else {
                stopAutoBotScanning();
            }
        });
    }

    // Configuration inputs
    ['min-score', 'max-score', 'stop-score', 'max-bots'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', (e) => {
                const key = id.replace('-', '').charAt(0).toUpperCase() + id.replace('-', '').slice(1);
                appState.autoBot.config[key.replace('Score', 'Score')] = parseFloat(e.target.value);
                console.log(`Updated ${key}:`, e.target.value);
            });
        }
    });

    // Pair checkboxes
    document.querySelectorAll('input[type="checkbox"][id^="pair-"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const pair = e.target.value;
            if (e.target.checked) {
                if (!appState.autoBot.config.allowedPairs.includes(pair)) {
                    appState.autoBot.config.allowedPairs.push(pair);
                }
            } else {
                appState.autoBot.config.allowedPairs = appState.autoBot.config.allowedPairs.filter(p => p !== pair);
            }
            console.log('Updated allowed pairs:', appState.autoBot.config.allowedPairs);
        });
    });
}

// Make functions globally available
window.runManualScan = runManualScan;
window.launchAutoBotForPair = launchAutoBotForPair;

console.log('✅ Auto Bot page loaded');