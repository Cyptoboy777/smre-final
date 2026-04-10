import { FEATURE_FLAGS } from "@/config/feature-flags";
import { Panel } from "@/components/ui/Panel";

const scaffoldRows = [
  { symbol: "BTC", status: "REST route staged" },
  { symbol: "ETH", status: "SWR key reserved" },
  { symbol: "SOL", status: "Rate-limit safe fetch plan" },
];

export function MarketPulseScaffold() {
  return (
    <Panel title="Market Pulse" eyebrow="Widget / SWR">
      <div className="space-y-3">
        <p className="text-sm leading-6 text-white/70">
          REST market snapshots will flow through SWR wrappers once the Sodex server client is wired.
        </p>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-[0.25em] text-white/45">
            Feature flag: {FEATURE_FLAGS.enableSodexRest ? "enabled" : "disabled"}
          </p>
        </div>
        <div className="space-y-2">
          {scaffoldRows.map((row) => (
            <div
              key={row.symbol}
              className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-2 text-sm"
            >
              <span className="font-medium text-white">{row.symbol}</span>
              <span className="text-white/55">{row.status}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
