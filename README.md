# 🌿 Serenity - AI Empathy Assistant & Mindfulness Sanctuary

> **Product Version:** 2.5 (App Store, Google Play & Gumroad Ready)
> **Tech Stack:** React 18, Vite, Tailwind CSS, Lucide Icons, HuggingFace Inference API (Gemma-2-9B & Mistral 7B)

---

## 🚀 Quick-Start Guide

Welcome to **Serenity**, an AI-powered empathy practice engine and personal reflection sanctuary designed for mindful communication and emotional clarity.

### 📋 Prerequisites & Requirements

- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm` (v9+) or `yarn` / `pnpm`
- **Modern Web Browser**: Chrome, Safari, Edge, or Firefox (Web Speech API supported for voice features)

---

## 🛠️ Step-by-Step Installation

1. **Unzip Project Files**
   Extract the archive to your workspace directory.

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your HuggingFace API Token (`VITE_HF_API_KEY`) if live Gemma / Mistral neural inference is desired. If no key is provided, Serenity automatically operates using its built-in offline empathetic AI engine.

4. **Launch Local Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build Production Distribution**
   ```bash
   npm run build
   ```
   To test the built production bundle locally:
   ```bash
   npm run preview
   ```

---

## 💳 Gumroad Purchase & Licensing Integration

Users purchase Serenity directly through the Gumroad product page or via the in-app Paywall modal:

1. **Gumroad Product Page**: The buyer completes checkout on Gumroad. Upon successful payment, Gumroad automatically generates a unique `license_key` (e.g. `SERENITY-PRO-839201`).
2. **In-App License Key Verification**:
   - In Serenity's Paywall or Settings screen, the user enters their key into the **Gumroad License Key Verification** input field.
   - Serenity pings Gumroad's official API endpoint (`https://api.gumroad.com/v2/licenses/verify`) with `product_permalink` and `license_key`.
   - Once verified, the user's account tier is immediately upgraded to **Licensed Pro** / **Premium** with full feature access.
3. **Local Test Keys**:
   - `SERENITY-PRO` (Unlocks Licensed Pro status instantly for offline testing)
   - `PREMIUM` (Unlocks Premium status instantly)

---

## 📁 Clean Directory Architecture

```
.
├── src/
│   ├── App.jsx            # Main Serenity React Application & Navigation
│   ├── main.jsx           # Entry point
│   └── index.css          # Tailwind CSS directives & custom scrollbars
├── public/                # Static assets & favicon icons
├── .env.example           # Template for HuggingFace / Gumroad API keys
├── index.html             # Main HTML template with Plus Jakarta Sans font
├── package.json           # Dependencies & build scripts
├── tailwind.config.js     # Custom Serenity color palette & typography
└── README.md              # Quick-Start documentation
```

---

## 🔒 Security & Privacy Standard

Serenity is built on a **Zero-Knowledge Architecture**. All personal reflection notes, mood pulse check-ins, and dialogue entries are encrypted client-side in browser `localStorage`. No personal data is stored on remote servers or used for AI model training.
