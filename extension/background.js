/**
 * Alexi-Bot Background Service Worker
 * Handles authentication, API calls, and message routing
 */

// Configuration
const CONFIG = {
  apiBaseUrl: 'http://localhost:5000/api',
  tokenRefreshInterval: 30 * 60 * 1000, // 30 minutes
};

/**
 * Initialize service worker
 */
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Alexi-Bot extension installed');
  
  // Set default settings
  const result = await chrome.storage.local.get(['tooltipEnabled']);
  if (result.tooltipEnabled === undefined) {
    await chrome.storage.local.set({ tooltipEnabled: true });
  }
});

/**
 * Message handler for communication with popup and content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('Message handling error:', error);
      sendResponse({ error: error.message });
    });
  
  // Return true to indicate async response
  return true;
});

/**
 * Route messages to appropriate handlers
 * @param {object} message - Message object
 * @param {object} sender - Sender information
 * @returns {Promise<object>} Response 
 */
async function handleMessage(message, sender) {
  switch (message.type) {
    case 'ANALYZE_WORD':
      return handleAnalyzeWord(message.payload);

    case 'SAVE_WORD':
      return handleSaveWord(message.word);
    
    case 'LOGOUT':
      return handleLogout();
    
    case 'TOGGLE_CHANGED':
      return handleToggleChanged(message.enabled);
    
    case 'GET_AUTH_STATE':
      return getAuthState();
    
    case 'SET_AUTH_TOKEN':
      return setAuthToken(message.token, message.email);
    
    default:
      return { error: 'Unknown message type' };
  }
}

/**
 * Analyze a selected word with context
 * @param {object} payload - Word and context data
 * @returns {Promise<object>} Analysis result
 */
async function handleAnalyzeWord(payload) {
  const { word, context } = payload;
  const result = await chrome.storage.local.get(['authToken']);
  // Validate input
  if (!word || !word.trim()) {
    return { error: 'No word provided' };
  }
  
  // // Get auth token
  // const authState = await getAuthState();
  
  // // Check if authenticated
  // if (!authState.isAuthenticated) {
  //   return { 
  //     error: 'Authentication required',
  //     requiresAuth: true 
  //   };
  // }
  
  try {
    const response = await fetch(`${CONFIG.apiBaseUrl}/dictionary/search/context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${result.authToken}`
      },
      body: JSON.stringify({
        word: word.trim(),
        context: context || '',
      })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear auth state
        await handleLogout();
        return { 
          error: 'Session expired. Please log in again.',
          requiresAuth: true 
        };
      }
      
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    // Update stats
    // await updateStats();
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    
    // Return fallback response for demo/offline mode
    return getFallbackResponse(word);
  }
}

async function handleSaveWord(word) {
  if(word.word_id === undefined) return false;
  const result = await chrome.storage.local.get(['authToken']);
  try {
    const res =  await fetch(`${CONFIG.apiBaseUrl}/user/word-bank`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${result.authToken}`
      },
      body: JSON.stringify(word)
    });

    if(!res.ok) {
      return false;
    }

    return true;

  } catch (error) {
    console.log(error);
    return false;
  }
}

/**
 * Get fallback response when API is unavailable
 * @param {string} word - The word to define
 * @returns {object} Fallback response
 */
function getFallbackResponse(word) {
  return {
    success: true,
    data: {
      word: word,
      meaning: 'Unable to fetch definition at this time. Please check your connection.',
      example: '',
      synonyms: [],
      pronunciation: {
        ipa: '',
        audioUrl: null
      }
    },
    isFallback: true
  };
}

/**
 * Get current authentication state
 * @returns {Promise<object>} Auth state
 */
async function getAuthState() {
  try {
    const result = await chrome.storage.local.get(['authToken', 'userEmail']);
    return {
      isAuthenticated: !!result.token,
      token: result.token || null,
      email: result.user || null
    };
  } catch (error) {
    console.error('Error getting auth state:', error);
    return { isAuthenticated: false, token: null, email: null };
  }
}

/**
 * Set authentication token
 * @param {string} token - Auth token
 * @param {string} email - User email
 * @returns {Promise<object>} Result
 */
async function setAuthToken(token, email) {
  try {
    console.log(token, email);
    await chrome.storage.local.set({
      authToken: token,
      userEmail: email,
      userStats: { wordsLearned: 0, todayLookups: 0 }
    });
    
    // Notify popup of auth state change
    broadcastMessage({ type: 'AUTH_STATE_CHANGED' });
    
    return { success: true };
  } catch (error) {
    console.error('Error setting auth token:', error);
    return { error: error.message };
  }
}

/**
 * Handle logout
 * @returns {Promise<object>} Result
 */

async function handleLogout() {
  try {
    await chrome.storage.local.remove(['authToken', 'userEmail', 'userStats']);
    broadcastMessage({ type: 'AUTH_STATE_CHANGED' });
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { error: error.message };
  }
}

/**
 * Handle toggle state change
 * @param {boolean} enabled - Whether tooltip is enabled
 * @returns {Promise<object>} Result
 */
async function handleToggleChanged(enabled) {
  try {
    // Broadcast to all content scripts
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'TOGGLE_STATE',
          enabled
        }).catch(() => {
          // Tab might not have content script loaded
        });
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error broadcasting toggle change:', error);
    return { error: error.message };
  }
}

/**
 * Update user statistics
 */
async function updateStats() {
  try {
    const result = await chrome.storage.local.get(['userStats']);
    const stats = result.userStats || { wordsLearned: 0, todayLookups: 0 };
    
    // Check if it's a new day
    const today = new Date().toDateString();
    const lastLookupDate = stats.lastLookupDate;
    
    if (lastLookupDate !== today) {
      stats.todayLookups = 0;
      stats.lastLookupDate = today;
    }
    
    stats.wordsLearned += 1;
    stats.todayLookups += 1;
    
    await chrome.storage.local.set({ userStats: stats });
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

/**
 * Broadcast message to all extension contexts
 * @param {object} message - Message to broadcast
 */
function broadcastMessage(message) {
  chrome.runtime.sendMessage(message).catch(() => {
    // Popup might not be open
  });
}

/**
 * Listen for messages from the main website for auth token
 */
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  // Verify sender is from alexibot.com
  if (sender.origin && sender.origin.includes('alexibot.com')) {
    if (message.type === 'SET_AUTH_TOKEN') {
      setAuthToken(message.token, message.email)
        .then(sendResponse)
        .catch((error) => sendResponse({ error: error.message }));
      return true;
    }
  }
  
  sendResponse({ error: 'Unauthorized' });
});
