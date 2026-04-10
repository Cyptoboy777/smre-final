import { fetchSodexPortfolio, getSodexServerAuthMessage, hasSodexServerAuth } from '@/lib/server/sodex';
import { ensureServerConfiguration, handleRoute, jsonSuccess } from '@/lib/server/route-response';

export async function GET() {
    return handleRoute(async () => {
        ensureServerConfiguration(hasSodexServerAuth(), getSodexServerAuthMessage() || 'SoDEX server auth is not configured');
        const portfolio = await fetchSodexPortfolio();

        return jsonSuccess(portfolio, {
            headers: {
                'Cache-Control': 'no-store',
            },
        });
    });
}
