import { AppShell } from "@/components/layout/AppShell";
import { DashboardGrid } from "@/components/layout/DashboardGrid";
import { MarketPulseScaffold } from "@/components/widgets/MarketPulseScaffold";
import { NewsStreamScaffold } from "@/components/widgets/NewsStreamScaffold";
import { PortfolioVaultScaffold } from "@/components/widgets/PortfolioVaultScaffold";
import { QuantIntelligence } from "@/components/widgets/QuantIntelligence";
import { SecurityRadarScaffold } from "@/components/widgets/SecurityRadarScaffold";
import { Terminal } from "@/components/widgets/Terminal";

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardGrid
        left={
          <>
            <MarketPulseScaffold />
            <NewsStreamScaffold />
          </>
        }
        center={
          <>
            <QuantIntelligence />
            <div className="grid gap-4 xl:grid-cols-2">
              <SecurityRadarScaffold />
              <PortfolioVaultScaffold />
            </div>
          </>
        }
        right={<Terminal />}
      />
    </AppShell>
  );
}
