import { useLayoutStore } from '../../stores/layoutStore';

interface LayoutToggleProps {
  collapsed?: boolean;
}

export function LayoutToggle({ collapsed }: LayoutToggleProps) {
  const { layoutMode, setLayoutMode } = useLayoutStore();

  const toggleLayout = () => {
    setLayoutMode(layoutMode === 'sequential' ? 'cards' : 'sequential');
  };

  const getIcon = () => {
    if (layoutMode === 'sequential') {
      return (
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    }
  };

  const getLabel = () => {
    return layoutMode === 'sequential' ? 'List' : 'Cards';
  };

  if (collapsed) {
    return (
      <button
        onClick={toggleLayout}
        className="w-full flex items-center justify-center p-2.5 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border transition-colors"
        title={`View: ${getLabel()} - Click to switch`}
      >
        {getIcon()}
      </button>
    );
  }

  return (
    <button
      onClick={toggleLayout}
      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border transition-colors text-sm font-medium"
      title={`Switch to ${layoutMode === 'sequential' ? 'Cards' : 'Sequential'} view`}
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </button>
  );
}
