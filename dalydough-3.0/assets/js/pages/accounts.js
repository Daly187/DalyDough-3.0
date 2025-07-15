// Enhanced Accounts Page - assets/js/pages/accounts.js

// Initialize MT5 Accounts if not already done
if (!window.appState) {
    window.appState = {
        mt5Accounts: []
    };
}

// MT5 Account Management Functions
function getMT5Accounts() {
    if (!appState.mt5Accounts) {
        // Initialize with sample data for demo
        appState.mt5Accounts = [
            {
                id: 'demo-1',
                nickname: 'Primary Demo',
                broker: 'IC Markets',
                login: '1234567890',
                server: 'ICMarkets-Demo01',
                status: 'connected',
                balance: 10000.00,
                equity: 10247.35,
                margin: 156.80,
                freeMargin: 10090.55,
                marginLevel: 6534.2,
                connectedAt: new Date('2024-01-15').toISOString(),
                lastSync: new Date().toISOString()
            },
            {
                id: 'demo-2',
                nickname: 'Testing Account',
                broker: 'Pepperstone',
                login: '9876543210',
                server: 'Pepperstone-Demo',
                status: 'disconnected',
                balance: 5000.00,
                equity: 4892.15,
                margin: 0,
                freeMargin: 4892.15,
                marginLevel: 0,
                connectedAt: new Date('2024-01-10').toISOString(),
                lastSync: new Date(Date.now() - 3600000).toISOString()
            }
        ];
    }
    return appState.mt5Accounts;
}

function createAccountsPage() {
    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">🔗 MT5 Account Management</h2>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="last-update">
                        ${getConnectedAccountsCount()} accounts connected
                    </div>
                    <button class="btn btn-primary" onclick="openAddAccountModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14m-7-7h14"></path>
                        </svg>
                        Add MT5 Account
                    </button>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(54, 124, 255, 0.1); border: 1px solid rgba(54, 124, 255, 0.3); border-radius: 8px;">
                <strong style="color: var(--accent-blue);">🛡️ Demo Account Safety</strong><br>
                <span style="color: var(--text-secondary); font-size: 0.875rem; line-height: 1.5;">
                    DalyDough 3.0 only connects to demo accounts for your safety. Live trading is not supported to prevent accidental losses during strategy testing.
                </span>
            </div>

            ${createAccountsGrid()}
        </div>

        <!-- Add Account Modal -->
        <div class="modal" id="addAccountModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(10px); z-index: 2000; padding: 2rem;">
            <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 2rem; max-width: 500px; width: 100%; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3 style="font-size: 1.25rem; font-weight: 600;">🔗 Connect MT5 Demo Account</h3>
                        <button onclick="closeAddAccountModal()" style="background: none; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>

                    <form id="addAccountForm">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Account Nickname</label>
                                <input type="text" id="accountNickname" placeholder="e.g., Primary Demo" required style="width: 100%; padding: 0.75rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                            </div>

                            <div class="form-group">
                                <label>Broker</label>
                                <select id="brokerName" required style="width: 100%; padding: 0.75rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                                    <option value="">Select Broker</option>
                                    <option value="IC Markets">IC Markets</option>
                                    <option value="Pepperstone">Pepperstone</option>
                                    <option value="FxPro">FxPro</option>
                                    <option value="OANDA">OANDA</option>
                                    <option value="Forex.com">Forex.com</option>
                                    <option value="Exness">Exness</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Login Number</label>
                                <input type="number" id="accountLogin" placeholder="1234567890" required style="width: 100%; padding: 0.75rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                            </div>

                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" id="accountPassword" placeholder="Enter password" required style="width: 100%; padding: 0.75rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                            </div>

                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label>Server</label>
                                <input type="text" id="serverAddress" placeholder="e.g., ICMarkets-Demo01" required style="width: 100%; padding: 0.75rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                            </div>
                        </div>

                        <div id="connectionTest" style="display: none; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 1rem; margin: 1rem 0;">
                            <div id="testResult" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem;">
                                <span>🔄</span>
                                <span>Testing connection...</span>
                            </div>
                        </div>

                        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                            <button type="button" class="btn btn-secondary" onclick="testConnection()">
                                Test Connection
                            </button>
                            <button type="submit" class="btn btn-primary" style="flex: 1;">
                                Connect Account
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Edit Account Modal -->
        <div class="modal" id="editAccountModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(10px); z-index: 2000; padding: 2rem;">
            <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 2rem; max-width: 500px; width: 100%; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3 style="font-size: 1.25rem; font-weight: 600;">✏️ Edit Account Details</h3>
                        <button onclick="closeEditAccountModal()" style="background: none; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>

                    <form id="editAccountForm">
                        <input type="hidden" id="editAccountId">
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Account Nickname</label>
                                <input type="text" id="editAccountNickname" required style="width: 100%; padding: 0.75rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                            </div>

                            <div class="form-group">
                                <label>Broker</label>
                                <select id="editBrokerName" required style="width: 100%; padding: 0.75rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                                    <option value="IC Markets">IC Markets</option>
                                    <option value="Pepperstone">Pepperstone</option>
                                    <option value="FxPro">FxPro</option>
                                    <option value="OANDA">OANDA</option>
                                    <option value="Forex.com">Forex.com</option>
                                    <option value="Exness">Exness</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Login Number</label>
                                <input type="number" id="editAccountLogin" readonly style="width: 100%; padding: 0.75rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-secondary);">
                            </div>

                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" id="editAccountPassword" placeholder="Leave blank to keep current" style="width: 100%; padding: 0.75rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                            </div>

                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label>Server</label>
                                <input type="text" id="editServerAddress" required style="width: 100%; padding: 0.75rem; background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: var(--border-radius); color: var(--text-primary);">
                            </div>
                        </div>

                        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                            <button type="button" class="btn btn-secondary" onclick="closeEditAccountModal()">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-primary" style="flex: 1;">
                                Update Account
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

function createAccountsGrid() {
    const accounts = getMT5Accounts();
    
    if (accounts.length === 0) {
        return `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem; opacity: 0.5;">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                </svg>
                <h3>No MT5 Accounts Connected</h3>
                <p style="margin: 0.5rem 0 1.5rem 0;">Connect your first demo account to start automated trading</p>
                <button class="btn btn-primary" onclick="openAddAccountModal()">
                    Connect Demo Account
                </button>
            </div>
        `;
    }

    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
            ${accounts.map(account => createAccountCard(account)).join('')}
        </div>
    `;
}

function createAccountCard(account) {
    const statusClass = account.status === 'connected' ? 'status-connected' : 'status-disconnected';
    const statusText = account.status === 'connected' ? 'Connected' : 'Disconnected';
    
    return `
        <div style="background: var(--bg-surface-2); border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 1.5rem; transition: all var(--transition-speed); position: relative;">
            <div style="position: absolute; top: 1rem; right: 1rem; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; ${account.status === 'connected' ? 'background: rgba(34, 197, 94, 0.2); color: var(--positive-green);' : 'background: rgba(239, 68, 68, 0.2); color: var(--negative-red);'}">
                ${statusText}
            </div>
            
            <div style="margin-bottom: 1rem;">
                <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">${account.nickname}</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                    ${account.broker} • Login: ${account.login}
                </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <span style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; font-weight: 500;">Balance</span>
                    <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">${formatCurrency(account.balance)}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <span style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; font-weight: 500;">Equity</span>
                    <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">${formatCurrency(account.equity)}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <span style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; font-weight: 500;">Free Margin</span>
                    <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">${formatCurrency(account.freeMargin)}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <span style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; font-weight: 500;">Margin Level</span>
                    <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">${account.marginLevel > 0 ? account.marginLevel.toFixed(1) + '%' : 'N/A'}</span>
                </div>
            </div>

            <div style="display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" onclick="refreshAccount('${account.id}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M23 4v6h-6"></path>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    Refresh
                </button>
                <button class="btn btn-secondary btn-sm" onclick="editAccount('${account.id}')">
                    ✏️ Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="removeAccount('${account.id}')">
                    🗑️ Remove
                </button>
            </div>

            <div style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-tertiary);">
                Last sync: ${new Date(account.lastSync).toLocaleString()}
            </div>
        </div>
    `;
}

function getConnectedAccountsCount() {
    return getMT5Accounts().filter(account => account.status === 'connected').length;
}

function saveMT5Accounts() {
    // In production, this would save to your backend/database
    localStorage.setItem('mt5Accounts', JSON.stringify(appState.mt5Accounts));
}

// Modal Functions
function openAddAccountModal() {
    document.getElementById('addAccountModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeAddAccountModal() {
    document.getElementById('addAccountModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('addAccountForm').reset();
    const testDiv = document.getElementById('connectionTest');
    if (testDiv) testDiv.style.display = 'none';
}

function openEditAccountModal() {
    document.getElementById('editAccountModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeEditAccountModal() {
    document.getElementById('editAccountModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('editAccountForm').reset();
}

// Test MT5 Connection
function testConnection() {
    const testDiv = document.getElementById('connectionTest');
    const resultDiv = document.getElementById('testResult');
    
    testDiv.style.display = 'block';
    resultDiv.innerHTML = '<span style="color: var(--warning-yellow);">🔄</span><span>Testing connection...</span>';

    // Simulate MT5 connection test
    setTimeout(() => {
        const success = Math.random() > 0.3; // 70% success rate for demo
        
        if (success) {
            resultDiv.innerHTML = '<span style="color: var(--positive-green);">✅</span><span>Connection successful! Demo account verified.</span>';
        } else {
            resultDiv.innerHTML = '<span style="color: var(--negative-red);">❌</span><span>Connection failed. Please check your credentials and server details.</span>';
        }
    }, 2000);
}

// Add New Account
function addMT5Account(formData) {
    const newAccount = {
        id: 'account_' + Date.now(),
        nickname: formData.nickname,
        broker: formData.broker,
        login: formData.login,
        server: formData.server,
        status: 'connected',
        balance: 10000.00, // Default demo balance
        equity: 10000.00,
        margin: 0,
        freeMargin: 10000.00,
        marginLevel: 0,
        connectedAt: new Date().toISOString(),
        lastSync: new Date().toISOString()
    };

    appState.mt5Accounts.push(newAccount);
    saveMT5Accounts();
    
    // Refresh the accounts page
    if (appState.activePage === 'Accounts') {
        switchPage('Accounts');
    }
    
    closeAddAccountModal();

    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification(`Successfully connected to ${newAccount.nickname}!`, 'success');
    } else {
        setTimeout(() => {
            alert(`✅ Successfully connected to ${newAccount.nickname}!\n\nAccount Details:\n• Broker: ${newAccount.broker}\n• Login: ${newAccount.login}\n• Server: ${newAccount.server}\n\nYour demo account is now ready for automated trading.`);
        }, 500);
    }
}

// Edit Account
function editAccount(accountId) {
    const account = appState.mt5Accounts.find(a => a.id === accountId);
    if (!account) return;

    // Populate edit form
    document.getElementById('editAccountId').value = account.id;
    document.getElementById('editAccountNickname').value = account.nickname;
    document.getElementById('editBrokerName').value = account.broker;
    document.getElementById('editAccountLogin').value = account.login;
    document.getElementById('editServerAddress').value = account.server;

    openEditAccountModal();
}

// Update Account
function updateMT5Account(formData) {
    const accountIndex = appState.mt5Accounts.findIndex(a => a.id === formData.id);
    if (accountIndex === -1) return;

    appState.mt5Accounts[accountIndex] = {
        ...appState.mt5Accounts[accountIndex],
        nickname: formData.nickname,
        broker: formData.broker,
        server: formData.server,
        lastSync: new Date().toISOString()
    };

    saveMT5Accounts();
    
    // Refresh the accounts page
    if (appState.activePage === 'Accounts') {
        switchPage('Accounts');
    }
    
    closeEditAccountModal();

    if (typeof showNotification === 'function') {
        showNotification('Account updated successfully!', 'success');
    } else {
        alert('✅ Account updated successfully!');
    }
}

// Remove Account
function removeAccount(accountId) {
    const account = appState.mt5Accounts.find(a => a.id === accountId);
    if (!account) return;

    if (confirm(`Are you sure you want to remove "${account.nickname}"?\n\nThis will disconnect the account from DalyDough and stop all automated trading for this account.`)) {
        appState.mt5Accounts = appState.mt5Accounts.filter(a => a.id !== accountId);
        saveMT5Accounts();
        
        // Refresh the accounts page
        if (appState.activePage === 'Accounts') {
            switchPage('Accounts');
        }
        
        if (typeof showNotification === 'function') {
            showNotification(`Account "${account.nickname}" has been removed.`, 'success');
        } else {
            alert(`🗑️ Account "${account.nickname}" has been removed.`);
        }
    }
}

// Refresh Account Data
function refreshAccount(accountId) {
    const account = appState.mt5Accounts.find(a => a.id === accountId);
    if (!account) return;

    // Simulate account refresh with slight balance changes
    const change = (Math.random() - 0.5) * 100; // ±$50 change
    account.equity = Math.max(0, account.equity + change);
    account.freeMargin = account.equity - account.margin;
    account.marginLevel = account.margin > 0 ? (account.equity / account.margin) * 100 : 0;
    account.lastSync = new Date().toISOString();
    account.status = Math.random() > 0.1 ? 'connected' : 'disconnected'; // 90% uptime

    saveMT5Accounts();
    
    // Refresh the accounts page
    if (appState.activePage === 'Accounts') {
        switchPage('Accounts');
    }

    if (typeof showNotification === 'function') {
        showNotification(`${account.nickname} refreshed successfully`, 'success');
    }
}

// Event Listeners for Account Management
function attachAccountsEventListeners() {
    // Add Account Form
    const addForm = document.getElementById('addAccountForm');
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                nickname: document.getElementById('accountNickname').value,
                broker: document.getElementById('brokerName').value,
                login: document.getElementById('accountLogin').value,
                server: document.getElementById('serverAddress').value
            };

            addMT5Account(formData);
        });
    }

    // Edit Account Form
    const editForm = document.getElementById('editAccountForm');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                id: document.getElementById('editAccountId').value,
                nickname: document.getElementById('editAccountNickname').value,
                broker: document.getElementById('editBrokerName').value,
                server: document.getElementById('editServerAddress').value
            };

            updateMT5Account(formData);
        });
    }

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
}

// Auto-refresh accounts periodically
function startAccountsAutoRefresh() {
    setInterval(() => {
        if (appState.activePage === 'Accounts' && appState.mt5Accounts && appState.mt5Accounts.length > 0) {
            appState.mt5Accounts.forEach(account => {
                // Simulate small account changes for connected accounts
                if (account.status === 'connected' && Math.random() > 0.8) {
                    const change = (Math.random() - 0.5) * 20;
                    account.equity = Math.max(0, account.equity + change);
                    account.freeMargin = account.equity - account.margin;
                    account.lastSync = new Date().toISOString();
                }
            });
            
            saveMT5Accounts();
            
            // Silently refresh the page if we're on accounts
            if (appState.activePage === 'Accounts') {
                const mainPanel = document.getElementById('main-panel');
                if (mainPanel) {
                    mainPanel.innerHTML = createAccountsPage();
                    attachAccountsEventListeners();
                }
            }
        }
    }, 30000); // Refresh every 30 seconds
}

// Make functions globally available
window.getMT5Accounts = getMT5Accounts;
window.openAddAccountModal = openAddAccountModal;
window.closeAddAccountModal = closeAddAccountModal;
window.openEditAccountModal = openEditAccountModal;
window.closeEditAccountModal = closeEditAccountModal;
window.testConnection = testConnection;
window.editAccount = editAccount;
window.removeAccount = removeAccount;
window.refreshAccount = refreshAccount;
window.attachAccountsEventListeners = attachAccountsEventListeners;

// Start auto-refresh when the module loads
startAccountsAutoRefresh();

console.log('✅ MT5 Accounts page loaded with full account management functionality');