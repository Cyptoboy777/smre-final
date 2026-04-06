import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

    if (!address || !ethers.isAddress(address)) {
        return NextResponse.json({ success: false, error: 'Invalid wallet address' }, { status: 400 });
    }

    if (!rpcUrl) {
        return NextResponse.json({ success: false, error: 'RPC_URL not configured' }, { status: 500 });
    }

    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const [balanceWei] = await Promise.all([
            provider.getBalance(address),
        ]);

        const ethBalance = ethers.formatEther(balanceWei);
        // Current ETH Price (Static or fetched)
        const ethPrice = 2854.40;

        return NextResponse.json({
            success: true,
            address: address,
            balances: [
                { asset: 'ETH', amount: ethBalance, value: formatUSD(parseFloat(ethBalance) * ethPrice) },
                { asset: 'USDT', amount: '1240.25', value: formatUSD(1240.25) }, // Simulated
                { asset: 'LINK', amount: '45.10', value: formatUSD(45.1 * 18.2) } // Simulated
            ],
            totalValue: formatUSD((parseFloat(ethBalance) * ethPrice) + 1240.25 + (45.1 * 18.2))
        });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}
