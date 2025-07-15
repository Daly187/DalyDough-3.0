// Updated main.js with enhanced real data integration

// Import the Supabase client creation function
import { createClient } from '@supabase/supabase-js';

// === Step 1: Initialize Supabase Client ===
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Fatal Error: Supabase credentials not found. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env.local file.");
  console.log("📋 Create a .env.local file in your project root with your Supabase credentials");
} else {
  // Create and make the Supabase client globally available
  window.supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized.');
  
  // Update status indicator
  updateSupabaseStatus('connected', 'Connected to Supabase');
}

// === Step 2: Status Management ===
function updateSupabaseStatus(status, message) {
  const indicator = document.getElementById('supabase-status-indicator');
  if (indicator) {
    const statusText = indicator.querySelector('.status-text');
    const statusLight = indicator.querySelector('.status-light');
    
    // Remove all status classes
    indicator.className = 'status-indicator';
    
    // Add new status
    indicator.classList.add(`status-${status}`);
    
    if (statusText) statusText.textContent = message;
    
    console.log(`📊 Supabase Status: ${status} - ${message}`);
  }
}

// === Step 3: Import Core Application Scripts ===
import './assets/js/core/state.js';
import './assets/js/core/utils.js';
import './assets/js/data/mock-data.js';

// === Step 4: Initialize Real Data API Service ===
console.log('🚀 Loading Real Data API Service...');

// Load the enhanced real data service
const loadRealDataService = async () => {
  try {
    // Check for API keys
    const hasApiKeys = import.meta.env.VITE_FMP_API_KEY || 
                      import.meta.env.VITE_ALPHAVANTAGE_API_KEY || 
                      import.meta.env.VITE_EXCHANGERATE_API_KEY ||
                      import.meta.env.VITE_POLYGON_API_KEY;

    if (!hasApiKeys) {
      console.warn('⚠️ No real data API keys found in environment variables');
      console.log('📝 Add API keys to .env.local file for real data');
      console.log('   VITE_FMP_API_KEY=your_key_here');
      console.log('   VITE_ALPHAVANTAGE_API_KEY=your_key_here');
      console.log('   etc...');
    }

    // Load the enhanced real data service
    await import('./assets/js/services/real-data-api.js');
    
    if (window.realDataAPI) {
      console.log('✅ Real Data API Service loaded successfully');
      
      // Test the connection
      try {
        const healthCheck = await window.realDataAPI.healthCheck();
        console.log('🏥 API Health Check:', healthCheck);
        
        if (healthCheck.healthyProviders > 0) {
          console.log(`✅ ${healthCheck.healthyProviders} data provider(s) available`);
        } else {
          console.warn('⚠️ No healthy data providers found - check your API keys');
        }
      } catch (error) {
        console.warn('⚠️ API health check failed:', error);
      }
    }
  } catch (error) {
    console.error('❌ Failed to load Real Data API Service:', error);
  }
};

// Load real data service
loadRealDataService();

// === Step 5: Import and Initialize Supabase API Service ===
import { SupabaseApiService } from './assets/js/services/supabase-api.js';
if (window.supabase) {
    window.supabaseApi = new SupabaseApiService(window.supabase);
    console.log('✅ Supabase API Service created.');
    
    // Test the connection after a brief delay
    setTimeout(async () => {
      try {
        const health = await window.supabaseApi.getSystemHealth();
        console.log('🏥 System Health Check:', health);
        
        // Update status based on health
        if (health.overall === 'healthy') {
          updateSupabaseStatus('connected', 'All Systems Online');
        } else {
          updateSupabaseStatus('error', 'Some Services Degraded');
        }
      } catch (error) {
        console.error('Health check failed:', error);
        updateSupabaseStatus('error', 'Connection Issues');
      }
    }, 2000);
} else {
    console.error('❌ Cannot create Supabase API Service - client not initialized');
    updateSupabaseStatus('error', 'Configuration Error');
}

// === Step 6: Import Remaining Application Modules ===
import './assets/js/data/generators.js';
import './assets/js/shared/market-components.js';
import './assets/js/shared/bot-management.js';
import './assets/js/shared/risk-manager.js';
import './assets/js/pages/dashboard.js';
import './assets/js/pages/meat-market.js';
import './assets/js/pages/auto-bot.js';
import './assets/js/pages/active-bots.js';
import './assets/js/pages/cot-report.js';
import './assets/js/pages/forex-news.js';
import './assets/js/pages/settings.js';
import './assets/js/pages/accounts.js';
import './assets/js/core/event-listeners.js';
import './assets/js/core/navigation.js';

// === Step 7: Enhanced App Initialization ===
const initializeApp = async () => {
  console.log('🚀 Initializing DalyDough 3.0 with Real Data Integration...');
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }
  
  // Initialize core app
  try {
    // Import and run the main app logic
    await import('./assets/js/core/app.js');
    console.log('✅ DalyDough 3.0 initialized successfully');
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    updateSupabaseStatus('error', 'App Init Failed');
  }
};

// === Step 8: Global Error Handling ===
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', event.error);
  
  // Update status if it's a critical error
  if (event.error.message.includes('Supabase') || event.error.message.includes('API')) {
    updateSupabaseStatus('error', 'Service Error');
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
  
  // Update status if it's a critical error
  if (event.reason && (event.reason.message?.includes('Supabase') || event.reason.message?.includes('API'))) {
    updateSupabaseStatus('error', 'Service Error');
  }
});

// === Step 9: Debugging Helpers ===
window.debugDalyDough = {
  async testRealData() {
    if (window.realDataAPI) {
      try {
        const data = await window.realDataAPI.getRealForexData();
        console.log('🧪 Real Data Test:', data);
        return data;
      } catch (error) {
        console.error('Real data test failed:', error);
        return null;
      }
    } else {
      console.warn('Real Data API not available');
      return null;
    }
  },
  
  async testSupabase() {
    if (window.supabaseApi) {
      try {
        const result = await window.supabaseApi.testConnection();
        console.log('🧪 Supabase Test:', result);
        return result;
      } catch (error) {
        console.error('Supabase test failed:', error);
        return null;
      }
    } else {
      console.warn('Supabase API not available');
      return null;
    }
  },
  
  async fullHealthCheck() {
    console.log('🏥 Running full system health check...');
    
    const health = {
      realData: await this.testRealData(),
      supabase: await this.testSupabase(),
      timestamp: new Date().toISOString()
    };
    
    console.log('🏥 Full Health Check Results:', health);
    return health;
  }
};

// Start the app
initializeApp();

console.log('🎯 DalyDough 3.0 main.js loaded with enhanced real data integration!');