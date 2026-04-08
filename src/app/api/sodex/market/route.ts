import { fetchSodexTickers } from '@/lib/server/sodex';
import { handleRoute, jsonSuccess } from '@/lib/server/route-response';

export async function GET(request: Request) {
    return handleRoute(async () => {
        const { searchParams } = new URL(request.url);
        const market = searchParams.get('market') === 'spot' ? 'spot' : 'perps';
        const symbol = searchParams.get('symbol')?.trim() || undefined;
        const items = await fetchSodexTickers(market, symbol);

        return jsonSuccess({
            market,
            items,
            source: 'sodex' as const,
        });
    });
}
