import { useModeStore } from '../../stores/modeStore';

interface ModeToggleProps {
  collapsed?: boolean;
}

export function ModeToggle({ collapsed }: ModeToggleProps) {
  const { mode, setShowModeSelector } = useModeStore();

  const getIcon = () => {
    if (mode === 'fast') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    } else if (mode === 'comprehensive') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    }
  };

  const getLabel = () => {
    if (mode === 'fast') return 'Fast';
    if (mode === 'comprehensive') return 'Full';
    return 'Deep';
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setShowModeSelector(true)}
        className="w-full flex items-center justify-center p-2.5 rounded-xl
                   bg-bg-tertiary hover:bg-surface border border-surface-border
                   text-text-secondary hover:text-primary
                   transition-all duration-fast"
        title={`Mode: ${getLabel()}`}
      >
        {getIcon()}
      </button>
    );
  }

  return (
    <button
      onClick={() => setShowModeSelector(true)}
      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                 bg-bg-tertiary hover:bg-surface border border-surface-border
                 text-text-secondary hover:text-primary
                 transition-all duration-fast text-sm font-medium"
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </button>
  );
}
