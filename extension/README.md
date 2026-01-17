# Alexi-Bot Chrome Extension

**Understand words in context instantly.** Get definitions, synonyms, and pronunciation right where you read.

## 📦 Installation

### Development Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension` folder from this project
5. The Alexi-Bot icon should appear in your toolbar

### Adding Icons

Before loading, add your icon files to the `assets/` folder:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

## 🚀 Features

### Popup Interface
- Clean, minimal design
- Authentication status display
- Enable/disable tooltip toggle
- Quick access to dashboard
- Word learning statistics

### Text Selection Tooltip
- Select any word or phrase on a webpage
- Instantly see:
  - Word definition (contextual)
  - Example sentence
  - Synonyms (up to 5)
  - IPA pronunciation
  - Audio playback button

### Smart Context Extraction
- Extracts ~150 characters before and after selection
- Respects paragraph boundaries
- Provides rich context for better definitions

### Dark Mode Support
- Automatically adapts to system preferences
- Consistent styling in both light and dark modes

## 🔐 Authentication

The extension uses Bearer token authentication:

1. User clicks "Login" in the popup
2. Redirected to `https://alexibot.com/login?source=extension`
3. After successful login, the main site stores the token
4. Extension reads token from `chrome.storage.local`
5. All API requests include `Authorization: Bearer <token>`

### Token Flow

```
Main Website                    Extension
    |                               |
    | --- User logs in -----------> |
    |                               |
    | <-- Store token in storage -- |
    |                               |
    | --- API calls with token ---> |
```

## 📁 Project Structure

```
extension/
├── manifest.json          # Extension manifest (v3)
├── popup.html             # Popup UI
├── popup.css              # Popup styles
├── popup.js               # Popup logic
├── background.js          # Service worker
├── content.js             # Content script
├── styles.css             # Tooltip styles
├── utils/
│   ├── helpers.js         # Utility functions
│   └── storage.js         # Storage wrapper
├── assets/
│   └── icon*.png          # Extension icons
└── README.md              # This file
```

## 🔧 Configuration

Edit `background.js` to update:

```javascript
const CONFIG = {
  apiBaseUrl: 'https://alexibot.com/api',
  tokenRefreshInterval: 30 * 60 * 1000, // 30 minutes
};
```

## 🌐 API Endpoints

### POST `/api/analyze`

Analyzes a word in context.

**Request:**
```json
{
  "word": "example",
  "context": "Text before ... example ... text after",
  "url": "https://source-page.com/article"
}
```

**Response:**
```json
{
  "word": "example",
  "meaning": "A thing characteristic of its kind...",
  "example": "This is a perfect example of modern design.",
  "synonyms": ["instance", "sample", "specimen"],
  "pronunciation": {
    "ipa": "/ɪɡˈzæmpəl/",
    "audioUrl": "https://api.alexibot.com/audio/example.mp3"
  }
}
```

## ♿ Accessibility

- Full keyboard navigation
- ARIA labels on interactive elements
- Focus management for tooltip
- Respects `prefers-reduced-motion`
- High contrast mode support

## 🛡️ Permissions

| Permission | Purpose |
|------------|---------|
| `storage` | Store auth token and settings |
| `activeTab` | Access current tab for context |
| `scripting` | Inject content scripts |
| `host_permissions` | Make API calls to alexibot.com |

## 📝 Development Notes

### Content Security Policy
The extension follows Chrome's CSP requirements for Manifest V3:
- No inline scripts
- No `eval()` or dynamic code execution
- All resources loaded from extension package

### Memory Management
- Event-based listeners (no continuous polling)
- Debounced selection handling
- Tooltip removed when not visible

### Error Handling
- Graceful fallback for offline mode
- Token expiration detection
- User-friendly error messages

## 📄 License

Proprietary - Alexi-Bot Platform
