import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="grid flex-1 gap-4 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-[32rem]" />
      </div>
      <div className="space-y-4 lg:col-span-6">
        <Skeleton className="h-[28rem]" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
      <div className="space-y-4 lg:col-span-3">
        <Skeleton className="h-[44rem]" />
      </div>
    </div>
  );
}
