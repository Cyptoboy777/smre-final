import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/crypto-dashboard';
import { fetchCryptoPanicNews } from '@/lib/server/crypto-apis';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim() || undefined;

    try {
        const items = await fetchCryptoPanicNews(query);
        return NextResponse.json({
            success: true,
            items,
            source: 'cryptopanic',
        });
    } catch (error) {
        return NextResponse.json({
            success: true,
            items: [],
            source: 'cryptopanic',
            warning: getErrorMessage(error),
        });
    }
}
