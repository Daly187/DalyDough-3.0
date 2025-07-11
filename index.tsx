/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createClient, User, Session } from '@supabase/supabase-js';

// --- TYPESCRIPT TYPE DEFINITIONS ---

// Define a type for the icon names to ensure type safety when accessing the 'icons' object.
type IconName = keyof typeof icons;

// Define more specific types for your data structures instead of 'any'.
type Bot = {
    id: string;
    pair: string;
    type: string;
    pnl: number;
    status: 'active' | 'paused' | 'error';
    uptime: string;
    trades: number;
    slLimit: number;
    tpLimit: number;
    dcaMultiplier: string;
    stepMultiplier: string;
    reEntries: number;
    initialOrderSize: string;
    trailingProfit: boolean;
    trailingProfitPips: number;
    sleepHours: number;
    avoidNews: boolean;
    reentryOnSR: boolean;
    dAtStart: string;
    dAtCurrent: string;
    plannedReentries: { level: string; size: string; note: string; }[];
};
type Account = { id: string; name: string; user_email: string };
type MarketTrend = { pair: string; trendH4: string; trendD1: string; setupQuality: 'A' | 'B' | 'C'; conditions: { cot: boolean; adx: boolean; spread: boolean; }; dsize: string; breakdown: object; };
type AccountStat = { label: string; value: string | number };
type Kpi = { label: string; value: string; positive: boolean | null };
type AiRecommendation = { pair: string; reason: string; score: number; score_level: string };
type CotData = { currency: string; longPercent: number; shortPercent: number; netPositions: number; };

// --- ICONS (as SVG strings) ---
const icons = {
  logo: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5zM12 14.47l-8-4v3.06l8 4 8-4v-3.06l-8 4z"></path></svg>`,
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  bots: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path><path d="M12 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path></svg>`,
  trends: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6m13 14v-6h-6"></path><path d="M21.5 2l-8.2 8.2a2 2 0 0 0 0 2.8L16 15.7a2 2 0 0 1 0 2.8l-2.8 2.8a2 2 0 0 1-2.8 0L2.5 12.5a2 2 0 0 0-2.8 0L2 14.2"></path></svg>`,
  statistics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20V16"></path></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  trendUp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l8 8h-6v8h-4v-8H4l8-8z"></path></svg>`,
  trendDown: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l-8-8h6V4h4v8h6l-8 8z"></path></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  brain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.94.44c-.22-.67-.22-1.42 0-2.08.33-1 .67-2 .67-3 0-1-.33-2-.67-3-.22-.67-.22-1.42 0-2.08A2.5 2.5 0 0 1 9.5 2z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.94.44c.22-.67.22-1.42 0-2.08-.33-1-.67-2-.67-3 0-1 .33-2 .67-3 .22-.67-.22-1.42 0-2.08A2.5 2.5 0 0 0 14.5 2z"></path></svg>`,
  bolt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>`,
  resizeHorizontal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 8 21 12 17 16"></polyline><polyline points="7 8 3 12 7 16"></polyline><line x1="3" y1="12" x2="21" y2="12"></line></svg>`,
  google: `<svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.519-3.317-11.28-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 34.421 44 29.839 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>`,
};

// --- SUPABASE CLIENT ---
const supabaseUrl = "https://rptysuvzufliibffzqgk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdHlzdXZ6dWZsaWliZmZ6cWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mjc4MTQsImV4cCI6MjA2NzEwMzgxNH0.lcErDO98PWonscKSKRdZYCiTgmMk17iWo2LZbgla5-s";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- CONFIG & STATIC DATA ---
const tradingSymbols = [
  'AUDCAD', 'AUDCHF', 'AUDJPY', 'AUDNZD', 'AUDUSD', 'Brent', 'CADJPY', 'CHFJPY',
  'EURCAD', 'EURCHF', 'EURGBP', 'EURJPY', 'EURNZD', 'EURTRY', 'EURUSD', 'GBPAUD',
  'GBPCAD', 'GBPCHF', 'GBPJPY', 'GBPUSD', 'NZDCAD', 'NZDCHF', 'NZDJPY', 'NZDUSD',
  'USDCAD', 'USDCHF', 'USDJPY', 'USDTRY', 'USDZAR', 'XAUUSD'
];
let marketTrendsData: MarketTrend[] | null = null; // Cache for market data

// --- DATA FETCHING FUNCTIONS ---

async function fetchAccounts(): Promise<Account[]> {
    return [
        { id: 'acc_1', name: 'Primary Alpha', user_email: state.user?.email || '' },
        { id: 'acc_2', name: 'Growth', user_email: state.user?.email || '' },
        { id: 'acc_3', name: 'Test Algo', user_email: state.user?.email || '' },
    ];
}

async function fetchKpiData(accountId: string): Promise<Kpi[]> {
    const seed = accountId.charCodeAt(3);
    return [
      { label: 'P/L Summary', value: `+$${(1284.50 * seed / 2).toFixed(2)}`, positive: true },
      { label: 'Equity', value: `$${(11432.12 * seed / 2).toFixed(2)}`, positive: null },
      { label: 'Balance', value: `$${(10147.62 * seed / 2).toFixed(2)}`, positive: null },
      { label: 'Margin Use', value: `${(15.7 * seed / 2).toFixed(1)}%`, positive: false },
    ];
}

async function fetchBots(accountId: string): Promise<Bot[]> {
    return generateBots(30, accountId);
}


async function fetchMarketTrends(): Promise<MarketTrend[]> {
    if (marketTrendsData) return marketTrendsData;
    console.log("Fetching live market data...");
    try {
        const { data, error } = await supabase.functions.invoke('get-market-data');
        if (error) throw error;
        marketTrendsData = data;
        return data;
    } catch (err: any) {
        console.error("Failed to fetch market trends:", err.message);
        return [];
    }
}

async function fetchCotReport(): Promise<CotData[]> {
    console.log("Fetching COT report data...");
     try {
        const { data, error } = await supabase.functions.invoke('get-cot-report');
        if (error) throw error;
        return data;
    } catch (err: any) {
        console.error("Failed to fetch COT report:", err.message);
        return [];
    }
}

async function fetchAiRecommendations(): Promise<AiRecommendation[]> {
    const trends = await fetchMarketTrends();
    if (trends.length === 0) return [];
    
    console.log("Fetching AI recommendations...");
    const sortedTrends = [...trends].sort((a, b) => Number(b.dsize) - Number(a.dsize));

    try {
        const { data, error } = await supabase.functions.invoke('get-ai-recommendations', {
            body: { marketTrends: sortedTrends.slice(0, 10) }
        });
        if (error) throw error;
        return data.recommendations;
    } catch(err: any) {
        console.error("Failed to fetch AI recommendations:", err.message);
        return [];
    }
}


async function fetchAccountStats(accountId: string): Promise<AccountStat[]> {
    const seed = accountId.charCodeAt(4);
    return [
        { label: 'Win Rate', value: `${(72.4 * seed / 100).toFixed(1)}%` },
        { label: 'Profit Factor', value: (1.82 * seed / 100).toFixed(2) },
        { label: 'Max Drawdown', value: `${(8.1 * seed / 100).toFixed(1)}%` },
        { label: 'Total Trades', value: Math.floor(127 * seed / 100) },
        { label: 'Average P/L', value: `$${(25.50 * seed / 100).toFixed(2)}` },
        { label: 'Total Volume', value: `${(45.2 * seed / 100).toFixed(2)} lots` },
        { label: 'Sharpe Ratio', value: (0.78 * seed / 100).toFixed(2) },
        { label: 'Longest Streak', value: `${Math.floor(8 * seed / 100)} wins` },
    ];
}


// --- MOCK DATA GENERATORS (to be phased out) ---
const generateBots = (count: number, accountId: string): Bot[] => {
    const bots: Bot[] = [];
    const statuses: ('active' | 'paused' | 'error')[] = ['active', 'paused', 'error'];
    const types = ['Dynamic DCA', 'Static Grid', 'AI Trend'];
    const existingPairs = new Set();
    const seed = accountId.length;

    for (let i = 0; i < count; i++) {
        let symbol = tradingSymbols[Math.floor(Math.random() * tradingSymbols.length)];
        let formattedPair = symbol.replace(/([A-Z]{3})([A-Z]{3,})/, '$1/$2');
        if (formattedPair === symbol) formattedPair = symbol;
        
        if (!existingPairs.has(formattedPair)) {
            const pnl = (Math.random() - 0.4) * (150 * seed);
            const dAtStart = (Math.random() * 6 + 4);
            let dAtCurrent = (dAtStart + (Math.random() - 0.5) * 2);
            dAtCurrent = Math.max(0, Math.min(10, dAtCurrent));
            
            const botData: Bot = {
                id: `bot_${accountId}_${i}`,
                pair: formattedPair,
                type: types[Math.floor(Math.random() * types.length)],
                pnl: pnl,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                uptime: `${Math.floor(Math.random() * 30) + 1}d ${Math.floor(Math.random() * 24)}h`,
                trades: Math.floor(Math.random() * 100) + 5,
                slLimit: Math.floor(Math.random() * 500) + 50,
                tpLimit: Math.floor(Math.random() * 1000) + 100,
                dcaMultiplier: (Math.random() * 0.5 + 1.5).toFixed(1),
                stepMultiplier: (Math.random() * 0.5 + 1.8).toFixed(1),
                reEntries: Math.floor(Math.random() * 10) + 1,
                initialOrderSize: (Math.random() * 0.04 + 0.01).toFixed(2),
                trailingProfit: Math.random() > 0.5,
                trailingProfitPips: Math.random() > 0.5 ? Math.floor(Math.random() * 20) + 10 : 0,
                sleepHours: Math.floor(Math.random() * 8),
                avoidNews: Math.random() > 0.5,
                reentryOnSR: Math.random() > 0.5,
                dAtStart: dAtStart.toFixed(1),
                dAtCurrent: dAtCurrent.toFixed(1),
                plannedReentries: []
            };
            
            const reentries = [];
            let price = 1.25000;
            let step = 0.0050;
            let size = parseFloat(botData.initialOrderSize);
            for (let j = 0; j < botData.reEntries; j++) {
                price -= step;
                size *= parseFloat(botData.dcaMultiplier);
                step *= parseFloat(botData.stepMultiplier);
                reentries.push({ level: price.toFixed(5), size: size.toFixed(2), note: 'Scheduled' });
            }
            botData.plannedReentries = reentries;
            
            bots.push(botData);
            existingPairs.add(formattedPair);
        }
    }
    return bots;
};


// --- APP STATE ---
let state = {
    user: null as User | null,
    session: null as Session | null,
    activePage: 'Dashboard',
    activeAccountId: 'acc_1',
    accounts: [] as Account[],
};

// --- COMPONENT CREATORS ---

function createSidebar(): HTMLElement {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';

  const navItems: { icon: IconName; text: string }[] = [
    { icon: 'dashboard', text: 'Dashboard' },
    { icon: 'bots', text: 'DCA Bots' },
    { icon: 'trends', text: 'Meat Market' },
    { icon: 'statistics', text: 'Statistics' },
    { icon: 'settings', text: 'Settings' },
  ];
  const activeAccount = state.accounts.find(acc => acc.id === state.activeAccountId);

  sidebar.innerHTML = `
    <div class="sidebar-header">
        <div class="sidebar-logo">
          ${icons.logo}
          <span class="sidebar-logo-text">DalyDough</span>
        </div>
    </div>
    <nav class="sidebar-nav">
      <ul class="sidebar-nav-list">
        ${navItems.map(item => `
          <li class="sidebar-nav-item">
            <a href="#" data-page="${item.text}" class="${state.activePage === item.text ? 'active' : ''}" title="${item.text}">
              ${icons[item.icon]}
              <span class="sidebar-nav-text">${item.text}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>
    <div class="sidebar-footer">
        <div class="account-switcher">
             <div class="account-info">
                ${icons.user}
                <div class="account-details">
                    <span class="account-name">${activeAccount?.name || '...'}</span>
                    <span class="account-user">${activeAccount?.user_email || '...'}</span>
                </div>
            </div>
            <select id="account-select">
                ${state.accounts.map(acc => `<option value="${acc.id}" ${acc.id === state.activeAccountId ? 'selected' : ''}>${acc.name}</option>`).join('')}
            </select>
        </div>
        <button id="logout-btn" class="logout-btn" title="Logout">
            ${icons.logout}
            <span class="sidebar-nav-text">Logout</span>
        </button>
    </div>
  `;
  return sidebar;
}

function createHeader(kpiData: Kpi[]): HTMLElement {
  const header = document.createElement('header');
  header.className = 'header';
  const activeAccount = state.accounts.find(acc => acc.id === state.activeAccountId);

  header.innerHTML = `
    <div class="header-left">
      <div class="current-account-display">
          <span class="kpi-label">Account</span>
          <span class="account-name-header">${activeAccount?.name || 'Loading...'}</span>
      </div>
      <div class="kpi-widgets">
        ${kpiData.map(kpi => `
          <div class="kpi-widget">
            <span class="kpi-label">${kpi.label}</span>
            <span class="kpi-value ${kpi.positive === true ? 'positive' : kpi.positive === false ? 'negative' : ''}">${kpi.value}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="header-actions">
      <button class="btn btn-danger">Close All</button>
      <button class="btn btn-primary" id="launch-new-bot-btn">Launch New Bot</button>
    </div>
  `;
  return header;
}


// --- PAGE & PANEL CREATORS ---
function createCotReportCard(data: CotData[], isLoading = false): string {
    if (isLoading) {
        return `<div class="card cot-report-card"><div class="placeholder-content"><p class="text-secondary">Loading COT Report...</p></div></div>`;
    }
    if (!data || data.length === 0) {
        return `<div class="card cot-report-card"><div class="placeholder-content"><p class="text-secondary">Could not load COT data.</p></div></div>`;
    }
    
    const sortedData = [...data].sort((a, b) => b.longPercent - a.longPercent);

    return `
        <div class="card cot-report-card">
            <div class="card-header"><h2 class="card-title" title="Commitment of Traders report summary for major currencies.">COT Sentiment</h2></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr><th>Currency</th><th>Sentiment</th><th>Net Positions</th></tr>
                    </thead>
                    <tbody>
                        ${sortedData.map(d => `
                            <tr>
                                <td><strong>${d.currency}</strong></td>
                                <td>
                                    <span class="sentiment-value trend-up">${d.longPercent.toFixed(1)}%</span>
                                    <div class="cot-sentiment-bar" title="Long: ${d.longPercent.toFixed(1)}% | Short: ${d.shortPercent.toFixed(1)}%">
                                        <div class="cot-long-bar" style="width: ${d.longPercent}%"></div>
                                        <div class="cot-short-bar" style="width: ${d.shortPercent}%"></div>
                                    </div>
                                    <span class="sentiment-value trend-down">${d.shortPercent.toFixed(1)}%</span>
                                </td>
                                <td class="${d.netPositions >= 0 ? 'trend-up' : 'trend-down'}">${d.netPositions.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function createGlobalRiskManagerHTML(bots: Bot[], idSuffix: string): string {
    const activeBots = bots.filter(b => b.status === 'active');
    const totalPnl = activeBots.reduce((sum, bot) => sum + bot.pnl, 0);
    const stopLossThreshold = -500;
    const isBreached = totalPnl <= stopLossThreshold;

    return `
        <div class="global-risk-manager ${isBreached ? 'breached' : ''}" data-stop-loss="${stopLossThreshold}">
            <div class="risk-manager-header">
                <h3 class="card-title" title="Monitors the total profit/loss of all active bots against a global stop-loss threshold.">Global Risk Monitor</h3>
                <div class="risk-manager-pnl">
                    <span>Total Active P/L:</span>
                    <span class="pnl-value ${totalPnl >= 0 ? 'positive' : 'negative'}">${totalPnl.toFixed(2)} USD</span>
                </div>
            </div>
            <div class="risk-manager-controls">
                <div class="form-group">
                    <label for="global-sl-input-${idSuffix}">Global Stop Loss ($)</label>
                    <input type="number" id="global-sl-input-${idSuffix}" class="global-sl-input" value="${stopLossThreshold}">
                </div>
                <button class="btn btn-danger close-all-bots-btn">Close All Positions</button>
            </div>
        </div>
    `;
}

function createBotConfigControlsHTML(isQuickLauncher = false): string {
    const pairSelectId = isQuickLauncher ? 'id="quick-launcher-pair-select"' : '';
    return `
        <div class="form-group">
            <label for="pair-select">Pair</label>
            <select name="pair" ${pairSelectId}>
                 ${tradingSymbols.slice(0, 20).map(s => `<option value="${s.replace(/([A-Z]{3})([A-Z]{3,})/, '$1/$2')}">${s.replace(/([A-Z]{3})([A-Z]{3,})/, '$1/$2')}</option>`).join('')}
            </select>
        </div>
        <div class="form-grid">
            <div class="form-group"><label for="dca-multiplier">DCA Multiplier</label><input type="number" id="dca-multiplier" value="1.6" step="0.1"></div>
            <div class="form-group"><label for="step-multiplier">Step Multiplier</label><input type="number" id="step-multiplier" value="2.0" step="0.1"></div>
            <div class="form-group"><label for="re-entries">Re-entries</label><input type="number" id="re-entries" value="5"></div>
            <div class="form-group"><label for="order-size">Initial Order Size</label><input type="number" id="order-size" value="0.01" step="0.01"></div>
            <div class="form-group"><label for="sl-limit">SL Limit ($)</label><input type="number" id="sl-limit" value="500"></div>
            <div class="form-group"><label for="tp-limit">TP Limit ($)</label><input type="number" id="tp-limit" value="1000"></div>
            <div class="form-group"><label for="sleep-hours">Sleep Hours After Trade</label><input type="number" id="sleep-hours" value="6" min="0"></div>
        </div>
        <div class="form-toggles">
             <div class="form-toggle-item"><div class="setting-label"><span>Trailing Profit</span><span class="setting-description">Enables a trailing stop loss by pips.</span></div><div class="setting-control-group"><label class="toggle-switch"><input type="checkbox" class="trailing-profit-toggle" checked><span class="toggle-slider"></span></label><input type="number" class="trailing-profit-pips" value="20" min="1" placeholder="pips"></div></div>
            <div class="form-toggle-item"><div class="setting-label"><span>Re-entry after next S/R</span><span class="setting-description">Waits for S/R flip to re-enter.</span></div><label class="toggle-switch"><input type="checkbox"><span class="toggle-slider"></span></label></div>
            <div class="form-toggle-item"><div class="setting-label"><span>Avoid High-Impact News</span><span class="setting-description">Pauses entries 30min around news.</span></div><label class="toggle-switch"><input type="checkbox" checked><span class="toggle-slider"></span></label></div>
        </div>
    `;
}

function createMarketTrendsTable(data: MarketTrend[], isLoading = false): string {
    if (isLoading) {
        return `<div class="placeholder-content"><p class="text-secondary">Loading Market Data...</p></div>`;
    }
    if (!data || data.length === 0) {
        return `<div class="placeholder-content"><p class="text-secondary">Could not load market data.</p></div>`;
    }
    return `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Pair</th><th>Trend (H4/D1)</th><th>Setup Quality</th><th>Conditions</th><th>D size</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(d => `
                        <tr class="is-expandable" data-pair='${JSON.stringify(d)}'>
                            <td>${d.pair}</td>
                            <td class="trend-cell"><span class="trend-text trend-${d.trendH4.toLowerCase()}">${d.trendH4}</span><span class="trend-text-secondary"> / ${d.trendD1}</span></td>
                            <td><span class="setup-quality-pill quality-${d.setupQuality}">${d.setupQuality}</span></td>
                            <td class="conditions-cell">
                                <span class="condition-icon ${d.conditions.cot ? 'active' : ''}" title="COT Bias">${icons.brain}</span>
                                <span class="condition-icon ${d.conditions.adx ? 'active' : ''}" title="ADX Strength">${icons.bolt}</span>
                                <span class="condition-icon ${d.conditions.spread ? 'active' : ''}" title="Spread/Volatility">${icons.resizeHorizontal}</span>
                            </td>
                            <td><span class="recommendation-score score-${Number(d.dsize) > 8 ? 'high' : Number(d.dsize) > 6 ? 'medium' : 'low'}">${d.dsize}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function createDashboardMainContent(): Promise<HTMLElement> {
    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';
    mainContent.innerHTML = `<div class="placeholder-content"><h2>Loading Dashboard...</h2></div>`;

    const [trends, bots, cotReport] = await Promise.all([
        fetchMarketTrends(),
        fetchBots(state.activeAccountId),
        fetchCotReport(),
    ]);
    
    const topTrends = [...trends]
        .sort((a, b) => Number(b.dsize) - Number(a.dsize))
        .slice(0, 6);
    const activeBots = bots.filter(b => b.status === 'active');

    mainContent.innerHTML = `
        ${createCotReportCard(cotReport)}
        <div class="card">
            <div class="card-header"><h2 class="card-title" title="An overview of top currency pairs based on our D-sizing score.">Meat Market</h2></div>
            ${createMarketTrendsTable(topTrends)}
        </div>
        <div class="card">
            <div class="card-header"><h2 class="card-title" title="A summary of your currently active trading bots and their performance.">D's Riding hard</h2></div>
            ${createGlobalRiskManagerHTML(activeBots, 'dashboard')}
            <div class="table-container">
                <table class="active-bots-table">
                    <thead><tr><th>Pair</th><th>Type</th><th>P/L ($)</th><th>Status</th><th>D Start</th><th>D Current</th><th>SL ($)</th><th>TP ($)</th><th>Trail Pips</th><th>Mode</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${activeBots.slice(0, 6).map(bot => `
                            <tr class="is-expandable" data-bot-id="${bot.id}">
                                <td>${bot.pair}</td><td>${bot.type}</td><td class="${bot.pnl >= 0 ? 'trend-up' : 'trend-down'}">${bot.pnl.toFixed(2)}</td>
                                <td><span class="status-indicator status-${bot.status}"></span>${bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}</td>
                                <td><span class="recommendation-score score-${Number(bot.dAtStart) > 8 ? 'high' : Number(bot.dAtStart) > 6 ? 'medium' : 'low'}">${bot.dAtStart}</span></td>
                                <td><span class="recommendation-score score-${Number(bot.dAtCurrent) > 8 ? 'high' : Number(bot.dAtCurrent) > 6 ? 'medium' : 'low'}">${bot.dAtCurrent}</span></td>
                                <td><input type="number" class="table-input" value="${bot.slLimit}"></td><td><input type="number" class="table-input" value="${bot.tpLimit}"></td>
                                <td><input type="number" class="table-input" value="${bot.trailingProfitPips}" min="0" style="width: 60px;"></td>
                                <td><div class="mode-toggle"><label class="toggle-switch"><input type="checkbox" class="mode-toggle-input" ${bot.status === 'active' ? 'checked' : ''}><span class="toggle-slider"></span></label><span>${bot.status === 'active' ? 'Active' : 'Close at TP'}</span></div></td>
                                <td><button class="btn btn-danger btn-sm close-now-btn">Close Now</button></td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
    mainContent.dataset.pageData = JSON.stringify({ activeBots: bots });
    return mainContent;
}

function createQuickBotLauncherPanel(): string {
    return `
        <div class="card">
            <div class="card-header"><h3 class="card-title" title="Quickly configure and launch a new trading bot based on a minimum D-size score.">Prepare that D!</h3></div>
            <form class="quick-launcher-form">
                ${createBotConfigControlsHTML(true)}
                <div class="form-group score-threshold-group">
                    <label for="score-threshold-slider">Min. Score Threshold: <span id="score-threshold-value">7.0</span></label>
                    <input type="range" id="score-threshold-slider" min="0" max="10" value="7" step="0.1">
                </div>
                <button class="btn btn-primary btn-full-width" id="quick-launch-btn">Launch</button>
            </form>
        </div>
    `;
}

async function createDashboardRightPanel(): Promise<HTMLElement> {
    const rightPanel = document.createElement('aside');
    rightPanel.className = 'right-panel';

    const [accountStats, aiRecommendations] = await Promise.all([
        fetchAccountStats(state.activeAccountId),
        fetchAiRecommendations()
    ]);
    
    rightPanel.innerHTML = `
        ${createQuickBotLauncherPanel()}
        <div class="card">
            <div class="card-header"><h3 class="card-title" title="Top trading opportunities identified by our AI for today.">AI Daily Recommendations</h3></div>
            ${aiRecommendations.length > 0 ? aiRecommendations.map(rec => `
                <div class="recommendation-item">
                    <div>
                        <div class="recommendation-pair">${rec.pair}</div>
                        <div class="recommendation-reason">${rec.reason}</div>
                    </div>
                    <span class="recommendation-score score-${rec.score_level}">${rec.score.toFixed(1)}</span>
                </div>
            `).join('') : `<div class="placeholder-content"><p class="text-secondary">No recommendations available.</p></div>`}
        </div>
        <div class="card">
            <div class="card-header"><h3 class="card-title" title="A snapshot of your account's key performance indicators.">Account Statistics</h3></div>
                ${accountStats.slice(0, 4).map(stat => `
                <div class="stat-item"><span class="stat-label">${stat.label}</span><span class="stat-value">${stat.value}</span></div>`).join('')}
        </div>
        <div class="card">
            <div class="card-header"><h3 class="card-title" title="Your account's current daily drawdown status against your set limit.">Risk Management</h3></div>
            <div class="stat-item"><span class="stat-label">Max Daily Drawdown</span><span class="stat-value">-3.4%</span></div>
            <div class="risk-bar-container"><div class="risk-bar" style="width: 34%;"></div></div>
            <div class="risk-label">Limit: -10%</div>
        </div>
    `;
    return rightPanel;
}

async function createDcaBotsPage(): Promise<HTMLElement> {
    const page = document.createElement('div');
    page.className = 'main-content-full';
    page.innerHTML = `<div class="card"><div class="placeholder-content"><h2>Loading Bots...</h2></div></div>`;
    
    const allBots = await fetchBots(state.activeAccountId);

    page.innerHTML = `
      <div class="card">
        <div class="card-header">
            <h2 class="card-title" title="View, manage, and search all your active and paused DCA bots.">DCA Bot Management</h2>
            <div class="search-bar">${icons.search}<input type="text" placeholder="Search bots by pair..."></div>
        </div>
        ${createGlobalRiskManagerHTML(allBots, 'dcabots')}
        <div class="table-container">
            <table>
                <thead><tr><th>Pair</th><th>Type</th><th>P/L ($)</th><th>Status</th><th>SL Limit ($)</th><th>TP Limit ($)</th><th>Uptime</th><th>Trades</th><th>Actions</th></tr></thead>
                <tbody>
                    ${allBots.map(bot => `
                        <tr>
                            <td>${bot.pair}</td><td>${bot.type}</td><td class="${bot.pnl >= 0 ? 'trend-up' : 'trend-down'}">${bot.pnl.toFixed(2)}</td>
                            <td><span class="status-indicator status-${bot.status}"></span>${bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}</td>
                            <td><input type="number" class="table-input" value="${bot.slLimit}"></td><td><input type="number" class="table-input" value="${bot.tpLimit}"></td>
                            <td>${bot.uptime}</td><td>${bot.trades}</td>
                            <td><button class="btn btn-secondary btn-sm">Edit</button><button class="btn btn-danger btn-sm">Stop</button></td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </div>
      </div>`;
    return page;
}

async function createMarketTrendsPage(): Promise<HTMLElement> {
    const page = document.createElement('div');
    page.className = 'main-content-full';
    page.innerHTML = `<div class="card">${createMarketTrendsTable([], true)}</div>`;

    const trends = await fetchMarketTrends();
    const sortedTrends = [...trends].sort((a, b) => Number(b.dsize) - Number(a.dsize));

    page.innerHTML = `
       <div class="card">
        <div class="card-header"><h2 class="card-title" title="A comprehensive list of all currency pairs, sorted by our proprietary D-sizing score.">Meat Market Analysis</h2></div>
        ${createMarketTrendsTable(sortedTrends)}
      </div>`;
    return page;
}

async function createStatisticsPage(): Promise<HTMLElement> {
    const page = document.createElement('div');
    page.className = 'main-content-full';
    const stats = await fetchAccountStats(state.activeAccountId);
    page.innerHTML = `
        <div class="card"><h2 class="card-title" title="In-depth performance metrics for the selected account.">Performance Statistics</h2></div>
        <div class="statistics-grid">
            ${stats.map(stat => `<div class="card stat-card"><span class="stat-label">${stat.label}</span><span class="stat-value">${stat.value}</span></div>`).join('')}
        </div>
        <div class="card">
            <h3 class="card-title" title="A historical chart of your profit and loss over time.">P/L History</h3>
            <div class="placeholder-content"><p class="text-secondary">Chart will be implemented here.</p></div>
        </div>`;
    return page;
}

async function createSettingsPage(): Promise<HTMLElement> {
    const page = document.createElement('div');
    page.className = 'main-content-full';
    page.innerHTML = `
        <div class="card">
            <h2 class="card-title" title="Configure application settings, API keys, and notification preferences.">Settings</h2>
            <div class="settings-section">
                <h3 class="settings-title" title="Securely connect to your trading terminal's API.">API Integration</h3>
                <p class="text-secondary">Connect to your MT5 terminal.</p>
                <div class="form-group"><label for="api-key">API Key</label><input type="password" id="api-key" value="••••••••••••••••••••"></div>
                <div class="form-group"><label for="api-secret">API Secret</label><input type="password" id="api-secret" value="••••••••••••••••••••••••••••••••"></div>
                <button class="btn btn-primary">Save Credentials</button>
            </div>
            <div class="settings-section">
                <h3 class="settings-title" title="Customize how you receive alerts and updates from the platform.">Notifications</h3>
                <p class="text-secondary">Choose which alerts you want to receive.</p>
                <div class="notification-setting"><span>Email Notifications</span><label class="toggle-switch"><input type="checkbox" checked><span class="toggle-slider"></span></label></div>
                <div class="notification-setting"><span>Desktop Push Notifications</span><label class="toggle-switch"><input type="checkbox"><span class="toggle-slider"></span></label></div>
                <div class="notification-setting"><span>Telegram Alerts</span><label class="toggle-switch"><input type="checkbox" checked><span class="toggle-slider"></span></label></div>
            </div>
            <div class="settings-section"><h3 class="settings-title" title="Change the application's appearance.">Theme</h3><div class="form-group"><label for="theme-select">Appearance</label><select id="theme-select" name="theme"><option>Dark (Default)</option><option>Light (Coming Soon)</option></select></div></div>
        </div>`;
    return page;
}

function createBotCreationModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.id = 'bot-creation-modal';
    modal.className = 'modal-backdrop hidden';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header"><h2 class="card-title" title="Manually configure and launch a new DCA trading bot.">Launch New Bot</h2><button id="modal-close-btn" class="modal-close" aria-label="Close">&times;</button></div>
            <div class="modal-body">${createBotConfigControlsHTML()}</div>
            <div class="modal-footer"><button id="modal-cancel-btn" class="btn btn-secondary">Cancel</button><button id="modal-launch-btn" class="btn btn-primary">Launch Bot</button></div>
        </div>`;
    return modal;
}

// --- MAIN APP RENDERER ---
async function App() {
    const root = document.getElementById('root');
    if (!root) { console.error('Root element not found'); return; }

    // Create a mock session object since we are removing login.
    state.session = {
      access_token: "dev-token",
      token_type: "bearer",
      user: {
        id: "dev_user_123",
        email: "dev@daly.com",
        role: "authenticated",
        aud: "authenticated",
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
      },
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: "dev-refresh-token",
    } as Session;

    state.user = state.session.user;

    // Fetch accounts now that we have a mock user
    state.accounts = await fetchAccounts();
    state.activeAccountId = state.accounts[0]?.id || 'acc_1';

    const render = async () => {
        root.innerHTML = '<div class="placeholder-content"><h2>Loading App...</h2></div>';

        const appContainer = document.createElement('div');
        appContainer.className = 'app-container sidebar-expanded';

        const sidebar = createSidebar();
        const kpiData = await fetchKpiData(state.activeAccountId);
        const header = createHeader(kpiData);
        const mainPanel = document.createElement('div');
        mainPanel.className = 'main-panel';
        mainPanel.innerHTML = `<div class="placeholder-content"><h2>Loading ${state.activePage}...</h2></div>`;
        const botModal = createBotCreationModal();

        appContainer.append(sidebar, header, mainPanel);
        root.innerHTML = '';
        root.append(appContainer, botModal);

        // ASYNC PAGE LOADING
        let pageContentPromise: Promise<HTMLElement>;
        switch (state.activePage) {
            case 'Dashboard':
                // Dashboard has a special two-panel layout that we handle separately.
                const dashboardContainer = document.createElement('div');
                dashboardContainer.style.display = 'contents';
                mainPanel.innerHTML = '';
                mainPanel.appendChild(dashboardContainer);
                Promise.all([createDashboardMainContent(), createDashboardRightPanel()])
                    .then(([mainContent, rightPanel]) => {
                        mainPanel.style.gridTemplateColumns = '1fr 350px';
                        dashboardContainer.append(mainContent, rightPanel);
                        attachPageListeners(mainPanel);
                    }).catch((err: any) => {
                        console.error("Error rendering dashboard", err);
                        mainPanel.innerHTML = `<div class="placeholder-content error"><h2>Could not load dashboard.</h2></div>`;
                    });
                return; // Early return for this special case
            case 'DCA Bots': pageContentPromise = createDcaBotsPage(); break;
            case 'Meat Market': pageContentPromise = createMarketTrendsPage(); break;
            case 'Statistics': pageContentPromise = createStatisticsPage(); break;
            case 'Settings': pageContentPromise = createSettingsPage(); break;
            default:
                const content = document.createElement('div');
                content.className = 'placeholder-content';
                content.innerHTML = `<h2>Page not found: ${state.activePage}</h2>`;
                pageContentPromise = Promise.resolve(content);
        }

        pageContentPromise.then(content => {
            mainPanel.innerHTML = '';
            mainPanel.style.gridTemplateColumns = '1fr';
            mainPanel.appendChild(content);
            attachPageListeners(mainPanel);
        }).catch((err: any) => {
            console.error("Error rendering page", err);
            mainPanel.innerHTML = `<div class="placeholder-content error"><h2>Could not load page: ${state.activePage}</h2></div>`;
        });
        
        attachGlobalListeners(root, render);
    };

    render();
}


function attachGlobalListeners(root: HTMLElement, render: () => void) {
    const launchBotBtn = root.querySelector('#launch-new-bot-btn');
    const closeModalBtn = root.querySelector('#modal-close-btn');
    const cancelModalBtn = root.querySelector('#modal-cancel-btn');
    const botModal = root.querySelector('#bot-creation-modal');

    const showModal = () => botModal?.classList.remove('hidden');
    const hideModal = () => botModal?.classList.add('hidden');

    launchBotBtn?.addEventListener('click', showModal);
    closeModalBtn?.addEventListener('click', hideModal);
    cancelModalBtn?.addEventListener('click', hideModal);
    botModal?.addEventListener('click', (event) => {
        if (event.target === botModal) hideModal();
    });

    const navLinks = root.querySelectorAll('.sidebar-nav-item a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = (e.currentTarget as HTMLElement).dataset.page;
            if (page && page !== state.activePage) {
                state.activePage = page;
                render(); 
            }
        });
    });

    const logoutBtn = root.querySelector('#logout-btn');
    logoutBtn?.addEventListener('click', () => {
        console.log("Logout clicked. No session to clear.");
        render();
    });

    const accountSelect = root.querySelector('#account-select') as HTMLSelectElement;
    accountSelect?.addEventListener('change', () => {
        state.activeAccountId = accountSelect.value;
        render();
    });
}

function attachPageListeners(mainPanel: HTMLElement) {
    if (state.activePage === 'Dashboard') {
        const pageDataStr = (mainPanel.querySelector('.main-content') as HTMLElement)?.dataset.pageData;
        const pageData = pageDataStr ? JSON.parse(pageDataStr) : {};
        const allBots: Bot[] = pageData.allBots || [];
        
        const pairSelect = mainPanel.querySelector('#quick-launcher-pair-select') as HTMLSelectElement;
        const scoreSlider = mainPanel.querySelector('#score-threshold-slider') as HTMLInputElement;
        const scoreValueSpan = mainPanel.querySelector('#score-threshold-value');
        const launchBtn = mainPanel.querySelector('#quick-launch-btn') as HTMLButtonElement;
       
        const updateLauncherState = () => {
            if (!pairSelect || !scoreSlider || !scoreValueSpan || !launchBtn || !marketTrendsData) return;
            const selectedPair = pairSelect.value;
            const threshold = parseFloat(scoreSlider.value);
            const trendData = marketTrendsData.find(t => t.pair === selectedPair);
            const currentScore = trendData ? parseFloat(trendData.dsize) : 0;
            if(scoreValueSpan) scoreValueSpan.textContent = threshold.toFixed(1);
            launchBtn.disabled = currentScore < threshold;
        };

        pairSelect?.addEventListener('change', updateLauncherState);
        scoreSlider?.addEventListener('input', updateLauncherState);

        // Fetch market data if not already cached, then update launcher state
        if (marketTrendsData) {
            updateLauncherState();
        } else {
            fetchMarketTrends().then(updateLauncherState);
        }

        const botTableBody = mainPanel.querySelector('.active-bots-table tbody');
        if (botTableBody) {
            botTableBody.addEventListener('click', (event) => {
                const target = event.target as HTMLElement;
                const row = target.closest('tr.is-expandable');

                if (target.classList.contains('close-now-btn')) {
                     const rowToClose = target.closest('tr');
                     if (rowToClose) rowToClose.style.opacity = '0.5';
                    return; // Prevent row expansion
                }

                if (row) {
                    if (target.closest('button, input, a, .toggle-switch')) return; // Ignore clicks on interactive elements
                    
                    const botId = (row as HTMLElement).dataset.botId;
                    const botData = allBots.find((b: Bot) => b.id === botId);
                    console.log("Expanding row for bot:", botData); // Use the variable to silence the error
                }
            });
        }
    }

    const trendRows = mainPanel.querySelectorAll('.is-expandable[data-pair]');
    trendRows.forEach(row => {
        row.addEventListener('click', (e) => {
             if ((e.target as HTMLElement).closest('button, input, a')) return;
            const trendData = JSON.parse((row as HTMLElement).dataset.pair!);
            console.log("Expanding row for trend:", trendData); // Use the variable
        });
    });
}

// --- INITIALIZE APP ---
App();