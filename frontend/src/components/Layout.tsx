import { useLayoutStore } from '../stores/layoutStore';
import { useModeStore } from '../stores/modeStore';
import { ChatArea } from './Chat/ChatArea';
import { InputArea } from './Input/InputArea';
import { LayoutSelector } from './Layout/LayoutSelector';
import { MobileHeader } from './Layout/MobileHeader';
import { ModeSelector } from './Mode/ModeSelector';
import { SettingsPopup } from './Settings/SettingsPopup';
import { Sidebar } from './Sidebar/Sidebar';

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
          ${sidebarCollapsed ? 'w-[60px]' : 'w-[280px]'}
          bg-surface-solid flex flex-col border-r border-border
          z-50 md:z-auto
          transform transition-all duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className={`p-4 border-b border-border flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {sidebarCollapsed ? (
              <button
                onClick={toggleSidebarCollapsed}
                className="p-1.5 rounded-lg hover:bg-surface-elevated transition-colors text-primary"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                </svg>
              </button>
            ) : (
              <>
                <h1 className="font-semibold text-lg text-primary">
                  LLM Council
                </h1>
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleSidebarCollapsed}
                    className="hidden md:block p-1.5 rounded-lg hover:bg-surface-elevated transition-colors text-text-muted hover:text-text-primary"
                    aria-label="Collapse sidebar"
                    title="Collapse sidebar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                    </svg>
                  </button>
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
              </>
            )}
          </div>
          <Sidebar collapsed={sidebarCollapsed} />
        </aside>

        <main className="flex-1 flex flex-col min-h-0">
          <div className="hidden md:flex items-center px-6 py-3 bg-header border-b border-header">
            <h2 className="font-semibold text-white">LLM Council Chamber</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatArea />
          </div>
          <div className="bg-surface-solid border-t border-border">
            <InputArea />
          </div>
        </main>
      </div>
    </>
  );
}
