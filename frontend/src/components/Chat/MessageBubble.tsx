import ReactMarkdown from 'react-markdown';

import type { Message } from '../../types';
import { RobotAvatar } from './RobotAvatar';
import { ThinkingIndicator } from './ThinkingIndicator';

interface MessageBubbleProps {
  message: Message;
}

const memberGlowClasses: Record<string, string> = {
  alpha: 'glow-alpha',
  beta: 'glow-beta',
  gamma: 'glow-gamma',
  senator: 'glow-senator',
};

const memberBorderColors: Record<string, string> = {
  alpha: 'border-l-alpha',
  beta: 'border-l-beta',
  gamma: 'border-l-gamma',
  senator: 'border-l-senator',
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isSenator = message.memberId === 'senator';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-gradient-to-r from-primary to-accent text-white px-4 py-3 rounded-xl rounded-br-sm shadow-md">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  if (isSystem) {
    return (
      <div className="flex justify-center mb-4">
        <div className="glass px-4 py-2 rounded-full text-text-secondary text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  const memberId = message.memberId || 'alpha';
  const glowClass = isSenator ? memberGlowClasses[memberId] : '';
  const borderColor = memberBorderColors[memberId] || 'border-l-gray-400';

  return (
    <div className={`mb-4 ${isSenator ? '' : 'opacity-70 hover:opacity-100 transition-opacity'}`}>
      <div 
        className={`
          glass-elevated 
          border-l-4 ${borderColor}
          ${isSenator ? glowClass : ''} 
          px-4 py-4 
          rounded-xl rounded-l-sm
          transition-all duration-300
        `}
      >
        <div className="flex items-center gap-3 mb-3">
          <RobotAvatar memberId={memberId} size={isSenator ? 'lg' : 'md'} />
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isSenator ? 'text-base' : 'text-sm'}`}>
              {message.memberName}
            </span>
            {isSenator && (
              <span className="text-xs bg-gradient-to-r from-senator/30 to-senator/10 text-senator px-3 py-1 rounded-full border border-senator/30">
                Final Verdict
              </span>
            )}
            {message.isThinking && <ThinkingIndicator />}
            {message.isStreaming && (
              <span className="text-xs text-accent animate-pulse">streaming...</span>
            )}
          </div>
        </div>
        {!message.isThinking && message.content && (
          <div className={`prose prose-sm max-w-none dark:prose-invert ${isSenator ? 'text-text-primary' : 'text-text-secondary'}`}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
