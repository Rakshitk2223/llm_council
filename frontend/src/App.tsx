import { useEffect } from 'react';

import { ErrorBoundary } from './components/Error/ErrorBoundary';
import { Layout } from './components/Layout';
import { useLayoutStore } from './stores/layoutStore';
import { useSessionStore } from './stores/sessionStore';
import './styles/theme.css';
import './styles/index.css';

export default function App() {
  const { loadFromStorage: loadSessions } = useSessionStore();
  const { loadFromStorage: loadLayout } = useLayoutStore();

  useEffect(() => {
    loadSessions();
    loadLayout();
  }, [loadSessions, loadLayout]);

  return (
    <ErrorBoundary>
      <Layout />
    </ErrorBoundary>
  );
}
