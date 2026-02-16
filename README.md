# 🧠 SMRE - Smart Money Research Engine

### *Top-Tier Institutional Crypto Intelligence for Retail Traders*

![SMRE Demo](./public/og-image.png) <!-- Add a screenshot if available, or keep as placeholder -->

## 🚨 The Problem
Retail traders are playing a rigged game. They lack the sophisticated data, whale alerts, and risk management tools that institutional investors use daily. They buy tops, panic sell bottoms, and get wrecked by "smart money."

## 💡 The Solution: SMRE v3.0
**SMRE (Smart Money Research Engine)** is an advanced analytics terminal that democratizes institutional-grade intelligence. It combines on-chain data, AI-powered technical analysis, and whale tracking into a single, futuristic interface.

---

## 🚀 Key Features (v3.0 Hackathon Edition)

### 🤖 1. "Algo-Analyst" Engine (Available 24/7)
Our custom-built **Deterministic Fallback Engine** ensures you get expert-level analysis even when AI models are down or rate-limited.
- **Auto-Generated Technicals:** Calculates RSI, MACD, and Momentum instantly.
- **Professional Signals:** Explicit `BUY DIP` / `SELL RALLY` signals with entry/exit zones.
- **Confidence Score:** A dynamic 0-100% reliability score based on volume/trend alignment.

### ⏱️ 2. Multi-Timeframe Intelligence
Unlike basic trackers, SMRE cross-references **5m, 1h, and 6h** timeframes.
- **"Aligned" Signal:** When all timeframes agree (e.g., Bullish), the confidence score boosts automatically.
- **Conflict Detection:** Warns you if short-term action contradicts the long-term trend.

### 🐋 3. Whale Watch & Wallet Profiling
Don't just track price—track the players.
- **Pressure Detection:** Identifies "Buying Pressure" vs "Selling Pressure" using Volume-Liquidity ratios.
- **Wallet Profiler:** Paste any address (`0x...`) to see:
    - **Identity:** (e.g., "Whale", "Scammer", "Fresh Wallet").
    - **Realistic Holdings:** A simulated portfolio of assets (ETH, USDC, PEPE, etc.) based on wallet type.

### 🛡️ 4. Dynamic Security Radar
Stop buying honeypots.
- **Honeypot Check:** Instantly verifies if a token can be sold.
- **Tax Scanner:** Alerts on high Buy/Sell taxes (>5%).
- **Liquidity Health:** Warns if liquidity is too low/unlocked.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TailwindCSS (Glassmorphism UI)
- **AI Logic:** Google Gemini Pro + Custom "Algo-Analyst" Fallback
- **Data Integrations:**
    - **DexScreener API:** Real-time price, volume, liquidity.
    - **GoPlus Security API:** Token safety & honeypot detection.
    - **Etherscan API:** Wallet transaction history.
- **Visualization:** Framer Motion (Animations), Recharts (Data Viz).

---

## ⚡ Getting Started

1.  **Clone the Repo:**
    ```bash
    git clone https://github.com/your-username/smre-project.git
    cd smre-project
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set Environment Variables:**
    Create a `.env.local` file and add your keys:
    ```env
    GEMINI_API_KEY=your_google_ai_key
    ETHERSCAN_API_KEY=your_etherscan_key
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

5.  **Explore:**
    - Open `http://localhost:3000`.
    - Search for **"SOL"**, **"PEPE"**, **"ETH"**.
    - Test the Wallet Profiler with: `0x742d35Cc6634C0532925a3b844Bc09e7595f0bEb`

---

## 🏆 Hackathon Goals
Built to solve the information asymmetry in crypto. SMRE gives the "little guy" the tools to trade like a whale.

*Not Financial Advice. Do Your Own Research.*
