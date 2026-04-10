import { Skeleton } from "@/components/ui/skeleton";

export function ActivitySkeleton() {
  return (
    <div className="space-y-12">
      {/* Metrics Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="panel p-6 border-line/60 bg-canvas/50">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-8 w-8 rounded-lg bg-line/20" />
              <Skeleton className="h-4 w-24 bg-line/20" />
            </div>
            <Skeleton className="h-12 w-16 mb-4 bg-line/20" />
            <Skeleton className="h-3 w-full bg-line/20" />
            <Skeleton className="h-3 w-2/3 mt-2 bg-line/20" />
          </div>
        ))}
      </div>

      {/* Timeline Skeleton */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-line hidden md:block" />
        
        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="relative pl-0 md:pl-16">
              <div className="absolute left-4 top-4 h-4 w-4 rounded-full border-4 border-canvas bg-line hidden md:block" />
              <div className="p-8 rounded-[2rem] border border-line bg-canvas/40 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                   <div className="space-y-3 flex-1">
                      <Skeleton className="h-4 w-20 rounded bg-line/20" />
                      <Skeleton className="h-8 w-3/4 rounded-lg bg-line/20" />
                      <div className="flex gap-4 pt-2">
                         <Skeleton className="h-3 w-24 bg-line/20" />
                         <Skeleton className="h-3 w-32 bg-line/20" />
                      </div>
                   </div>
                   <Skeleton className="h-5 w-16 rounded-full bg-line/20" />
                </div>
                <div className="p-4 rounded-xl bg-canvas-depth/30 border border-line/50">
                   <Skeleton className="h-4 w-full mb-2 bg-line/20" />
                   <Skeleton className="h-4 w-5/6 bg-line/20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
