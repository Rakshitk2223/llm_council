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
      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg 
                 text-text-muted hover:text-text-primary hover:bg-surface
                 transition-all duration-fast"
      title={copied ? 'Copied!' : 'Copy'}
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-success">
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
      <div className="flex justify-end mb-5 animate-slide-up">
        <div className="max-w-[75%] flex items-start gap-3">
          <div className="px-5 py-3.5 rounded-2xl rounded-br-md
                          bg-gradient-to-r from-primary to-primary-dark
                          text-white shadow-lg">
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSystem) {
    const isEvaluating = message.content.toLowerCase().includes('evaluating');
    const isComplete = message.content.toLowerCase().includes('available') || message.content.toLowerCase().includes('complete');
    
    return (
      <div className="flex justify-center mb-5 animate-fade-in">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-full
                        bg-surface border border-surface-border">
          {isEvaluating && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <span className="text-text-secondary">Processing</span>
            </div>
          )}
          {isComplete && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-status-success/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-status-success">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-text-secondary">{message.content}</span>
            </div>
          )}
          {!isEvaluating && !isComplete && (
            <span className="text-text-secondary">{message.content}</span>
          )}
        </div>
      </div>
    );
  }

  const getGlowClass = () => {
    if (isSenator) return 'shadow-glow-senator';
    const memberNum = message.memberId?.match(/\d+/)?.[0];
    if (memberNum === '1') return 'shadow-glow-alpha';
    if (memberNum === '2') return 'shadow-glow-beta';
    if (memberNum === '3') return 'shadow-glow-gamma';
    return '';
  };

  return (
    <div className={`group mb-5 animate-slide-up ${getGlowClass()}`}>
      <div 
        className={`p-5 rounded-2xl rounded-l-md
                   bg-bg-elevated border border-surface-border
                   hover:border-surface-border-hover
                   transition-all duration-base ${isSenator ? 'border-l-2 border-l-accent' : ''}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <RobotAvatar memberId={message.memberId || 'alpha'} size={isSenator ? 'lg' : 'md'} />
          <div className="flex items-center gap-2 flex-1">
            <span className={`font-semibold ${isSenator ? 'text-base text-accent' : 'text-sm'}`}>
              {message.memberName}
            </span>
            {isSenator && (
              <span className="badge-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mr-1.5 animate-pulse" />
                Final Verdict
              </span>
            )}
            {message.isThinking && <ThinkingIndicator />}
            {message.isStreaming && (
              <span className="text-xs text-text-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                streaming
              </span>
            )}
          </div>
          {message.content && !message.isThinking && (
            <CopyButton content={message.content} />
          )}
        </div>
        
        {!message.isThinking && message.content && (
          <div className="prose prose-sm max-w-none 
                          prose-headings:text-text-primary prose-p:text-text-secondary
                          prose-strong:text-text-primary prose-li:text-text-secondary
                          prose-a:text-primary prose-code:text-accent">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
