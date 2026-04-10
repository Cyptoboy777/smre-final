/**
 * Groq LLM client — SERVER-ONLY
 *
 * All inference calls go through this module. The GROQ_API_KEY is only ever
 * read here, never on the client. Import only from src/app/api/analyze/route.ts.
 */
import 'server-only';

import Groq from 'groq-sdk';
import type { AnalysisSnapshot } from '@/types/groq';
import type { MarketPulseItem } from '@/types/sodex';
import type { NewsItem } from '@/types/market';
import { isWalletAddress } from '@/lib/crypto/formatters';

// ─── Singleton client ──────────────────────────────────────────────────────────

let _groqClient: Groq | null = null;

const getGroqClient = (): Groq => {
    if (!_groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey?.trim()) {
            throw new Error('GROQ_API_KEY is not configured');
        }
        _groqClient = new Groq({ apiKey });
    }
    return _groqClient;
};

// ─── Analysis ─────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are SMRE (Systematic Market Risk Engine), the Institutional Intelligence core of SoSo.
You provide concise, high-signal analysis for professional crypto traders.
Your responses are direct, data-driven, and formatted for a command-center dashboard.
Never use disclaimers. Never say "please note". Be terse and authoritative.
Always return a JSON object matching the exact schema requested.`;

const buildAnalysisPrompt = (
    query: string,
    contextNews: NewsItem[],
    contextMarket: MarketPulseItem[]
) => {
    const newsContext = contextNews
        .slice(0, 5)
        .map((n) => `- ${n.title} [${n.source.title}]`)
        .join('\n');

    const marketContext = contextMarket
        .slice(0, 5)
        .map((m) => `- ${m.symbol}: ${m.price} (${m.change})`)
        .join('\n');

    const queryType = isWalletAddress(query) ? 'WALLET ADDRESS' : 'TOKEN SYMBOL';

    return `Analyze the following ${queryType}: ${query}

Recent market context:
${marketContext || 'No market data available'}

Recent news context:
${newsContext || 'No news available'}

Return a JSON object with EXACTLY this structure (no markdown, raw JSON only):
{
  "type": "token" | "wallet",
  "symbol": "<ticker or null>",
  "name": "<full name or null>",
  "address": "<0x address if wallet, else null>",
  "price": "<USD price string or null>",
  "change": "<24h change like +1.23% or null>",
  "isSodexVerified": <true | false>,
  "sosoRating": "<BUY | HOLD | SELL | NEUTRAL | HIGH_RISK>",
  "analysis": "<2-4 sentence institutional-grade analysis>",
  "security": {
    "isSafe": <true | false>,
    "status_text": "<one sentence security assessment>",
    "buy_tax": "<percent or null>",
    "sell_tax": "<percent or null>",
    "flags": ["<flag1>", "<flag2>"]
  }
}`;
};

// ─── Public API ────────────────────────────────────────────────────────────────

export type RunAnalysisInput = {
    query: string;
    news?: NewsItem[];
    market?: MarketPulseItem[];
};

export const runGroqAnalysis = async ({
    query,
    news = [],
    market = [],
}: RunAnalysisInput): Promise<AnalysisSnapshot> => {
    const client = getGroqClient();

    const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildAnalysisPrompt(query, news, market) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1024,
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';

    let parsed: Partial<AnalysisSnapshot>;
    try {
        parsed = JSON.parse(raw) as Partial<AnalysisSnapshot>;
    } catch {
        throw new Error('Groq returned malformed JSON');
    }

    return {
        type: parsed.type ?? (isWalletAddress(query) ? 'wallet' : 'token'),
        symbol: parsed.symbol ?? query.toUpperCase(),
        name: parsed.name,
        address: parsed.address,
        price: parsed.price,
        change: parsed.change,
        isSodexVerified: parsed.isSodexVerified ?? false,
        sosoRating: parsed.sosoRating ?? 'NEUTRAL',
        analysis: parsed.analysis ?? 'Analysis unavailable.',
        security: parsed.security ?? {
            isSafe: true,
            status_text: 'No security data available.',
            flags: [],
        },
        news,
        market,
        source: 'groq',
        updatedAt: new Date().toISOString(),
    };
};
