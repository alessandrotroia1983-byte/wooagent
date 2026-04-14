# CLAUDE.md — WooAgent

## Project Overview

**WooAgent** is an AI-powered WooCommerce inventory management and sales platform. It is a **single-file, zero-dependency SPA** — all HTML, CSS, and JavaScript live in `index.html`. There is no build step, no package manager, and no backend server. The app runs entirely in the browser.

**Primary language:** Italian (UI labels and user-facing text)
**Tech stack:** Vanilla HTML5 + CSS3 + ES6 JavaScript, loaded via CDN

---

## Repository Structure

```
wooagent/
├── index.html     # Entire application (~1,385 lines)
└── CLAUDE.md      # This file
```

Everything — styles, logic, markup — is in `index.html`. Do not create separate files unless absolutely necessary; the intentional monolithic structure is a feature, not a bug.

---

## Running the App

No build or install step is required.

```bash
# Serve with any static file server:
python3 -m http.server 8000
# or
npx http-server .

# Then open http://localhost:8000 in a browser.
```

**First-run setup:** The user fills in a form with four credentials that are saved to `localStorage['wooagent_cfg']` as JSON:

```json
{
  "url": "https://tuonegozio.it",
  "key": "ck_...",
  "secret": "cs_...",
  "claude": "sk-ant-..."
}
```

There is no `.env` file or server-side configuration.

---

## External Dependencies (CDN only)

| Library | Version | Purpose |
|---------|---------|---------|
| html5-qrcode | 2.3.8 | Barcode / QR scanning via camera |
| Google Fonts | — | Syne + DM Mono typography |

No npm, no webpack, no bundler.

---

## API Integrations

### WooCommerce REST API v3
- **Base:** `{CFG.url}/wp-json/wc/v3/`
- **Auth:** HTTP Basic (Consumer Key + Secret, Base64-encoded)
- **Used endpoints:** `products`, `products/{id}/variations`, `orders`
- **Wrappers:** `woo(method, path, body, cb)` (callback) and `wooPromise(method, path, body)` (Promise)

### Anthropic Claude API
- **Endpoint:** `https://api.anthropic.com/v1/messages`
- **Model:** `claude-sonnet-4-20250514`
- **Headers:** `x-api-key`, `anthropic-version: 2023-06-01`
- **Features:** vision (base64 images), JSON label extraction, chat
- **Wrapper:** `aiCall(messages, base64img, mimeType)` → returns Promise
- **CORS fallback:** `https://corsproxy.io/` if direct call fails

---

## Global State

```javascript
var CFG = {}            // Loaded from localStorage on startup
var scan = {}           // Active product being scanned/added
var invProducts = []    // Cached inventory list
var chatHistory = []    // AI chat message history
var deleteProductId = null
var html5QrCode = null  // Camera instance (html5-qrcode)
var invFilter = 'all'   // Inventory filter state
var SIZES = { clothing: [...], shoes: [...] }
```

All state is module-level globals (no framework, no Vuex/Redux). Mutations happen in-place.

---

## UI Panels (Navigation)

The app has 7 panels switched via `go(panelId)`:

| Panel ID | Feature |
|----------|---------|
| `scan-add` | 4-step barcode → photo → sizes → publish workflow |
| `scan-sell` | Scan label to deduct stock |
| `delete-product` | Find and permanently remove a product |
| `inventory` | View all products with stock; quick-deduct |
| `low-stock` | Products below stock threshold |
| `orders` | Pending orders; update status |
| `chat` | AI chat assistant (Italian, WooCommerce context) |

Setup screen and logout are separate overlay flows.

---

## Key Function Groups

| Category | Key Functions |
|----------|--------------|
| Setup/Auth | `doSetup()`, `doLogout()`, `loadConfig()` |
| API | `woo()`, `wooPromise()`, `aiCall()` |
| Camera/Scanner | `startCamera()`, `stopCamera()`, `onPhoto()`, `onBarcodeFound()` |
| Scan-Add workflow | `analyzeImg()`, `publishProduct()`, `goStep()`, `resetScan()` |
| Size management | `initSizes()`, `setSzType()`, `toggleSz()`, `removeSz()`, `updateStockTable()` |
| Selling | `onSellScan()`, `populateSell()`, `deduct()`, `deductSimple()` |
| Inventory | `loadInventory()`, `renderInv()`, `filterInv()`, `quickDeduct()`, `loadLowStock()` |
| Orders | `loadOrders()`, `updOrder()` |
| Chat | `chatSend()`, `addChatMsg()`, `addThinking()` |
| UI helpers | `go()`, `notify()`, `showOv()`, `hideOv()`, `buildSummary()` |

---

## Design System

**CSS custom properties (design tokens):**

```css
--bg:   #07070e   /* Dark background */
--acc:  #00e5a0   /* Teal accent (primary actions) */
--acc2: #7c3aff   /* Purple accent */
--acc3: #ff6535   /* Orange accent */
--err:  #ff4d6d   /* Error red */
--warn: #ffd60a   /* Warning yellow */
```

**Reusable CSS classes:**
- `.btn-acc`, `.btn-ghost`, `.btn-danger` — buttons
- `.card`, `.panel` — containers
- `.flow-steps`, `.step-panel` — multi-step workflow
- `.size-chip`, `.sz-chip` — size selector chips
- `.cmsg` — chat bubbles
- `.notif` — toast notifications
- `.overlay` — loading spinner

**Responsive breakpoint:** `≤768px` activates mobile layout (collapsible sidebar, bottom nav).

---

## Conventions & Coding Style

- **ES5/ES6 mix** — `var` for globals, `const`/`let` acceptable inside functions.
- **No classes** — plain functions only, no OOP patterns.
- **DOM manipulation** — direct `getElementById`, `innerHTML`, `classList` — no virtual DOM.
- **Callbacks vs Promises** — `woo()` uses callbacks; `wooPromise()` and `aiCall()` use Promises. Prefer Promises for new code.
- **Error handling** — surface errors via `notify(message, 'error')` toast; log details with `console.error`.
- **Italian UI strings** — all user-visible text must remain in Italian.
- **Comments** — English or Italian are both acceptable for code comments.
- **No external files** — add new code inside `index.html`; keep the single-file structure.

---

## Security Considerations

- WooCommerce API credentials and the Anthropic API key are stored **in plaintext in `localStorage`**. This is by design for a single-user local tool, but be aware of XSS risks.
- All API calls are made **client-side** — the API keys are visible in browser DevTools network tab.
- The CORS proxy fallback (`corsproxy.io`) sends the Anthropic API key through a third-party service — only used as a last resort.
- Do **not** add server-side components or change the security model without discussing with the maintainer.

---

## Browser Requirements

| API | Used for |
|-----|---------|
| `localStorage` | Config persistence |
| `MediaDevices` / `getUserMedia` | Camera access for scanning |
| `FileReader` | Photo upload handling |
| `fetch` | All HTTP requests |
| `Canvas` | Barcode detection |
| ES6 (Promise, arrow functions, template literals) | General logic |

Target browsers: Chrome, Firefox, Safari, Edge (all modern versions).

---

## Git Workflow

- **Main branch:** `main`
- **Development:** feature branches named `claude/<description>-<id>`
- No CI/CD, no linting, no pre-commit hooks are configured.
- Commits should be descriptive; keep changes focused.

---

## Testing Checklist

There is no automated test suite. Manual verification steps:

- [ ] Setup form saves credentials and loads main UI
- [ ] Barcode scanning works via camera
- [ ] Photo upload accepted (JPEG/PNG)
- [ ] AI label analysis returns structured product data
- [ ] Product publishes to WooCommerce as simple or variable product
- [ ] Selling flow deducts stock per size correctly
- [ ] Inventory panel loads and filters products
- [ ] Low-stock panel shows correct alerts
- [ ] Orders panel loads pending orders and allows status update
- [ ] Chat responds in Italian
- [ ] Mobile layout renders correctly at ≤768px viewport
- [ ] Logout clears credentials and returns to setup screen
