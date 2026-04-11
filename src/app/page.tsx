"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardGrid } from "@/components/layout/DashboardGrid";
import MarketPulse from "@/components/widgets/MarketPulse";
import NewsStream from "@/components/widgets/NewsStream";
import PortfolioVault from "@/components/widgets/PortfolioVault";
import { QuantIntelligence } from "@/components/widgets/QuantIntelligence";
import SecurityRadar from "@/components/widgets/SecurityRadar";
import SodexTerminal from "@/components/widgets/SodexTerminal";

export default function DashboardPage() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const handleTickerClick = (ticker: string) => {
    setSelectedTicker(ticker);
  };

  return (
    <AppShell>
      <div className="p-4 md:p-8">
        <DashboardGrid
          left={
            <>
              <MarketPulse />
              <div className="flex-1 min-h-[400px]">
                <NewsStream onTickerClick={handleTickerClick} />
              </div>
            </>
          }
          center={
            <>
              <div className="flex-1 min-h-[500px]">
                <QuantIntelligence />
              </div>
              <div className="grid gap-6 xl:grid-cols-2 shrink-0">
                <SecurityRadar data={null} loading={false} />
                <PortfolioVault />
              </div>
            </>
          }
          right={
            <div className="h-full flex flex-col">
              <SodexTerminal target={selectedTicker ? { symbol: selectedTicker } : null} />
            </div>
          }
        />
      </div>
    </AppShell>
  );
}

