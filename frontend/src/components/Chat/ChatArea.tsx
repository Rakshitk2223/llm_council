import { useCallback, useEffect, useRef } from 'react';

import { useLayoutStore } from '../../stores/layoutStore';
import { useSessionStore } from '../../stores/sessionStore';
import { CardsView } from './CardsView';
import { MessageBubble } from './MessageBubble';
import { VotingDisplay } from './VotingDisplay';
import { ErrorMessage } from '../Error/ErrorMessage';
import type { Message } from '../../types';

interface ConversationRound {
  userMessage: Message;
  councilMessages: Message[];
  systemMessages: Message[];
  senatorMessage?: Message;
}

const CLUTTER_MESSAGES = [
  'Council members are evaluating responses...',
  'Voting results are now available.',
];

function isClutterMessage(message: Message): boolean {
  return message.role === 'system' && CLUTTER_MESSAGES.includes(message.content);
}

function filterSystemMessages(messages: Message[], hasSenator: boolean): Message[] {
  if (!hasSenator) return messages;
  return messages.filter((m) => !isClutterMessage(m));
}

function groupMessagesIntoRounds(messages: Message[]): ConversationRound[] {
  const rounds: ConversationRound[] = [];
  let currentRound: ConversationRound | null = null;

  for (const message of messages) {
    if (message.role === 'user') {
      if (currentRound) {
        rounds.push(currentRound);
      }
      currentRound = {
        userMessage: message,
        councilMessages: [],
        systemMessages: [],
        senatorMessage: undefined,
      };
    } else if (currentRound) {
      if (message.role === 'assistant' && message.memberId === 'senator') {
        currentRound.senatorMessage = message;
      } else if (message.role === 'assistant' && message.memberId) {
        currentRound.councilMessages.push(message);
      } else if (message.role === 'system') {
        currentRound.systemMessages.push(message);
      }
    }
  }

  if (currentRound) {
    rounds.push(currentRound);
  }

  return rounds;
}

export function ChatArea() {
  const { sessions, currentSessionId, councilState } = useSessionStore();
  const { layoutMode } = useLayoutStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const currentSession = sessions.find((session) => session.id === currentSessionId);
  const messages = currentSession?.messages || [];
  const rounds = groupMessagesIntoRounds(messages);
  const hasVotingResults = councilState.votingResults && councilState.responseMapping;

  const checkIfNearBottom = useCallback(() => {
    if (!containerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 150;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  const handleScroll = useCallback(() => {
    isNearBottomRef.current = checkIfNearBottom();
  }, [checkIfNearBottom]);

  useEffect(() => {
    if (containerRef.current && isNearBottomRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, councilState.votingResults]);

  if (layoutMode === 'cards') {
    return (
      <div 
        className="h-full overflow-y-auto px-3 py-4 md:px-6 md:py-6" 
        ref={containerRef}
        onScroll={handleScroll}
      >
        {councilState.error && (
          <div className="mb-4">
            <ErrorMessage message={councilState.error} />
          </div>
        )}

        {rounds.map((round, roundIndex) => {
          const isLastRound = roundIndex === rounds.length - 1;
          const hasSenator = !!round.senatorMessage;
          const filteredSystemMessages = filterSystemMessages(round.systemMessages, hasSenator);
          
          return (
            <div key={round.userMessage.id} className="mb-6">
              <MessageBubble message={round.userMessage} />
              
              {round.councilMessages.length > 0 && (
                <CardsView messages={round.councilMessages} />
              )}
              
              {filteredSystemMessages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {isLastRound && hasVotingResults && (
                <VotingDisplay
                  results={councilState.votingResults!}
                  mapping={councilState.responseMapping!}
                  votes={councilState.votingVotes}
                />
              )}
              
              {round.senatorMessage && (
                <div className="mt-6">
                  <MessageBubble message={round.senatorMessage} />
                </div>
              )}
            </div>
          );
        })}

        {!currentSession && (
          <div className="text-text-muted text-sm text-center py-10">
            Start a new session to ask the Axis Council.
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="h-full overflow-y-auto px-3 py-4 md:px-6 md:py-6" 
      ref={containerRef}
      onScroll={handleScroll}
    >
      {councilState.error && (
        <div className="mb-4">
          <ErrorMessage message={councilState.error} />
        </div>
      )}

      {rounds.map((round, roundIndex) => {
        const isLastRound = roundIndex === rounds.length - 1;
        const hasSenator = !!round.senatorMessage;
        const filteredSystemMessages = filterSystemMessages(round.systemMessages, hasSenator);
        
        return (
          <div key={round.userMessage.id} className="mb-6">
            <MessageBubble message={round.userMessage} />
            
            {round.councilMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {filteredSystemMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isLastRound && hasVotingResults && (
              <VotingDisplay
                results={councilState.votingResults!}
                mapping={councilState.responseMapping!}
                votes={councilState.votingVotes}
              />
            )}
            
            {round.senatorMessage && (
              <div className="mt-6">
                <MessageBubble message={round.senatorMessage} />
              </div>
            )}
          </div>
        );
      })}

      {!currentSession && (
        <div className="text-text-muted text-sm text-center py-10">
          Start a new session to ask the Axis Council.
        </div>
      )}
    </div>
  );
}
