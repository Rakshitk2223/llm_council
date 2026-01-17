import { useLayoutStore } from '../../stores/layoutStore';

export function LayoutToggle() {
  const { layoutMode, setLayoutMode } = useLayoutStore();

  const toggleLayout = () => {
    setLayoutMode(layoutMode === 'sequential' ? 'cards' : 'sequential');
  };

  return (
    <button
      onClick={toggleLayout}
      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg glass hover:bg-surface-elevated/50 transition-colors text-sm font-medium"
      title={`Switch to ${layoutMode === 'sequential' ? 'Cards' : 'Sequential'} view`}
    >
      {layoutMode === 'sequential' ? (
        <>
          <svg className="w-4 h-4 text-alpha" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>List</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 text-beta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Cards</span>
        </>
      )}
    </button>
  );
}
