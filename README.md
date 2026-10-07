# HĀNA RUNNER — Digital Product Deployment & Pricing Guide

**HĀNA RUNNER (Engine v2.4 Edge)** is a high-converting, self-contained, offline-first dynamic Shopify storefront template designed specifically for Road to Hana experiences, eco-tourism guides, local rentals, and regional commerce sites.

---

## 📦 What’s Included in the Digital Download Package (`hana-runner-v2.4.zip`)

```
hana-runner-v2.4/
├── index.html                 # Main single-page application (Tailwind CSS, Lucide icons, ES modules)
├── sw.js                      # Offline-first Service Worker for PWA capabilities & offline caching
├── README.md                  # Installation, configuration, and customization documentation
└── assets/                    # Optional local media and icon overrides
```

---

## 💰 Recommended Pricing Strategy

| Tier | Price | Target Audience | Features Included |
| :--- | :--- | :--- | :--- |
| **Standard License** | **$39 USD** | Individual Creators & Single Storeowners | Full source code (`index.html`, `sw.js`), 1 domain license, setup documentation |
| **Developer / Pro License** | **$89 USD** | Agencies, Freelancers & Multi-Site Operators | Unlimited domain usage, client deployment rights, pre-configured Hugging Face WASM AI prompts |
| **Commercial Bundle** | **$149 USD** | Enterprise Tour & Hospitality Platforms | Includes 1-on-1 setup assistance, custom Shopify metafield mapping guide, and priority email support |

---

## 🚀 How to Host & Deploy (Self-Hosted Setup)

### Option 1: Static Web Hosting (Netlify / Vercel / GitHub Pages / Cloudflare Pages)
1. Unzip `hana-runner-v2.4.zip` on your computer.
2. Upload `index.html` and `sw.js` directly to your root directory or drag-and-drop the folder into Netlify/Vercel.
3. Your site is instantly live with full WebAssembly AI support and HTTPS caching enabled!

### Option 2: Custom Web Server (Apache / Nginx / Node.js static)
Ensure your server serves `.js` files with the header `Content-Type: text/javascript`.

```nginx
# Nginx sample configuration
location / {
    root /var/www/hana-runner;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

---

## ⚙️ Platform Configuration (Gumroad / Sellfy Setup)

### Gumroad Setup Steps:
1. **Title**: `HĀNA RUNNER — Edge AI Commerce & Road to Hana Storefront Template (v2.4)`
2. **Category**: `Software / Web Development / Website Templates`
3. **Download File**: Zip archive containing `index.html`, `sw.js`, and `README.md`.
4. **License Key**: Enable Gumroad license key generation to verify purchases.

### Sellfy Setup Steps:
1. Create a **Digital Product**.
2. Set price to **$39** (with an optional launch discount to $29).
3. Upload `hana-runner-v2.4.zip`.
4. Add preview screenshots from the `/verification` directory.

---

## 🌺 Key Features Highlighted for Customers

- ⚡ **Zero Backend Overhead**: Runs 100% in the client browser with zero server costs.
- 🤖 **Edge AI Concierge ("Aunty Hana")**: On-device Hugging Face WASM language model with static offline fallback.
- 🛒 **Dynamic Shopping Cart**: Real-time totals, quantity controls, and optional $2 Mālama ʻĀina eco-donation support.
- 📱 **Offline PWA Ready**: Service Worker pre-caches assets for zero-cell-coverage highway environments.
- 🔧 **Shopify Liquid & Metafield Inspector**: Visual preview of Customer Context GraphQL payloads and Liquid code logic.
