import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/crypto-dashboard';
import { fetchSodexTickers } from '@/lib/server/sodex';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const market = searchParams.get('market') === 'spot' ? 'spot' : 'perps';
    const symbol = searchParams.get('symbol')?.trim() || undefined;

    try {
        const items = await fetchSodexTickers(market, symbol);

        return NextResponse.json({
            success: true,
            market,
            items,
        });
    } catch (error) {
        return NextResponse.json({
            success: true,
            market,
            items: [],
            warning: getErrorMessage(error),
        });
    }
}
