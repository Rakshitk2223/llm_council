import { create } from 'zustand';

export type LayoutMode = 'sequential' | 'cards';

interface LayoutStore {
  layoutMode: LayoutMode;
  hasSelectedLayout: boolean;
  setLayoutMode: (mode: LayoutMode) => void;
  setHasSelectedLayout: (selected: boolean) => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'axis-council-layout';

export const useLayoutStore = create<LayoutStore>((set) => ({
  layoutMode: 'sequential',
  hasSelectedLayout: false,
  setLayoutMode: (mode) => {
    set({ layoutMode: mode, hasSelectedLayout: true });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ layoutMode: mode, hasSelectedLayout: true }));
  },
  setHasSelectedLayout: (selected) => {
    set({ hasSelectedLayout: selected });
  },
  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { layoutMode, hasSelectedLayout } = JSON.parse(stored);
        set({ layoutMode, hasSelectedLayout });
      }
    } catch (error) {
      console.error('Failed to load layout from storage:', error);
    }
  },
}));
