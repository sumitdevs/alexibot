/**
 * Alexi-Bot Storage Utilities
 * Wrapper for Chrome storage API with type safety
 */

/**
 * Storage keys enum
 */
export const StorageKeys = {
  AUTH_TOKEN: 'authToken',
  USER_EMAIL: 'userEmail',
  USER_STATS: 'userStats',
  TOOLTIP_ENABLED: 'tooltipEnabled',
  SETTINGS: 'settings',
  WORD_HISTORY: 'wordHistory'
};

/**
 * Get value from local storage
 * @param {string|string[]} keys - Key(s) to retrieve
 * @returns {Promise<object>} Storage values
 */
export async function getStorage(keys) {
  try {
    return await chrome.storage.local.get(keys);
  } catch (error) {
    console.error('Storage get error:', error);
    return {};
  }
}

/**
 * Set value in local storage
 * @param {object} data - Data to store
 * @returns {Promise<boolean>} Success status
 */
export async function setStorage(data) {
  try {
    await chrome.storage.local.set(data);
    return true;
  } catch (error) {
    console.error('Storage set error:', error);
    return false;
  }
}

/**
 * Remove value(s) from local storage
 * @param {string|string[]} keys - Key(s) to remove
 * @returns {Promise<boolean>} Success status
 */
export async function removeStorage(keys) {
  try {
    await chrome.storage.local.remove(keys);
    return true;
  } catch (error) {
    console.error('Storage remove error:', error);
    return false;
  }
}

/**
 * Clear all local storage
 * @returns {Promise<boolean>} Success status
 */
export async function clearStorage() {
  try {
    await chrome.storage.local.clear();
    return true;
  } catch (error) {
    console.error('Storage clear error:', error);
    return false;
  }
}

/**
 * Get auth token
 * @returns {Promise<string|null>} Auth token or null
 */
export async function getAuthToken() {
  const { authToken } = await getStorage(StorageKeys.AUTH_TOKEN);
  return authToken || null;
}

/**
 * Set auth token and email
 * @param {string} token - Auth token
 * @param {string} email - User email
 * @returns {Promise<boolean>} Success status
 */
export async function setAuthToken(token, email) {
  return setStorage({
    [StorageKeys.AUTH_TOKEN]: token,
    [StorageKeys.USER_EMAIL]: email
  });
}

/**
 * Clear auth data
 * @returns {Promise<boolean>} Success status
 */
export async function clearAuth() {
  return removeStorage([
    StorageKeys.AUTH_TOKEN,
    StorageKeys.USER_EMAIL,
    StorageKeys.USER_STATS
  ]);
}

/**
 * Get user settings
 * @returns {Promise<object>} User settings
 */
export async function getSettings() {
  const { settings } = await getStorage(StorageKeys.SETTINGS);
  return settings || {
    tooltipEnabled: true,
    autoSpeak: false,
    darkMode: 'auto'
  };
}

/**
 * Update user settings
 * @param {object} newSettings - Settings to update
 * @returns {Promise<boolean>} Success status
 */
export async function updateSettings(newSettings) {
  const currentSettings = await getSettings();
  return setStorage({
    [StorageKeys.SETTINGS]: {
      ...currentSettings,
      ...newSettings
    }
  });
}

/**
 * Add word to history
 * @param {object} wordData - Word data to add
 * @returns {Promise<boolean>} Success status
 */
export async function addToWordHistory(wordData) {
  const { wordHistory } = await getStorage(StorageKeys.WORD_HISTORY);
  const history = wordHistory || [];
  
  // Add new word at beginning, limit to 100 items
  const newHistory = [
    {
      ...wordData,
      timestamp: Date.now()
    },
    ...history
  ].slice(0, 100);
  
  return setStorage({
    [StorageKeys.WORD_HISTORY]: newHistory
  });
}

/**
 * Get word history
 * @param {number} limit - Maximum items to return
 * @returns {Promise<array>} Word history
 */
export async function getWordHistory(limit = 50) {
  const { wordHistory } = await getStorage(StorageKeys.WORD_HISTORY);
  return (wordHistory || []).slice(0, limit);
}

/**
 * Listen for storage changes
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function onStorageChange(callback) {
  const listener = (changes, areaName) => {
    if (areaName === 'local') {
      callback(changes);
    }
  };
  
  chrome.storage.onChanged.addListener(listener);
  
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}
