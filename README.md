# 🧠 SMRE - Smart Money Research Engine

### *Top-Tier Institutional Crypto Intelligence for Retail Traders*

## 🚨 The Problem
Retail traders are playing a rigged game. They lack the sophisticated data, whale alerts, and risk management tools that institutional investors use daily. They buy tops, panic sell bottoms, and get wrecked by "smart money."

## 💡 The Solution: SMRE v3.0
**SMRE (Smart Money Research Engine)** is an advanced analytics terminal that democratizes institutional-grade intelligence. It combines on-chain data, AI-powered technical analysis, and whale tracking into a single, futuristic interface.

---

## 🚀 Key Features (v3.0 Hackathon Edition)

### 🤖 1. Groq-Powered "Algo-Analyst"
Our custom-built **Deterministic Fallback Engine** paired with **Groq Llama 3 (70B)** ensures ultra-fast, institutional-grade analysis.
- **Ultra-Fast Inference:** Sub-second response times using Groq Cloud.
- **Professional Signals:** Explicit `BUY DIP` / `SELL RALLY` signals with entry/exit zones.
- **Confidence Score:** A dynamic 0-100% reliability score based on volume/trend alignment.

### ⏱️ 2. SoDEX API Integration (Mainnet)
Direct connection to **SoDEX**, the high-performance DEX orderbook.
- **EIP-712 Signing:** Secure, typed transaction signing for automated trading.
- **Mainnet Ready:** Routed through SoDEX Mainnet gateway for immediate execution.
- **Deep Liquidity:** Access institutional-grade orderflow directly from the terminal.

### 🐋 3. Whale Watch & Wallet Profiling
Don't just track price—track the players.
- **Pressure Detection:** Identifies "Buying Pressure" vs "Selling Pressure" using Volume-Liquidity ratios.
- **Wallet Profiler:** Paste any address (`0x...`) to see identity and holdings.

### 🛡️ 4. Dynamic Security Radar
Stop buying honeypots with real-time GoPlus integration.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TailwindCSS (Glassmorphism UI)
- **AI Logic:** Groq Cloud AI (Llama 3 70B) + Custom "Algo-Analyst" Fallback
- **Data Integrations:**
    - **SoDEX API (Mainnet):** Real-time orderbook execution and EIP-712 signing.
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
    ```

3.  **Set Environment Variables:**
    Create a `.env.local` file and add your keys:
    ```env
    GROQ_API_KEY=your_groq_sdk_key
    SODEX_API_PRIVATE_KEY=your_evm_private_key
    ETHERSCAN_API_KEY=your_etherscan_key
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

---

## 🏆 Hackathon Goals
Built to solve the information asymmetry in crypto. SMRE gives the "little guy" the tools to trade like a whale.

*Not Financial Advice. Do Your Own Research.*
