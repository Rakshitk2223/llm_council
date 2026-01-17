import React, { useEffect } from 'react';

import { ErrorBoundary } from './components/Error/ErrorBoundary';
import { Layout } from './components/Layout';
import { useSessionStore } from './stores/sessionStore';
import './styles/theme.css';
import './styles/index.css';

export default function App() {
  const { loadFromStorage } = useSessionStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <ErrorBoundary>
      <Layout />
    </ErrorBoundary>
  );
}
