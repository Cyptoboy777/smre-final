import { normalizeNumericString } from '@/lib/crypto-dashboard';
import { getSodexServerAuthMessage, hasSodexServerAuth, placeSodexPerpsOrder } from '@/lib/server/sodex';
import { ensureServerConfiguration, handleRoute, jsonError, jsonSuccess } from '@/lib/server/route-response';

type TradeBody = {
    symbol?: string;
    amount?: number;
    direction?: 'LONG' | 'SHORT';
};

export async function POST(request: Request) {
    return handleRoute(async () => {
        ensureServerConfiguration(hasSodexServerAuth(), getSodexServerAuthMessage() || 'SoDEX server auth is not configured');

        const body = (await request.json()) as TradeBody;
        const symbol = typeof body.symbol === 'string' && body.symbol.trim() ? body.symbol.trim().toUpperCase() : '';
        const amount = Number(body.amount ?? 0);
        const direction = body.direction === 'SHORT' ? 'SHORT' : 'LONG';

        if (!symbol) {
            return jsonError('Symbol is required', 400);
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return jsonError('Quantity must be greater than zero', 400);
        }

        const result = await placeSodexPerpsOrder({
            symbol,
            quantity: normalizeNumericString(amount, 6),
            direction,
        });

        return jsonSuccess({
            result,
        });
    });
}
