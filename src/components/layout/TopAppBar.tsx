"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/config/app";

export function TopAppBar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Portfolio", href: "/" },
    { label: "Terminal", href: "#terminal" },
    { label: "AI Deep Dive", href: "#ai" },
    { label: "Radar", href: "#radar" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0b0e11]/60 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-white/5">
      <div className="flex justify-between items-center px-6 md:px-8 h-20 w-full max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#ccff00]" data-icon="hub">hub</span>
          <span className="text-xl font-bold tracking-tighter text-[#ccff00] font-heading uppercase drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]">
            {APP_NAME}
          </span>
        </div>
        
        <nav className="hidden md:flex gap-10 items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-heading text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
                pathname === item.href || (item.href.startsWith("#") && pathname === "/")
                  ? "text-[#ccff00] border-b-2 border-[#ccff00]"
                  : "text-[#a9abaf] hover:text-[#f8f9fe]"
              }`}
            >
              {item.label}
            </Link>
          ))}
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant/20 text-[#ccff00] font-mono text-[10px] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
            0x...4F2A
          </div>
        </nav>
      </div>
    </header>
  );
}
