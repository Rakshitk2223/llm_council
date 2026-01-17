import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CouncilMode } from '../types';

interface ModeStore {
  mode: CouncilMode;
  hasSelectedMode: boolean;
  setMode: (mode: CouncilMode) => void;
  setHasSelectedMode: (value: boolean) => void;
}

export const useModeStore = create<ModeStore>()(
  persist(
    (set) => ({
      mode: 'fast',
      hasSelectedMode: false,
      setMode: (mode) => set({ mode }),
      setHasSelectedMode: (value) => set({ hasSelectedMode: value }),
    }),
    {
      name: 'axis-council-mode',
    }
  )
);
