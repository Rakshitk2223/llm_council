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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">LLM Council</h3>
      <p className="text-text-secondary text-center max-w-md">
        Ask any question and watch multiple AI models collaborate to deliver the best answer.
      </p>
    </div>
  );
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

  if (!currentSession || messages.length === 0) {
    return (
      <div className="h-full overflow-y-auto px-4 md:px-8">
        <EmptyState />
      </div>
    );
  }

  return (
    <div 
      className="h-full overflow-y-auto px-4 py-6 md:px-8" 
      ref={containerRef}
      onScroll={handleScroll}
    >
      {councilState.error && (
        <div className="mb-6">
          <ErrorMessage message={councilState.error} />
        </div>
      )}

      {rounds.map((round) => {
        const hasSenator = !!round.senatorMessage;
        const filteredSystemMessages = filterSystemMessages(round.systemMessages, hasSenator);
        
        return (
          <div key={round.userMessage.id}>
            <MessageBubble message={round.userMessage} />
            
            {round.councilMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {filteredSystemMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {hasVotingResults && layoutMode === 'cards' && (
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
    </div>
  );
}
