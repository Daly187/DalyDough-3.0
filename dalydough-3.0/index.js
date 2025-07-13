// DalyDough 2.0 - Pure JavaScript Version
console.log("🚀 DalyDough JavaScript starting...");

// Wait for DOM to be ready
function initApp() {
    console.log("📄 Initializing DalyDough app...");
    
    const root = document.getElementById('root');
    if (!root) {
        console.error('❌ Root element not found');
        return;
    }

    console.log("✅ Root element found, creating app...");

    root.innerHTML = `
        <style>
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #10111a;
                color: #f0f0f5;
                line-height: 1.6;
            }
            
            .container {
                min-height: 100vh;
                padding: 2rem;
            }
            
            .header {
                background: linear-gradient(135deg, #367cff, #2563eb);
                padding: 2rem;
                border-radius: 12px;
                margin-bottom: 2rem;
                text-align: center;
                box-shadow: 0 8px 32px rgba(54, 124, 255, 0.3);
            }
            
            .card {
                background: #1c1d2b;
                border: 1px solid #31334a;
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 2rem;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
            }
            
            .status-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin: 1rem 0;
            }
            
            .status-item {
                background: #282a3d;
                padding: 1rem;
                border-radius: 8px;
                border-left: 4px solid #22c55e;
            }
            
            .market-grid {
                display: grid;
                gap: 1rem;
                margin-top: 1.5rem;
            }
            
            .pair-row {
                display: grid;
                grid-template-columns: 1fr 120px 80px 120px 100px;
                gap: 1rem;
                align-items: center;
                padding: 1rem;
                border-radius: 8px;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .pair-row:hover {
                background: #282a3d;
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            }
            
            .pair-name {
                font-weight: 600;
                font-size: 1.1rem;
            }
            
            .score-badge {
                padding: 0.5rem;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                text-align: center;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }
            
            .grade-badge {
                padding: 0.4rem 0.8rem;
                border-radius: 12px;
                color: white;
                font-weight: bold;
                text-align: center;
                font-size: 0.9rem;
            }
            
            .entry-status {
                font-weight: bold;
                text-align: center;
                font-size: 0.9rem;
            }
            
            .breakdown {
                font-size: 0.8rem;
                color: #a8a9b8;
                margin-top: 0.25rem;
            }
            
            .btn {
                padding: 0.75rem 1.5rem;
                background: linear-gradient(135deg, #367cff, #2563eb);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 16px rgba(54, 124, 255, 0.3);
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(54, 124, 255, 0.4);
            }
            
            .success { color: #22c55e; }
            .error { color: #ef4444; }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .card {
                animation: fadeIn 0.6s ease-out;
            }
        </style>

        <div class="container">
            <div class="header">
                <h1>🎯 DalyDough 2.0 - D-Size Scoring System</h1>
                <p style="margin-top: 0.5rem; opacity: 0.9;">AI-Powered Forex Trading Dashboard</p>
            </div>

            <div class="card">
                <h2 style="margin-bottom: 1rem; color: #22c55e;">✅ System Status</h2>
                <div class="status-grid">
                    <div class="status-item">
                        <strong>JavaScript Engine</strong><br>
                        <span class="success">✓ Active</span>
                    </div>
                    <div class="status-item">
                        <strong>D-Size Algorithm</strong><br>
                        <span class="success">✓ Operational</span>
                    </div>
                    <div class="status-item">
                        <strong>Mock Data</strong><br>
                        <span class="success">✓ Generated</span>
                    </div>
                    <div class="status-item">
                        <strong>Last Update</strong><br>
                        <span id="timestamp">${new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>

            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2>🎯 D-Size Market Analysis</h2>
                    <button class="btn" onclick="generateNewData()">🔄 Refresh Data</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 120px 80px 120px 100px; gap: 1rem; padding: 1rem; background: #282a3d; border-radius: 8px; margin-bottom: 1rem; font-weight: 600; color: #a8a9b8;">
                    <div>Currency Pair</div>
                    <div style="text-align: center;">D-Size Score</div>
                    <div style="text-align: center;">Grade</div>
                    <div style="text-align: center;">Components</div>
                    <div style="text-align: center;">Entry Status</div>
                </div>
                
                <div class="market-grid" id="market-data">
                    <!-- Market data will be inserted here -->
                </div>
                
                <div style="margin-top: 2rem; padding: 1rem; background: #282a3d; border-radius: 8px; border-left: 4px solid #367cff;">
                    <strong>📊 D-Size Scoring Methodology:</strong><br>
                    <span style="color: #a8a9b8;">COT Bias (0-2) + Trend Confirmation (0-3) + ADX Strength (0-1) + Support Retest (0-2) + Price Structure (0-1) + Spread Check (0-1) = Total Score (0-10)</span><br>
                    <span style="color: #22c55e; font-weight: 600;">Entry Threshold: ≥ 7.0 points required</span>
                </div>
            </div>
        </div>
    `;

    // Generate initial data
    generateMarketData();
    
    console.log("✅ DalyDough app initialized successfully!");
}

// D-Size scoring function
function generateMarketData() {
    console.log("📊 Generating D-Size market data...");
    
    const pairs = [
        'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 
        'NZD/USD', 'EUR/GBP', 'GBP/JPY', 'XAU/USD', 'USD/CHF'
    ];
    
    const marketData = pairs.map(pair => {
        // Generate realistic D-Size components
        const cotScore = Math.random() > 0.6 ? 2 : Math.random() > 0.3 ? 1 : 0;
        const trendScore = Math.floor(Math.random() * 4); // 0-3
        const adxScore = Math.random() > 0.5 ? 1 : 0;
        const supportScore = Math.random() > 0.5 ? 2 : Math.random() > 0.3 ? 1 : 0;
        const structureScore = Math.random() > 0.4 ? 1 : 0;
        const spreadScore = Math.random() > 0.6 ? 1 : 0;
        
        const totalScore = cotScore + trendScore + adxScore + supportScore + structureScore + spreadScore;
        const canEnter = totalScore >= 7;
        const grade = totalScore >= 8 ? 'A' : totalScore >= 6 ? 'B' : 'C';
        
        return {
            pair,
            score: totalScore,
            canEnter,
            grade,
            components: { cotScore, trendScore, adxScore, supportScore, structureScore, spreadScore }
        };
    });

    // Sort by score (highest first)
    marketData.sort((a, b) => b.score - a.score);

    const container = document.getElementById('market-data');
    if (!container) {
        console.error('❌ Market data container not found');
        return;
    }

    container.innerHTML = marketData.map(data => {
        const scoreColor = data.score >= 8 ? '#22c55e' : data.score >= 6 ? '#367cff' : '#6b7280';
        const gradeColor = data.grade === 'A' ? '#22c55e' : data.grade === 'B' ? '#367cff' : '#6b7280';
        const entryColor = data.canEnter ? '#22c55e' : '#ef4444';
        const bgColor = data.canEnter ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)';
        
        return `
            <div class="pair-row" style="background: ${bgColor}; border-left: 4px solid ${entryColor};">
                <div>
                    <div class="pair-name">${data.pair}</div>
                    <div class="breakdown">
                        COT:${data.components.cotScore} • Trend:${data.components.trendScore} • ADX:${data.components.adxScore} • Support:${data.components.supportScore} • Structure:${data.components.structureScore} • Spread:${data.components.spreadScore}
                    </div>
                </div>
                <div>
                    <div class="score-badge" style="background: ${scoreColor};">
                        ${data.score.toFixed(1)}/10
                    </div>
                </div>
                <div>
                    <div class="grade-badge" style="background: ${gradeColor};">
                        ${data.grade}
                    </div>
                </div>
                <div style="text-align: center; font-size: 0.9rem; color: #a8a9b8;">
                    Total: ${data.score}/10
                </div>
                <div class="entry-status" style="color: ${entryColor};">
                    ${data.canEnter ? '✓ ALLOW' : '✗ BLOCK'}
                </div>
            </div>
        `;
    }).join('');

    // Update timestamp
    const timestamp = document.getElementById('timestamp');
    if (timestamp) {
        timestamp.textContent = new Date().toLocaleTimeString();
    }

    console.log(`✅ Generated data for ${marketData.length} pairs`);
    console.log('📈 Top scores:', marketData.slice(0, 3).map(d => `${d.pair}: ${d.score}/10`));
}

// Make function globally available
window.generateNewData = generateMarketData;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

console.log("🎯 DalyDough JavaScript loaded successfully!");