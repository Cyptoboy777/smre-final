import { NextResponse } from 'next/server';
import { getErrorMessage, normalizeNumericString } from '@/lib/crypto-dashboard';
import { placeSodexPerpsOrder } from '@/lib/server/sodex';

type TradeBody = {
    symbol?: string;
    amount?: number;
    direction?: 'LONG' | 'SHORT';
};

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as TradeBody;
        const symbol = typeof body.symbol === 'string' && body.symbol.trim() ? body.symbol.trim().toUpperCase() : '';
        const amount = Number(body.amount ?? 0);
        const direction = body.direction === 'SHORT' ? 'SHORT' : 'LONG';

        if (!symbol) {
            return NextResponse.json({ success: false, error: 'Symbol is required' }, { status: 400 });
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return NextResponse.json({ success: false, error: 'Quantity must be greater than zero' }, { status: 400 });
        }

        const result = await placeSodexPerpsOrder({
            symbol,
            quantity: normalizeNumericString(amount, 6),
            direction,
        });

        return NextResponse.json({
            success: true,
            result,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: getErrorMessage(error),
            },
            { status: 500 }
        );
    }
}
