import { useSessionStore } from '../../stores/sessionStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { LayoutToggle } from '../Layout/LayoutToggle';
import { ModeToggle } from '../Mode/ModeToggle';
import { NewSessionButton } from './NewSessionButton';
import { SessionItem } from './SessionItem';

interface SidebarProps {
  collapsed?: boolean;
}

function SettingsButton({ collapsed }: { collapsed?: boolean }) {
  const { setShowSettingsPopup } = useSettingsStore();

  return (
    <button
      onClick={() => setShowSettingsPopup(true)}
      className={`${collapsed ? 'w-full flex justify-center' : 'flex-1'} 
                 p-2.5 rounded-xl 
                 bg-bg-tertiary hover:bg-surface border border-surface-border
                 text-text-secondary hover:text-primary
                 transition-all duration-fast`}
      aria-label="Settings"
      title="Settings"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  );
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { sessions, currentSessionId, createSession, selectSession } = useSessionStore();

  if (collapsed) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-2">
          <button
            onClick={createSession}
            className="w-full flex items-center justify-center p-3 rounded-xl
                       bg-gradient-to-r from-primary to-primary-dark text-white
                       hover:shadow-glow transition-all duration-fast"
            title="New Session"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {sessions.map((session) => {
            const firstWord = session.title.split(/[\s/]/)[0].slice(0, 6);
            const isActive = session.id === currentSessionId;
            return (
              <button
                key={session.id}
                onClick={() => selectSession(session.id)}
                className={`
                  w-full p-2 rounded-lg text-xs font-medium truncate transition-all duration-fast
                  ${isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface'
                  }
                `}
                title={session.title}
              >
                {firstWord}
              </button>
            );
          })}
        </div>
        
        <div className="p-2 flex flex-col gap-2">
          <SettingsButton collapsed />
          <ModeToggle collapsed />
          <LayoutToggle collapsed />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-3">
        <NewSessionButton onClick={createSession} />
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {sessions.map((session) => (
          <SessionItem
            key={session.id}
            session={session}
            isActive={session.id === currentSessionId}
            onSelect={() => selectSession(session.id)}
          />
        ))}
        {sessions.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-surface flex items-center justify-center">
              <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-text-muted text-sm">No sessions yet</p>
            <p className="text-text-disabled text-xs mt-1">Start a new conversation</p>
          </div>
        )}
      </div>
      
      <div className="p-3 flex gap-2">
        <SettingsButton />
        <ModeToggle />
        <LayoutToggle />
      </div>
    </div>
  );
}
