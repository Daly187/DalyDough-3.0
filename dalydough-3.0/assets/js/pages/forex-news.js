function createForexNewsPage() {
    if (!appState.forexNews.length) {
        appState.forexNews = generateForexNews();
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

            <div class="news-filter-bar">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-weight: 600; color: var(--text-secondary);">Impact Level:</span>
                    <div class="impact-filter">
                        <span class="impact-badge impact-high active" data-impact="High">High</span>
                        <span class="impact-badge impact-medium active" data-impact="Medium">Medium</span>
                        <span class="impact-badge impact-low active" data-impact="Low">Low</span>
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-weight: 600; color: var(--text-secondary);">Currency:</span>
                    <select id="currency-filter" style="padding: 0.25rem 0.5rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary);">
                        <option value="All">All Currencies</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                        <option value="AUD">AUD</option>
                        <option value="CAD">CAD</option>
                    </select>
                </div>
            </div>

            <div style="padding: 1rem; background: var(--bg-main); border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid var(--warning-yellow);">
                <strong>🎯 Trading Impact Guide:</strong><br>
                <span style="color: var(--text-secondary); font-size: 0.875rem;">
                    <span style="color: var(--negative-red);">High Impact</span> - Major volatility expected, avoid trading 30min before/after<br>
                    <span style="color: var(--warning-yellow);">Medium Impact</span> - Moderate volatility, trade with caution<br>
                    <span style="color: var(--positive-green);">Low Impact</span> - Minimal market impact, safe to trade
                </span>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Currency</th>
                            <th>Event</th>
                            <th>Impact</th>
                            <th>Forecast</th>
                            <th>Actual</th>
                            <th>Previous</th>
                        </tr>
                    </thead>
                    <tbody id="news-table-body">
                        ${appState.forexNews.map(news => `
                            <tr class="news-item" data-impact="${news.impact}" data-currency="${news.currency}">
                                <td class="news-time">${news.time}</td>
                                <td class="news-currency">${news.currency}</td>
                                <td class="news-event">${news.event}</td>
                                <td><span class="impact-badge impact-${news.impact.toLowerCase()}">${news.impact}</span></td>
                                <td class="news-value">${news.forecast}</td>
                                <td class="news-value" style="font-weight: 600;">${news.actual}</td>
                                <td class="news-value">${news.previous}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
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
    
    document.querySelectorAll('.news-item').forEach(item => {
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

console.log('✅ Forex News page loaded');