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
      <DashboardGrid
        left={
          <>
            <MarketPulse />
            <NewsStream onTickerClick={handleTickerClick} />
          </>
        }
        center={
          <>
            <QuantIntelligence />
            <div className="grid gap-4 xl:grid-cols-2">
              <SecurityRadar data={null} loading={false} />
              <PortfolioVault />
            </div>
          </>
        }
        right={<SodexTerminal target={selectedTicker ? { symbol: selectedTicker } : null} />}
      />
    </AppShell>
  );
}
