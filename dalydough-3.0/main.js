// dalydough-3.0/main.js

// Import the Supabase client creation function
import { createClient } from '@supabase/supabase-js';

// === Step 1: Initialize Supabase Client ===
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Fatal Error: Supabase credentials not found. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env.local file.");
} else {
  // Create and make the Supabase client globally available
  window.supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized.');
}

// === Step 2: Import all your application scripts ===
// This ensures they are bundled by Vite and executed in the correct order.
// We are importing them for their side effects (they add functions and state to the global scope).
import './assets/js/core/state.js';
import './assets/js/core/utils.js';
import './assets/js/data/mock-data.js';

// Import the service class and instantiate it
import { SupabaseApiService } from './assets/js/services/supabase-api.js';
if (window.supabase) {
    window.supabaseApi = new SupabaseApiService(window.supabase);
    console.log('✅ Supabase API Service created.');
}

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

// Finally, import the main app logic which kicks everything off
import './assets/js/core/app.js';