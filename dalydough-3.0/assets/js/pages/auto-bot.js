// Redesigned Auto Bot Page - Replace assets/js/pages/auto-bot.js

function createAutoBotPage() {
    const { autoBot } = appState;
    const nextScanTime = autoBot.nextScan ? Math.max(0, Math.floor((autoBot.nextScan - Date.now()) / 1000)) : 0;
    const minutes = Math.floor(nextScanTime / 60);
    const seconds = nextScanTime % 60;

    return `
        <div class="launcher-container" style="max-width: 1600px; margin: 0 auto; padding: 1rem;">
            <!-- Header -->
            <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 1rem 1.5rem; background: var(--bg-surface); border-radius: 12px; border: 1px solid var(--border-color);">
                <div>
                    <h1 style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, var(--accent-blue), #5a95ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0;">🤖 Auto Bot Scanner</h1>
                    <p style="color: var(--text-secondary); margin: 0.25rem 0 0 0; font-size: 0.9rem;">Automated D-Size powered opportunity detection and bot deployment</p>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="text-align: right;">
                        <div style="color: var(--text-secondary); font-size: 0.8rem;">Scanner Status</div>
                        <div style="color: ${autoBot.enabled ? 'var(--positive-green)' : 'var(--negative-red)'}; font-weight: 600;">
                            ${autoBot.enabled ? '🟢 ACTIVE' : '🔴 STOPPED'}
                        </div>
                    </div>
                    <label class="toggle-switch" style="position: relative; width: 50px; height: 28px;">
                        <input type="checkbox" id="auto-bot-enabled" ${autoBot.enabled ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                        <span class="toggle-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-surface-2); border: 1px solid var(--border-color); transition: .4s; border-radius: 28px;"></span>
                    </label>
                </div>
            </div>

            <!-- Main Grid Layout -->
            <div style="display: grid; grid-template-columns: 320px 1fr 400px; gap: 1.5rem; height: calc(100vh - 200px);">
                
                <!-- Left Panel: Auto Bot Configuration -->
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 0;">⚙️ Auto Configuration</h3>
                            <div style="width: 8px; height: 8px; background: ${autoBot.enabled ? 'var(--positive-green)' : 'var(--text-tertiary)'}; border-radius: 50%; ${autoBot.enabled ? 'animation: pulse 2s infinite;' : ''}"></div>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                                <div class="form-group">
                                    <label for="min-dsize" style="font-weight: 500; color: var(--text-secondary); font-size: 0.8rem;">Min D-Size</label>
                                    <input type="number" id="min-dsize" value="${autoBot.config.minScore}" step="0.1" min="6.0" max="9.0" style="padding: 0.5rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.9rem;">
                                </div>
                                <div class="form-group">
                                    <label for="max-dsize" style="font-weight: 500; color: var(--text-secondary); font-size: 0.8rem;">Max D-Size</label>
                                    <input type="number" id="max-dsize" value="${autoBot.config.maxScore}" step="0.1" min="7.0" max="10.0" style="padding: 0.5rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.9rem;">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="stop-loss-pips" style="font-weight: 500; color: var(--text-secondary); font-size: 0.8rem;">Stop Loss (pips)</label>
                                <input type="number" id="stop-loss-pips" value="${autoBot.config.stopLossPips || 50}" min="10" max="200" step="5" style="padding: 0.5rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.9rem;">
                            </div>
                            
                            <div class="form-group">
                                <label for="take-profit-pips" style="font-weight: 500; color: var(--text-secondary); font-size: 0.8rem;">Take Profit (pips)</label>
                                <input type="number" id="take-profit-pips" value="${autoBot.config.takeProfitPips || 100}" min="20" max="500" step="10" style="padding: 0.5rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.9rem;">
                            </div>
                            
                            <div class="form-group">
                                <label for="max-bots-per-pair" style="font-weight: 500; color: var(--text-secondary); font-size: 0.8rem;">Max Bots Per Pair</label>
                                <input type="number" id="max-bots-per-pair" value="${autoBot.config.maxBotsPerPair || 2}" min="1" max="5" style="padding: 0.5rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.9rem;">
                            </div>
                            
                            <div class="form-group">
                                <label for="scan-interval" style="font-weight: 500; color: var(--text-secondary); font-size: 0.8rem;">Scan Interval (minutes)</label>
                                <input type="number" id="scan-interval" value="${autoBot.config.scanInterval || 5}" min="1" max="60" style="padding: 0.5rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.9rem;">
                            </div>
                            
                            <div class="form-group">
                                <label style="font-weight: 500; color: var(--text-secondary); font-size: 0.8rem;">Allowed Pairs</label>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-top: 0.5rem;">
                                    ${['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'XAU/USD', 'GBP/JPY'].map(pair => `
                                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                                            <input type="checkbox" id="pair-${pair.replace('/', '')}" value="${pair}" ${autoBot.config.allowedPairs.includes(pair) ? 'checked' : ''} style="width: auto;">
                                            <label for="pair-${pair.replace('/', '')}" style="font-size: 0.75rem; color: var(--text-primary);">${pair}</label>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Scanner Status -->
                    <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem;">
                        <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 0 0 1rem 0;">⏰ Scanner Timer</h3>
                        
                        <div style="text-align: center; margin: 1.5rem 0;">
                            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Next Scan In:</div>
                            <div style="font-family: 'Monaco', 'Menlo', monospace; font-size: 1.4rem; font-weight: 700; color: var(--accent-blue);" id="countdown-timer">
                                ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
                            <div style="text-align: center; padding: 0.75rem; background: var(--bg-main); border-radius: 8px;">
                                <div style="font-size: 1.2rem; font-weight: 700; color: var(--accent-blue);">${autoBot.opportunities.length}</div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary);">Opportunities</div>
                            </div>
                            <div style="text-align: center; padding: 0.75rem; background: var(--bg-main); border-radius: 8px;">
                                <div style="font-size: 1.2rem; font-weight: 700; color: var(--positive-green);">${appState.activeBots.filter(b => b.type === 'Auto Bot').length}</div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary);">Active Bots</div>
                            </div>
                        </div>

                        <button class="btn btn-primary" style="width: 100%; padding: 0.6rem 1.2rem; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; background: linear-gradient(135deg, var(--accent-blue), #5a95ff); color: white;" onclick="runManualScan()">
                            🔍 Force Scan Now
                        </button>
                    </div>
                </div>

                <!-- Middle Panel: Opportunities -->
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem; flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 0;">📊 Available Opportunities</h3>
                            <span style="background: var(--accent-blue); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;" id="opportunities-count">${autoBot.opportunities.length} pairs</span>
                        </div>

                        <!-- Column Headers -->
                        <div style="display: grid; grid-template-columns: 80px 60px 40px 80px 60px 80px; gap: 0.5rem; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border-color); font-size: 0.7rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">
                            <span>Pair</span>
                            <span>D-Size</span>
                            <span>Qly</span>
                            <span>Signal</span>
                            <span>Bots</span>
                            <span>Action</span>
                        </div>

                        <div style="flex: 1; overflow-y: auto; margin: -0.5rem; padding: 0.5rem; max-height: calc(100vh - 400px);" id="opportunities-list">
                            ${autoBot.opportunities.length === 0 ? `
                                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem; opacity: 0.5;">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                        <path d="M9 9h.01"></path>
                                        <path d="M15 9h.01"></path>
                                    </svg>
                                    <p style="margin: 0 0 1rem 0;">No opportunities found</p>
                                    <p style="margin: 0 0 1.5rem 0; font-size: 0.85rem;">Adjust criteria or wait for next scan</p>
                                    <button class="btn btn-primary btn-sm" onclick="runManualScan()" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: linear-gradient(135deg, var(--accent-blue), #5a95ff); color: white; border: none; border-radius: 6px; cursor: pointer;">🔍 Scan Now</button>
                                </div>
                            ` : autoBot.opportunities.map(opp => {
                                const currentBotsForPair = appState.activeBots.filter(b => b.pair === opp.pair && b.type === 'Auto Bot').length;
                                const canLaunch = currentBotsForPair < (autoBot.config.maxBotsPerPair || 2);
                                
                                return `
                                    <div style="display: grid; grid-template-columns: 80px 60px 40px 80px 60px 80px; gap: 0.5rem; align-items: center; padding: 0.75rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 0.5rem; transition: all 0.2s ease; cursor: pointer; font-size: 0.85rem;" onmouseover="this.style.background='var(--border-color)'; this.style.transform='translateY(-1px)';" onmouseout="this.style.background='var(--bg-surface-2)'; this.style.transform='translateY(0)';">
                                        
                                        <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">${opp.pair}</div>
                                        
                                        <div style="font-weight: 700; padding: 0.25rem 0.4rem; border-radius: 6px; text-align: center; color: white; font-size: 0.8rem; background: ${Number(opp.dsize) >= 8 ? 'linear-gradient(135deg, var(--positive-green), #16a34a)' : 'linear-gradient(135deg, var(--warning-yellow), #d97706)'};">
                                            ${opp.dsize}
                                        </div>
                                        
                                        <div style="font-weight: 700; padding: 0.25rem 0.4rem; border-radius: 6px; font-size: 0.75rem; text-align: center; color: white; background: ${opp.quality === 'A' ? 'linear-gradient(135deg, var(--positive-green), #16a34a)' : opp.quality === 'B' ? 'linear-gradient(135deg, var(--accent-blue), #2563eb)' : 'linear-gradient(135deg, var(--text-tertiary), #6b7280)'};">
                                            ${opp.quality}
                                        </div>
                                        
                                        <div style="font-weight: 600; font-size: 0.7rem; padding: 0.25rem 0.4rem; border-radius: 6px; text-align: center; background: rgba(34, 197, 94, 0.2); color: var(--positive-green);">
                                            ${opp.entrySignal.replace('Allow ', '')}
                                        </div>
                                        
                                        <div style="background: var(--accent-blue); color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; margin: 0 auto;">
                                            ${currentBotsForPair}
                                        </div>
                                        
                                        <button class="btn btn-primary btn-sm" onclick="launchAutoBotForPair('${opp.pair}')" ${!canLaunch ? 'disabled' : ''} style="padding: 0.4rem 0.6rem; font-size: 0.7rem; background: ${canLaunch ? 'linear-gradient(135deg, var(--accent-blue), #5a95ff)' : 'var(--text-tertiary)'}; color: white; border: none; border-radius: 4px; cursor: ${canLaunch ? 'pointer' : 'not-allowed'}; font-weight: 600;">
                                            ${canLaunch ? 'Launch' : 'Max'}
                                        </button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Right Panel: Auto Launch Summary -->
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 0;">📋 Auto Launch Summary</h3>
                        </div>

                        <div style="background: linear-gradient(135deg, rgba(54, 124, 255, 0.1), rgba(54, 124, 255, 0.05)); border: 1px solid rgba(54, 124, 255, 0.2); border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                <span>Min D-Size Score:</span>
                                <strong id="summary-min-score">${autoBot.config.minScore}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                <span>Stop Loss:</span>
                                <strong id="summary-sl">${autoBot.config.stopLossPips || 50} pips</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                <span>Take Profit:</span>
                                <strong id="summary-tp">${autoBot.config.takeProfitPips || 100} pips</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                <span>Max Bots Per Pair:</span>
                                <strong id="summary-max-bots">${autoBot.config.maxBotsPerPair || 2}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                <span>Scan Interval:</span>
                                <strong id="summary-scan-interval">${autoBot.config.scanInterval || 5} min</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                                <span>Auto Launch:</span>
                                <strong style="color: ${autoBot.enabled ? 'var(--positive-green)' : 'var(--negative-red)'};">${autoBot.enabled ? 'Enabled' : 'Disabled'}</strong>
                            </div>
                        </div>

                        <!-- Risk Assessment -->
                        <div style="background: var(--bg-surface-2); border-radius: 6px; padding: 0.75rem; margin-bottom: 1rem;">
                            <h4 style="margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-primary);">Risk Assessment</h4>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.8rem;">
                                <span>Risk/Reward:</span>
                                <span id="risk-reward">1:${((autoBot.config.takeProfitPips || 100) / (autoBot.config.stopLossPips || 50)).toFixed(1)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.8rem;">
                                <span>Max Concurrent:</span>
                                <span id="max-concurrent">${autoBot.config.allowedPairs.length * (autoBot.config.maxBotsPerPair || 2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                                <span>Status:</span>
                                <span style="color: ${autoBot.enabled ? 'var(--positive-green)' : 'var(--negative-red)'}; font-weight: 600;">${autoBot.enabled ? 'Auto Launch ON' : 'Manual Only'}</span>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <button class="btn btn-primary" onclick="launchBestOpportunity()" style="width: 100%; padding: 0.6rem; background: linear-gradient(135deg, var(--positive-green), #16a34a); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem;">
                                🚀 Launch Best Opportunity
                            </button>
                            <button class="btn btn-secondary" onclick="stopAllAutoBots()" style="width: 100%; padding: 0.6rem; background: var(--bg-surface-2); color: var(--text-secondary); border: 1px solid var(--border-color); border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem;">
                                🛑 Stop All Auto Bots
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <style>
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
            }
            
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 20px;
                width: 20px;
                left: 3px;
                bottom: 3px;
                background-color: var(--text-secondary);
                transition: .4s;
                border-radius: 50%;
            }

            input:checked + .toggle-slider {
                background-color: var(--accent-blue);
                border-color: var(--accent-blue);
            }

            input:checked + .toggle-slider:before {
                transform: translateX(22px);
                background-color: white;
            }
            
            @media (max-width: 1400px) {
                .launcher-container > div:last-child {
                    grid-template-columns: 280px 1fr 350px;
                }
            }

            @media (max-width: 1200px) {
                .launcher-container > div:last-child {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
            }
        </style>
    `;
}

// Enhanced Auto Bot Functions
function startAutoBotScanning() {
    if (!appState.autoBot.config.stopLossPips) appState.autoBot.config.stopLossPips = 50;
    if (!appState.autoBot.config.takeProfitPips) appState.autoBot.config.takeProfitPips = 100;
    if (!appState.autoBot.config.maxBotsPerPair) appState.autoBot.config.maxBotsPerPair = 2;
    if (!appState.autoBot.config.scanInterval) appState.autoBot.config.scanInterval = 5;
    
    appState.autoBot.enabled = true;
    appState.autoBot.nextScan = Date.now() + (appState.autoBot.config.scanInterval * 60 * 1000);
    
    // Start the scanning interval
    if (appState.autoBot.scanInterval) {
        clearInterval(appState.autoBot.scanInterval);
    }
    
    appState.autoBot.scanInterval = setInterval(() => {
        runAutoBotScan();
    }, appState.autoBot.config.scanInterval * 60 * 1000);
    
    console.log('🤖 Auto Bot scanning started');
    showNotification('Auto Bot scanner activated', 'success');
    updateAutoBotDisplay();
}

function stopAutoBotScanning() {
    appState.autoBot.enabled = false;
    appState.autoBot.scanning = false;
    appState.autoBot.nextScan = null;
    
    if (appState.autoBot.scanInterval) {
        clearInterval(appState.autoBot.scanInterval);
        appState.autoBot.scanInterval = null;
    }
    
    console.log('🛑 Auto Bot scanning stopped');
    showNotification('Auto Bot scanner stopped', 'info');
    updateAutoBotDisplay();
}

function runAutoBotScan() {
    console.log('🔍 Running Auto Bot scan...');
    appState.autoBot.scanning = true;
    
    // Ensure we have fresh market data
    appState.marketTrendsData = generateMarketDataWithScoring();
    
    // Filter opportunities based on criteria
    const opportunities = appState.marketTrendsData.filter(trend => {
        const score = parseFloat(trend.dsize);
        const meetsScore = score >= appState.autoBot.config.minScore && score <= appState.autoBot.config.maxScore;
        const isPairAllowed = appState.autoBot.config.allowedPairs.includes(trend.pair);
        const canEnter = trend.entryStatus && trend.entryStatus.includes('Allow');
        
        return meetsScore && isPairAllowed && canEnter;
    }).map(trend => ({
        pair: trend.pair,
        dsize: trend.dsize,
        entrySignal: trend.entryStatus,
        quality: trend.setupQuality,
        trendAlignment: trend.trendAnalysis ? trend.trendAnalysis.trendConfirmationScore || 0 : 0,
        lastScanned: new Date().toISOString()
    }));
    
    appState.autoBot.opportunities = opportunities;
    appState.autoBot.scanning = false;
    appState.autoBot.nextScan = Date.now() + (appState.autoBot.config.scanInterval * 60 * 1000);
    
    console.log(`✅ Auto Bot scan complete. Found ${opportunities.length} opportunities.`);
    
    // Auto-launch bots if enabled and opportunities found
    if (appState.autoBot.enabled && opportunities.length > 0) {
        autoLaunchBots(opportunities);
    }
    
    updateAutoBotDisplay();
}

function autoLaunchBots(opportunities) {
    let launched = 0;
    
    for (const opportunity of opportunities) {
        const currentBotsForPair = appState.activeBots.filter(b => b.pair === opportunity.pair && b.type === 'Auto Bot').length;
        const maxBotsPerPair = appState.autoBot.config.maxBotsPerPair || 2;
        
        if (currentBotsForPair < maxBotsPerPair) {
            launchAutoBotForPair(opportunity.pair, true); // true = auto launch
            launched++;
        }
    }
    
    if (launched > 0) {
        showNotification(`Auto-launched ${launched} bot${launched > 1 ? 's' : ''}`, 'success');
    }
}

function runManualScan() {
    console.log('🔍 Running manual Auto Bot scan...');
    showNotification('Scanning for opportunities...', 'info');
    
    // Generate fresh market data
    appState.marketTrendsData = generateMarketDataWithScoring();
    
    // Run the scan
    runAutoBotScan();
    
    // Refresh the page
    setTimeout(() => {
        if (appState.activePage === 'Auto Bot') {
            switchPage('Auto Bot');
        }
    }, 1000);
}

function launchAutoBotForPair(pair, isAutoLaunch = false) {
    const opportunity = appState.autoBot.opportunities.find(o => o.pair === pair);
    if (!opportunity) {
        if (!isAutoLaunch) showNotification('Opportunity no longer available', 'error');
        return;
    }
    
    const currentBotsForPair = appState.activeBots.filter(b => b.pair === pair && b.type === 'Auto Bot').length;
    const maxBotsPerPair = appState.autoBot.config.maxBotsPerPair || 2;
    
    if (currentBotsForPair >= maxBotsPerPair) {
        if (!isAutoLaunch) showNotification(`Maximum ${maxBotsPerPair} bots per pair reached for ${pair}`, 'error');
        return;
    }
    
    // Create new auto bot with clear SL/TP
    const stopLossPips = appState.autoBot.config.stopLossPips || 50;
    const takeProfitPips = appState.autoBot.config.takeProfitPips || 100;
    
    const newBot = {
        id: `auto_bot_${pair.replace('/', '')}_${Date.now()}`,
        pair: pair,
        type: 'Auto Bot',
        totalPL: 0,
        status: 'active',
        entryDScore: parseFloat(opportunity.dsize),
        currentDScore: parseFloat(opportunity.dsize),
        globalSL: stopLossPips,
        globalTP: takeProfitPips,
        trailingProfitEnabled: true,
        closeAtNextTP: false,
        autoStopScore: appState.autoBot.config.stopScore,
        activeTrades: [{
            id: `auto_trade_${Date.now()}`,
            botId: `auto_bot_${pair.replace('/', '')}_${Date.now()}`,
            pair: pair,
            direction: opportunity.entrySignal.includes('Buy') ? 'buy' : 'sell',
            entryPrice: Math.random() * 2 + 1,
            lotSize: 0.01,
            sl: stopLossPips,
            tp: takeProfitPips,
            currentPL: (Math.random() - 0.5) * 50,
            isReentry: false,
            reentryLevel: 0,
            entryTime: new Date().toISOString(),
            score: parseFloat(opportunity.dsize),
            reason: `Auto Bot entry - D-Size: ${opportunity.dsize}, SL: ${stopLossPips}p, TP: ${takeProfitPips}p`
        }],
        lastUpdate: new Date().toISOString()
    };
    
    appState.activeBots.push(newBot);
    
    console.log(`🤖 Auto Bot launched for ${pair} (${isAutoLaunch ? 'auto' : 'manual'})`);
    if (!isAutoLaunch) {
        showNotification(`Auto Bot launched for ${pair}`, 'success');
        
        // Refresh the page
        setTimeout(() => {
            if (appState.activePage === 'Auto Bot') {
                switchPage('Auto Bot');
            }
        }, 1000);
    }
}

function launchBestOpportunity() {
    if (appState.autoBot.opportunities.length === 0) {
        showNotification('No opportunities available', 'error');
        return;
    }
    
    // Find best opportunity by D-Size score
    const bestOpp = appState.autoBot.opportunities.reduce((best, current) => 
        parseFloat(current.dsize) > parseFloat(best.dsize) ? current : best
    );
    
    launchAutoBotForPair(bestOpp.pair);
}

function stopAllAutoBots() {
    const autoBots = appState.activeBots.filter(b => b.type === 'Auto Bot');
    
    if (autoBots.length === 0) {
        showNotification('No auto bots to stop', 'info');
        return;
    }
    
    if (confirm(`Stop all ${autoBots.length} auto bots?`)) {
        appState.activeBots = appState.activeBots.filter(b => b.type !== 'Auto Bot');
        showNotification(`Stopped ${autoBots.length} auto bots`, 'success');
        
        setTimeout(() => {
            if (appState.activePage === 'Auto Bot') {
                switchPage('Auto Bot');
            }
        }, 1000);
    }
}

function updateAutoBotDisplay() {
    if (appState.activePage === 'Auto Bot') {
        // Update countdown timer
        const countdownElement = document.getElementById('countdown-timer');
        if (countdownElement && appState.autoBot.nextScan) {
            const nextScanTime = Math.max(0, Math.floor((appState.autoBot.nextScan - Date.now()) / 1000));
            const minutes = Math.floor(nextScanTime / 60);
            const seconds = nextScanTime % 60;
            countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Update summary values
        const summaryElements = {
            'summary-min-score': appState.autoBot.config.minScore,
            'summary-sl': `${appState.autoBot.config.stopLossPips || 50} pips`,
            'summary-tp': `${appState.autoBot.config.takeProfitPips || 100} pips`,
            'summary-max-bots': appState.autoBot.config.maxBotsPerPair || 2,
            'summary-scan-interval': `${appState.autoBot.config.scanInterval || 5} min`,
            'risk-reward': `1:${((appState.autoBot.config.takeProfitPips || 100) / (appState.autoBot.config.stopLossPips || 50)).toFixed(1)}`,
            'max-concurrent': appState.autoBot.config.allowedPairs.length * (appState.autoBot.config.maxBotsPerPair || 2),
            'opportunities-count': `${appState.autoBot.opportunities.length} pairs`
        };
        
        Object.entries(summaryElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
}

function attachAutoBotEventListeners() {
    console.log('🔧 Attaching Auto Bot event listeners...');
    
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

    // Configuration inputs with summary updates
    const configInputs = {
        'min-dsize': 'minScore',
        'max-dsize': 'maxScore',
        'stop-loss-pips': 'stopLossPips',
        'take-profit-pips': 'takeProfitPips',
        'max-bots-per-pair': 'maxBotsPerPair',
        'scan-interval': 'scanInterval'
    };
    
    Object.entries(configInputs).forEach(([inputId, configKey]) => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', (e) => {
                appState.autoBot.config[configKey] = parseFloat(e.target.value);
                updateAutoBotDisplay();
                showNotification(`${configKey} updated`, 'info');
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
            updateAutoBotDisplay();
        });
    });
}

// Make functions globally available
window.runManualScan = runManualScan;
window.launchAutoBotForPair = launchAutoBotForPair;
window.launchBestOpportunity = launchBestOpportunity;
window.stopAllAutoBots = stopAllAutoBots;
window.startAutoBotScanning = startAutoBotScanning;
window.stopAutoBotScanning = stopAutoBotScanning;
window.attachAutoBotEventListeners = attachAutoBotEventListeners;

console.log('✅ Redesigned Auto Bot page loaded with launch bot styling');