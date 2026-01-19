import { useCallback, useRef } from 'react';

import { parseFollowUpQuestions, removeFollowUpSection } from '../components/Chat/FollowUpSuggestions';
import { useSessionStore } from '../stores/sessionStore';
import type { CouncilMode, SSEEvent, SSEEventType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useCouncilStream() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const memberMessageIds = useRef<Map<string, string>>(new Map());

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
    setFollowUpQuestions,
  } = useSessionStore();

  const getCurrentSession = () => {
    const state = useSessionStore.getState();
    return state.sessions.find((session) => session.id === state.currentSessionId);
  };

  const isLoading = () => {
    const state = useSessionStore.getState();
    return state.councilState.phase !== 'idle' && state.councilState.phase !== 'complete' && state.councilState.phase !== 'error';
  };

  const submitQuery = useCallback(async (query: string, authToken: string, mode: CouncilMode = 'comprehensive') => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    memberMessageIds.current.clear();
    resetCouncilState();
    addMessage({ role: 'user', content: query });

    const session = getCurrentSession();
    const sessionHistory =
      session?.messages
        .filter((message) => message.role !== 'system')
        .map((message) => ({
          role: message.role,
          content: message.content,
          member_name: message.memberName,
        })) || [];

    try {
      const response = await fetch(`${API_BASE_URL}/api/council/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          query,
          session_history: sessionHistory,
          mode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.error || 'Request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let eventType: string | null = null;
        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          }
          if (line.startsWith('data:')) {
            const data = JSON.parse(line.slice(5).trim());
            handleSseEvent({ event: (eventType || 'error') as SSEEventType, data });
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      const errorMessage = error.message || 'Council is temporarily unavailable';
      setError(errorMessage);
      addMessage({ role: 'system', content: errorMessage });
    }
  }, []);

  const handleSseEvent = (event: SSEEvent) => {
    try {
      switch (event.event) {
      case 'council_start':
        setCouncilPhase('answering');
        break;
      case 'thinking': {
        setCurrentMember(event.data.member);
        const thinkingId = addMessage({
          role: 'assistant',
          content: '',
          memberName: event.data.member,
          memberId: event.data.member_id,
          isThinking: true,
        });
        memberMessageIds.current.set(event.data.member_id, thinkingId);
        break;
      }
      case 'answer_chunk': {
        const messageId = memberMessageIds.current.get(event.data.member_id);
        if (messageId) {
          updateMessage(messageId, { isThinking: false, isStreaming: true });
          appendToMessage(messageId, event.data.chunk);
        }
        break;
      }
      case 'answer_complete': {
        const messageId = memberMessageIds.current.get(event.data.member_id);
        if (messageId) {
          updateMessage(messageId, {
            isStreaming: false,
            content: event.data.full_answer,
          });
        }
        break;
      }
      case 'voting_start':
        setCouncilPhase('voting');
        addMessage({ role: 'system', content: 'Council members are evaluating responses...' });
        break;
      case 'voting_skipped':
        addMessage({ role: 'system', content: 'Fast mode: Voting skipped.' });
        break;
      case 'voting_complete': {
        const transformedResults = event.data.results.map((r: any) => ({
          responseLabel: r.response_label,
          memberId: r.member_id,
          memberName: r.member_name,
          averageScores: r.average_scores,
          overallAverage: r.overall_average,
          allRatings: r.all_ratings,
        }));
        setVotingResults(transformedResults, event.data.mapping, event.data.votes);
        addMessage({ role: 'system', content: 'Voting results are now available.' });
        break;
      }
      case 'senator_start': {
        setCouncilPhase('verdict');
        setCurrentMember(event.data.member);
        const verdictId = addMessage({
          role: 'assistant',
          content: '',
          memberName: event.data.member,
          memberId: 'senator',
          isThinking: true,
        });
        memberMessageIds.current.set('senator', verdictId);
        break;
      }
      case 'verdict_chunk': {
        const messageId = memberMessageIds.current.get('senator');
        if (messageId) {
          updateMessage(messageId, { isThinking: false, isStreaming: true });
          appendToMessage(messageId, event.data.chunk);
        }
        break;
      }
      case 'verdict_complete': {
        const messageId = memberMessageIds.current.get('senator');
        const verdict = event.data.verdict;
        const followUpQuestions = parseFollowUpQuestions(verdict);
        const cleanVerdict = removeFollowUpSection(verdict);

        if (messageId) {
          updateMessage(messageId, {
            isStreaming: false,
            content: cleanVerdict,
          });
        }
        setFollowUpQuestions(followUpQuestions);
        setCouncilPhase('complete');
        break;
      }
      case 'council_complete':
        setCouncilPhase('complete');
        if (event.data.queries_remaining !== undefined) {
          setQueriesRemaining(event.data.queries_remaining);
        }
        break;
      case 'error':
        setError(event.data.error || 'Council is temporarily unavailable');
        break;
      default:
        break;
    }
    } catch (err) {
      console.error('SSE event handling error:', err);
      setError('An error occurred while processing the response');
    }
  };

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    resetCouncilState();
  }, []);

  return { submitQuery, cancelRequest, isLoading };
}
