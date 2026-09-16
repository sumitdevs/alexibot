
(function () {
  "use strict";

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    selectionDebounce: 300,
    contextRadius: 150, // characters before/after selection
    minWordLength: 2,
    maxWordLength: 50,
    tooltipMaxWidth: 320,
    tooltipOffset: 10,
    animationDuration: 200,
  };

  // ============================================
  // State
  // ============================================
  let state = {
    isEnabled: true,
    tooltip: null,
    currentSelection: null,
    debounceTimer: null,
  };

  let word = {
    word_id: null,
    synset_id: null,
  };

  window.addEventListener("message", async (e) => {
    if (e.source !== window) return;
    const { type, token, email } = e.data;
    if (type === "SET_TOKEN") {
      await handleLogin(token, email);
    }
  });

  // ============================================
  // Initialization
  // ============================================

  async function init() {
    // Load enabled state
    await loadEnabledState();
    // Create tooltip element
    createTooltip();

    // Setup event listeners
    setupEventListeners();

    // Listen for toggle changes from popup
    chrome.runtime.onMessage.addListener(handleMessage);

    console.log("Alexi-Bot content script initialized");
  }

  /**
   * Load enabled state from storage
   */
  async function loadEnabledState() {
    try {
      const result = await chrome.storage.local.get(["tooltipEnabled"]);
      state.isEnabled = result.tooltipEnabled !== false;
    } catch (error) {
      console.error("Error loading enabled state:", error);
      state.isEnabled = true;
    }
  }

  /**
   * Handle messages from popup/background
   */
  function handleMessage(message, sender, sendResponse) {
    if (message.type === "TOGGLE_STATE") {
      state.isEnabled = message.enabled;
      if (!state.isEnabled) {
        hideTooltip();
      }
    }
    sendResponse({ success: true });
  }

  // ============================================
  // Tooltip Creation & Management
  // ============================================

  /**
   * Create the tooltip element
   */
  function createTooltip() {
    // Check if tooltip already exists
    if (document.getElementById("alexi-bot-tooltip")) {
      state.tooltip = document.getElementById("alexi-bot-tooltip");
      return;
    }

    const tooltip = document.createElement("div");
    tooltip.id = "alexi-bot-tooltip";
    tooltip.className = "alexi-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.setAttribute("aria-hidden", "true");

    tooltip.innerHTML = `
      <div class="alexi-tooltip-content">
        <div class="alexi-tooltip-header">
          <span class="alexi-word"></span>
          <div class="alexi-pronunciation">
            <span class="alexi-ipa"></span>
            <button class="alexi-speak-btn" aria-label="Listen to pronunciation">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            </button>
            <button class="alexi-save-btn" aria-label="Listen to pronunciation">
            // <svg id="saveicon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bookmark w-5 h-5 flex-shrink-0"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
            <svg class="alexi-save-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bookmark w-5 h-5 flex-shrink-0"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
            </button>
          </div>
        </div>
        <div class="alexi-tooltip-body">
          <p class="alexi-meaning"></p>
          <p class="alexi-example"></p>
          <div class="alexi-synonyms">
            <span class="alexi-synonyms-label">Synonyms:</span>
            <span class="alexi-synonyms-list"></span>
          </div>
        </div>
        <div class="alexi-tooltip-footer">
          <span class="alexi-powered">Powered by Alexi-Bot</span>
        </div>
      </div>
      <div class="alexi-tooltip-loader">
        <div class="alexi-spinner"></div>
        <span>Analyzing...</span>
      </div>
      <div class="alexi-tooltip-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span class="alexi-error-message"></span>
        <button class="alexi-login-btn">Login</button>
      </div>
    `;

    document.body.appendChild(tooltip);
    state.tooltip = tooltip;

    // Setup tooltip event listeners
    setupTooltipListeners();
  }

  /**
   * Setup tooltip event listeners
   */
  function setupTooltipListeners() {
    // Speak button
    const speakBtn = state.tooltip.querySelector(".alexi-speak-btn");
    speakBtn.addEventListener("click", handleSpeak);

    const saveBtn = state.tooltip.querySelector(".alexi-save-btn");
    const saveIcon = state.tooltip.querySelector(".alexi-save-icon");
    saveBtn.addEventListener("click", () => {
      handleSave(saveIcon);
    });

    // Login button
    // const loginBtn = state.tooltip.querySelector('.alexi-login-btn');
    // loginBtn.addEventListener('click', handleLogin);

    // Prevent tooltip clicks from closing it
    state.tooltip.addEventListener("click", (e) => e.stopPropagation());
  }

  /**
   * Show tooltip at specified position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  function showTooltip(x, y) {
    if (!state.tooltip) return;

    state.tooltip.classList.add("alexi-visible");
    state.tooltip.setAttribute("aria-hidden", "false");

    // Position tooltip
    positionTooltip(x, y);
  }

  /**
   * Position tooltip smartly to avoid viewport overflow
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  function positionTooltip(x, y) {
    const tooltip = state.tooltip;

    if (!tooltip) return; //new added

    const rect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = x;
    let top = y + CONFIG.tooltipOffset;

    // Adjust horizontal position
    if (left + CONFIG.tooltipMaxWidth > viewportWidth - 20) {
      left = viewportWidth - CONFIG.tooltipMaxWidth - 20;
    }

    if (left < 20) {
      left = 20;
    }

    // Adjust vertical position (show above if not enough space below)
    if (top + rect.height > viewportHeight - 20) {
      top = y - rect.height - CONFIG.tooltipOffset;
    }

    if (top < 20) {
      // new added
      top = 20;
    }

    // tooltip.style.left = `${left + window.scrollX}px`;
    // tooltip.style.top = `${top + window.scrollY}px`;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  /**
   * Hide tooltip
   */
  function hideTooltip() {
    if (!state.tooltip) return;

    state.tooltip.classList.remove("alexi-visible");
    state.tooltip.setAttribute("aria-hidden", "true");
    setTooltipState("content");
  }

  /**
   * Set tooltip state (loading, content, error)
   * @param {string} stateName - State name
   */
  function setTooltipState(stateName) {
    if (!state.tooltip) return;

    state.tooltip.classList.remove("alexi-loading", "alexi-error");

    if (stateName === "loading") {
      state.tooltip.classList.add("alexi-loading");
    } else if (stateName === "error") {
      state.tooltip.classList.add("alexi-error");
    }
  }

  /**
   * Update tooltip content with word data
   * @param {object} data - Word data from API
   */
  function updateTooltipContent(data) {
    if (!state.tooltip) return;
    const wordEl = state.tooltip.querySelector(".alexi-word");
    const ipaEl = state.tooltip.querySelector(".alexi-ipa");
    const meaningEl = state.tooltip.querySelector(".alexi-meaning");
    const exampleEl = state.tooltip.querySelector(".alexi-example");
    const synonymsEl = state.tooltip.querySelector(".alexi-synonyms");
    const synonymsListEl = state.tooltip.querySelector(".alexi-synonyms-list");
    const speakBtn = state.tooltip.querySelector(".alexi-speak-btn");

    const gloss = data.gloss?.split(";") || [];

    wordEl.textContent = data?.lemma || "";
    ipaEl.textContent = data.pronunciation?.ipa || "";
    meaningEl.textContent = gloss[0] || "No definition available.";

    // Example
    if (gloss.length > 1) {
      exampleEl.textContent = `${gloss[1]}`;
      exampleEl.style.display = "block";
    } else {
      exampleEl.style.display = "none";
    }

    // Synonyms
    if (data.synonyms) {
      synonymsListEl.textContent = JSON.parse(data.synonyms).join(", ");
      synonymsEl.style.display = "flex";
    } else {
      synonymsEl.style.display = "none";
    }

    // Pronunciation audio
    // if (data.pronunciation?.audioUrl) {
    //   speakBtn.dataset.audioUrl = data.pronunciation.audioUrl;
    //   speakBtn.style.display = 'flex';
    // } else {
    //   speakBtn.style.display = 'none';
    // }

    setTooltipState("content");
  }

  /**
   * Show error in tooltip
   * @param {string} message - Error message
   * @param {boolean} showLogin - Whether to show login button
   */
  function showTooltipError(message, showLogin = false) {
    if (!state.tooltip) return;

    const errorMsgEl = state.tooltip.querySelector(".alexi-error-message");
    const loginBtn = state.tooltip.querySelector(".alexi-login-btn");

    errorMsgEl.textContent = message;
    loginBtn.style.display = showLogin ? "block" : "none";

    setTooltipState("error");
  }

  // ============================================
  // Event Handlers
  // ============================================

  /**
   * Setup main event listeners
   */
  function setupEventListeners() {
    // Text selection
    document.addEventListener("mouseup", handleMouseUp);

    // Close tooltip on click outside
    document.addEventListener("mousedown", handleClickOutside);

    // Close tooltip on scroll
    document.addEventListener("scroll", hideTooltip, { passive: true });

    // Close tooltip on ESC key
    document.addEventListener("keydown", handleKeyDown);
  }

  /**
   * Handle mouse up (text selection)
   * @param {MouseEvent} e - Mouse event
   */
  function handleMouseUp(e) {
    // Clear previous debounce
    if (state.debounceTimer) {
      clearTimeout(state.debounceTimer);
    }

    // Check if enabled
    if (!state.isEnabled) return;

    // Ignore if clicking on tooltip
    if (state.tooltip && state.tooltip.contains(e.target)) return;

    // Debounce selection
    state.debounceTimer = setTimeout(() => {
      processSelection(e);
    }, CONFIG.selectionDebounce);
  }

  /**
   * Process text selection
   * @param {MouseEvent} e - Mouse event
   */
  async function processSelection(e) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // Validate selection
    if (!isValidSelection(selectedText)) {
      return;
    }

    // Get selection position
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Extract context
    const context = extractContext(selection);

    // Store current selection
    state.currentSelection = {
      word: selectedText,
      context: context,
    };

    // Show tooltip with loading state
    showTooltip(rect.left, rect.bottom);
    setTooltipState("loading");

    // Analyze word
    await analyzeWord(state.currentSelection);
  }

  /**
   * Validate text selection
   * @param {string} text - Selected text
   * @returns {boolean} Is valid
   */
  function isValidSelection(text) {
    if (!text) return false;
    if (text.length < CONFIG.minWordLength) return false;
    if (text.length > CONFIG.maxWordLength) return false;
    if (/\s/.test(text) && text.split(/\s+/).length > 5) return false; // Max 5 words
    return true;
  }

  /**
   * Extract context around selection
   * @param {Selection} selection - Current selection
   * @returns {string} Context text
   */
  function extractContext(selection) {
    try {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;

      // Get parent paragraph or block element
      let blockElement = container;
      if (container.nodeType === Node.TEXT_NODE) {
        blockElement = container.parentElement;
      }

      // Find nearest block-level parent
      while (blockElement && !isBlockElement(blockElement)) {
        blockElement = blockElement.parentElement;
      }

      if (!blockElement) {
        return "";
      }

      // Get text content
      const fullText = blockElement.textContent || "";
      const selectedText = selection.toString();
      const selectionIndex = fullText.indexOf(selectedText);

      if (selectionIndex === -1) {
        return fullText.slice(0, CONFIG.contextRadius * 2);
      }

      // Extract context around selection
      const start = Math.max(0, selectionIndex - CONFIG.contextRadius);
      const end = Math.min(
        fullText.length,
        selectionIndex + selectedText.length + CONFIG.contextRadius,
      );

      let context = fullText.slice(start, end);

      // Add ellipsis if truncated
      if (start > 0) context = "..." + context;
      if (end < fullText.length) context = context + "...";

      return context;
    } catch (error) {
      console.error("Error extracting context:", error);
      return "";
    }
  }

  /**
   * Check if element is block-level
   * @param {Element} element - DOM element
   * @returns {boolean} Is block element
   */
  function isBlockElement(element) {
    const blockTags = [
      "P",
      "DIV",
      "ARTICLE",
      "SECTION",
      "LI",
      "TD",
      "TH",
      "BLOCKQUOTE",
      "PRE",
    ];
    return blockTags.includes(element.tagName);
  }

  /**
   * Analyze word via background script
   * @param {object} payload - Selection data
   */
  async function analyzeWord(payload) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "ANALYZE_WORD",
        payload,
      });

      // if (response.error) {
      //   showTooltipError(response.error, response.requiresAuth);
      //   return;
      // }

      if (response.data) {
        const { word_id, synset_id } = response.data;
        updateTooltipContent(response.data);
        word = { word_id, synset_id };
        console.log(word);
      }
    } catch (error) {
      console.log("Error analyzing word:", error);
      showTooltipError("Failed to analyze word. Please try again.");
    }
  }

  /**
   * Handle click outside tooltip
   * @param {MouseEvent} e - Mouse event
   */
  function handleClickOutside(e) {
    if (state.tooltip && !state.tooltip.contains(e.target)) {
      // Small delay to allow selection to complete
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection.toString().trim()) {
          hideTooltip();
        }
      }, 50);
    }
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} e - Keyboard event
   */
  function handleKeyDown(e) {
    if (e.key === "Escape") {
      hideTooltip();
    }
  }

  /**
   * Handle speak button click
   */
  function handleSpeak() {
    const speakBtn = state.tooltip.querySelector(".alexi-speak-btn");
    const audioUrl = speakBtn.dataset.audioUrl;

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    } else if (state.currentSelection?.word) {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(
        state.currentSelection.word,
      );
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }

  async function handleSave(icon) {
    try {
      const status = await chrome.runtime.sendMessage({
        type: "SAVE_WORD",
        word,
      });

      if (status?.success) {
        icon.style.fill = "#fff";
      }
    } catch (error) {
      console.error('Error saving word:', error)
    }
    
    // const status = await chrome.runtime.sendMessage({
    //   type: 'SAVE_WORD',
    //   word,
    // });

    // if(status) {
    //   icon.style.fill = "#fff"
    // }
  }

  /**
   * Handle login button click
   */
  async function handleLogin(token, email) {
    const status = await chrome.runtime.sendMessage({
      type: "SET_AUTH_TOKEN",
      token,
      email,
    });

    console.log(status);
    hideTooltip();
  }

  // ============================================
  // Initialize
  // ============================================

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
