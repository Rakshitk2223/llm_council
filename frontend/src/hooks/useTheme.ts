import { useCallback } from 'react';

import type { Theme } from '../types';

export function useTheme() {
  const theme: Theme = 'light';

  const toggleTheme = useCallback(() => {
  }, []);

  const setTheme = useCallback((_nextTheme: Theme) => {
  }, []);

  return { theme, toggleTheme, setTheme };
}
