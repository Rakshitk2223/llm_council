import React from 'react';

export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-text-muted">thinking</span>
      <div className="flex gap-1">
        <span
          className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}
