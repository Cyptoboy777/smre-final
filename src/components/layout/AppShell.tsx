"use client";

import type { ReactNode } from "react";
import { TopAppBar } from "./TopAppBar";
import { BottomNavBar } from "./BottomNavBar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen bg-[#0b0e11] text-[#f8f9fe] selection:bg-[#ccff00] selection:text-black">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-30 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ccff00]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#d277ff]/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 scanline opacity-30" />
      </div>

      <TopAppBar />

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 md:px-8 pb-32 pt-24 min-h-screen">
        {children}
      </main>

      <BottomNavBar />

      <footer className="relative z-10 border-t border-white/5 bg-black/40 py-12 px-8 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ccff00]" data-icon="terminal">terminal</span>
            <span className="text-lg font-bold tracking-widest text-[#ccff00]/60 font-heading uppercase">SOSO-SMRE PROTOCOL</span>
          </div>
          <div className="text-[10px] text-[#737679] uppercase tracking-widest font-sans">
             2024 Kinetic Vault System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

