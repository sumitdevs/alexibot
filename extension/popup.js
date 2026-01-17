/**
 * Alexi-Bot Popup Script
 * Handles authentication state, toggle, and navigation
 */

// DOM Elements
const elements = {
  loggedOutState: document.getElementById('loggedOutState'),
  loggedInState: document.getElementById('loggedInState'),
  loginBtn: document.getElementById('loginBtn'),
  logoutBtn: document.getElementById('logoutBtn'),
  userEmail: document.getElementById('userEmail'),
  userAvatar: document.getElementById('userAvatar'),
  tooltipToggle: document.getElementById('tooltipToggle'),
  dashboardLink: document.getElementById('dashboardLink'),
  helpLink: document.getElementById('helpLink'),
  statsSection: document.getElementById('statsSection'),
  wordsLearned: document.getElementById('wordsLearned'),
  todayLookups: document.getElementById('todayLookups')
};

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:8080/',
  loginUrl: 'http://localhost:8080/login?source=extension',
  dashboardUrl: 'http://localhost:8080/dashboard',
  helpUrl: 'http://localhost:8080/'
};

/**
 * Initialize popup on load
 */
async function init() {
  await checkAuthState();
  await loadSettings();
  setupEventListeners();
}

/**
 * Check authentication state from storage
 */
async function checkAuthState() {
  try {
    const result = await chrome.storage.local.get(['authToken', 'userEmail', 'userStats']);
    
    if (result.authToken && result.userEmail) {
      showLoggedInState(result.userEmail, result.userStats);
    } else {
      showLoggedOutState();
    }
  } catch (error) {
    console.error('Error checking auth state:', error);
    showLoggedOutState();
  }
}

/**
 * Show logged out UI state
 */
function showLoggedOutState() {
  elements.loggedOutState.classList.remove('hidden');
  elements.loggedInState.classList.add('hidden');
  elements.statsSection.classList.add('hidden');
}

/**
 * Show logged in UI state
 * @param {string} email - User's email
 * @param {object} stats - User's statistics
 */
function showLoggedInState(email, stats = {}) {
  elements.loggedOutState.classList.add('hidden');
  elements.loggedInState.classList.remove('hidden');
  elements.statsSection.classList.remove('hidden');
  
  // Update user info
  elements.userEmail.textContent = email;
  elements.userAvatar.textContent = email.charAt(0).toUpperCase();
  
  // Update stats
  elements.wordsLearned.textContent = formatNumber(stats.wordsLearned || 0);
  elements.todayLookups.textContent = formatNumber(stats.todayLookups || 0);
}

/**
 * Format number for display
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

/**
 * Load saved settings
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['tooltipEnabled']);
    elements.tooltipToggle.checked = result.tooltipEnabled !== false; // Default to true
  } catch (error) {
    console.error('Error loading settings:', error);
    elements.tooltipToggle.checked = true;
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Login button
  elements.loginBtn.addEventListener('click', handleLogin);
  
  // Logout button
  elements.logoutBtn.addEventListener('click', handleLogout);
  
  // Tooltip toggle
  elements.tooltipToggle.addEventListener('change', handleToggleChange);
  
  // Dashboard link
  elements.dashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    openUrl(CONFIG.dashboardUrl);
  });
  
  // Help link
  elements.helpLink.addEventListener('click', (e) => {
    e.preventDefault();
    openUrl(CONFIG.helpUrl);
  });
  
  // Listen for auth state changes from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'AUTH_STATE_CHANGED') {
      checkAuthState();
    }
  });
}

/**
 * Handle login button click
 */
function handleLogin() {
  openUrl(CONFIG.loginUrl);
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    // Clear stored auth data
    await chrome.storage.local.remove(['authToken', 'userEmail', 'userStats']);
    
    // Notify background script
    chrome.runtime.sendMessage({ type: 'LOGOUT' });
    
    // Update UI
    showLoggedOutState();
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

/**
 * Handle toggle change
 */
async function handleToggleChange(e) {
  const enabled = e.target.checked;
  
  try {
    // Save setting
    await chrome.storage.local.set({ tooltipEnabled: enabled });
    
    // Notify all tabs
    chrome.runtime.sendMessage({ 
      type: 'TOGGLE_CHANGED', 
      enabled 
    });
  } catch (error) {
    console.error('Error saving toggle state:', error);
  }
}

/**
 * Open URL in new tab
 * @param {string} url - URL to open
 */
function openUrl(url) {
  chrome.tabs.create({ url });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', init);
