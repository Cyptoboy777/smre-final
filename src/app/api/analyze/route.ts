import { isWalletAddress } from '@/lib/crypto-dashboard';
import { safeBuildTokenAnalysis, safeBuildWalletAnalysis } from '@/lib/server/crypto-apis';
import { handleRoute, jsonError, jsonSuccess } from '@/lib/server/route-response';

export async function GET(request: Request) {
    return handleRoute(async () => {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query')?.trim();

        if (!query) {
            return jsonError('Query required', 400);
        }

        const analysis = isWalletAddress(query)
            ? await safeBuildWalletAnalysis(query)
            : await safeBuildTokenAnalysis(query);

        return jsonSuccess(analysis);
    });
}
