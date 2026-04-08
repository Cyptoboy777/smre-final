import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { isWalletAddress } from '@/lib/crypto-dashboard';
import { getErrorMessage } from '@/lib/crypto-dashboard';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address')?.trim();

    if (!address || !isWalletAddress(address)) {
        return NextResponse.json({ success: false, error: 'Invalid wallet address' }, { status: 400 });
    }

    try {
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const balanceWei = await provider.getBalance(address);
        const ethBalance = ethers.formatEther(balanceWei);

        return NextResponse.json({
            success: true,
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
