import React, { useEffect, useRef, useState } from 'react';

import { addToast } from '../Toast';
import { FollowUpSuggestions } from '../Chat/FollowUpSuggestions';
import { useCouncilStream } from '../../hooks/useCouncilStream';
import { useModeStore } from '../../stores/modeStore';
import { useSessionStore } from '../../stores/sessionStore';

// Maximum query length in words - can be adjusted as needed
const MAX_QUERY_WORDS = 500;

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

  // Calculate word count
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

    // Check word count
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
    <div className="p-3 md:p-4">
      <FollowUpSuggestions onSelect={handleFollowUpSelect} />
      <div className="flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the Axis Council..."
          disabled={isProcessing}
          rows={1}
          className="flex-1 resize-none px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-text-primary placeholder:text-text-muted"
        />
        {isProcessing ? (
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-error text-white rounded-lg hover:opacity-90 transition-colors duration-150 font-medium"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!query.trim() || isOverLimit}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 font-medium"
          >
            Send
          </button>
        )}
      </div>

      <div className="flex justify-between items-center mt-2">
        <p className={`text-xs ${isOverLimit ? 'text-error font-medium' : isNearLimit ? 'text-warning' : 'text-text-muted'}`}>
          {wordCount} / {MAX_QUERY_WORDS} words
          {isOverLimit && ' (too long)'}
        </p>
        
        {councilState.queriesRemaining !== undefined && (
          <p className="text-xs text-text-muted">
            {councilState.queriesRemaining} queries remaining today
          </p>
        )}
      </div>
    </div>
  );
}
