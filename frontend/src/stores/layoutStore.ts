import { create } from 'zustand';

export type LayoutMode = 'sequential' | 'cards';

interface LayoutStore {
  layoutMode: LayoutMode;
  hasSelectedLayout: boolean;
  sidebarOpen: boolean;
  setLayoutMode: (mode: LayoutMode) => void;
  setHasSelectedLayout: (selected: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'axis-council-layout';

export const useLayoutStore = create<LayoutStore>((set) => ({
  layoutMode: 'sequential',
  hasSelectedLayout: false,
  sidebarOpen: false,
  setLayoutMode: (mode) => {
    set({ layoutMode: mode, hasSelectedLayout: true });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ layoutMode: mode, hasSelectedLayout: true }));
  },
  setHasSelectedLayout: (selected) => {
    set({ hasSelectedLayout: selected });
  },
  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
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
