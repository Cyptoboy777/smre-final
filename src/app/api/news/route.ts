import { fetchCryptoPanicNews } from '@/lib/server/crypto-apis';
import { handleRoute, jsonSuccess } from '@/lib/server/route-response';

export async function GET(request: Request) {
    return handleRoute(async () => {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query')?.trim() || undefined;
        const items = await fetchCryptoPanicNews(query);

        return jsonSuccess({
            items,
            source: 'cryptopanic',
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    });
}
