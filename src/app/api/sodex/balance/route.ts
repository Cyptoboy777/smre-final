import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function GET() {
    try {
        const privateKey = process.env.SODEX_API_PRIVATE_KEY;

        if (!privateKey) {
            return NextResponse.json({ error: "SODEX_API_PRIVATE_KEY missing in .env.local" }, { status: 400 });
        }

        // Derive wallet address from private key
        const wallet = new ethers.Wallet(privateKey);
        const address = wallet.address;

        // In a full production environment with an active RPC for Chain 286623 (ValueChain):
        // const provider = new ethers.JsonRpcProvider('https://rpc.sodex.dev'); 
        // const balanceWei = await provider.getBalance(address);
        // const balanceEth = ethers.formatEther(balanceWei);

        // For now, simulate a rich on-chain portfolio response for the Demo setup
        const simulatedBalances = [
            { asset: 'ETH', free: '10.0000', locked: '0.0000' },
            { asset: 'USDT', free: '25420.50', locked: '1200.00' },
            { asset: 'SODEX', free: '150000.00', locked: '50000.00' },
        ];

        return NextResponse.json({
            success: true,
            address: address, // returning actual address derived from PK
            balances: simulatedBalances
        });

    } catch (error) {
        console.error("SoDEX Balance API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
