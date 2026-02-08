import { create } from 'zustand';

import { CouncilState, Message, Session, VotingResult } from '../types';

interface SessionStore {
  sessions: Session[];
  currentSessionId: string | null;
  councilState: CouncilState;
  createSession: () => string;
  selectSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  deleteSession: (id: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  appendToMessage: (id: string, chunk: string) => void;
  setCouncilPhase: (phase: CouncilState['phase']) => void;
  setCurrentMember: (member: string | undefined) => void;
  setVotingResults: (
    results: VotingResult[],
    mapping: Record<string, string>,
    votes?: Record<string, Record<string, Record<string, number>>>
  ) => void;
  setFollowUpQuestions: (questions: string[] | undefined) => void;
  setError: (error: string | undefined) => void;
  setQueriesRemaining: (count: number) => void;
  resetCouncilState: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = 'axis-council-sessions';

const generateId = () => Math.random().toString(36).substring(2, 15);

const initialCouncilState: CouncilState = {
  phase: 'idle',
  currentMember: undefined,
  votingResults: undefined,
  responseMapping: undefined,
  votingVotes: undefined,
  error: undefined,
  queriesRemaining: undefined,
  followUpQuestions: undefined,
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  councilState: initialCouncilState,
  createSession: () => {
    const id = generateId();
    const newSession: Session = {
      id,
      title: 'New Session',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      currentSessionId: id,
    }));
    get().saveToStorage();
    return id;
  },
  selectSession: (id) => {
    set({ currentSessionId: id });
    get().resetCouncilState();
  },
  renameSession: (id, title) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === id
          ? { ...session, title, updatedAt: Date.now() }
          : session
      ),
    }));
    get().saveToStorage();
  },
  deleteSession: (id) => {
    set((state) => {
      const newSessions = state.sessions.filter((session) => session.id !== id);
      const newCurrentId =
        state.currentSessionId === id ? newSessions[0]?.id || null : state.currentSessionId;
      return { sessions: newSessions, currentSessionId: newCurrentId };
    });
    get().saveToStorage();
  },
  addMessage: (message) => {
    const id = generateId();
    const fullMessage: Message = {
      ...message,
      id,
      timestamp: Date.now(),
    };
    set((state) => {
      const currentSession = state.sessions.find(
        (session) => session.id === state.currentSessionId
      );
      if (!currentSession) {
        return state;
      }
      const isFirstUserMessage =
        message.role === 'user' &&
        currentSession.messages.filter((entry) => entry.role === 'user').length === 0;
      const newTitle = isFirstUserMessage
        ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
        : currentSession.title;
      return {
        sessions: state.sessions.map((session) =>
          session.id === state.currentSessionId
            ? {
                ...session,
                title: newTitle,
                messages: [...session.messages, fullMessage],
                updatedAt: Date.now(),
              }
            : session
        ),
      };
    });
    get().saveToStorage();
    return id;
  },
  updateMessage: (id, updates) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === state.currentSessionId
          ? {
              ...session,
              messages: session.messages.map((message) =>
                message.id === id ? { ...message, ...updates } : message
              ),
              updatedAt: Date.now(),
            }
          : session
      ),
    }));
    get().saveToStorage();
  },
  appendToMessage: (id, chunk) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === state.currentSessionId
          ? {
              ...session,
              messages: session.messages.map((message) =>
                message.id === id
                  ? { ...message, content: message.content + chunk }
                  : message
              ),
            }
          : session
      ),
    }));
  },
  setCouncilPhase: (phase) => {
    set((state) => ({
      councilState: { ...state.councilState, phase },
    }));
  },
  setCurrentMember: (member) => {
    set((state) => ({
      councilState: { ...state.councilState, currentMember: member },
    }));
  },
  setVotingResults: (results, mapping, votes) => {
    set((state) => ({
      councilState: {
        ...state.councilState,
        votingResults: results,
        responseMapping: mapping,
        votingVotes: votes,
      },
    }));
  },
  setError: (error) => {
    set((state) => ({
      councilState: { ...state.councilState, phase: 'error', error },
    }));
  },
  setQueriesRemaining: (count) => {
    set((state) => ({
      councilState: { ...state.councilState, queriesRemaining: count },
    }));
  },
  setFollowUpQuestions: (questions) => {
    set((state) => ({
      councilState: { ...state.councilState, followUpQuestions: questions },
    }));
  },
  resetCouncilState: () => {
    set({ councilState: initialCouncilState });
  },
  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const sessions: Session[] = JSON.parse(stored);
        const sanitizedSessions = sessions.map((session) => ({
          ...session,
          messages: session.messages.map((message) => ({
            ...message,
            isThinking: false,
            isStreaming: false,
          })),
        }));
        set({
          sessions: sanitizedSessions,
          currentSessionId: sanitizedSessions[0]?.id || null,
        });
      }
    } catch (error) {
      console.error('Failed to load sessions from storage:', error);
    }
  },
  saveToStorage: () => {
    try {
      const { sessions } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save sessions to storage:', error);
    }
  },
}));
