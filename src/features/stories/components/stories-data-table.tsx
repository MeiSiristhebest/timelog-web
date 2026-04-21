"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  MessageCircle, 
  CheckCircle2, 
  Eye, 
  MoreVertical, 
  Trash2 
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "@/lib/hooks/use-translation";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useBatchStore } from "@/features/stories/store";
import { storyRoute } from "@/lib/routes";
import type { StoryListItem as Story } from "@/features/stories/queries";
import { BatchFloatingToolbar } from "@/features/stories/components/batch-floating-toolbar";
import { usePermissions } from "@/hooks/use-permissions";


export function StoriesDataTable({ storiesPromise }: { storiesPromise: Promise<Story[]> }) {
  const stories = use(storiesPromise);
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { hasPermission } = usePermissions();

  const { 
    isManagementMode, 
    selectedIds, 
    toggleSelection, 
    setManagementMode,
    selectAll,
    clearSelection
  } = useBatchStore();

  const filteredStories = useMemo(() => {
    if (!debouncedSearchQuery) return stories;
    const lowerQuery = debouncedSearchQuery.toLowerCase();
    return stories.filter(
      (story) =>
        story.title.toLowerCase().includes(lowerQuery) ||
        story.speakerLabel.toLowerCase().includes(lowerQuery) ||
        (story.transcriptPreview && story.transcriptPreview.toLowerCase().includes(lowerQuery))
    );
  }, [stories, debouncedSearchQuery]);

  const allIds = filteredStories.map(s => s.id);
  const isAllSelected = selectedIds.length === allIds.length && allIds.length > 0;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-canvas-elevated border border-line rounded-2xl shadow-sm">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder={t("Stories.searchPlaceholder") || "Search moments, speakers, or transcripts..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-canvas-depth border border-line-strong rounded-xl py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold"
            />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setManagementMode(!isManagementMode)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border outline-none",
                isManagementMode 
                  ? "bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20" 
                  : "bg-canvas-depth text-muted border-line-strong hover:border-accent/40 hover:text-ink"
              )}
            >
              {isManagementMode ? t("Common.exitSelect") || "Exit Selection" : t("Common.batchSelect") || "Select Multiple"}
            </button>
            
            <button className="p-2.5 rounded-xl bg-canvas-depth border border-line-strong text-muted hover:text-ink hover:border-accent/40 transition-all">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Table Container */}
        <div className="bg-canvas-elevated border border-line rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-line bg-canvas-depth/30">
                {isManagementMode && (
                  <TableHead className="w-12 px-6 h-14">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      onChange={() => isAllSelected ? clearSelection() : selectAll(allIds)}
                      className="rounded border-line-strong text-accent focus:ring-accent accent-accent h-4 w-4 cursor-pointer"
                    />
                  </TableHead>
                )}
                <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted">{t("Stories.tableTitle")}</TableHead>
                <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted">{t("Stories.tableDuration")}</TableHead>
                <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted text-center">{t("Stories.tableStats") || "Interactions"}</TableHead>
                <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted">{t("Stories.tableDate")}</TableHead>
                <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted">{t("Stories.tableStatus")}</TableHead>
                <TableHead className="w-16 px-6 h-14"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStories.map((story) => {
                const isSelected = selectedIds.includes(story.id);
                return (
                  <TableRow 
                    key={story.id} 
                    className={cn(
                      "group border-b border-line transition-colors",
                      isSelected ? "bg-accent/[0.04]" : "hover:bg-accent/[0.02]"
                    )}
                  >
                    {isManagementMode && (
                      <TableCell className="px-6 py-5">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSelection(story.id)}
                          className="rounded border-line-strong text-accent focus:ring-accent accent-accent h-4 w-4 cursor-pointer"
                        />
                      </TableCell>
                    )}
                    <TableCell className="px-6 py-5">
                      <div className="flex items-start gap-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className={cn(
                              "mt-1.5 transition-colors shrink-0 outline-none",
                              story.isFavorite ? "text-amber-500 drop-shadow-sm" : "text-muted/40 hover:text-amber-400"
                            )}>
                              <Star className={cn("h-4 w-4", story.isFavorite && "fill-current")} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-canvas-elevated border border-line text-ink font-bold text-[10px] uppercase tracking-widest">
                            {story.isFavorite ? t("Stories.pinned") : t("Stories.pinToTop")}
                          </TooltipContent>
                        </Tooltip>
                        
                        <div className="min-w-0">
                          <Link href={storyRoute(story.id)} className="text-sm font-black text-ink hover:text-accent transition-colors block leading-tight truncate">
                            {story.title}
                          </Link>
                          <p className="text-[10px] text-muted font-bold mt-1.5 uppercase tracking-widest border-l-2 border-accent/30 pl-2">
                            {story.speakerLabel}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs text-muted font-bold">
                        <Clock className="h-3.5 w-3.5 text-muted/50" />
                        {story.durationLabel}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-1.5 text-muted group-hover:text-ink transition-colors">
                          <MessageCircle size={14} className="text-muted/60" />
                          <span className="text-[10px] font-black">{story.commentCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted group-hover:text-ink transition-colors">
                          <CheckCircle2 size={14} className="text-muted/60" />
                          <span className="text-[10px] font-black">{story.reactionCount}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-xs text-muted font-bold whitespace-nowrap">
                       {story.startedAtLabel}
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] font-black px-2 py-0.5 uppercase tracking-[0.1em]",
                          story.syncStatus === "synced" 
                            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600" 
                            : "border-line-strong bg-canvas-depth text-muted"
                        )}
                      >
                        <span className={cn(
                          "h-1 w-1 rounded-full mr-1.5",
                          story.syncStatus === "synced" ? "bg-emerald-500" : "bg-muted"
                        )} />
                        {story.syncStatus === "synced" 
                          ? (t("Stories.statusSynced") || "Synchronized") 
                          : (t("Stories.statusSyncing") || story.syncStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={storyRoute(story.id)} className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-xl transition-all">
                              <Eye size={16} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="top">{t("Stories.viewStory")}</TooltipContent>
                        </Tooltip>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 text-muted hover:text-ink hover:bg-canvas-depth rounded-xl transition-all outline-none">
                              <MoreVertical size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="flex items-center gap-2">
                               <Clock className="h-4 w-4" /> {t("Stories.timelineDetails")}
                            </DropdownMenuItem>
                            {hasPermission('canDeleteStories') && (
                              <DropdownMenuItem className="text-danger focus:text-danger focus:bg-danger/10 flex items-center gap-2 font-bold">
                                 <Trash2 className="h-4 w-4" /> {t("Stories.archivalDelete")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredStories.length === 0 && (
             <div className="p-32 text-center animate-in fade-in zoom-in duration-500 flex flex-col items-center">
                <div className="h-20 w-20 rounded-2xl bg-canvas-depth flex items-center justify-center border border-dashed border-line-strong mb-6 rotate-12 group-hover:rotate-0 transition-transform">
                  <Search className="h-8 w-8 text-muted/40" />
                </div>
                <h4 className="text-xl font-black text-ink tracking-tight">{t("Stories.noMatchingMemories")}</h4>
                <p className="text-sm text-muted font-bold mt-2 max-w-xs mx-auto uppercase tracking-widest opacity-60">
                  {t("Stories.searchAdjust")}
                </p>
             </div>
          )}
        </div>

        <BatchFloatingToolbar mode={isManagementMode ? "active" : "archived"} />
      </div>
    </TooltipProvider>
  );
}
