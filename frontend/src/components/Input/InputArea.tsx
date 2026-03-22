import React, { useEffect, useRef, useState } from 'react';

import { addToast } from '../Toast';
import { FollowUpSuggestions } from '../Chat/FollowUpSuggestions';
import { useCouncilStream } from '../../hooks/useCouncilStream';
import { useModeStore } from '../../stores/modeStore';
import { useSessionStore } from '../../stores/sessionStore';

const MAX_QUERY_WORDS = 200;

export function InputArea() {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { councilState, currentSessionId, createSession } = useSessionStore();
  const { mode } = useModeStore();
  const { submitQuery, cancelRequest } = useCouncilStream();

  const isProcessing =
    councilState.phase !== 'idle' &&
    councilState.phase !== 'complete' &&
    councilState.phase !== 'error';

  const wordCount = query.trim() ? query.trim().split(/\s+/).length : 0;
  const isOverLimit = wordCount > MAX_QUERY_WORDS;
  const isNearLimit = wordCount > MAX_QUERY_WORDS * 0.8;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [query]);

  const submitQuestion = async (questionText: string) => {
    const trimmedQuestion = questionText.trim();
    
    if (!trimmedQuestion || isProcessing) {
      if (!trimmedQuestion) {
        addToast('Please enter a question first.', 'warning', 3000);
      }
      return;
    }

    const words = trimmedQuestion.split(/\s+/);
    if (words.length > MAX_QUERY_WORDS) {
      addToast(
        `Your question is too long (${words.length} words). Please keep it under ${MAX_QUERY_WORDS} words.`,
        'error',
        5000
      );
      return;
    }

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createSession();
    }

    setQuery('');
    const authToken = localStorage.getItem('auth_token') || '';
    await submitQuery(trimmedQuestion, authToken, mode);
  };

  const handleSubmit = async () => {
    await submitQuestion(query);
  };

  const handleCancel = () => {
    cancelRequest();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleFollowUpSelect = (question: string) => {
    submitQuestion(question);
  };

  return (
    <div className="p-4 md:p-5">
      <FollowUpSuggestions onSelect={handleFollowUpSelect} />
      <div className="relative">
        <div className="flex gap-3 items-end">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the LLM Council..."
              disabled={isProcessing}
              rows={1}
              className="w-full px-5 py-4 pr-12 
                         bg-bg-tertiary border border-surface-border rounded-xl
                         text-text-primary placeholder:text-text-muted
                         focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                         disabled:opacity-50 disabled:cursor-not-allowed
                         resize-none transition-all duration-base"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {query.trim() && !isProcessing && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {isProcessing ? (
            <button
              onClick={handleCancel}
              className="h-[52px] px-6 rounded-xl
                         bg-status-error/10 text-status-error
                         border border-status-error/20
                         hover:bg-status-error/20
                         transition-all duration-base font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Stop
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!query.trim() || isOverLimit}
              className="h-[52px] px-6 rounded-xl
                         bg-gradient-to-r from-primary to-primary-dark text-white font-medium
                         hover:shadow-glow hover:scale-[1.02]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100
                         transition-all duration-base flex items-center gap-2"
            >
              <span>Send</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex justify-between items-center mt-3 px-1">
          <p className={`text-xs font-medium ${isOverLimit ? 'text-status-error' : isNearLimit ? 'text-status-warning' : 'text-text-muted'}`}>
            {wordCount} / {MAX_QUERY_WORDS}
            {isOverLimit && ' (too long)'}
          </p>
          
          {councilState.queriesRemaining !== undefined && (
            <p className="text-xs text-text-muted">
              {councilState.queriesRemaining} queries remaining
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
