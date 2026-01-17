import { useSessionStore } from '../../stores/sessionStore';
import { LayoutToggle } from '../Layout/LayoutToggle';
import { ModeToggle } from '../Mode/ModeToggle';
import { NewSessionButton } from './NewSessionButton';
import { SessionItem } from './SessionItem';

export function Sidebar() {
  const { sessions, currentSessionId, createSession, selectSession } = useSessionStore();

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
          <p className="text-text-muted text-sm text-center py-4">
            No sessions yet. Start a new one!
          </p>
        )}
      </div>
      <div className="p-3 md:p-4 flex gap-2">
        <ModeToggle />
        <LayoutToggle />
      </div>
    </div>
  );
}
