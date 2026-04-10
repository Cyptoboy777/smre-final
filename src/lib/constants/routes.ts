export const API_ROUTES = {
  health: "/api/health",
  revalidate: "/api/revalidate",
  groq: {
    briefing: "/api/groq/briefing",
    summarize: "/api/groq/summarize",
    quantIntelligence: "/api/groq/quant-intelligence",
  },
  sodex: {
    session: "/api/sodex/session",
    market: "/api/sodex/market",
    portfolio: "/api/sodex/portfolio",
    balance: "/api/sodex/balance",
    orders: "/api/sodex/orders",
    positions: "/api/sodex/positions",
    trade: "/api/sodex/trade",
  },
} as const;
