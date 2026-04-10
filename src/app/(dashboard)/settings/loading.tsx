import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui/skeleton";

export default async function SettingsLoading() {
  const t = await getTranslations("Settings");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
         <div>
            <h1 className="text-3xl font-bold text-ink tracking-tight">{t("title")}</h1>
            <p className="text-sm text-muted mt-1">{t("subtitle")}</p>
         </div>
         <Skeleton className="h-6 w-32 rounded-full" />
      </div>

      <div className="space-y-6">
        <div className="flex gap-2 p-1 bg-canvas-depth rounded-lg w-fit border border-line/50">
           <Skeleton className="h-9 w-24 rounded-md" />
           <Skeleton className="h-9 w-24 rounded-md" />
           <Skeleton className="h-9 w-24 rounded-md" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
           <div className="space-y-6">
              <div className="bg-canvas border border-line rounded-2xl p-10 h-[300px]">
                 <Skeleton className="h-6 w-48 mb-8" />
                 <Skeleton className="h-12 w-full mb-6" />
                 <Skeleton className="h-10 w-32" />
              </div>
              <div className="bg-canvas border border-line rounded-2xl p-8 h-[200px]">
                 <Skeleton className="h-6 w-32 mb-6" />
                 <div className="space-y-4">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                 </div>
              </div>
           </div>
           <div className="bg-canvas border border-line rounded-2xl p-6 h-[200px]">
              <Skeleton className="h-4 w-32 mb-6" />
              <div className="space-y-4">
                 {[...Array(3)].map((_, i) => (
                   <div key={i} className="flex justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-12" />
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
