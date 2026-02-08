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
    factual_confidence?: number;
  };
  overallAverage: number;
}

export type CouncilMode = 'fast' | 'comprehensive' | 'deep';

export interface CouncilState {
  phase: 'idle' | 'answering' | 'voting' | 'verdict' | 'complete' | 'error';
  currentMember?: string;
  votingResults?: VotingResult[];
  responseMapping?: Record<string, string>;
  votingVotes?: Record<string, Record<string, Record<string, number>>>;
  error?: string;
  queriesRemaining?: number;
  followUpQuestions?: string[];
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

export interface AvailableModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  temperature: number;
  senatorOnly?: boolean;
}

export interface CustomPersona {
  name: string;
  description: string;
  temperature: number;
  modelId?: string;
}

export interface CouncilMemberSelection {
  personaId: string;
  modelId: string;
}

export interface CouncilConfig {
  councilMembers: CouncilMemberSelection[];
  senatorPersona: string;
  senatorModel: string;
  customPersona?: CustomPersona | null;
}

export const PERSONAS: Persona[] = [
  {
    id: 'skeptic',
    name: 'The Skeptic',
    description: 'Questions everything and demands evidence. Points out logical fallacies and weak reasoning.',
    temperature: 0.3,
  },
  {
    id: 'explainer',
    name: 'The Explainer',
    description: 'Breaks down complex topics with analogies and simple language. ELI5 master.',
    temperature: 0.5,
  },
  {
    id: 'contrarian',
    name: 'The Contrarian',
    description: 'Deliberately argues the opposite view to stress-test ideas. Devil\'s advocate.',
    temperature: 0.7,
  },
  {
    id: 'maximalist',
    name: 'The Maximalist',
    description: 'Comprehensive and thorough. Leaves nothing out. Exhaustive coverage.',
    temperature: 0.6,
  },
  {
    id: 'minimalist',
    name: 'The Minimalist',
    description: 'Bottom-line focused. Shortest possible correct answer. No fluff.',
    temperature: 0.3,
  },
  {
    id: 'historian',
    name: 'The Historian',
    description: 'Provides context, background, and origins. How did we get here?',
    temperature: 0.4,
  },
  {
    id: 'futurist',
    name: 'The Futurist',
    description: 'Forward-looking perspective. Trends, predictions, and what\'s coming next.',
    temperature: 0.7,
  },
  {
    id: 'pragmatist',
    name: 'The Pragmatist',
    description: 'Actionable advice and practical guidance. Real-world application.',
    temperature: 0.5,
  },
  {
    id: 'analyst',
    name: 'The Analyst',
    description: 'Data-driven and quantitative. Focuses on numbers, statistics, and logical reasoning.',
    temperature: 0.3,
  },
  {
    id: 'empath',
    name: 'The Empath',
    description: 'Human-centered perspective. Considers feelings, user experience, and emotional impact.',
    temperature: 0.5,
  },
];

export const NEUTRAL_SENATOR: Persona = {
  id: 'neutral',
  name: 'The Neutral Judge',
  description: 'Unbiased synthesizer with no personality bias. Available for senator selection only.',
  temperature: 0.25,
  senatorOnly: true,
};

export const GREEK_LETTERS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
