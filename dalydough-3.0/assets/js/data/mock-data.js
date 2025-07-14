// Clean Mock Data Constants - assets/js/data/mock-data.js

// Keep only essential constants for application logic
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

// Keep these for structure but no mock events
const NEWS_EVENTS = [];

const COT_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

console.log('✅ Clean constants loaded');