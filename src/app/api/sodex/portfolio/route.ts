import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/crypto-dashboard';
import { fetchSodexPortfolio } from '@/lib/server/sodex';

export async function GET() {
    try {
        const portfolio = await fetchSodexPortfolio();

        return NextResponse.json({
            success: true,
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
