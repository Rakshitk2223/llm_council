import { useModeStore } from '../../stores/modeStore';

export function ModeToggle() {
  const { mode, setMode } = useModeStore();

  const toggleMode = () => {
    setMode(mode === 'fast' ? 'comprehensive' : 'fast');
  };

  return (
    <button
      onClick={toggleMode}
      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg glass hover:bg-surface-elevated/50 transition-colors text-sm font-medium"
      title={`Current: ${mode === 'fast' ? 'Fast' : 'Comprehensive'} Mode. Click to switch.`}
    >
      {mode === 'fast' ? (
        <>
          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Fast</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          <span>Full</span>
        </>
      )}
    </button>
  );
}
