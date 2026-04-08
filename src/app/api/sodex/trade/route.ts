import { normalizeNumericString } from '@/lib/crypto-dashboard';
import { getSodexServerAuthMessage, hasSodexServerAuth, placeSodexPerpsOrder } from '@/lib/server/sodex';
import { ensureServerConfiguration, handleRoute, jsonError, jsonSuccess } from '@/lib/server/route-response';

export async function POST(req: Request) {
    return handleRoute(async () => {
        ensureServerConfiguration(hasSodexServerAuth(), getSodexServerAuthMessage() || 'SoDEX server auth is not configured');
        const body = await req.json();
        const { symbol, amount, direction } = body;

        if (!symbol || !amount || !direction) {
            return jsonError('Missing required parameters', 400);
        }

        const result = await placeSodexPerpsOrder({
            symbol: String(symbol),
            quantity: normalizeNumericString(amount, 6),
            direction: direction === 'SHORT' ? 'SHORT' : 'LONG',
        });

        return jsonSuccess({
            result,
        });
    });
}
