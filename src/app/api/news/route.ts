import { jsonSuccess, jsonError, handleRoute } from "@/lib/server/route-response";
import axios from "axios";

export const runtime = "nodejs";

const CRYPTOPANIC_BASE_URL = "https://cryptopanic.com/api/v1/posts/";

export async function GET() {
  return handleRoute(async () => {
    const apiKey = process.env.CRYPTOPANIC_API_KEY;
    
    if (!apiKey) {
      throw new Error("CRYPTOPANIC_API_KEY is missing from server environment.");
    }

    try {
      const response = await axios.get(CRYPTOPANIC_BASE_URL, {
        params: {
          auth_token: apiKey,
          public: true,
          kind: "news",
          filter: "hot",
        },
      });

      // Map CryptoPanic results to NewsItem shape
      const items = (response.data.results || []).map((item: any) => ({
        title: item.title,
        url: item.url,
        published_at: item.published_at,
        source: {
            title: item.source.title,
            domain: item.source.domain
        },
        currencies: (item.currencies || []).map((c: any) => ({
            code: c.code,
            title: c.title
        }))
      }));

      return jsonSuccess({
        items,
        total: items.length,
      });
    } catch (error: any) {
      console.error("[API/News] CryptoPanic fetch failed:", error.message);
      return jsonError("Failed to fetch market intelligence stream.", 502);
    }
  });
}

