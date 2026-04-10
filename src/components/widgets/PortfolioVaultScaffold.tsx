import { Panel } from "@/components/ui/Panel";

const checklist = [
  "Server-only balance route reserved at /api/sodex/balance",
  "Portfolio snapshot route reserved at /api/sodex/portfolio",
  "Realtime portfolio listener reserved in hooks/realtime/usePortfolioStream.ts",
];

export function PortfolioVaultScaffold() {
  return (
    <Panel title="Portfolio Vault" eyebrow="Widget / Server Boundaries">
      <div className="space-y-3">
        <p className="text-sm leading-6 text-white/70">
          This panel is intentionally scaffold-only until the server signer and Sodex account APIs are wired.
        </p>
        <ul className="space-y-2 text-sm text-white/75">
          {checklist.map((item) => (
            <li key={item} className="rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
