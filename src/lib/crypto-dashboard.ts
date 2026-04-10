/**
 * @deprecated Backward-compat shim. Import from @/types/* and @/lib/crypto/formatters directly.
 */

export type { NewsItem } from '@/types/market';
export type { MarketPulseItem, PortfolioBalance, SodexOrder, PortfolioSnapshot } from '@/types/sodex';
export type { SecuritySnapshot, AnalysisSnapshot } from '@/types/groq';

export {
    isWalletAddress,
    formatUSD,
    formatSignedPercent,
    normalizeNumericString,
    truncateAddress,
    getErrorMessage,
} from '@/lib/crypto/formatters';
