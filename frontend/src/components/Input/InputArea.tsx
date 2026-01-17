import React, { useEffect, useRef, useState } from 'react';

import { useCouncilStream } from '../../hooks/useCouncilStream';
import { useModeStore } from '../../stores/modeStore';
import { useSessionStore } from '../../stores/sessionStore';

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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [query]);

  const handleSubmit = async () => {
    if (!query.trim() || isProcessing) {
      return;
    }

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createSession();
    }

    const userQuery = query.trim();
    setQuery('');

    const authToken = localStorage.getItem('auth_token') || '';
    await submitQuery(userQuery, authToken, mode);
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

  return (
    <div className="p-3 md:p-4">
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
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-150 font-medium"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!query.trim()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 font-medium"
          >
            Send
          </button>
        )}
      </div>

      {councilState.queriesRemaining !== undefined && (
        <p className="text-xs text-text-muted mt-2 text-right">
          {councilState.queriesRemaining} queries remaining today
        </p>
      )}
    </div>
  );
}
