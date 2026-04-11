"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNavBar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Portfolio", icon: "account_balance_wallet", href: "/" },
    { label: "Terminal", icon: "terminal", href: "#terminal" },
    { label: "Intelligence", icon: "psychology", href: "#ai" },
    { label: "Radar", icon: "radar", href: "#radar" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center h-20 pb-4 bg-[#0b0e11]/90 backdrop-blur-xl border-t border-white/5 shadow-2xl">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href.startsWith("#") && pathname === "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-all ${
              isActive
                ? "text-[#ccff00] bg-[#ccff00]/10 rounded-lg shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                : "text-[#a9abaf] hover:text-[#f8f9fe]"
            }`}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="font-heading text-[10px] uppercase font-bold tracking-widest mt-1">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
