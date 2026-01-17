import type { CouncilMode } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function postCouncilQuery(
  query: string,
  sessionHistory: Array<{ role: string; content: string; member_name?: string }>,
  authToken: string,
  mode: CouncilMode = 'comprehensive'
) {
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
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail?.error || 'Request failed');
  }

  return response;
}
