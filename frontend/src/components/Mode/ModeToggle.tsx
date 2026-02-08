import { useModeStore } from '../../stores/modeStore';

interface ModeToggleProps {
  collapsed?: boolean;
}

export function ModeToggle({ collapsed }: ModeToggleProps) {
  const { mode, setShowModeSelector } = useModeStore();

  const openModeSelector = () => {
    setShowModeSelector(true);
  };

  const getIcon = () => {
    if (mode === 'fast') {
      return (
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    } else if (mode === 'comprehensive') {
      return (
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        onClick={openModeSelector}
        className="w-full flex items-center justify-center p-2.5 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border transition-colors"
        title={`Mode: ${getLabel()} - Click to change`}
      >
        {getIcon()}
      </button>
    );
  }

  return (
    <button
      onClick={openModeSelector}
      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border transition-colors text-sm font-medium"
      title="Click to change mode"
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </button>
  );
}
