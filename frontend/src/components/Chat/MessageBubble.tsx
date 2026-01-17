import React from 'react';
import ReactMarkdown from 'react-markdown';

import type { Message } from '../../types';
import { RobotAvatar } from './RobotAvatar';
import { ThinkingIndicator } from './ThinkingIndicator';

interface MessageBubbleProps {
  message: Message;
}

const memberColors: Record<string, string> = {
  alpha: 'border-l-alpha',
  beta: 'border-l-beta',
  gamma: 'border-l-gamma',
  senator: 'border-l-senator',
};

const memberBgColors: Record<string, string> = {
  alpha: 'bg-purple-50 dark:bg-purple-900/20',
  beta: 'bg-cyan-50 dark:bg-cyan-900/20',
  gamma: 'bg-orange-50 dark:bg-orange-900/20',
  senator: 'bg-yellow-50 dark:bg-yellow-900/20',
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isSenator = message.memberId === 'senator';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-primary text-white px-4 py-2 rounded-lg rounded-br-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  if (isSystem) {
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-surface px-4 py-2 rounded-full text-text-secondary text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  const memberId = message.memberId || 'alpha';
  const colorClass = memberColors[memberId] || 'border-l-gray-400';
  const bgClass = memberBgColors[memberId] || 'bg-gray-50';

  const opacityClass = isSenator ? 'opacity-100' : 'opacity-60';
  const borderWidth = isSenator ? 'border-l-4 border-2' : 'border-l-4';
  const extraSenatorStyle = isSenator ? 'ring-2 ring-senator/30 shadow-lg' : '';

  return (
    <div className={`mb-4 ${opacityClass}`}>
      <div className={`${borderWidth} ${colorClass} ${bgClass} ${extraSenatorStyle} px-4 py-3 rounded-r-lg`}>
        <div className="flex items-center gap-3 mb-2">
          <RobotAvatar memberId={memberId} size={isSenator ? 'lg' : 'md'} />
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isSenator ? 'text-base' : 'text-sm'}`}>
              {message.memberName}
            </span>
            {isSenator && (
              <span className="text-xs bg-senator/20 text-senator px-2 py-0.5 rounded-full">
                Final Verdict
              </span>
            )}
            {message.isThinking && <ThinkingIndicator />}
            {message.isStreaming && <span className="text-xs text-text-muted">typing...</span>}
          </div>
        </div>
        {!message.isThinking && message.content && (
          <div className={`prose prose-sm max-w-none ${isSenator ? 'text-text-primary' : 'text-text-secondary'} dark:prose-invert`}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
