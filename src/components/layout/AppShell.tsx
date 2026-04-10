import type { ReactNode } from "react";
import { APP_PHASE } from "@/config/app";
import { Topbar } from "@/components/layout/Topbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-3 py-4 md:px-5 lg:px-6">
      <Topbar />
      <main className="flex flex-1 flex-col py-4">{children}</main>
      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] uppercase tracking-[0.22em] text-white/45">
        <span>Phase: {APP_PHASE}</span>
        <span>Architecture-first scaffold for Vercel deployment</span>
      </footer>
    </div>
  );
}
