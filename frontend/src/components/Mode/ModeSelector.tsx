import { useModeStore } from '../../stores/modeStore';
import type { CouncilMode } from '../../types';

const ENABLE_VOTE_MODE = true;
const ENABLE_DEEP_MODE = true;

interface ModeOption {
  mode: CouncilMode;
  title: string;
  description: string;
  details: string[];
  icon: 'zap' | 'vote' | 'brain';
  gradient: string;
}

const modeOptions: ModeOption[] = [
  {
    mode: 'fast',
    title: 'Fast Mode',
    description: 'Quick responses without peer voting',
    details: [
      'Council members respond',
      'Senator delivers final verdict',
      'Skips voting phase',
      'Best for quick questions',
    ],
    icon: 'zap',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    mode: 'comprehensive',
    title: 'Vote Mode',
    description: 'Full deliberation with peer evaluation',
    details: [
      'Council members respond',
      'Blind peer voting on all responses',
      'Senator synthesizes with vote data',
      'Best for complex topics',
    ],
    icon: 'vote',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    mode: 'deep',
    title: 'Deep Mode',
    description: 'Maximum accuracy with NxN voting matrix',
    details: [
      'Council members respond',
      'Every member rates every response',
      'NxN cross-evaluation matrix',
      'Most thorough analysis',
    ],
    icon: 'brain',
    gradient: 'from-purple-500 to-pink-500',
  },
];

const getAvailableModes = () => {
  return modeOptions.filter(mode => {
    if (mode.mode === 'fast') return true;
    if (mode.mode === 'comprehensive') return ENABLE_VOTE_MODE;
    if (mode.mode === 'deep') return ENABLE_DEEP_MODE;
    return true;
  });
};

export function ModeSelector() {
  const { setMode, setHasSelectedMode, setShowModeSelector } = useModeStore();
  const availableModes = getAvailableModes();

  const handleSelectMode = (mode: CouncilMode) => {
    setMode(mode);
    setHasSelectedMode(true);
    setShowModeSelector(false);
  };

  return (
    <div className="fixed inset-0 bg-bg-primary/95 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl animate-scale-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6 shadow-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
              Welcome to LLM Council
            </span>
          </h1>
          <p className="text-text-secondary text-lg">
            Choose how you want the council to deliberate
          </p>
        </div>

        <div className={`grid gap-5 ${availableModes.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : 'md:grid-cols-3'}`}>
          {availableModes.map((option) => (
            <button
              key={option.mode}
              onClick={() => handleSelectMode(option.mode)}
              className="group relative p-6 rounded-2xl 
                         bg-bg-secondary border border-surface-border
                         hover:border-transparent
                         transition-all duration-300
                         text-left overflow-hidden
                         hover:scale-[1.02] hover:shadow-xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  {option.icon === 'zap' ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ) : option.icon === 'vote' ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-text-primary mb-2">
                  {option.title}
                </h2>
                <p className="text-text-secondary text-sm mb-4">
                  {option.description}
                </p>
                
                <ul className="space-y-2">
                  {option.details.map((detail, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-text-muted">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${option.gradient}`} />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-text-muted text-sm mt-8">
          You can change the mode anytime using the toggle in the sidebar
        </p>
      </div>
    </div>
  );
}
