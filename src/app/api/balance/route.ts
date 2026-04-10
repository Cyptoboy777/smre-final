import { ethers } from 'ethers';
import { isWalletAddress } from '@/lib/crypto-dashboard';
import { handleRoute, jsonError, jsonSuccess } from '@/lib/server/route-response';

export async function GET(request: Request) {
    return handleRoute(async () => {
        const { searchParams } = new URL(request.url);
        const address = searchParams.get('address')?.trim();

        if (!address || !isWalletAddress(address)) {
            return jsonError('Invalid wallet address', 400);
        }

        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL?.trim();

        if (!rpcUrl) {
            return jsonError('Key not configured', 500);
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const balanceWei = await provider.getBalance(address);
        const ethBalance = ethers.formatEther(balanceWei);

        return jsonSuccess({
            address,
            balances: [
                {
                    asset: 'ETH',
                    free: ethBalance,
                    locked: '0.0000',
                    total: ethBalance,
                    market: 'spot',
                },
            ],
        });
    });
}
