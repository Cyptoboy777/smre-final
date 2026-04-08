import { fetchSodexOrderHistory, getSodexServerAuthMessage, hasSodexServerAuth } from '@/lib/server/sodex';
import { ensureServerConfiguration, handleRoute, jsonSuccess } from '@/lib/server/route-response';

export async function GET(request: Request) {
    return handleRoute(async () => {
        const { searchParams } = new URL(request.url);
        const market = searchParams.get('market') === 'spot' ? 'spot' : 'perps';
        const symbol = searchParams.get('symbol')?.trim() || undefined;
        const limit = Number(searchParams.get('limit') ?? 25);

        ensureServerConfiguration(hasSodexServerAuth(), getSodexServerAuthMessage() || 'SoDEX server auth is not configured');

        const orders = await fetchSodexOrderHistory(market, {
            symbol,
            limit: Number.isFinite(limit) ? limit : 25,
        });

        return jsonSuccess({
            market,
            orders,
        });
    });
}
