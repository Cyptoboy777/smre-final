import 'server-only';

import { createHash } from 'crypto';
import { Groq } from 'groq-sdk';
import { ethers } from 'ethers';
import {
    type AnalysisSnapshot,
    type NewsItem,
    type SecuritySnapshot,
    formatUSD,
    formatSignedPercent,
    getErrorMessage,
    isWalletAddress,
} from '@/lib/crypto-dashboard';
import { fetchSodexTickers } from '@/lib/server/sodex';

type GoPlusAccessTokenResponse = {
    access_token?: string;
    accessToken?: string;
    token?: string;
    result?: {
        access_token?: string;
        accessToken?: string;
        token?: string;
        expires_in?: number;
        expire_in?: number;
    };
    expires_in?: number;
    expire_in?: number;
};

type DexPair = {
    baseToken?: { symbol?: string; name?: string; address?: string };
    priceUsd?: string;
    priceChange?: { h24?: number | string };
    liquidity?: { usd?: number | string };
    volume?: { h24?: number | string };
    chainId?: string;
    pairAddress?: string;
};

type DexSearchResponse = {
    pairs?: DexPair[];
};

type CryptoPanicResponse = {
    results?: Array<{
        title?: string;
        url?: string;
        published_at?: string;
        source?: { title?: string };
        currencies?: Array<{ code?: string }>;
    }>;
};

type GoPlusTokenSecurityResponse = {
    result?: Record<string, any>;
};

type GoPlusAddressSecurityResponse = {
    result?: Record<string, any> | any;
};

let goplusTokenCache: {
    token: string;
    expiresAt: number;
} | null = null;

const requiredEnv = (name: string) => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`${name} is not configured`);
    }

    return value;
};

const safeJsonFetch = async <T>(url: string, init: RequestInit = {}): Promise<T> => {
    const response = await fetch(url, { cache: 'no-store', ...init });
    const text = await response.text();
    const json = text ? (JSON.parse(text) as T) : ({} as T);

    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }

    return json;
};

const getDexBaseUrl = () => requiredEnv('NEXT_PUBLIC_DEXSCREENER_API_URL').replace(/\/+$/, '');

const getGoPlusAccessToken = async () => {
    const appKey = requiredEnv('GOPLUS_APP_KEY');
    const appSecret = requiredEnv('GOPLUS_APP_SECRET');

    const cached = goplusTokenCache;
    if (cached && cached.expiresAt > Date.now()) {
        return cached.token;
    }

    const time = Math.floor(Date.now() / 1000);
    const sign = createHash('sha1').update(`${appKey}${time}${appSecret}`).digest('hex');

    const tokenResponse = await safeJsonFetch<GoPlusAccessTokenResponse>('https://api.gopluslabs.io/api/v1/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            app_key: appKey,
            sign,
            time,
        }),
    });

    const token =
        tokenResponse?.access_token ||
        tokenResponse?.accessToken ||
        tokenResponse?.token ||
        tokenResponse?.result?.access_token ||
        tokenResponse?.result?.accessToken ||
        tokenResponse?.result?.token ||
        null;

    if (!token) {
        throw new Error('GoPlus access token request failed');
    }

    const expiresIn =
        tokenResponse?.expires_in ||
        tokenResponse?.expire_in ||
        tokenResponse?.result?.expires_in ||
        tokenResponse?.result?.expire_in ||
        3600;

    goplusTokenCache = {
        token,
        expiresAt: Date.now() + Math.max(60, expiresIn - 60) * 1000,
    };

    return token;
};

const fetchGoPlusJson = async <T>(url: string) => {
    const token = await getGoPlusAccessToken();
    return safeJsonFetch<T>(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

const pickBestPair = (pairs: DexPair[] | undefined) => {
    if (!pairs?.length) {
        return null;
    }

    return [...pairs].sort((a, b) => {
        const liquidityA = Number(a.liquidity?.usd ?? 0);
        const liquidityB = Number(b.liquidity?.usd ?? 0);
        const volumeA = Number(a.volume?.h24 ?? 0);
        const volumeB = Number(b.volume?.h24 ?? 0);

        return liquidityB - liquidityA || volumeB - volumeA;
    })[0] ?? null;
};

export const fetchCryptoPanicNews = async (query?: string): Promise<NewsItem[]> => {
    const apiKey = requiredEnv('CRYPTOPANIC_API_KEY');

    const params = new URLSearchParams({
        auth_token: apiKey,
        kind: 'news',
        public: 'true',
    });

    if (query && !isWalletAddress(query)) {
        params.set('currencies', query.toUpperCase());
    }

    const data = await safeJsonFetch<CryptoPanicResponse>(
        `https://cryptopanic.com/api/v1/posts/?${params.toString()}`
    );

    const items = data?.results?.slice(0, 8).map((item) => ({
        title: item.title || 'Market update unavailable',
        source: { title: item.source?.title || 'CryptoPanic' },
        currencies: (item.currencies || []).map((currency) => ({
            code: currency.code || 'CRYPTO',
        })),
        url: item.url,
        publishedAt: item.published_at,
    }));

    return items?.length ? items : [];
};

export const fetchTokenSecurity = async (contractAddress: string, chainId: string): Promise<SecuritySnapshot> => {
    const url = `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${contractAddress}`;
    const data = await fetchGoPlusJson<GoPlusTokenSecurityResponse>(url);
    const security = data?.result?.[contractAddress.toLowerCase()];

    if (!security) {
        throw new Error('GoPlus token security data unavailable');
    }

    const honeypot = security.is_honeypot === '1' || security.honeypot === '1';
    const buyTax = security.buy_tax ?? security.buy_tax_rate ?? '0%';
    const sellTax = security.sell_tax ?? security.sell_tax_rate ?? '0%';
    const flags: string[] = [];

    if (honeypot) flags.push('Honeypot detected');
    if (security.can_take_back_ownership === '1') flags.push('Ownership can be reclaimed');
    if (security.hidden_owner === '1') flags.push('Hidden owner detected');
    if (security.is_proxy === '1') flags.push('Proxy contract');

    return {
        isSafe: !honeypot,
        status_text: honeypot ? 'HONEYPOT DETECTED' : 'SECURITY VERIFIED',
        buy_tax: String(buyTax),
        sell_tax: String(sellTax),
        flags,
        address: contractAddress,
    };
};

export const fetchAddressSecurity = async (address: string): Promise<SecuritySnapshot> => {
    const url = `https://api.gopluslabs.io/api/v1/address_security/${address}?chain_id=1`;
    const data = await fetchGoPlusJson<GoPlusAddressSecurityResponse>(url);
    const security = data?.result?.[address.toLowerCase()] ?? data?.result ?? null;

    if (!security) {
        throw new Error('GoPlus address security data unavailable');
    }

    const risky = security.phishing_activities === '1' || security.is_blacklisted === '1';
    const flags: string[] = [];

    if (security.phishing_activities === '1') flags.push('Phishing activity flagged');
    if (security.is_blacklisted === '1') flags.push('Address blacklisted');
    if (security.malicious_mining_activities === '1') flags.push('Malicious mining activity');

    return {
        isSafe: !risky,
        status_text: risky ? 'BLACKLISTED' : 'CLEAN ADDR',
        flags,
        address,
    };
};

const fetchWalletEthBalance = async (address: string) => {
    const provider = new ethers.JsonRpcProvider(requiredEnv('NEXT_PUBLIC_RPC_URL'));
    const balanceWei = await provider.getBalance(address);
    return Number(ethers.formatEther(balanceWei));
};

const resolveDexPair = async (query: string) => {
    const data = await safeJsonFetch<DexSearchResponse>(`${getDexBaseUrl()}/search?q=${encodeURIComponent(query)}`);
    return pickBestPair(data?.pairs);
};

const generateGroqAnalysis = async (prompt: string) => {
    try {
        const groq = new Groq({ apiKey: requiredEnv('GROQ_API_KEY') });
        const completion = await groq.chat.completions.create({
            model: 'llama3-70b-8192',
            temperature: 0.2,
            messages: [{ role: 'user', content: prompt }],
        });

        return {
            text: completion.choices[0]?.message?.content?.trim() || '',
            source: 'groq' as const,
        };
    } catch {
        return {
            text: '',
            source: 'deterministic' as const,
        };
    }
};

const deterministicTokenAnalysis = ({
    symbol,
    name,
    price,
    change,
    security,
    news,
}: {
    symbol: string;
    name: string;
    price: string;
    change: string;
    security: SecuritySnapshot;
    news: NewsItem[];
}) =>
    [
        '## EXECUTIVE SUMMARY',
        `${name} (${symbol}) is trading at ${price} with a 24h move of ${change}.`,
        '',
        '## INSTITUTIONAL WHALE TRACKING',
        `News catalyst count: ${news.length}. Primary risk flags: ${security.flags.length > 0 ? security.flags.join(', ') : 'none detected'}.`,
        '',
        '## BULL VS BEAR CASE',
        security.isSafe
            ? 'Security checks are broadly clean, so the dominant drivers are liquidity, narrative rotation, and execution quality.'
            : 'Security anomalies are present, so aggressive positioning should be avoided until the contract risk profile improves.',
        '',
        '## FINAL CONVICTION RATING (1.0 to 10.0)',
        security.isSafe ? '7.4' : '3.1',
    ].join('\n');

const deterministicWalletAnalysis = ({
    address,
    ethBalance,
    security,
}: {
    address: string;
    ethBalance: number;
    security: SecuritySnapshot;
}) =>
    [
        '## EXECUTIVE SUMMARY',
        `Wallet ${address} currently holds approximately ${ethBalance.toFixed(4)} ETH on Ethereum mainnet.`,
        '',
        '## INSTITUTIONAL WHALE TRACKING',
        `Risk flags detected: ${security.flags.length > 0 ? security.flags.join(', ') : 'none detected'}.`,
        '',
        '## BULL VS BEAR CASE',
        security.isSafe
            ? 'The wallet does not show immediate blacklist or phishing flags, so it is suitable for continued monitoring.'
            : 'The wallet carries serious security warnings and should be treated as hostile or compromised until proven otherwise.',
        '',
        '## FINAL CONVICTION RATING (1.0 to 10.0)',
        security.isSafe ? '6.8' : '1.8',
    ].join('\n');

export const buildTokenAnalysis = async (input: string): Promise<AnalysisSnapshot> => {
    const query = input.toUpperCase();
    const [pair, news, perpsTickers, spotTickers] = await Promise.all([
        resolveDexPair(query),
        fetchCryptoPanicNews(query),
        fetchSodexTickers('perps', `${query}-USD`).catch(() => []),
        fetchSodexTickers('spot', `v${query}_vUSDC`).catch(() => []),
    ]);

    const symbol = pair?.baseToken?.symbol || query;
    const name = pair?.baseToken?.name || query;
    const price =
        pair?.priceUsd
            ? formatUSD(Number(pair.priceUsd))
            : perpsTickers[0]?.price
              ? formatUSD(Number(perpsTickers[0].price.replace(/,/g, '')))
              : 'N/A';
    const changeValue = Number(pair?.priceChange?.h24 ?? Number(perpsTickers[0]?.change?.replace('%', '').replace('+', '') ?? 0));
    const change = formatSignedPercent(Number.isFinite(changeValue) ? changeValue : 0);
    const security =
        pair?.baseToken?.address
            ? await fetchTokenSecurity(
                  pair.baseToken.address,
                  pair.chainId === 'bsc' ? '56' : pair.chainId === 'polygon' ? '137' : '1'
              )
            : {
                  isSafe: true,
                  status_text: 'NO CONTRACT SCAN',
                  flags: ['No contract address resolved for GoPlus scan'],
              };

    const prompt = [
        'You are SoSo-SMRE, an institutional crypto quant analyst.',
        `Token: ${name} (${symbol})`,
        `Current price: ${price}`,
        `24h change: ${change}`,
        `SoDEX verification: ${perpsTickers.length > 0 || spotTickers.length > 0 ? 'verified on SoDEX mainnet' : 'not verified on SoDEX mainnet'}`,
        `Security status: ${security.status_text}`,
        `Security flags: ${security.flags.length > 0 ? security.flags.join(', ') : 'none'}`,
        `News headlines: ${news.map((item) => item.title).join(' | ') || 'none'}`,
        'Return markdown with these exact headers:',
        '## EXECUTIVE SUMMARY',
        '## INSTITUTIONAL WHALE TRACKING',
        '## BULL VS BEAR CASE',
        '## FINAL CONVICTION RATING (1.0 to 10.0)',
    ].join('\n');

    const groq = await generateGroqAnalysis(prompt);
    const analysis = groq.text || deterministicTokenAnalysis({ symbol, name, price, change, security, news });
    const ratingMatch = analysis.match(/FINAL CONVICTION RATING[\s\S]*?(\d+(?:\.\d+)?)/i);

    return {
        type: 'token',
        symbol,
        name,
        price,
        change,
        isSodexVerified: perpsTickers.length > 0 || spotTickers.length > 0,
        sosoRating: ratingMatch?.[1] || (security.isSafe ? '7.4' : '3.1'),
        analysis,
        security,
        news,
        market: [...perpsTickers, ...spotTickers].slice(0, 4),
        source: groq.source,
        updatedAt: new Date().toISOString(),
    };
};

export const buildWalletAnalysis = async (address: string): Promise<AnalysisSnapshot> => {
    const [news, market, security, ethBalance] = await Promise.all([
        fetchCryptoPanicNews(),
        fetchSodexTickers('perps').then((items) => items.slice(0, 4)),
        fetchAddressSecurity(address),
        fetchWalletEthBalance(address),
    ]);

    const prompt = [
        'You are SoSo-SMRE, an institutional crypto quant analyst.',
        `Wallet: ${address}`,
        `Mainnet ETH balance: ${ethBalance.toFixed(4)} ETH`,
        `Security status: ${security.status_text}`,
        `Security flags: ${security.flags.length > 0 ? security.flags.join(', ') : 'none'}`,
        `Macro market context: ${market.map((item) => `${item.symbol} ${item.change}`).join(' | ')}`,
        'Return markdown with these exact headers:',
        '## EXECUTIVE SUMMARY',
        '## INSTITUTIONAL WHALE TRACKING',
        '## BULL VS BEAR CASE',
        '## FINAL CONVICTION RATING (1.0 to 10.0)',
    ].join('\n');

    const groq = await generateGroqAnalysis(prompt);
    const analysis = groq.text || deterministicWalletAnalysis({ address, ethBalance, security });
    const ratingMatch = analysis.match(/FINAL CONVICTION RATING[\s\S]*?(\d+(?:\.\d+)?)/i);

    return {
        type: 'wallet',
        address,
        isSodexVerified: false,
        sosoRating: ratingMatch?.[1] || (security.isSafe ? '6.8' : '1.8'),
        analysis,
        security,
        news,
        market,
        source: groq.source,
        updatedAt: new Date().toISOString(),
    };
};

export const safeBuildTokenAnalysis = async (query: string) => {
    try {
        return await buildTokenAnalysis(query);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const safeBuildWalletAnalysis = async (query: string) => {
    try {
        return await buildWalletAnalysis(query);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};
