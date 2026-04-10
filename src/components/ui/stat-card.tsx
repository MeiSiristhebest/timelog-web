
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
    label?: string;
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn(
      "p-6 bg-[var(--canvas-elevated)] border border-[var(--line)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          {/* Label: font-bold (not medium) + text-muted (#334155 = 10.7:1 on white) ✓ AAA */}
          <p className="text-sm font-bold text-muted mb-1 truncate">{label}</p>
          {/* Value: Slate 950 = 21:1 ✓ */}
          <h3 className="text-3xl font-bold text-ink tracking-tight">{value}</h3>
          
          {trend && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0",
                trend.isUp 
                  // Emerald 900 on Emerald 50 = 9:1 ✓ AAA
                  ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" 
                  : "bg-canvas-depth text-muted dark:bg-canvas-depth dark:text-muted"
              )}>
                {trend.value}
              </span>
              {trend.label && (
                // text-muted = 10.7:1 on white ✓ AAA
                <span className="text-[10px] text-muted font-bold truncate">{trend.label}</span>
              )}
            </div>
          )}
          
          {description && (
            // Italic description: text-muted (#334155) = 10.7:1 ✓ AAA
            <p className="mt-4 text-xs text-muted font-bold leading-relaxed line-clamp-1 border-l-2 border-accent/40 pl-2">
              {description}
            </p>
          )}
        </div>
        
        {/* Icon container: use semantic tokens, not hardcoded slate */}
        <div className="p-3 rounded-xl bg-canvas-depth border border-line group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors shrink-0 ml-4">
          <Icon className="h-5 w-5 text-muted group-hover:text-accent transition-colors" />
        </div>
      </div>
    </div>
  );
}
