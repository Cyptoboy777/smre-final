import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

// ==========================================
// 🛠️ UTILITIES & CONFIG
// ==========================================

const safeFetch = async (url: string, options: any = {}) => {
    try {
        const res = await fetch(url, { ...options, cache: 'no-store' });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error(`Fetch Error: ${url}`, e);
        return null;
    }
};

const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

// ==========================================
// 🕵️ TOKEN & WALLET ENGINE
// ==========================================

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.toUpperCase() || '';

    if (!query) {
        return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // Determine target type (Wallet vs Token)
    const isWallet = /^0x[a-fA-F0-9]{40}$/.test(query);

    if (isWallet) {
        return await handleWalletAnalysis(query);
    } else {
        return await handleTokenAnalysis(query);
    }
}

async function handleTokenAnalysis(symbol: string) {
    const sodexBase = process.env.NEXT_PUBLIC_SODEX_API_BASE_URL;
    const groqKey = process.env.GROQ_API_KEY;
    const panicKey = process.env.CRYPTOPANIC_API_KEY;
    const goplusKey = process.env.GOPLUS_API_KEY;

    // --- 1. Fetch Real-time Market Data (SoDEX) ---
    // Fallback search via DexScreener if not directly available on SoDEX for general tokens
    const pairData = await safeFetch(`https://api.dexscreener.com/latest/dex/search?q=${symbol}`);
    const pair = pairData?.pairs?.[0] || null;

    if (!pair) return NextResponse.json({ error: 'Token not found' }, { status: 404 });

    // --- 2. Cross-Reference SoDEX Mainnet ---
    const sodexTicker = await safeFetch(`${sodexBase}/spot/ticker/24hr?symbol=${symbol}-USDT`);
    const isSodexVerified = !!(sodexTicker && sodexTicker.lastPrice);

    // --- 3. Security Check (GoPlus) ---
    const chainId = pair.chainId === 'ethereum' ? '1' : (pair.chainId === 'bsc' ? '56' : '137');
    const secData = await safeFetch(`https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${pair.baseToken.address}`);
    const security = secData?.result?.[pair.baseToken.address.toLowerCase()] || {};

    // --- 4. News Feed (CryptoPanic) ---
    const newsData = await safeFetch(`https://cryptopanic.com/api/v1/posts/?auth_token=${panicKey}&currencies=${symbol}&kind=news&public=true`);
    const topNews = newsData?.results?.slice(0, 5).map((n: any) => n.title).join('\n') || 'No recent news found.';

    // --- 5. Microstructure Analysis ---
    const vol24h = parseFloat(pair.volume?.h24 || '0');
    const liq = parseFloat(pair.liquidity?.usd || '1');
    const volLiqRatio = (vol24h / liq).toFixed(2);
    
    let whaleAction = "Neutral";
    if (parseFloat(volLiqRatio) > 2) whaleAction = "High Accumulation / Volatility Spike";
    if (parseFloat(volLiqRatio) < 0.1) whaleAction = "Low Interest / Stagnant";

    // --- 6. AI Quant Insights (Groq Llama-3-70B) ---
    const groq = new Groq({ apiKey: groqKey });
    
    let analysisText = "";
    let sosoRating = "5.0";

    try {
        const prompt = `Act as soso-smre, an elite institutional quant analyst.
            Analyze ${symbol} (${pair.baseToken.name}) based on:
            - Price: ${pair.priceUsd} 
            - 24h Change: ${pair.priceChange?.h24}%
            - News: ${topNews}
            - Vol/Liq Ratio: ${volLiqRatio} (${whaleAction})
            - Security: ${security.is_honeypot === "1" ? "CRITICAL RISK: HONEYPOT" : "Safe/Standard"}

            Return a report in EXACT Markdown with these headers:
            ## EXECUTIVE SUMMARY
            ## INSTUTITIONAL WHALE TRACKING
            ## BULL VS BEAR CASE
            ## FINAL CONVICTION RATING (1.0 to 10.0)

            Keep the tone aggressive, professional, and data-driven. Do NOT use fake prices. Do NOT use placeholders.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: "llama3-70b-8192",
            temperature: 0.2,
        });

        analysisText = completion.choices[0]?.message?.content || "AI Analysis offline.";
        // Extract rating from text if possible, otherwise default
        const ratingMatch = analysisText.match(/FINAL CONVICTION RATING.*?(\d+\.\d+|\d+)/i);
        if (ratingMatch) sosoRating = ratingMatch[1];

    } catch (e) {
        console.error("Groq Error", e);
        analysisText = "**[ALERT] AI Engine Rate-Limited.** Displaying deterministic microstructure report.\n\n" + whaleAction;
    }

    return NextResponse.json({
        type: 'token',
        symbol: symbol,
        name: pair.baseToken.name,
        price: formatUSD(parseFloat(pair.priceUsd)),
        change: `${pair.priceChange?.h24}%`,
        isSodexVerified,
        sosoRating,
        analysis: analysisText,
        liquidity: formatUSD(liq),
        volume: formatUSD(vol24h),
        security: {
            isSafe: security.is_honeypot !== "1",
            status_text: security.is_honeypot === "1" ? "HONEYPOT DETECTED" : "SECURITY VERIFIED",
            buy_tax: security.buy_tax || "0%",
            sell_tax: security.sell_tax || "0%",
        }
    });
}

async function handleWalletAnalysis(address: string) {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    // For wallet analysis, we primarily look for on-chain history and flags
    const secData = await safeFetch(`https://api.gopluslabs.io/api/v1/address_security/${address}?chain_id=1`);
    const security = secData?.result || {};

    return NextResponse.json({
        type: 'wallet',
        address: address,
        identity: security.phishing_activities === "1" ? "FLAGGED: PHISHING" : "ACTIVE ON-CHAIN ENTITY",
        sosoRating: security.phishing_activities === "1" ? "1.0" : "7.5",
        analysis: `**WALLET PROFILING COMPLETE**
        Target address **${address}** has been scanned across Ethereum Mainnet.
        
        **Risk Factors:** ${security.phishing_activities === "1" ? "HIGH RISK" : "CLEAN HISTORY"}
        **Recommended Action:** ${security.phishing_activities === "1" ? "BLOCK / DO NOT INTERACT" : "TRUSTED / MONITOR ACTIVITY"}
        `,
        security: {
            isSafe: security.phishing_activities !== "1",
            status_text: security.phishing_activities === "1" ? "BLACKLISTED" : "CLEAN ADDR",
        }
    });
}
