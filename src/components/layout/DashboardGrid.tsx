import type { ReactNode } from "react";

type DashboardGridProps = {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
};

export function DashboardGrid({ left, center, right }: DashboardGridProps) {
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 w-full max-w-[1800px] mx-auto pb-8 lg:pb-4">
      {/* Left Sidebar: Market & News */}
      <aside className="lg:col-span-3 flex flex-col gap-6 min-h-0">
         {left}
      </aside>

      {/* Main Center: AI Analysis & Portfolio */}
      <main className="lg:col-span-6 flex flex-col gap-6 min-h-0">
         {center}
      </main>

      {/* Right Sidebar: Execution Terminal */}
      <aside className="lg:col-span-3 flex flex-col gap-6 min-h-0">
         {right}
      </aside>
    </div>
  );
}

