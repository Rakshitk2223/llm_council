import { useLayoutStore } from '../stores/layoutStore';
import { useModeStore } from '../stores/modeStore';
import { ChatArea } from './Chat/ChatArea';
import { InputArea } from './Input/InputArea';
import { LayoutSelector } from './Layout/LayoutSelector';
import { MobileHeader } from './Layout/MobileHeader';
import { ModeSelector } from './Mode/ModeSelector';
import { Sidebar } from './Sidebar/Sidebar';
import { ThemeToggle } from './Theme/ThemeToggle';

export function Layout() {
  const { hasSelectedMode } = useModeStore();
  const { hasSelectedLayout, sidebarOpen, setSidebarOpen } = useLayoutStore();

  const showModeSelector = !hasSelectedMode;
  const showLayoutSelector = hasSelectedMode && !hasSelectedLayout;

  return (
    <>
      {showModeSelector && <ModeSelector />}
      {showLayoutSelector && <LayoutSelector />}
      
      <div className="flex flex-col md:flex-row h-screen text-text-primary">
        <MobileHeader />
        
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <aside className={`
          fixed md:relative
          top-0 left-0 bottom-0
          w-[280px] md:w-sidebar
          glass-elevated flex flex-col border-r border-border
          z-50 md:z-auto
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h1 className="font-semibold text-lg bg-gradient-to-r from-alpha via-beta to-gamma bg-clip-text text-transparent">
              Axis Council
            </h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg hover:bg-surface-elevated transition-colors"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          <Sidebar />
        </aside>

        <main className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-hidden">
            <ChatArea />
          </div>
          <div className="glass-elevated border-t border-border">
            <InputArea />
          </div>
        </main>
      </div>
    </>
  );
}
