import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/crypto-dashboard';
import { fetchSodexOrderHistory, getSodexServerAuthMessage, hasSodexServerAuth } from '@/lib/server/sodex';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const market = searchParams.get('market') === 'spot' ? 'spot' : 'perps';
    const symbol = searchParams.get('symbol')?.trim() || undefined;
    const limit = Number(searchParams.get('limit') ?? 25);

    if (!hasSodexServerAuth()) {
        return NextResponse.json({
            success: true,
            authenticated: false,
            reason: getSodexServerAuthMessage(),
            market,
            orders: [],
        });
    }

    try {
        const orders = await fetchSodexOrderHistory(market, {
            symbol,
            limit: Number.isFinite(limit) ? limit : 25,
        });

        return NextResponse.json({
            success: true,
            authenticated: true,
            market,
            orders,
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
