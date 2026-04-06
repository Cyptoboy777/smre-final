import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// EIP-712 Order Domain & Type
const SODEX_DOMAIN = {
    name: 'SoDEX Mainnet',
    version: '1',
    chainId: 1, // ETH Mainnet Context
    verifyingContract: '0x0000000000000000000000000000000000000000'
};

const ORDER_TYPE = {
    Order: [
        { name: 'symbol', type: 'string' },
        { name: 'amount', type: 'uint256' },
        { name: 'leverage', type: 'uint8' },
        { name: 'isLong', type: 'bool' },
        { name: 'timestamp', type: 'uint256' }
    ]
};

export async function POST(request: Request) {
    const body = await request.json();
    const { symbol, amount, leverage, direction } = body;
    
    const privKey = process.env.SODEX_API_PRIVATE_KEY;

    if (!privKey || privKey === 'your_private_key_here') {
        return NextResponse.json({ 
            success: false, 
            error: 'SODEX Terminal restricted: Private Key not configured in environment.' 
        }, { status: 500 });
    }

    try {
        const wallet = new ethers.Wallet(privKey);
        const timestamp = Math.floor(Date.now() / 1000);
        const amountWei = ethers.parseUnits(amount.toString(), 6); // USDC-style 6 decimals
        
        const leverageInt = parseInt(leverage.replace('x', '')) || 1;

        // Perform EIP-712 Signing (Server-Side Only)
        const signature = await wallet.signTypedData(SODEX_DOMAIN, ORDER_TYPE, {
            symbol: `${symbol}-USDT`,
            amount: amountWei,
            leverage: leverageInt,
            isLong: direction === 'LONG',
            timestamp: BigInt(timestamp)
        });

        // Simulating SoDEX Gateway Persistence
        return NextResponse.json({
            success: true,
            orderID: `SODEX-${Math.random().toString(36).substring(7).toUpperCase()}`,
            signature,
            timestamp,
            signer: wallet.address,
            status: 'OPEN / PLACED'
        });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}
