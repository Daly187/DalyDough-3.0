// Mock Data Constants
const CURRENCY_PAIRS = [
    'AUD/CAD', 'AUD/CHF', 'AUD/JPY', 'AUD/NZD', 'AUD/USD',
    'CAD/JPY', 'CHF/JPY', 'EUR/CAD', 'EUR/CHF', 'EUR/GBP', 
    'EUR/JPY', 'EUR/NZD', 'EUR/TRY', 'EUR/USD', 'GBP/AUD',
    'GBP/CAD', 'GBP/CHF', 'GBP/JPY', 'GBP/USD', 'NZD/CAD',
    'NZD/CHF', 'NZD/JPY', 'NZD/USD', 'USD/CAD', 'USD/CHF',
    'USD/JPY', 'USD/TRY', 'USD/ZAR', 'XAU/USD'
];

const TREND_VALUES = ['Up', 'Down', 'Neutral'];

const BOT_TYPES = ['Dynamic DCA', 'Static Grid', 'AI Trend'];

const NEWS_EVENTS = [
    { event: 'Non-Farm Payrolls', currency: 'USD', impact: 'High' },
    { event: 'CPI Flash Estimate', currency: 'EUR', impact: 'High' },
    { event: 'BOE Interest Rate Decision', currency: 'GBP', impact: 'High' },
    { event: 'Unemployment Rate', currency: 'AUD', impact: 'Medium' },
    { event: 'Trade Balance', currency: 'CAD', impact: 'Medium' },
    { event: 'Manufacturing PMI', currency: 'JPY', impact: 'Low' },
    { event: 'Retail Sales', currency: 'USD', impact: 'Medium' },
    { event: 'GDP Growth Rate', currency: 'EUR', impact: 'High' }
];

const COT_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

console.log('✅ Mock data constants loaded');