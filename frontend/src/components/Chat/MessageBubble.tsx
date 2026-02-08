import { useState } from 'react';
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
      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-surface-elevated text-text-muted hover:text-text-primary"
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

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isSenator = message.memberId === 'senator';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-text-primary text-text-inverse px-4 py-3 rounded-xl rounded-br-sm shadow-md">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  if (isSystem) {
    const isEvaluating = message.content.toLowerCase().includes('evaluating');
    const isComplete = message.content.toLowerCase().includes('available') || message.content.toLowerCase().includes('complete');
    
    return (
      <div className="flex justify-center mb-4">
        <div className="glass px-4 py-2 rounded-full text-text-muted text-sm flex items-center gap-2">
          {isEvaluating && (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {isComplete && (
            <svg className="w-3 h-3 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`group mb-4`}>
      <div 
        className={`glass-elevated border-l-4 border-border px-4 py-4 rounded-xl rounded-l-sm transition-colors ${
          isSenator ? 'ring-1 ring-border' : 'hover:bg-surface-elevated/80'
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <RobotAvatar memberId={message.memberId || 'alpha'} size={isSenator ? 'lg' : 'md'} />
          <div className="flex items-center gap-2 flex-1">
            <span className={`font-semibold ${isSenator ? 'text-base' : 'text-sm'}`}>
              {message.memberName}
            </span>
            {isSenator && (
              <span className="text-xs px-3 py-1 rounded-full border border-border bg-surface-elevated text-text-muted">
                Final Verdict
              </span>
            )}
            {message.isThinking && <ThinkingIndicator />}
            {message.isStreaming && (
              <span className="text-xs text-text-muted animate-pulse">streaming...</span>
            )}
          </div>
          {message.content && !message.isThinking && (
            <CopyButton content={message.content} />
          )}
        </div>
        {!message.isThinking && message.content && (
          <div className="prose prose-sm max-w-none dark:prose-invert text-text-primary">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
