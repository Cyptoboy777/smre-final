import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";

const commandQueue = [
  "Reserve /api/sodex/trade for signed server execution",
  "Reserve lib/server/crypto/eip712-signer.ts for private-key signing",
  "Reserve lib/server/sodex/ws-manager.ts for singleton stream manager",
];

export function Terminal() {
  return (
    <Panel title="Terminal" eyebrow="Widget / Execution Surface" className="flex-1">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="connecting" label="Trade route stubbed" />
          <StatusBadge status="idle" label="Signer deferred" />
        </div>
        <div className="space-y-2 rounded-3xl border border-white/10 bg-black/25 p-4 font-mono text-xs leading-6 text-cyan-100/85">
          {commandQueue.map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
