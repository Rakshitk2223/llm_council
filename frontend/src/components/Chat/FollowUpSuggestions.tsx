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
  const marker = 'FOLLOW_UP_QUESTIONS:';
  const markerIndex = verdict.indexOf(marker);
  
  if (markerIndex === -1) {
    return [];
  }

  const questionsSection = verdict.substring(markerIndex + marker.length);
  const lines = questionsSection.split('\n').filter(line => line.trim());
  
  const questions: string[] = [];
  for (const line of lines) {
    const match = line.match(/^\d+\.\s*(.+)/);
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
  const marker = 'FOLLOW_UP_QUESTIONS:';
  const markerIndex = verdict.indexOf(marker);
  
  if (markerIndex === -1) {
    return verdict;
  }

  return verdict.substring(0, markerIndex).trim();
}
