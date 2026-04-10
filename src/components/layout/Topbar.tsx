import { Cpu, ShieldCheck } from "lucide-react";
import { APP_NAME, APP_SUBTITLE } from "@/config/app";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function Topbar() {
  return (
    <header className="flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          <Cpu className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold tracking-tight text-white">{APP_NAME}</p>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">{APP_SUBTITLE}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status="connecting" label="Sodex realtime pending" />
        <StatusBadge status="idle" label="Groq routes server-only" />
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
          <ShieldCheck className="h-4 w-4" />
          Secrets confined to route handlers
        </div>
      </div>
    </header>
  );
}
