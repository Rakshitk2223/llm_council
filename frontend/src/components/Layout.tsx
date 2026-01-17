import React from 'react';

import { useModeStore } from '../stores/modeStore';
import { ChatArea } from './Chat/ChatArea';
import { InputArea } from './Input/InputArea';
import { ModeSelector } from './Mode/ModeSelector';
import { ModeToggle } from './Mode/ModeToggle';
import { Sidebar } from './Sidebar/Sidebar';
import { ThemeToggle } from './Theme/ThemeToggle';

export function Layout() {
  const { hasSelectedMode } = useModeStore();

  return (
    <>
      {!hasSelectedMode && <ModeSelector />}
      
      <div className="flex h-screen bg-background text-text-primary">
        <aside className="w-sidebar border-r border-border flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h1 className="font-semibold text-lg">Axis Council</h1>
            <ThemeToggle />
          </div>
          <Sidebar />
        </aside>

        <main className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ChatArea />
          </div>
          <div className="border-t border-border">
            <InputArea />
          </div>
        </main>
      </div>

      <ModeToggle />
    </>
  );
}
