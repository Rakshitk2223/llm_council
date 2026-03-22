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
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    }
  };

  const getLabel = () => {
    return layoutMode === 'sequential' ? 'Cards' : 'List';
  };

  if (collapsed) {
    return (
      <button
        onClick={toggleLayout}
        className="w-full flex items-center justify-center p-2.5 rounded-xl
                   bg-bg-tertiary hover:bg-surface border border-surface-border
                   text-text-secondary hover:text-primary
                   transition-all duration-fast"
        title={`View: ${getLabel()}`}
      >
        {getIcon()}
      </button>
    );
  }

  return (
    <button
      onClick={toggleLayout}
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
