// Complete Auto Bot Page - assets/js/pages/auto-bot.js

function createAutoBotPage() {
    const { autoBot } = appState;
    const nextScanTime = autoBot.nextScan ? Math.max(0, Math.floor((autoBot.nextScan - Date.now()) / 1000)) : 0;
    const minutes = Math.floor(nextScanTime / 60);
    const seconds = nextScanTime % 60;

    return `
        <div class="launcher-container" style="max-width: 1600px; margin: 0 auto; padding: 1rem;">
            <!-- Header with Global Stop Loss -->
            <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 1rem 1.5rem; background: var(--bg-surface); border-radius: 12px; border: 1px solid var(--border-color);">
                <div>
                    <h1 style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, var(--accent-blue), #5a95ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0;">🤖 Auto Bot Scanner</h1>
                    <p style="color: var(--text-secondary); margin: 0.25rem 0 0 0; font-size: 0.9rem;">Automated D-Size powered opportunity detection and bot deployment</p>
                </div>
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <!-- Auto Entry D-Size Filter -->
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                        <label style="color: var(--text-secondary); font-size: 0.8rem; font-weight: 500;">Auto Entry D-Size ≥</label>
                        <input type="number" 
                               id="auto-entry-dsize" 
                               value="${appState.autoBot.config.autoEntryDSize || 8.0}" 
                               min="6.0" 
                               max="10.0"
                               step="0.1"
                               style="width: 80px; padding: 0.5rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.9rem; text-align: center; font-weight: 600;"
                               onchange="updateAutoEntryDSize(this.value)">
                    </div>
                    <!-- Global Stop Loss Input -->
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                        <label style="color: var(--text-secondary); font-size: 0.8rem; font-weight: 500;">Global Stop Loss ($)</label>
                        <input type="number" 
                               id="global-stop-loss" 
                               value="${appState.autoBot.config.globalStopLoss || 500}" 
                               min="100" 
                               step="50"
                               style="width: 100px; padding: 0.5rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.9rem; text-align: center; font-weight: 600;"
                               onchange="updateGlobalStopLoss(this.value)">
                    </div>
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
                
                <!-- Left Panel: Bot Configuration -->
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 0;">⚙️ Bot Configuration</h3>
                            <div style="width: 8px; height: 8px; background: ${autoBot.enabled ? 'var(--positive-green)' : 'var(--text-tertiary)'}; border-radius: 50%; ${autoBot.enabled ? 'animation: pulse 2s infinite;' : ''}"></div>
                        </div>

                        <table style="width: 100%; background: var(--bg-surface-2); border-radius: 8px; overflow: hidden; margin-bottom: 1rem;">
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.85rem; width: 40%;">Bot Type</td>
                                <td style="padding: 0.75rem;">
                                    <select id="bot-type" style="width: 100%; padding: 0.4rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 0.85rem;">
                                        <option value="dynamic-dca">Dynamic DCA</option>
                                        <option value="static-grid">Static Grid</option>
                                        <option value="ai-trend">AI Trend</option>
                                    </select>
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.85rem;">Initial Investment ($)</td>
                                <td style="padding: 0.75rem;">
                                    <input type="number" id="initial-investment" value="1000" min="100" step="50" style="width: 100%; padding: 0.4rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 0.85rem;">
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.85rem;">Lot Size</td>
                                <td style="padding: 0.75rem;">
                                    <input type="number" id="lot-size" value="0.01" step="0.01" min="0.01" style="width: 100%; padding: 0.4rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 0.85rem;">
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.85rem;">Max Positions</td>
                                <td style="padding: 0.75rem;">
                                    <input type="number" id="max-positions" value="5" min="1" max="20" style="width: 100%; padding: 0.4rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 0.85rem;">
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.85rem;">Take Profit (pips)</td>
                                <td style="padding: 0.75rem;">
                                    <input type="number" id="take-profit-pips" value="100" min="20" max="500" step="10" style="width: 100%; padding: 0.4rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 0.85rem;">
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.85rem;">Max Drawdown (%)</td>
                                <td style="padding: 0.75rem;">
                                    <input type="number" id="max-drawdown" value="20" min="5" max="50" step="1" style="width: 100%; padding: 0.4rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 0.85rem;">
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.85rem;">Daily Loss Limit ($)</td>
                                <td style="padding: 0.75rem;">
                                    <input type="number" id="daily-loss-limit" value="200" min="50" step="25" style="width: 100%; padding: 0.4rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 0.85rem;">
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.85rem;">Enable Trailing Stop</td>
                                <td style="padding: 0.75rem;">
                                    <label class="toggle-switch" style="position: relative; width: 40px; height: 20px;">
                                        <input type="checkbox" id="trailing-stop" style="opacity: 0; width: 0; height: 0;">
                                        <span class="toggle-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-surface-2); border: 1px solid var(--border-color); transition: .4s; border-radius: 20px;"></span>
                                    </label>
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.85rem;">D-Size Exit Threshold</td>
                                <td style="padding: 0.75rem;">
                                    <input type="number" id="dsize-threshold" value="6.0" step="0.1" min="4.0" max="8.0" style="width: 100%; padding: 0.4rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 0.85rem;">
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.85rem;">Re-entry Delay (mins)</td>
                                <td style="padding: 0.75rem;">
                                    <input type="number" id="reentry-delay" value="15" min="5" step="5" style="width: 100%; padding: 0.4rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 0.85rem;">
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.85rem;">News Filter</td>
                                <td style="padding: 0.75rem;">
                                    <label class="toggle-switch" style="position: relative; width: 40px; height: 20px;">
                                        <input type="checkbox" id="news-filter" checked style="opacity: 0; width: 0; height: 0;">
                                        <span class="toggle-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-surface-2); border: 1px solid var(--border-color); transition: .4s; border-radius: 20px;"></span>
                                    </label>
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.85rem;">Weekend Trading</td>
                                <td style="padding: 0.75rem;">
                                    <label class="toggle-switch" style="position: relative; width: 40px; height: 20px;">
                                        <input type="checkbox" id="weekend-trading" style="opacity: 0; width: 0; height: 0;">
                                        <span class="toggle-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-surface-2); border: 1px solid var(--border-color); transition: .4s; border-radius: 20px;"></span>
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 0.75rem; color: var(--text-secondary); font-size: 0.85rem;">AI Optimization</td>
                                <td style="padding: 0.75rem;">
                                    <label class="toggle-switch" style="position: relative; width: 40px; height: 20px;">
                                        <input type="checkbox" id="ai-optimization" checked style="opacity: 0; width: 0; height: 0;">
                                        <span class="toggle-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-surface-2); border: 1px solid var(--border-color); transition: .4s; border-radius: 20px;"></span>
                                    </label>
                                </td>
                            </tr>
                        </table>

                        <div style="background: rgba(54, 124, 255, 0.1); border: 1px solid rgba(54, 124, 255, 0.3); border-radius: 6px; padding: 0.75rem; margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-secondary);">
                            <strong>🤖 AI Optimization Features:</strong><br>
                            • Dynamic R/S level detection for optimal re-entry timing<br>
                            • Real-time sentiment analysis integration<br>
                            • Adaptive lot sizing based on market volatility<br>
                            • Smart exit timing using momentum indicators<br>
                            • News impact assessment for position sizing
                        </div>
                    </div>

                    <!-- Scanner Timer -->
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
                                <span>Auto Entry D-Size:</span>
                                <strong id="summary-auto-entry-dsize">≥ ${appState.autoBot.config.autoEntryDSize || 8.0}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                <span>Global Stop Loss:</span>
                                <strong id="summary-global-sl">${appState.autoBot.config.globalStopLoss || 500}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                <span>Take Profit:</span>
                                <strong id="summary-tp">${appState.autoBot.config.takeProfitPips || 100} pips</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                <span>D-Size Exit Threshold:</span>
                                <strong id="summary-dsize-exit">${appState.autoBot.config.dsizeThreshold || 6.0}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                <span>Max Bots Per Pair:</span>
                                <strong id="summary-max-bots">${appState.autoBot.config.maxBotsPerPair || 2}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
                                <span>Scan Interval:</span>
                                <strong id="summary-scan-interval">${appState.autoBot.config.scanInterval || 5} min</strong>
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
                                <span>Global Risk Limit:</span>
                                <span id="global-risk-limit">$${autoBot.config.globalStopLoss || 500}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.8rem;">
                                <span>Risk/Reward:</span>
                                <span id="risk-reward">1:${((autoBot.config.takeProfitPips || 100) / 50).toFixed(1)}</span>
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
                height: 14px;
                width: 14px;
                left: 2px;
                bottom: 2px;
                background-color: var(--text-secondary);
                transition: .4s;
                border-radius: 50%;
            }

            input:checked + .toggle-slider {
                background-color: var(--accent-blue);
                border-color: var(--accent-blue);
            }

            input:checked + .toggle-slider:before {
                transform: translateX(16px);
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

// Enhanced Auto Bot Functions with Global Stop Loss
function startAutoBotScanning() {
    if (!appState.autoBot.config.takeProfitPips) appState.autoBot.config.takeProfitPips = 100;
    if (!appState.autoBot.config.maxBotsPerPair) appState.autoBot.config.maxBotsPerPair = 2;
    if (!appState.autoBot.config.scanInterval) appState.autoBot.config.scanInterval = 5;
    if (!appState.autoBot.config.globalStopLoss) appState.autoBot.config.globalStopLoss = 500;
    
    appState.autoBot.enabled = true;
    appState.autoBot.nextScan = Date.now() + (appState.autoBot.config.scanInterval * 60 * 1000);
    
    // Start the scanning interval
    if (appState.autoBot.scanInterval) {
        clearInterval(appState.autoBot.scanInterval);
    }
    
    appState.autoBot.scanInterval = setInterval(() => {
        runAutoBotScan();
    }, appState.autoBot.config.scanInterval * 60 * 1000);
    
    // Start global stop loss monitoring
    startGlobalStopLossMonitoring();
    
    console.log('🤖 Auto Bot scanning started with global stop loss monitoring');
    showNotification('Auto Bot scanner activated with global stop loss protection', 'success');
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
    
    // Stop global stop loss monitoring
    stopGlobalStopLossMonitoring();
    
    console.log('🛑 Auto Bot scanning stopped');
    showNotification('Auto Bot scanner stopped', 'info');
    updateAutoBotDisplay();
}

function updateGlobalStopLoss(value) {
    appState.autoBot.config.globalStopLoss = parseFloat(value);
    console.log(`🛡️ Global stop loss updated to ${value}`);
    showNotification(`Global stop loss updated to ${value}`, 'success');
    updateAutoBotDisplay();
}

function updateAutoEntryDSize(value) {
    appState.autoBot.config.autoEntryDSize = parseFloat(value);
    console.log(`🎯 Auto entry D-Size threshold updated to ${value}`);
    showNotification(`Auto entry threshold updated to D-Size ≥ ${value}`, 'success');
    updateAutoBotDisplay();
}

function startGlobalStopLossMonitoring() {
    if (appState.autoBot.globalStopLossInterval) {
        clearInterval(appState.autoBot.globalStopLossInterval);
    }
    
    appState.autoBot.globalStopLossInterval = setInterval(() => {
        checkGlobalStopLoss();
    }, 5000); // Check every 5 seconds
}

function stopGlobalStopLossMonitoring() {
    if (appState.autoBot.globalStopLossInterval) {
        clearInterval(appState.autoBot.globalStopLossInterval);
        appState.autoBot.globalStopLossInterval = null;
    }
}

function checkGlobalStopLoss() {
    const autoBots = appState.activeBots.filter(b => b.type === 'Auto Bot');
    if (autoBots.length === 0) return;
    
    const totalAutoBotsLoss = autoBots.reduce((sum, bot) => {
        return sum + Math.min(0, bot.totalPL); // Only count losses (negative values)
    }, 0);
    
    const globalStopLoss = appState.autoBot.config.globalStopLoss || 500;
    
    if (Math.abs(totalAutoBotsLoss) >= globalStopLoss) {
        console.log(`🚨 Global stop loss triggered! Total loss: $${Math.abs(totalAutoBotsLoss)}, Limit: $${globalStopLoss}`);
        
        // Close all auto bots
        const closedBots = autoBots.length;
        appState.activeBots = appState.activeBots.filter(b => b.type !== 'Auto Bot');
        
        // Stop auto bot scanning
        stopAutoBotScanning();
        
        // Show alert
        const alertMessage = `🚨 GLOBAL STOP LOSS TRIGGERED!\n\nTotal Auto Bot Loss: $${Math.abs(totalAutoBotsLoss)}\nGlobal Stop Loss Limit: $${globalStopLoss}\n\nClosed ${closedBots} auto bots and stopped scanning.`;
        
        showNotification('Global Stop Loss Triggered - All Auto Bots Closed', 'error');
        
        setTimeout(() => {
            alert(alertMessage);
        }, 500);
        
        // Refresh display
        if (typeof refreshCurrentPage === 'function') {
            refreshCurrentPage();
        }
    }
}

function runAutoBotScan() {
    console.log('🔍 Running Auto Bot scan...');
    appState.autoBot.scanning = true;
    
    // Ensure we have fresh market data
    appState.marketTrendsData = generateMarketDataWithScoring();
    
    // Filter opportunities based on auto entry D-Size threshold
    const autoEntryThreshold = appState.autoBot.config.autoEntryDSize || 8.0;
    const opportunities = appState.marketTrendsData.filter(trend => {
        const score = parseFloat(trend.dsize);
        const meetsAutoEntry = score >= autoEntryThreshold;
        const isPairAllowed = appState.autoBot.config.allowedPairs.includes(trend.pair);
        const canEnter = trend.entryStatus && trend.entryStatus.includes('Allow');
        
        return meetsAutoEntry && isPairAllowed && canEnter;
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
    
    console.log(`✅ Auto Bot scan complete. Found ${opportunities.length} opportunities with D-Size ≥ ${autoEntryThreshold}.`);
    
    // Auto-launch bots if enabled and opportunities found
    if (appState.autoBot.enabled && opportunities.length > 0) {
        autoLaunchBots(opportunities);
    }
    
    // Check for D-Size exit conditions on existing bots
    checkDSizeExitConditions();
    
    updateAutoBotDisplay();
}

function checkDSizeExitConditions() {
    const autoBots = appState.activeBots.filter(b => b.type === 'Auto Bot');
    const exitThreshold = appState.autoBot.config.dsizeThreshold || 6.0;
    
    autoBots.forEach(bot => {
        // Check if current D-Score has fallen below exit threshold
        if (bot.currentDScore <= exitThreshold && !bot.closeAtNextTP) {
            bot.closeAtNextTP = true;
            bot.lastUpdate = new Date().toISOString();
            
            console.log(`🔄 Bot ${bot.pair} marked for closure - D-Score ${bot.currentDScore} ≤ exit threshold ${exitThreshold}`);
            showNotification(`${bot.pair} bot will close at next TP - D-Score below ${exitThreshold}`, 'info');
        }
    });
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
    
    // Create new auto bot with TP only (no SL - handled by global stop loss)
    const takeProfitPips = appState.autoBot.config.takeProfitPips || 100;
    
    const newBot = {
        id: `auto_bot_${pair.replace('/', '')}_${Date.now()}`,
        pair: pair,
        type: 'Auto Bot',
        totalPL: 0,
        status: 'active',
        entryDScore: parseFloat(opportunity.dsize),
        currentDScore: parseFloat(opportunity.dsize),
        globalSL: null, // No individual SL - using global stop loss
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
            sl: null, // No individual SL
            tp: takeProfitPips,
            currentPL: (Math.random() - 0.5) * 50,
            isReentry: false,
            reentryLevel: 0,
            entryTime: new Date().toISOString(),
            score: parseFloat(opportunity.dsize),
            reason: `Auto Bot entry - D-Size: ${opportunity.dsize}, TP: ${takeProfitPips}p, Global SL: $${appState.autoBot.config.globalStopLoss}`
        }],
        lastUpdate: new Date().toISOString()
    };
    
    appState.activeBots.push(newBot);
    
    console.log(`🤖 Auto Bot launched for ${pair} (${isAutoLaunch ? 'auto' : 'manual'}) with global stop loss protection`);
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
            'summary-auto-entry-dsize': `≥ ${appState.autoBot.config.autoEntryDSize || 8.0}`,
            'summary-global-sl': `${appState.autoBot.config.globalStopLoss || 500}`,
            'summary-tp': `${appState.autoBot.config.takeProfitPips || 100} pips`,
            'summary-dsize-exit': `${appState.autoBot.config.dsizeThreshold || 6.0}`,
            'summary-max-bots': appState.autoBot.config.maxBotsPerPair || 2,
            'summary-scan-interval': `${appState.autoBot.config.scanInterval || 5} min`,
            'global-risk-limit': `${appState.autoBot.config.globalStopLoss || 500}`,
            'risk-reward': `1:${((appState.autoBot.config.takeProfitPips || 100) / 50).toFixed(1)}`,
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

    // Auto entry D-Size threshold input
    const autoEntryDSizeInput = document.getElementById('auto-entry-dsize');
    if (autoEntryDSizeInput) {
        autoEntryDSizeInput.addEventListener('change', (e) => {
            updateAutoEntryDSize(e.target.value);
        });
    }

    // Global stop loss input
    const globalStopLossInput = document.getElementById('global-stop-loss');
    if (globalStopLossInput) {
        globalStopLossInput.addEventListener('change', (e) => {
            updateGlobalStopLoss(e.target.value);
        });
    }

    // Bot configuration inputs
    const configInputs = {
        'bot-type': 'botType',
        'initial-investment': 'initialInvestment',
        'lot-size': 'lotSize',
        'max-positions': 'maxPositions',
        'take-profit-pips': 'takeProfitPips',
        'max-drawdown': 'maxDrawdown',
        'daily-loss-limit': 'dailyLossLimit',
        'dsize-threshold': 'dsizeThreshold',
        'reentry-delay': 'reentryDelay'
    };
    
    Object.entries(configInputs).forEach(([inputId, configKey]) => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', (e) => {
                const value = input.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                appState.autoBot.config[configKey] = value;
                updateAutoBotDisplay();
                console.log(`Updated ${configKey}: ${value}`);
            });
        }
    });

    // Toggle switches
    const toggleInputs = ['trailing-stop', 'news-filter', 'weekend-trading', 'ai-optimization'];
    toggleInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', (e) => {
                const configKey = inputId.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
                appState.autoBot.config[configKey] = e.target.checked;
                console.log(`Updated ${configKey}: ${e.target.checked}`);
            });
        }
    });
}

// Make functions globally available
window.runManualScan = runManualScan;
window.launchAutoBotForPair = launchAutoBotForPair;
window.launchBestOpportunity = launchBestOpportunity;
window.stopAllAutoBots = stopAllAutoBots;
window.startAutoBotScanning = startAutoBotScanning;
window.stopAutoBotScanning = stopAutoBotScanning;
window.updateGlobalStopLoss = updateGlobalStopLoss;
window.updateAutoEntryDSize = updateAutoEntryDSize;
window.attachAutoBotEventListeners = attachAutoBotEventListeners;

console.log('✅ Complete Auto Bot page loaded with auto entry D-Size filtering and D-Size exit conditions');