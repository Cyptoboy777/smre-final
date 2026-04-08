import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/crypto-dashboard';
import { fetchSodexPortfolio, getSodexServerAuthMessage, hasSodexServerAuth } from '@/lib/server/sodex';

export async function GET() {
    if (!hasSodexServerAuth()) {
        return NextResponse.json({
            success: true,
            authenticated: false,
            reason: getSodexServerAuthMessage(),
            address: null,
            spotAccountID: null,
            perpsAccountID: null,
            balances: [],
            recentOrders: [],
        });
    }

    try {
        const portfolio = await fetchSodexPortfolio();

        return NextResponse.json({
            success: true,
            authenticated: true,
            ...portfolio,
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
