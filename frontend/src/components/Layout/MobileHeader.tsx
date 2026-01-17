import { useLayoutStore } from '../../stores/layoutStore';
import { ThemeToggle } from '../Theme/ThemeToggle';

export function MobileHeader() {
  const { toggleSidebar } = useLayoutStore();

  return (
    <div className="md:hidden glass-elevated border-b border-border p-3 flex items-center justify-between">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      
      <h1 className="font-semibold text-lg bg-gradient-to-r from-alpha via-beta to-gamma bg-clip-text text-transparent">
        Axis Council
      </h1>
      
      <ThemeToggle />
    </div>
  );
}
