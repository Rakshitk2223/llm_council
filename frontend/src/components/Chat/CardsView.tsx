import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

import type { Message } from '../../types';
import { RobotAvatar } from './RobotAvatar';
import { ThinkingIndicator } from './ThinkingIndicator';

interface CardsViewProps {
  messages: Message[];
}

const memberBorderColors: Record<string, string> = {
  alpha: 'border-l-alpha',
  beta: 'border-l-beta',
  gamma: 'border-l-gamma',
};

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

  return (
    <div className="mb-4">
      <div className="relative">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="p-2 glass rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-elevated/50 transition-all"
            aria-label="Previous response"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {councilMessages.map((message, index) => {
                const memberId = message.memberId || 'alpha';
                const isActive = index === currentIndex;
                const borderColor = memberBorderColors[memberId] || 'border-l-gray-400';

                return (
                  <div
                    key={message.id}
                    className="w-full flex-shrink-0"
                    style={{
                      opacity: isActive ? 0.7 : 0.2,
                      transition: 'opacity 0.3s ease-out',
                    }}
                  >
                    <div
                      className={`
                        glass-elevated 
                        border-l-4 ${borderColor}
                        px-4 py-4 
                        rounded-xl rounded-l-sm
                        transition-all duration-300
                        max-h-[350px]
                        overflow-y-auto
                      `}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <RobotAvatar memberId={memberId} size="md" />
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{message.memberName}</span>
                          {message.isThinking && <ThinkingIndicator />}
                          {message.isStreaming && (
                            <span className="text-xs text-accent animate-pulse">streaming...</span>
                          )}
                        </div>
                      </div>
                      {!message.isThinking && message.content && (
                        <div className="prose prose-sm max-w-none text-text-secondary dark:prose-invert">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={goToNext}
            disabled={currentIndex === councilMessages.length - 1}
            className="p-2 glass rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-elevated/50 transition-all"
            aria-label="Next response"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-3">
          {councilMessages.map((message, index) => {
            const memberId = message.memberId || 'alpha';
            const isActive = index === currentIndex;
            return (
              <button
                key={message.id}
                onClick={() => setCurrentIndex(index)}
                className={`
                  h-1.5 rounded-full transition-all duration-300
                  ${isActive 
                    ? `w-6 bg-${memberId}` 
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
