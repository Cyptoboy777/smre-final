import { NextResponse } from 'next/server';
import { getErrorMessage, normalizeNumericString } from '@/lib/crypto-dashboard';
import { placeSodexPerpsOrder } from '@/lib/server/sodex';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { symbol, amount, direction } = body;

        if (!symbol || !amount || !direction) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const result = await placeSodexPerpsOrder({
            symbol: String(symbol),
            quantity: normalizeNumericString(amount, 6),
            direction: direction === 'SHORT' ? 'SHORT' : 'LONG',
        });

        return NextResponse.json({
            success: true,
            result,
        });

    } catch (error: any) {
        return NextResponse.json({ error: getErrorMessage(error) || "Failed to execute SoDEX order" }, { status: 500 });
    }
}
