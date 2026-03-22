import { useLayoutStore } from '../../stores/layoutStore';
import { ThemeToggle } from '../Theme/ThemeToggle';

export function MobileHeader() {
  const { toggleSidebar } = useLayoutStore();

  return (
    <div className="md:hidden h-14 px-4 flex items-center justify-between 
                    bg-bg-secondary border-b border-surface-border">
      <button
        onClick={toggleSidebar}
        className="p-2.5 rounded-lg bg-surface hover:bg-surface-hover 
                   text-text-primary transition-all duration-fast"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="font-bold text-gradient">LLM Council</span>
      </div>
      
      <ThemeToggle />
    </div>
  );
}
