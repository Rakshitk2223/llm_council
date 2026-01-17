import { useLayoutStore } from '../stores/layoutStore';
import { useModeStore } from '../stores/modeStore';
import { ChatArea } from './Chat/ChatArea';
import { InputArea } from './Input/InputArea';
import { LayoutSelector } from './Layout/LayoutSelector';
import { LayoutToggle } from './Layout/LayoutToggle';
import { ModeSelector } from './Mode/ModeSelector';
import { ModeToggle } from './Mode/ModeToggle';
import { Sidebar } from './Sidebar/Sidebar';
import { ThemeToggle } from './Theme/ThemeToggle';

export function Layout() {
  const { hasSelectedMode } = useModeStore();
  const { hasSelectedLayout } = useLayoutStore();

  const showModeSelector = !hasSelectedMode;
  const showLayoutSelector = hasSelectedMode && !hasSelectedLayout;

  return (
    <>
      {showModeSelector && <ModeSelector />}
      {showLayoutSelector && <LayoutSelector />}
      
      <div className="flex h-screen text-text-primary">
        <aside className="w-sidebar glass-elevated flex flex-col border-r border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h1 className="font-semibold text-lg bg-gradient-to-r from-alpha via-beta to-gamma bg-clip-text text-transparent">
              Axis Council
            </h1>
            <ThemeToggle />
          </div>
          <Sidebar />
        </aside>

        <main className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ChatArea />
          </div>
          <div className="glass-elevated border-t border-border">
            <InputArea />
          </div>
        </main>
      </div>

      <ModeToggle />
      <LayoutToggle />
    </>
  );
}
