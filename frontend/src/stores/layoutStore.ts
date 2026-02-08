import { create } from 'zustand';

export type LayoutMode = 'sequential' | 'cards';

interface LayoutStore {
  layoutMode: LayoutMode;
  hasSelectedLayout: boolean;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  setLayoutMode: (mode: LayoutMode) => void;
  setHasSelectedLayout: (selected: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'axis-council-layout';

export const useLayoutStore = create<LayoutStore>((set) => ({
  layoutMode: 'sequential',
  hasSelectedLayout: false,
  sidebarOpen: false,
  sidebarCollapsed: false,
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
  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, sidebarCollapsed: collapsed }));
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
    }
  },
  toggleSidebarCollapsed: () => {
    set((state) => {
      const newCollapsed = !state.sidebarCollapsed;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, sidebarCollapsed: newCollapsed }));
      } catch (error) {
        console.error('Failed to save sidebar state:', error);
      }
      return { sidebarCollapsed: newCollapsed };
    });
  },
  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { layoutMode, hasSelectedLayout, sidebarCollapsed } = JSON.parse(stored);
        set({ layoutMode, hasSelectedLayout, sidebarCollapsed: sidebarCollapsed || false });
      }
    } catch (error) {
      console.error('Failed to load layout from storage:', error);
    }
  },
}));
