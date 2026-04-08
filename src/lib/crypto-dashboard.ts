export type NewsItem = {
    title: string;
    source: { title: string };
    currencies: Array<{ code: string }>;
    url?: string;
    publishedAt?: string;
};

export type MarketPulseItem = {
    symbol: string;
    price: string;
    change: string;
    isUp: boolean;
    market: 'spot' | 'perps';
    bidPrice?: string;
    askPrice?: string;
    volume24h?: string;
};

export type PortfolioBalance = {
    asset: string;
    free: string;
    locked: string;
    total: string;
    market: 'spot' | 'perps';
};

export type SodexOrder = {
    id: string;
    symbol: string;
    side: string;
    orderType: string;
    status: string;
    price?: string;
    quantity?: string;
    filled?: string;
    notional?: string;
    createdAt?: number;
    updatedAt?: number;
    market: 'spot' | 'perps';
};

export type PortfolioSnapshot = {
    address: string;
    spotAccountID: number;
    perpsAccountID: number;
    balances: PortfolioBalance[];
    recentOrders: SodexOrder[];
    fetchedAt: string;
};

export type SecuritySnapshot = {
    isSafe: boolean;
    status_text: string;
    buy_tax?: string;
    sell_tax?: string;
    flags: string[];
    address?: string;
};

export type AnalysisSnapshot = {
    type: 'token' | 'wallet';
    symbol?: string;
    name?: string;
    address?: string;
    price?: string;
    change?: string;
    isSodexVerified: boolean;
    sosoRating: string;
    analysis: string;
    security: SecuritySnapshot;
    news: NewsItem[];
    market: MarketPulseItem[];
    source: 'groq' | 'deterministic';
    updatedAt: string;
};

export const isWalletAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value);

export const formatUSD = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);

export const formatSignedPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

export const normalizeNumericString = (value: unknown, decimals = 4) => {
    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
        return '0';
    }

    return numeric.toFixed(decimals);
};

export const truncateAddress = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`;

export const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : 'Unexpected error';
