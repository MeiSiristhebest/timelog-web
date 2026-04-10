"use client";

import { create } from "zustand";

interface BatchState {
  isManagementMode: boolean;
  selectedIds: string[];
  setManagementMode: (mode: boolean) => void;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useBatchStore = create<BatchState>((set) => ({
  isManagementMode: false,
  selectedIds: [],
  
  setManagementMode: (mode) => set({ 
    isManagementMode: mode, 
    selectedIds: [] // Clear selection when toggling mode
  }),

  toggleSelection: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter((i) => i !== id)
      : [...state.selectedIds, id]
  })),

  selectAll: (ids) => set({ selectedIds: ids }),
  
  clearSelection: () => set({ selectedIds: [] }),
}));
