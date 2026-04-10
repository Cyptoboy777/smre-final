import { Panel } from "@/components/ui/Panel";

const securityItems = [
  "SODEX_API_PRIVATE_KEY is server-only",
  "GROQ_API_KEY is server-only",
  "No client-side env fallbacks allowed",
];

export function SecurityRadarScaffold() {
  return (
    <Panel title="Security Radar" eyebrow="Widget / Policy">
      <div className="space-y-2 text-sm text-white/75">
        {securityItems.map((item) => (
          <div key={item} className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2">
            {item}
          </div>
        ))}
      </div>
    </Panel>
  );
}
