import { useEffect, useRef } from 'react';

import { useSessionStore } from '../../stores/sessionStore';
import { MessageBubble } from './MessageBubble';
import { VotingDisplay } from './VotingDisplay';
import { ErrorMessage } from '../Error/ErrorMessage';

export function ChatArea() {
  const { sessions, currentSessionId, councilState } = useSessionStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find((session) => session.id === currentSessionId);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentSession?.messages, councilState.votingResults]);

  const messages = currentSession?.messages || [];
  const senatorIndex = messages.findIndex((m) => m.memberId === 'senator');
  const hasVotingResults = councilState.votingResults && councilState.responseMapping;

  return (
    <div className="h-full overflow-y-auto px-6 py-6" ref={containerRef}>
      {councilState.error && (
        <div className="mb-4">
          <ErrorMessage message={councilState.error} />
        </div>
      )}

      {messages.map((message, index) => (
        <div key={message.id}>
          {hasVotingResults && senatorIndex === index && (
            <VotingDisplay
              results={councilState.votingResults!}
              mapping={councilState.responseMapping!}
              votes={councilState.votingVotes}
            />
          )}
          <MessageBubble message={message} />
        </div>
      ))}

      {hasVotingResults && senatorIndex === -1 && (
        <VotingDisplay
          results={councilState.votingResults!}
          mapping={councilState.responseMapping!}
          votes={councilState.votingVotes}
        />
      )}

      {!currentSession && (
        <div className="text-text-muted text-sm text-center py-10">
          Start a new session to ask the Axis Council.
        </div>
      )}
    </div>
  );
}
