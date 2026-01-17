# Axis Council - Frontend Implementation Guide

## Overview

The frontend is a React application built with Vite and TypeScript, styled with Tailwind CSS. It provides a chat-like interface for users to interact with the Axis Council, displaying the deliberation process in real-time via Server-Sent Events.

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx                 # Main layout wrapper
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx            # Sessions sidebar
│   │   │   ├── SessionItem.tsx        # Individual session item
│   │   │   └── NewSessionButton.tsx   # "+ New Session" button
│   │   ├── Chat/
│   │   │   ├── ChatArea.tsx           # Main chat display
│   │   │   ├── MessageBubble.tsx      # Individual message (grayed for council, prominent for senator)
│   │   │   ├── RobotAvatar.tsx        # Robot/avatar icons for council members
│   │   │   ├── ThinkingIndicator.tsx  # "Thinking..." animation
│   │   │   └── VotingDisplay.tsx      # Ratings matrix (shown all at once)
│   │   ├── Input/
│   │   │   └── InputArea.tsx          # Query input + send button
│   │   ├── Theme/
│   │   │   └── ThemeToggle.tsx        # Light/Dark mode switch
│   │   └── Error/
│   │       └── ErrorMessage.tsx       # Error state displays
│   ├── hooks/
│   │   ├── useCouncilStream.ts        # SSE connection management
│   │   ├── useSessions.ts             # Session localStorage logic
│   │   └── useTheme.ts                # Theme management
│   ├── stores/
│   │   └── sessionStore.ts            # Zustand store for state
│   ├── services/
│   │   └── api.ts                     # API client
│   ├── types/
│   │   └── index.ts                   # TypeScript types
│   ├── styles/
│   │   ├── theme.css                  # CSS variables for theming
│   │   └── index.css                  # Global styles + Tailwind
│   ├── utils/
│   │   └── helpers.ts                 # Utility functions
│   ├── App.tsx                        # Root component
│   └── main.tsx                       # Entry point
├── public/
│   └── favicon.ico
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── Dockerfile
```

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.0",
    "vite": "^5.1.0"
  }
}
```

---

## Theme System

### CSS Variables (styles/theme.css)

```css
:root {
  /* Primary Colors - Update these to match main dashboard */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-light: #eff6ff;
  
  /* Background Colors */
  --color-background: #ffffff;
  --color-surface: #f9fafb;
  --color-surface-elevated: #ffffff;
  
  /* Text Colors */
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  
  /* Border Colors */
  --color-border: #e5e7eb;
  --color-border-light: #f3f4f6;
  
  /* Status Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Council Member Colors */
  --color-alpha: #8b5cf6;      /* Purple for Axis Alpha */
  --color-beta: #06b6d4;       /* Cyan for Axis Beta */
  --color-gamma: #f97316;      /* Orange for Axis Gamma */
  --color-senator: #eab308;    /* Gold for Senator Axis */
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  
  /* Spacing */
  --sidebar-width: 280px;
  --input-height: 80px;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;
}

/* Dark Theme */
[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-primary-hover: #3b82f6;
  --color-primary-light: #1e3a5f;
  
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-surface-elevated: #334155;
  
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
  
  --color-border: #334155;
  --color-border-light: #1e293b;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
}
```

### Tailwind Configuration (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-light': 'var(--color-primary-light)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        alpha: 'var(--color-alpha)',
        beta: 'var(--color-beta)',
        gamma: 'var(--color-gamma)',
        senator: 'var(--color-senator)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
      },
      width: {
        'sidebar': 'var(--sidebar-width)',
      },
      height: {
        'input': 'var(--input-height)',
      },
    },
  },
  plugins: [],
}
```

---

## TypeScript Types (types/index.ts)

```typescript
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

export interface CouncilState {
  phase: 'idle' | 'answering' | 'voting' | 'verdict' | 'complete' | 'error';
  currentMember?: string;
  votingResults?: VotingResult[];
  responseMapping?: Record<string, string>;
  error?: string;
  queriesRemaining?: number;
}

// SSE Event Types
export type SSEEventType = 
  | 'council_start'
  | 'thinking'
  | 'answer_chunk'
  | 'answer_complete'
  | 'voting_start'
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
```

---

## State Management (stores/sessionStore.ts)

```typescript
import { create } from 'zustand';
import { Session, Message, CouncilState, VotingResult } from '../types';

interface SessionStore {
  // Sessions
  sessions: Session[];
  currentSessionId: string | null;
  
  // Council State
  councilState: CouncilState;
  
  // Actions - Sessions
  createSession: () => string;
  selectSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  deleteSession: (id: string) => void;
  
  // Actions - Messages
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  appendToMessage: (id: string, chunk: string) => void;
  
  // Actions - Council State
  setCouncilPhase: (phase: CouncilState['phase']) => void;
  setCurrentMember: (member: string | undefined) => void;
  setVotingResults: (results: VotingResult[], mapping: Record<string, string>) => void;
  setError: (error: string | undefined) => void;
  setQueriesRemaining: (count: number) => void;
  resetCouncilState: () => void;
  
  // Persistence
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
  error: undefined,
  queriesRemaining: undefined,
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
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, title, updatedAt: Date.now() } : s
      ),
    }));
    get().saveToStorage();
  },
  
  deleteSession: (id) => {
    set((state) => {
      const newSessions = state.sessions.filter((s) => s.id !== id);
      const newCurrentId = state.currentSessionId === id
        ? newSessions[0]?.id || null
        : state.currentSessionId;
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
        (s) => s.id === state.currentSessionId
      );
      
      if (!currentSession) return state;
      
      // Update session title if first user message
      const isFirstUserMessage = 
        message.role === 'user' && 
        currentSession.messages.filter((m) => m.role === 'user').length === 0;
      
      const newTitle = isFirstUserMessage
        ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
        : currentSession.title;
      
      return {
        sessions: state.sessions.map((s) =>
          s.id === state.currentSessionId
            ? {
                ...s,
                title: newTitle,
                messages: [...s.messages, fullMessage],
                updatedAt: Date.now(),
              }
            : s
        ),
      };
    });
    
    get().saveToStorage();
    return id;
  },
  
  updateMessage: (id, updates) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === state.currentSessionId
          ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === id ? { ...m, ...updates } : m
              ),
              updatedAt: Date.now(),
            }
          : s
      ),
    }));
  },
  
  appendToMessage: (id, chunk) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === state.currentSessionId
          ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === id ? { ...m, content: m.content + chunk } : m
              ),
            }
          : s
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
  
  setVotingResults: (results, mapping) => {
    set((state) => ({
      councilState: {
        ...state.councilState,
        votingResults: results,
        responseMapping: mapping,
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
  
  resetCouncilState: () => {
    set({ councilState: initialCouncilState });
  },
  
  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const sessions: Session[] = JSON.parse(stored);
        set({
          sessions,
          currentSessionId: sessions[0]?.id || null,
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
```

---

## SSE Hook (hooks/useCouncilStream.ts)

```typescript
import { useCallback, useRef } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { Message, SSEEvent } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useCouncilStream() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageIdRef = useRef<string | null>(null);
  
  const {
    addMessage,
    updateMessage,
    appendToMessage,
    setCouncilPhase,
    setCurrentMember,
    setVotingResults,
    setError,
    setQueriesRemaining,
    resetCouncilState,
  } = useSessionStore();
  
  const getCurrentSession = () => {
    const state = useSessionStore.getState();
    return state.sessions.find((s) => s.id === state.currentSessionId);
  };
  
  const submitQuery = useCallback(async (query: string, authToken: string) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    // Reset state
    resetCouncilState();
    
    // Add user message
    addMessage({ role: 'user', content: query });
    
    // Get session history for context
    const session = getCurrentSession();
    const sessionHistory = session?.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role,
        content: m.content,
        member_name: m.memberName,
      })) || [];
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/council/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          query,
          session_history: sessionHistory,
        }),
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.error || 'Request failed');
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('No response body');
      
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('event:')) {
            const eventType = line.slice(6).trim();
            continue;
          }
          
          if (line.startsWith('data:')) {
            const data = JSON.parse(line.slice(5).trim());
            handleSSEEvent(data);
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      const errorMessage = error.message || 'Council is temporarily unavailable';
      setError(errorMessage);
      addMessage({
        role: 'system',
        content: errorMessage,
      });
    }
  }, []);
  
  const handleSSEEvent = (event: SSEEvent) => {
    switch (event.event) {
      case 'council_start':
        setCouncilPhase('answering');
        break;
        
      case 'thinking':
        setCurrentMember(event.data.member);
        // Add thinking message
        const thinkingId = addMessage({
          role: 'assistant',
          content: '',
          memberName: event.data.member,
          memberId: event.data.member_id,
          isThinking: true,
        });
        currentMessageIdRef.current = thinkingId;
        break;
        
      case 'answer_chunk':
        if (currentMessageIdRef.current) {
          // Update from thinking to streaming
          updateMessage(currentMessageIdRef.current, { isThinking: false, isStreaming: true });
          appendToMessage(currentMessageIdRef.current, event.data.chunk);
        }
        break;
        
      case 'answer_complete':
        if (currentMessageIdRef.current) {
          updateMessage(currentMessageIdRef.current, {
            isStreaming: false,
            content: event.data.full_answer,
          });
          currentMessageIdRef.current = null;
        }
        break;
        
      case 'voting_start':
        setCouncilPhase('voting');
        addMessage({
          role: 'system',
          content: 'Council members are evaluating responses...',
        });
        break;
        
      case 'voting_complete':
        setVotingResults(event.data.results, event.data.mapping);
        break;
        
      case 'senator_start':
        setCouncilPhase('verdict');
        setCurrentMember(event.data.member);
        const verdictId = addMessage({
          role: 'assistant',
          content: '',
          memberName: event.data.member,
          memberId: 'senator',
          isThinking: true,
        });
        currentMessageIdRef.current = verdictId;
        break;
        
      case 'verdict_chunk':
        if (currentMessageIdRef.current) {
          updateMessage(currentMessageIdRef.current, { isThinking: false, isStreaming: true });
          appendToMessage(currentMessageIdRef.current, event.data.chunk);
        }
        break;
        
      case 'verdict_complete':
        if (currentMessageIdRef.current) {
          updateMessage(currentMessageIdRef.current, {
            isStreaming: false,
            content: event.data.verdict,
          });
          currentMessageIdRef.current = null;
        }
        setCouncilPhase('complete');
        break;
        
      case 'council_complete':
        setCouncilPhase('complete');
        if (event.data.queries_remaining !== undefined) {
          setQueriesRemaining(event.data.queries_remaining);
        }
        break;
        
      case 'error':
        setError(event.data.error);
        break;
    }
  };
  
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    resetCouncilState();
  }, []);
  
  return { submitQuery, cancelRequest };
}
```

---

## Theme Hook (hooks/useTheme.ts)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Theme } from '../types';

const THEME_KEY = 'axis-council-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    
    // Fall back to system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  
  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);
  
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);
  
  return { theme, toggleTheme, setTheme };
}
```

---

## Components

### Layout Component (components/Layout.tsx)

```tsx
import React from 'react';
import { Sidebar } from './Sidebar/Sidebar';
import { ChatArea } from './Chat/ChatArea';
import { InputArea } from './Input/InputArea';
import { ThemeToggle } from './Theme/ThemeToggle';

export function Layout() {
  return (
    <div className="flex h-screen bg-background text-text-primary">
      {/* Sidebar */}
      <aside className="w-sidebar border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="font-semibold text-lg">Axis Council</h1>
          <ThemeToggle />
        </div>
        <Sidebar />
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <ChatArea />
        </div>
        
        {/* Input Area */}
        <div className="border-t border-border">
          <InputArea />
        </div>
      </main>
    </div>
  );
}
```

### Sidebar Component (components/Sidebar/Sidebar.tsx)

```tsx
import React from 'react';
import { useSessionStore } from '../../stores/sessionStore';
import { SessionItem } from './SessionItem';
import { NewSessionButton } from './NewSessionButton';

export function Sidebar() {
  const { sessions, currentSessionId, createSession, selectSession } = useSessionStore();
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-3">
        <NewSessionButton onClick={createSession} />
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {sessions.map((session) => (
          <SessionItem
            key={session.id}
            session={session}
            isActive={session.id === currentSessionId}
            onSelect={() => selectSession(session.id)}
          />
        ))}
        
        {sessions.length === 0 && (
          <p className="text-text-muted text-sm text-center py-4">
            No sessions yet. Start a new one!
          </p>
        )}
      </div>
    </div>
  );
}
```

### Session Item Component (components/Sidebar/SessionItem.tsx)

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { Session } from '../../types';
import { useSessionStore } from '../../stores/sessionStore';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onSelect: () => void;
}

export function SessionItem({ session, isActive, onSelect }: SessionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const { renameSession, deleteSession } = useSessionStore();
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const handleRename = () => {
    if (editTitle.trim()) {
      renameSession(session.id, editTitle.trim());
    }
    setIsEditing(false);
    setShowMenu(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditTitle(session.title);
      setIsEditing(false);
    }
  };
  
  return (
    <div
      className={`
        group relative flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer
        transition-colors duration-150
        ${isActive 
          ? 'bg-primary-light text-primary' 
          : 'hover:bg-surface text-text-secondary hover:text-text-primary'
        }
      `}
      onClick={onSelect}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-b border-primary outline-none text-sm"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <span className="flex-1 truncate text-sm">{session.title}</span>
          
          {/* Three-dot menu */}
          <button
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-border rounded transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 bg-surface-elevated border border-border rounded-md shadow-md py-1 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-surface"
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
              >
                Rename
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-surface"
                onClick={() => {
                  deleteSession(session.id);
                  setShowMenu(false);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

### New Session Button (components/Sidebar/NewSessionButton.tsx)

```tsx
import React from 'react';

interface NewSessionButtonProps {
  onClick: () => void;
}

export function NewSessionButton({ onClick }: NewSessionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        w-full flex items-center justify-center gap-2 
        px-4 py-2 rounded-md
        bg-primary text-white
        hover:bg-primary-hover
        transition-colors duration-150
        font-medium text-sm
      "
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      New Session
    </button>
  );
}
```

### Message Bubble Component (components/Chat/MessageBubble.tsx)

```tsx
import React from 'react';
import { Message } from '../../types';
import { ThinkingIndicator } from './ThinkingIndicator';
import { RobotAvatar } from './RobotAvatar';

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
  
  // Council member message
  const memberId = message.memberId || 'alpha';
  const colorClass = memberColors[memberId] || 'border-l-gray-400';
  const bgClass = memberBgColors[memberId] || 'bg-gray-50';
  
  // Senator gets prominent styling (100% opacity, special border)
  // Council members get grayed out styling (50% opacity)
  const opacityClass = isSenator ? 'opacity-100' : 'opacity-60';
  const borderWidth = isSenator ? 'border-l-4 border-2' : 'border-l-4';
  const extraSenatorStyle = isSenator ? 'ring-2 ring-senator/30 shadow-lg' : '';
  
  return (
    <div className={`mb-4 ${opacityClass}`}>
      <div className={`${borderWidth} ${colorClass} ${bgClass} ${extraSenatorStyle} px-4 py-3 rounded-r-lg`}>
        {/* Header with Robot Avatar */}
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
            {message.isStreaming && (
              <span className="text-xs text-text-muted">typing...</span>
            )}
          </div>
        </div>
        {!message.isThinking && (
          <p className={`whitespace-pre-wrap ${isSenator ? 'text-text-primary' : 'text-text-secondary'}`}>
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
}
```

### Robot Avatar Component (components/Chat/RobotAvatar.tsx)

```tsx
import React from 'react';

interface RobotAvatarProps {
  memberId: string;
  size?: 'sm' | 'md' | 'lg';
}

const avatarColors: Record<string, { bg: string; accent: string }> = {
  alpha: { bg: 'bg-alpha/20', accent: 'text-alpha' },
  beta: { bg: 'bg-beta/20', accent: 'text-beta' },
  gamma: { bg: 'bg-gamma/20', accent: 'text-gamma' },
  senator: { bg: 'bg-senator/20', accent: 'text-senator' },
};

const sizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

export function RobotAvatar({ memberId, size = 'md' }: RobotAvatarProps) {
  const colors = avatarColors[memberId] || avatarColors.alpha;
  const sizeClass = sizes[size];
  const isSenator = memberId === 'senator';
  
  return (
    <div className={`${sizeClass} ${colors.bg} rounded-full flex items-center justify-center`}>
      {isSenator ? (
        // Senator icon (gavel/judge)
        <svg 
          className={`w-5 h-5 ${colors.accent}`} 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z"/>
        </svg>
      ) : (
        // Robot icon for council members
        <svg 
          className={`w-4 h-4 ${colors.accent}`} 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2M7.5 13A2.5 2.5 0 005 15.5 2.5 2.5 0 007.5 18a2.5 2.5 0 002.5-2.5A2.5 2.5 0 007.5 13m9 0a2.5 2.5 0 00-2.5 2.5 2.5 2.5 0 002.5 2.5 2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-2.5-2.5z"/>
        </svg>
      )}
    </div>
  );
}
```

### Thinking Indicator (components/Chat/ThinkingIndicator.tsx)

```tsx
import React from 'react';

export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-text-muted">thinking</span>
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
```

### Voting Display Component (components/Chat/VotingDisplay.tsx)

Shows all voting results at once (not collapsed) for transparency.

```tsx
import React from 'react';
import { VotingResult } from '../../types';
import { RobotAvatar } from './RobotAvatar';

interface VotingDisplayProps {
  results: VotingResult[];
  mapping: Record<string, string>;
}

export function VotingDisplay({ results, mapping }: VotingDisplayProps) {
  return (
    <div className="mb-4 bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-surface-elevated">
        <span className="font-semibold text-sm">Council Voting Results</span>
      </div>
      
      {/* Voting Results - Always visible */}
      <div className="px-4 py-4">
        {/* Individual votes display */}
        <div className="space-y-3 mb-4">
          {results.map((result) => (
            <div key={result.memberId} className="flex items-center gap-3">
              <RobotAvatar memberId={result.memberId} size="sm" />
              <span className="text-sm font-medium w-24">{result.memberName}</span>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-text-muted">votes:</span>
                {Object.entries(mapping).map(([label, memberName]) => (
                  <span key={label} className="text-xs bg-surface-elevated px-2 py-1 rounded">
                    {label}: {result.averageScores ? 
                      ((result.averageScores.accuracy + result.averageScores.relevance + 
                        result.averageScores.clarity + result.averageScores.completeness) / 4).toFixed(1) 
                      : 'N/A'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 text-left">Response</th>
              <th className="py-2 text-center">Accuracy</th>
              <th className="py-2 text-center">Relevance</th>
              <th className="py-2 text-center">Clarity</th>
              <th className="py-2 text-center">Complete</th>
              <th className="py-2 text-center font-bold">Avg</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => (
              <tr
                key={result.memberId}
                className={idx === 0 ? 'bg-primary-light' : ''}
              >
                <td className="py-2 flex items-center gap-2">
                  <RobotAvatar memberId={result.memberId} size="sm" />
                  {result.memberName}
                  {idx === 0 && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      Highest Rated
                    </span>
                  )}
                </td>
                <td className="py-2 text-center">{result.averageScores.accuracy.toFixed(1)}</td>
                <td className="py-2 text-center">{result.averageScores.relevance.toFixed(1)}</td>
                <td className="py-2 text-center">{result.averageScores.clarity.toFixed(1)}</td>
                <td className="py-2 text-center">{result.averageScores.completeness.toFixed(1)}</td>
                <td className="py-2 text-center font-bold">{result.overallAverage.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Input Area Component (components/Input/InputArea.tsx)

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { useSessionStore } from '../../stores/sessionStore';
import { useCouncilStream } from '../../hooks/useCouncilStream';

export function InputArea() {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { councilState, currentSessionId, createSession } = useSessionStore();
  const { submitQuery } = useCouncilStream();
  
  const isProcessing = councilState.phase !== 'idle' && councilState.phase !== 'complete' && councilState.phase !== 'error';
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [query]);
  
  const handleSubmit = async () => {
    if (!query.trim() || isProcessing) return;
    
    // Create session if none exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createSession();
    }
    
    const userQuery = query.trim();
    setQuery('');
    
    // Get auth token from wherever the main app stores it
    // This should be passed from the parent app or retrieved from a shared auth context
    const authToken = localStorage.getItem('auth_token') || '';
    
    await submitQuery(userQuery, authToken);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the Axis Council..."
          disabled={isProcessing}
          rows={1}
          className="
            flex-1 resize-none px-4 py-3 
            bg-surface border border-border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            text-text-primary placeholder:text-text-muted
          "
        />
        <button
          onClick={handleSubmit}
          disabled={!query.trim() || isProcessing}
          className="
            px-6 py-3 bg-primary text-white rounded-lg
            hover:bg-primary-hover
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150
            font-medium
          "
        >
          {isProcessing ? 'Processing...' : 'Send'}
        </button>
      </div>
      
      {councilState.queriesRemaining !== undefined && (
        <p className="text-xs text-text-muted mt-2 text-right">
          {councilState.queriesRemaining} queries remaining today
        </p>
      )}
    </div>
  );
}
```

### Theme Toggle Component (components/Theme/ThemeToggle.tsx)

```tsx
import React from 'react';
import { useTheme } from '../../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-surface transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        // Moon icon for dark mode
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // Sun icon for light mode
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
}
```

---

## App Component (App.tsx)

```tsx
import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { useSessionStore } from './stores/sessionStore';
import './styles/theme.css';
import './styles/index.css';

function App() {
  const { loadFromStorage } = useSessionStore();
  
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);
  
  return <Layout />;
}

export default App;
```

---

## Vite Configuration (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

---

## Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## Nginx Configuration (nginx.conf)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # SSE specific settings
        proxy_buffering off;
        proxy_read_timeout 86400;
    }

    # Caching for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Environment Variables

Create a `.env` file for local development:

```bash
VITE_API_URL=http://localhost:8000
```

For production, this would be the deployed backend URL.

---

## Implementation Checklist

- [ ] Project setup (Vite + React + TypeScript + Tailwind)
- [ ] Theme system with CSS variables
- [ ] Light/Dark mode toggle with persistence
- [ ] Session store with Zustand
- [ ] localStorage persistence for sessions
- [ ] SSE hook for council stream
- [ ] Layout component (sidebar + chat + input)
- [ ] Sidebar with session list
- [ ] New session button
- [ ] Session item with rename/delete menu
- [ ] Chat area with message display
- [ ] Robot avatar component for council members
- [ ] Message bubbles with visual hierarchy:
  - [ ] Council member answers: 50% opacity (grayed out)
  - [ ] Senator verdict: 100% opacity (prominent, special styling)
- [ ] Council member color coding (Alpha=purple, Beta=cyan, Gamma=orange, Senator=gold)
- [ ] Thinking indicator animation
- [ ] Voting results display (shown all at once, not collapsed)
- [ ] "Highest Rated" label instead of "Winner"
- [ ] Input area with send button
- [ ] Disable input during processing
- [ ] Queries remaining counter
- [ ] Error message display
- [ ] Dockerfile for production (create at end of project)
- [ ] Nginx configuration

---

## Testing Locally

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

---

## Customizing Theme Colors

To match the main dashboard theme, update the CSS variables in `src/styles/theme.css`:

```css
:root {
  /* Update these values to match your dashboard */
  --color-primary: #your-primary-color;
  --color-background: #your-background-color;
  /* ... etc */
}
```

All components use these variables, so changes propagate automatically.
