import { useSessionStore } from '../../stores/sessionStore';

interface FollowUpSuggestionsProps {
  onSelect: (question: string) => void;
}

export function FollowUpSuggestions({ onSelect }: FollowUpSuggestionsProps) {
  const { councilState } = useSessionStore();
  const { followUpQuestions, phase } = councilState;

  if (phase !== 'complete' || !followUpQuestions || followUpQuestions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {followUpQuestions.map((question, index) => (
        <button
          key={index}
          onClick={() => onSelect(question)}
          className="glass px-3 py-1.5 rounded-full text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50 transition-all cursor-pointer border border-transparent hover:border-border"
        >
          {question}
        </button>
      ))}
    </div>
  );
}

export function parseFollowUpQuestions(verdict: string): string[] {
  const markerPattern = /follow[_-]?up[_-]?questions?:?/i;
  const markerMatch = verdict.match(markerPattern);
  
  if (!markerMatch) {
    return [];
  }

  const markerIndex = markerMatch.index! + markerMatch[0].length;
  const questionsSection = verdict.substring(markerIndex);
  const lines = questionsSection.split('\n').filter(line => line.trim());
  
  const questions: string[] = [];
  for (const line of lines) {
    const trimmedLine = line.trim();
    const match = trimmedLine.match(/^(?:\d+[.):]\s*|[-*]\s*)(.+)/);
    if (match) {
      const question = match[1].trim().replace(/^\[|\]$/g, '');
      if (question) {
        questions.push(question);
      }
    }
  }

  return questions.slice(0, 3);
}

export function removeFollowUpSection(verdict: string): string {
  const markerPattern = /follow[_-]?up[_-]?questions?:?/i;
  const markerMatch = verdict.match(markerPattern);
  
  if (!markerMatch) {
    return verdict;
  }

  return verdict.substring(0, markerMatch.index).trim();
}
