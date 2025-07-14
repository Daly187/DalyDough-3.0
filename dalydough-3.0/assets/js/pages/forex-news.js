// Enhanced Forex News Page - Replace assets/js/pages/forex-news.js

function createForexNewsPage() {
    if (!appState.forexNews.length) {
        appState.forexNews = [];
    }
 // Add empty state in news table
    if (appState.forexNews.length === 0) {
        // Show "No news data available" message
    }
    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">📰 Forex News Calendar</h2>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="last-update">
                        Live Updates: ${new Date().toLocaleDateString()}
                    </div>
                    <button class="btn btn-secondary refresh-button" onclick="refreshForexNews()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 4v6h-6"></path>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            <!-- Enhanced Filter Bar -->
            <div class="news-filter-bar">
                <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">📊 Impact Level:</span>
                        <div class="impact-filter">
                            <span class="impact-badge impact-high active" data-impact="High">🔴 High</span>
                            <span class="impact-badge impact-medium active" data-impact="Medium">🟡 Medium</span>
                            <span class="impact-badge impact-low active" data-impact="Low">🟢 Low</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">🌍 Currency:</span>
                        <select id="currency-filter" style="padding: 0.5rem 0.75rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-weight: 500;">
                            <option value="All">All Currencies</option>
                            <option value="USD">🇺🇸 USD</option>
                            <option value="EUR">🇪🇺 EUR</option>
                            <option value="GBP">🇬🇧 GBP</option>
                            <option value="JPY">🇯🇵 JPY</option>
                            <option value="AUD">🇦🇺 AUD</option>
                            <option value="CAD">🇨🇦 CAD</option>
                        </select>
                    </div>
                    
                    <div style="margin-left: auto; display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 8px; height: 8px; background: var(--positive-green); border-radius: 50%; animation: pulse 2s infinite;"></div>
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">Live Feed Active</span>
                    </div>
                </div>
            </div>

            <!-- Trading Impact Guide -->
            <div style="padding: 1.25rem; background: linear-gradient(135deg, rgba(54, 124, 255, 0.1), rgba(54, 124, 255, 0.05)); border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid rgba(54, 124, 255, 0.2);">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                    <div style="background: var(--accent-blue); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">💡</div>
                    <strong style="color: var(--text-primary); font-size: 1.1rem;">Trading Impact Guide</strong>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; font-size: 0.9rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: var(--negative-red); font-weight: 700;">🔴 High Impact</span>
                        <span style="color: var(--text-secondary);">Major volatility expected - avoid trading 30min before/after</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: var(--warning-yellow); font-weight: 700;">🟡 Medium Impact</span>
                        <span style="color: var(--text-secondary);">Moderate volatility - trade with caution & tight stops</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: var(--positive-green); font-weight: 700;">🟢 Low Impact</span>
                        <span style="color: var(--text-secondary);">Minimal market impact - safe to trade normally</span>
                    </div>
                </div>
            </div>

            <!-- Enhanced News Table -->
            <div class="enhanced-news-container">
                <div class="news-table-header">
                    <div class="news-col news-time-col">⏰ Time</div>
                    <div class="news-col news-currency-col">🌍 Currency</div>
                    <div class="news-col news-event-col">📰 Event</div>
                    <div class="news-col news-impact-col">📊 Impact</div>
                    <div class="news-col news-forecast-col">🎯 Forecast</div>
                    <div class="news-col news-actual-col">⚡ Actual</div>
                    <div class="news-col news-previous-col">📈 Previous</div>
                </div>
                
                <div class="news-items-container" id="news-table-body">
                    ${appState.forexNews.map(news => `
                        <div class="enhanced-news-item" data-impact="${news.impact}" data-currency="${news.currency}">
                            <div class="news-col news-time-col">
                                <div class="news-time-display">
                                    <div class="time-main">${news.time}</div>
                                    <div class="time-zone">EST</div>
                                </div>
                            </div>
                            
                            <div class="news-col news-currency-col">
                                <div class="currency-display">
                                    <div class="currency-flag">${getCurrencyFlag(news.currency)}</div>
                                    <div class="currency-code">${news.currency}</div>
                                </div>
                            </div>
                            
                            <div class="news-col news-event-col">
                                <div class="event-title">${news.event}</div>
                                <div class="event-description">Monitor for ${news.currency} volatility</div>
                            </div>
                            
                            <div class="news-col news-impact-col">
                                <div class="impact-indicator impact-${news.impact.toLowerCase()}">
                                    <div class="impact-icon">${getImpactIcon(news.impact)}</div>
                                    <div class="impact-text">${news.impact}</div>
                                </div>
                            </div>
                            
                            <div class="news-col news-forecast-col">
                                <div class="data-value forecast-value">${news.forecast}</div>
                            </div>
                            
                            <div class="news-col news-actual-col">
                                <div class="data-value actual-value ${getActualClass(news.actual, news.forecast)}">${news.actual}</div>
                                <div class="variance-indicator">${getVarianceIndicator(news.actual, news.forecast)}</div>
                            </div>
                            
                            <div class="news-col news-previous-col">
                                <div class="data-value previous-value">${news.previous}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Helper functions for enhanced news display
function getCurrencyFlag(currency) {
    const flags = {
        'USD': '🇺🇸',
        'EUR': '🇪🇺', 
        'GBP': '🇬🇧',
        'JPY': '🇯🇵',
        'AUD': '🇦🇺',
        'CAD': '🇨🇦'
    };
    return flags[currency] || '🌍';
}

function getImpactIcon(impact) {
    const icons = {
        'High': '🔴',
        'Medium': '🟡',
        'Low': '🟢'
    };
    return icons[impact] || '⚪';
}

function getActualClass(actual, forecast) {
    const actualNum = parseFloat(actual);
    const forecastNum = parseFloat(forecast);
    
    if (actualNum > forecastNum) return 'actual-higher';
    if (actualNum < forecastNum) return 'actual-lower';
    return 'actual-equal';
}

function getVarianceIndicator(actual, forecast) {
    const actualNum = parseFloat(actual);
    const forecastNum = parseFloat(forecast);
    const variance = actualNum - forecastNum;
    
    if (Math.abs(variance) < 0.05) return '';
    
    if (variance > 0) return '<span class="variance-up">📈</span>';
    if (variance < 0) return '<span class="variance-down">📉</span>';
    return '';
}

function attachNewsEventListeners() {
    // Impact filter badges
    document.querySelectorAll('.impact-badge').forEach(badge => {
        badge.addEventListener('click', (e) => {
            e.target.classList.toggle('active');
            filterNews();
        });
    });

    // Currency filter
    const currencyFilter = document.getElementById('currency-filter');
    if (currencyFilter) {
        currencyFilter.addEventListener('change', filterNews);
    }
}

function filterNews() {
    const activeImpacts = Array.from(document.querySelectorAll('.impact-badge.active')).map(badge => badge.dataset.impact);
    const selectedCurrency = document.getElementById('currency-filter')?.value || 'All';
    
    document.querySelectorAll('.enhanced-news-item').forEach(item => {
        const impact = item.dataset.impact;
        const currency = item.dataset.currency;
        const showImpact = activeImpacts.includes(impact);
        const showCurrency = selectedCurrency === 'All' || currency === selectedCurrency;
        
        item.style.display = (showImpact && showCurrency) ? 'grid' : 'none';
    });
}

function refreshForexNews() {
    console.log('📰 Refreshing forex news...');
    appState.forexNews = generateForexNews();
    
    if (appState.activePage === 'Forex News') {
        switchPage('Forex News');
    }
}

// Make functions globally available
window.refreshForexNews = refreshForexNews;

console.log('✅ Enhanced Forex News page loaded with modern design');