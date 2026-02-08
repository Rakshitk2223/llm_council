import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-error/10 text-error border border-error/30 rounded-md px-4 py-3 text-sm">
      {message}
    </div>
  );
}
