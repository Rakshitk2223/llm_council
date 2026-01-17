export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  memberName?: string;
  memberId?: string;
  timestamp: number;
  isStreaming?: boolean;
  isThinking?: boolean;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface VotingResult {
  responseLabel: string;
  memberId: string;
  memberName: string;
  averageScores: {
    accuracy: number;
    relevance: number;
    clarity: number;
    completeness: number;
  };
  overallAverage: number;
}

export type CouncilMode = 'fast' | 'comprehensive';

export interface CouncilState {
  phase: 'idle' | 'answering' | 'voting' | 'verdict' | 'complete' | 'error';
  currentMember?: string;
  votingResults?: VotingResult[];
  responseMapping?: Record<string, string>;
  votingVotes?: Record<string, Record<string, Record<string, number>>>;
  error?: string;
  queriesRemaining?: number;
}

export type SSEEventType =
  | 'council_start'
  | 'thinking'
  | 'answer_chunk'
  | 'answer_complete'
  | 'voting_start'
  | 'voting_skipped'
  | 'voting_complete'
  | 'senator_start'
  | 'verdict_chunk'
  | 'verdict_complete'
  | 'council_complete'
  | 'error';

export interface SSEEvent {
  event: SSEEventType;
  data: any;
}

export type Theme = 'light' | 'dark';
