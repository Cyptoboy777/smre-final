import { NextResponse } from 'next/server';
import { isWalletAddress } from '@/lib/crypto-dashboard';
import { safeBuildTokenAnalysis, safeBuildWalletAnalysis } from '@/lib/server/crypto-apis';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim();

    if (!query) {
        return NextResponse.json({ success: false, error: 'Query required' }, { status: 400 });
    }

    try {
        const analysis = isWalletAddress(query)
            ? await safeBuildWalletAnalysis(query)
            : await safeBuildTokenAnalysis(query);

        return NextResponse.json({
            success: true,
            ...analysis,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: typeof error?.message === 'string' ? error.message : 'Analysis request failed',
            },
            { status: 500 }
        );
    }
}
