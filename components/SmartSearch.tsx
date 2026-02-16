'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const SUGGESTIONS = [
    "BTC", "ETH", "SOL", "PEPE", "DOGE", "XRP", "BNB", "ADA", "AVAX", "LINK",
    "DOT", "TRX", "MATIC", "SHIB", "LTC", "UNI", "WBTC", "LEO", "DAI", "ATOM",
    "ETC", "XLM", "BCH", "FIL", "NEAR", "APT", "VET", "MKR", "LDO", "QNT",
    "AAVE", "ALGO", "GRT", "STX", "FTM", "EOS", "SAND", "EGLD", "MANA", "THETA",
    "AXS", "XTZ", "RPL", "SNX", "IMX", "CRV", "NEO", "KLAY", "FLOW", "CHZ",
    "GALA", "KCS", "USDT", "USDC", "WIF", "BONK"
];

interface SmartSearchProps {
    onSearch: (query: string) => void;
    externalLoading: boolean;
    parentQuery: string;
    setParentQuery: (q: string) => void;
}

export default function SmartSearch({ onSearch, externalLoading, parentQuery, setParentQuery }: SmartSearchProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setParentQuery(val);

        if (val.length > 0) {
            const filtered = SUGGESTIONS.filter(s => s.toLowerCase().startsWith(val.toLowerCase()));
            setSuggestions(filtered.slice(0, 8)); // Limit to 8
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSearchCheck = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuggestions(false);
        onSearch(parentQuery);
    };

    const handleSuggestionClick = (s: string) => {
        setParentQuery(s);
        setShowSuggestions(false);
        onSearch(s);
    };

    return (
        <div className="w-full max-w-3xl mx-auto my-8 relative z-50">
            <motion.form
                onSubmit={handleSearchCheck}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative group"
            >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-zinc-900 rounded-lg p-2 border border-zinc-700 shadow-2xl">
                    <Search className="w-6 h-6 text-zinc-400 ml-3" />
                    <input
                        type="text"
                        className="w-full bg-transparent text-white px-4 py-3 focus:outline-none placeholder-zinc-500 font-mono text-lg"
                        placeholder="Search Token (PEPE) or Wallet (0x...)"
                        value={parentQuery}
                        onChange={handleInputChange}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                        onFocus={() => parentQuery && setShowSuggestions(true)}
                    />
                    <button
                        type="submit"
                        disabled={externalLoading}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-md transition-all flex items-center justify-center min-w-[120px]"
                    >
                        {externalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ANALYZE'}
                    </button>
                </div>
            </motion.form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-[100]">
                    {suggestions.map((s, i) => (
                        <div
                            key={i}
                            className="px-4 py-2 hover:bg-zinc-800 cursor-pointer text-zinc-300 font-mono flex items-center justify-between transition-colors"
                            onClick={() => handleSuggestionClick(s)}
                        >
                            <span className="font-bold text-white">{s}</span>
                            <span className="text-xs text-zinc-500">TOKEN</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
