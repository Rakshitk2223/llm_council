export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-1">
        <span
          className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span className="text-xs text-text-muted">thinking</span>
    </div>
  );
}
