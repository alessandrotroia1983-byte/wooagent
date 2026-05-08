# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

WooAgent is a **single-file, zero-build browser app** (`index.html`) for managing a WooCommerce store. It runs entirely client-side — no server, no build step, no npm. Open the file directly in a browser or serve it statically.

## Running the App

```bash
# Serve locally (any of these work)
python3 -m http.server 8080
npx serve .
```

No build, no install. Changes to `index.html` are reflected on next browser refresh.

## Architecture

The entire application lives in `index.html` (~1400 lines), structured in three contiguous sections:

1. **CSS** (`<style>`) — design tokens as CSS custom properties (`--bg`, `--acc`, `--brd`, etc.), component styles, mobile breakpoint at 768px.
2. **HTML** — static panel markup. Panels are toggled visible with CSS (`display:none/flex`). Panels: `scan-add`, `scan-sell`, `delete-product`, `inventory`, `low-stock`, `orders`, `chat`.
3. **JavaScript** (`<script>`) — vanilla JS, no framework. Sections map to features and are separated by `// COMMENT` headers.

### Global State

```js
var CFG = {};          // WooCommerce URL + keys + Claude API key; persisted to localStorage
var scan = { ... };    // Mutable object tracking the multi-step product creation wizard
var invProducts = [];  // Cached inventory fetched from WooCommerce
var chatHistory = [];  // AI chat history (currently unused in API calls; stateless)
```

### Two Core API Wrappers

- `woo(endpoint, method, body, cb)` — callback-style WooCommerce REST API (`/wp-json/wc/v3/`), Basic Auth with `CFG.key:CFG.secret`.
- `wooPromise(endpoint, method, body)` — Promise wrapper around `woo()`, used for chained calls (e.g. create product then create variations).
- `aiCall(systemPrompt, userMsg, imageB64, cb)` — calls `claude-sonnet-4-20250514` directly from the browser. Falls back to `corsproxy.io` if direct call fails due to CORS.

### Product Creation Flow

The "Scansiona e Aggiungi" panel is a 4-step wizard (Barcode → Image → Sizes → Publish) driven by `goStep(n)`. State accumulates in the `scan` object across steps. `publishProduct()` creates a WooCommerce variable product then fires parallel `Promise.all()` to create one variation per size.

### AI Usage Pattern

All AI calls return JSON. Prompts explicitly instruct Claude to respond with `ONLY valid JSON`. The response is parsed after stripping markdown fences:
```js
JSON.parse(res.replace(/```json|```/g, '').trim())
```

The hardcoded model is `claude-sonnet-4-20250514` in `aiCall()`. Update this string to change the model.

## Key Conventions

- **Language**: UI labels and AI system prompts are in Italian.
- **CSS tokens**: All colors, radii, and fonts are CSS custom properties on `:root`. Never hardcode colors — use the existing variables (`--acc` for green, `--err` for red, `--warn` for yellow, etc.).
- **No modules**: Everything is global. Functions are called directly from inline `onclick=` attributes in HTML.
- **CORS**: The Anthropic API is called directly from the browser. This works on GitHub Pages and some servers, but localhost may hit CORS restrictions — the `corsproxy.io` fallback handles this.
- **Stock logic**: "Low stock" threshold is hardcoded at `<= 3` units (`loadLowStock()` and inventory card color classes). Inventory only loads the first 50 products (`per_page=50`).

## External Dependencies (CDN only)

- `html5-qrcode@2.3.8` — live camera barcode scanning
- Google Fonts: Syne (headings) + DM Mono (body/code)
- `corsproxy.io` — CORS proxy fallback for Anthropic API calls
