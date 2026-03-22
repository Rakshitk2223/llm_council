import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CouncilMode } from '../types';

interface ModeStore {
  mode: CouncilMode;
  hasSelectedMode: boolean;
  showModeSelector: boolean;
  setMode: (mode: CouncilMode) => void;
  setHasSelectedMode: (value: boolean) => void;
  setShowModeSelector: (value: boolean) => void;
}

export const useModeStore = create<ModeStore>()(
  persist(
    (set) => ({
      mode: 'fast',
      hasSelectedMode: false,
      showModeSelector: false,
      setMode: (mode) => set({ mode }),
      setHasSelectedMode: (value) => set({ hasSelectedMode: value }),
      setShowModeSelector: (value) => set({ showModeSelector: value }),
    }),
    {
      name: 'llm-council-mode',
      partialize: (state) => ({
        mode: state.mode,
        hasSelectedMode: state.hasSelectedMode,
      }),
    }
  )
);
