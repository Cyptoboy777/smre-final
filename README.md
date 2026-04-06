# 🧠 soso-smre - Smart Money Research Engine

**soso-smre** (Smart Money Research Engine) is an advanced analytics terminal that democratizes institutional-grade intelligence. It combines on-chain data, AI-powered technical analysis, and whale tracking into a single, futuristic interface, fully integrated with the **SoDEX Mainnet**.

## 🚀 Vision
The crypto market is designed for institutions. Retails are left to fight over scraps. 
**soso-smre** bridges this gap by providing:
- **Whale tracking** in real-time.
- **Smart automated execution** via SoDEX.
- **Institutional analysis** powered by Groq Llama-3.

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + Framer Motion
- **AI Engine**: Groq SDK (Llama-3 70B & 8B)
- **Market Data**: SoDEX Mainnet API + DexScreener
- **On-Chain**: ethers.js v6
- **Security**: GoPlus API v1 (Public)
- **News**: CryptoPanic News Feed

## 📦 Features
- **SoDEX Portfolio**: View real-time on-chain balances and assets.
- **SoDEX Terminal**: Execute demo trades with valid EIP-712 signing mechanisms.
- **AI Deep Dive**: Multi-source intelligence reports with news sentiment and technical conviction scores.
- **On-Chain Radar**: Visualize security risk factors like honeypots and tax structures.

## ⚙️ Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/soso-smre.git
   cd soso-smre
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.local`:
   ```env
   GROQ_API_KEY=your_key
   SODEX_API_PRIVATE_KEY=your_key
   ETHERSCAN_API_KEY=your_key
   CRYPTOPANIC_API_KEY=your_key
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

## 🔒 Security
All trades in the **SoDEX Terminal** are signed using EIP-712 secure methods. For demo purposes, the system operates in a sandboxed execution context to prevent accidental live-fund loss during development.

---
Built to solve the information asymmetry in crypto. **soso-smre** gives the "little guy" the tools to trade like a whale.
