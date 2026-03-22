import { useLayoutStore } from '../stores/layoutStore';
import { useModeStore } from '../stores/modeStore';
import { ChatArea } from './Chat/ChatArea';
import { InputArea } from './Input/InputArea';
import { LayoutSelector } from './Layout/LayoutSelector';
import { MobileHeader } from './Layout/MobileHeader';
import { ModeSelector } from './Mode/ModeSelector';
import { SettingsPopup } from './Settings/SettingsPopup';
import { Sidebar } from './Sidebar/Sidebar';
import { ThemeToggle } from './Theme/ThemeToggle';

export function Layout() {
  const { hasSelectedMode, showModeSelector } = useModeStore();
  const { hasSelectedLayout, sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useLayoutStore();

  const shouldShowModeSelector = !hasSelectedMode || showModeSelector;
  const showLayoutSelector = hasSelectedMode && !hasSelectedLayout;

  return (
    <>
      {shouldShowModeSelector && <ModeSelector />}
      {showLayoutSelector && <LayoutSelector />}
      <SettingsPopup />
      
      <div className="flex flex-col md:flex-row h-screen bg-bg-primary text-text-primary overflow-hidden">
        <MobileHeader />
        
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <aside className={`
          fixed md:relative
          top-0 left-0 bottom-0
          ${sidebarCollapsed ? 'w-[64px]' : 'w-[280px]'}
          bg-bg-secondary border-r border-surface-border
          z-50 md:z-auto
          transform transition-all duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className={`h-16 px-4 flex items-center border-b border-surface-border ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {sidebarCollapsed ? (
              <button
                onClick={toggleSidebarCollapsed}
                className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-primary transition-all duration-fast"
                aria-label="Expand sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                </svg>
              </button>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h1 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    LLM Council
                  </h1>
                </div>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <button
                    onClick={toggleSidebarCollapsed}
                    className="btn-icon"
                    aria-label="Collapse sidebar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="btn-icon md:hidden"
                    aria-label="Close menu"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
          <Sidebar collapsed={sidebarCollapsed} />
        </aside>

        <main className="flex-1 flex flex-col min-h-0 relative">
          <div className="hidden md:flex h-14 px-6 items-center bg-bg-secondary border-b border-surface-border">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
              <h2 className="font-semibold text-text-primary">Council Chamber</h2>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatArea />
          </div>
          <div className="bg-bg-secondary border-t border-surface-border">
            <InputArea />
          </div>
        </main>
      </div>
    </>
  );
}
