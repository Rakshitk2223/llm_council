import { useLayoutStore, LayoutMode } from '../../stores/layoutStore';

export function LayoutSelector() {
  const { setLayoutMode } = useLayoutStore();

  const handleSelect = (mode: LayoutMode) => {
    setLayoutMode(mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="relative bg-popup border border-border rounded-2xl p-8 max-w-lg w-full animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-alpha via-beta to-gamma bg-clip-text text-transparent">
            Choose Your View
          </h2>
          <p className="text-text-secondary">
            How would you like to see council responses?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSelect('sequential')}
            className="group bg-surface-elevated p-6 rounded-xl hover:bg-surface-elevated/80 transition-all duration-300 text-left border border-border hover:border-alpha/30"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-4 rounded-xl bg-alpha/20 flex items-center justify-center group-hover:glow-alpha transition-all">
                <svg className="w-8 h-8 text-alpha" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Sequential</h3>
              <p className="text-xs text-text-muted">
                Classic chat view with all responses stacked vertically
              </p>
            </div>
          </button>

          <button
            onClick={() => handleSelect('cards')}
            className="group bg-surface-elevated p-6 rounded-xl hover:bg-surface-elevated/80 transition-all duration-300 text-left border border-border hover:border-beta/30"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-4 rounded-xl bg-beta/20 flex items-center justify-center group-hover:glow-beta transition-all">
                <svg className="w-8 h-8 text-beta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Cards</h3>
              <p className="text-xs text-text-muted">
                Swipe through responses like cards
              </p>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          You can change this anytime from the bottom left corner
        </p>
      </div>
    </div>
  );
}
