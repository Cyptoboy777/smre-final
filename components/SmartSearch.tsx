'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface SmartSearchProps {
    onResult: (data: any) => void;
}

export default function SmartSearch({ onResult }: SmartSearchProps) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        onResult(null); // Clear previous result

        try {
            // Call our new Safe API
            const res = await fetch(`/api/analyze?query=${query}`);
            const data = await res.json();

            onResult(data);
        } catch (err) {
            console.error(err);
            setError('Analysis failed. Try another token.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto my-8 relative z-10">
            <motion.form
                onSubmit={handleSearch}
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
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-md transition-all flex items-center justify-center min-w-[120px]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ANALYZE'}
                    </button>
                </div>
            </motion.form>

            {error && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 mt-2 text-center font-mono"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}
