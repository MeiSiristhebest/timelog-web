"use client";

export function StoryCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div 
      className="card block p-5 opacity-60 animate-pulse"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="h-7 w-48 bg-ink/10 rounded-lg" />
          <div className="h-4 w-32 bg-muted/10 rounded-lg" />
        </div>
        <div className="text-right space-y-3">
          <div className="h-6 w-20 bg-accent/10 rounded-full" />
          <div className="h-3 w-16 bg-muted/10 rounded-lg ml-auto" />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="h-4 w-full bg-muted/5 rounded-lg" />
        <div className="h-4 w-3/4 bg-muted/5 rounded-lg" />
      </div>

      <div className="mt-6 flex gap-5">
        <div className="h-3 w-24 bg-muted/10 rounded-lg" />
        <div className="h-3 w-24 bg-muted/10 rounded-lg" />
      </div>
    </div>
  );
}
