import type { ReactNode } from "react";

type DashboardGridProps = {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
};

export function DashboardGrid({ left, center, right }: DashboardGridProps) {
  return (
    <div className="grid flex-1 gap-4 lg:grid-cols-12">
      <div className="flex min-h-0 flex-col gap-4 lg:col-span-3">{left}</div>
      <div className="flex min-h-0 flex-col gap-4 lg:col-span-6">{center}</div>
      <div className="flex min-h-0 flex-col gap-4 lg:col-span-3">{right}</div>
    </div>
  );
}
