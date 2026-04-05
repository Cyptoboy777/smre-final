import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
    try {
        const apiKey = process.env.BINANCE_TESTNET_API_KEY;
        const apiSecret = process.env.BINANCE_TESTNET_SECRET_KEY;

        if (!apiKey || !apiSecret) {
            return NextResponse.json({ error: "Binance API keys missing in .env" }, { status: 400 });
        }

        // Testnet Base URL
        const baseUrl = 'https://testnet.binance.vision';
        const endpoint = '/api/v3/account';

        // 1. Create Timestamp (Binance requires this for security)
        const timestamp = Date.now();
        const queryString = `timestamp=${timestamp}`;

        // 2. Generate HMAC SHA256 Signature using Secret Key
        const signature = crypto
            .createHmac('sha256', apiSecret)
            .update(queryString)
            .digest('hex');

        // 3. Final URL with query and signature
        const url = `${baseUrl}${endpoint}?${queryString}&signature=${signature}`;

        // 4. Fetch data from Binance
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-MBX-APIKEY': apiKey,
            },
        });

        const data = await response.json();

        // If Binance returns an error
        if (!response.ok) {
            return NextResponse.json({ error: data.msg || "Failed to fetch from Binance" }, { status: response.status });
        }

        // Filter out balances that are 0 to make the response cleaner
        const activeBalances = data.balances.filter((coin: any) => parseFloat(coin.free) > 0 || parseFloat(coin.locked) > 0);

        return NextResponse.json({
            success: true,
            accountType: data.accountType,
            balances: activeBalances
        });

    } catch (error) {
        console.error("SMRE Binance API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
