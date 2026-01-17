import { useEffect, useRef } from 'react';

import { useLayoutStore } from '../../stores/layoutStore';
import { useSessionStore } from '../../stores/sessionStore';
import { CardsView } from './CardsView';
import { MessageBubble } from './MessageBubble';
import { VotingDisplay } from './VotingDisplay';
import { ErrorMessage } from '../Error/ErrorMessage';

export function ChatArea() {
  const { sessions, currentSessionId, councilState } = useSessionStore();
  const { layoutMode } = useLayoutStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find((session) => session.id === currentSessionId);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentSession?.messages, councilState.votingResults]);

  const messages = currentSession?.messages || [];
  const hasVotingResults = councilState.votingResults && councilState.responseMapping;

  const userMessages = messages.filter((m) => m.role === 'user');
  const systemMessages = messages.filter((m) => m.role === 'system');
  const councilMessages = messages.filter(
    (m) => m.role === 'assistant' && m.memberId && m.memberId !== 'senator'
  );
  const senatorMessage = messages.find((m) => m.memberId === 'senator');

  if (layoutMode === 'cards') {
    return (
      <div className="h-full overflow-y-auto px-6 py-6" ref={containerRef}>
        {councilState.error && (
          <div className="mb-4">
            <ErrorMessage message={councilState.error} />
          </div>
        )}

        {userMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {councilMessages.length > 0 && <CardsView messages={councilMessages} />}

        {systemMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {hasVotingResults && (
          <VotingDisplay
            results={councilState.votingResults!}
            mapping={councilState.responseMapping!}
            votes={councilState.votingVotes}
          />
        )}

        {senatorMessage && <MessageBubble message={senatorMessage} />}

        {!currentSession && (
          <div className="text-text-muted text-sm text-center py-10">
            Start a new session to ask the Axis Council.
          </div>
        )}
      </div>
    );
  }

  const senatorIndex = messages.findIndex((m) => m.memberId === 'senator');

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
