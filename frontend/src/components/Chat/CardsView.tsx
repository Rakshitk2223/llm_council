import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

import type { Message } from '../../types';
import { RobotAvatar } from './RobotAvatar';
import { ThinkingIndicator } from './ThinkingIndicator';

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-surface-elevated text-text-secondary hover:text-text-primary"
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

interface CardsViewProps {
  messages: Message[];
}

export function CardsView({ messages }: CardsViewProps) {
  const councilMessages = messages.filter(
    (m) => m.role === 'assistant' && m.memberId && m.memberId !== 'senator'
  );
  
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (councilMessages.length > 0 && currentIndex >= councilMessages.length) {
      setCurrentIndex(councilMessages.length - 1);
    }
  }, [councilMessages.length, currentIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(councilMessages.length - 1, prev + 1));
  }, [councilMessages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  if (councilMessages.length === 0) {
    return null;
  }

  const activeMessage = councilMessages[currentIndex];
  const memberId = activeMessage?.memberId || 'alpha';

  return (
    <div className="mb-4">
      <div className="relative">
        <div className="group">
          <div
            className="glass-elevated border-l-4 border-border px-4 py-4 rounded-xl rounded-l-sm transition-colors hover:bg-surface-elevated/80"
          >
            <div className="flex items-center gap-3 mb-3">
              <RobotAvatar memberId={memberId} size="md" />
              <div className="flex items-center gap-2 flex-1">
                <span className="font-semibold text-sm text-text-primary">{activeMessage.memberName}</span>
                {activeMessage.isThinking && <ThinkingIndicator />}
                {activeMessage.isStreaming && (
                  <span className="text-xs text-accent animate-pulse">streaming...</span>
                )}
              </div>
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="p-1.5 glass rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-elevated/50 transition-all"
                aria-label="Previous response"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                disabled={currentIndex === councilMessages.length - 1}
                className="p-1.5 glass rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-elevated/50 transition-all"
                aria-label="Next response"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {activeMessage.content && !activeMessage.isThinking && (
                <CopyButton content={activeMessage.content} />
              )}
            </div>
            {!activeMessage.isThinking && activeMessage.content && (
              <div className="prose prose-sm max-w-none text-text-primary dark:prose-invert">
                <ReactMarkdown>{activeMessage.content}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-3">
          {councilMessages.map((message, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={message.id}
                onClick={() => setCurrentIndex(index)}
                className={`
                  h-1.5 rounded-full transition-all
                  ${isActive 
                    ? 'w-6 bg-primary' 
                    : 'w-1.5 bg-border hover:bg-text-muted'
                  }
                `}
                aria-label={`Go to ${message.memberName}'s response`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
