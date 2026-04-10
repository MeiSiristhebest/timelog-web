"use client";

import { useTranslations } from "next-intl";
import { Settings2, X, CheckSquare, Square } from "lucide-react";
import { useBatchStore } from "../store";

export function ManagementControlBar({ allIds }: { allIds: string[] }) {
  const t = useTranslations("Stories");
  const { isManagementMode, selectedIds, setManagementMode, selectAll, clearSelection } = useBatchStore();
  
  const isAllSelected = selectedIds.length === allIds.length && allIds.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-line/50 mb-6 group">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setManagementMode(!isManagementMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
            isManagementMode 
            ? "bg-accent text-white shadow-lg shadow-accent/20" 
            : "bg-canvas-depth text-muted hover:bg-line hover:text-ink"
          }`}
        >
          {isManagementMode ? (
            <X className="h-3.5 w-3.5" />
          ) : (
            <Settings2 className="h-3.5 w-3.5" />
          )}
          {isManagementMode ? t("exitManagement") : t("management")}
        </button>
        
        {isManagementMode && (
          <span className="text-xs font-bold text-accent animate-in fade-in slide-in-from-left-2">
            {t("selectedCount", { count: selectedIds.length })}
          </span>
        )}
      </div>

      {isManagementMode && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
          <button
            onClick={() => isAllSelected ? clearSelection() : selectAll(allIds)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:bg-canvas-depth hover:text-ink transition-colors"
          >
            {isAllSelected ? (
              <Square className="h-4 w-4" />
            ) : (
              <CheckSquare className="h-4 w-4" />
            )}
            {isAllSelected ? t("deselectAll") : t("selectAll")}
          </button>
        </div>
      )}
    </div>
  );
}
