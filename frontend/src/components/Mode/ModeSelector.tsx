import React from 'react';

import { useModeStore } from '../../stores/modeStore';
import type { CouncilMode } from '../../types';

interface ModeOption {
  mode: CouncilMode;
  title: string;
  description: string;
  details: string[];
  icon: string;
  isPremium?: boolean;
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
  },
  {
    mode: 'comprehensive',
    title: 'Full Mode',
    description: 'Full deliberation with peer evaluation',
    details: [
      'Council members respond',
      'Blind peer voting on all responses',
      'Senator synthesizes with vote data',
      'Best for complex topics',
    ],
    icon: 'scale',
  },
  {
    mode: 'deep',
    title: 'Deep Mode',
    description: 'Maximum accuracy with N×N voting matrix',
    details: [
      'Council members respond',
      'Every member rates every response',
      'N×N cross-evaluation matrix',
      'Most thorough analysis',
    ],
    icon: 'brain',
    isPremium: true,
  },
];

export function ModeSelector() {
  const { setMode, setHasSelectedMode, setShowModeSelector } = useModeStore();

  const handleSelectMode = (mode: CouncilMode) => {
    setMode(mode);
    setHasSelectedMode(true);
    setShowModeSelector(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-popup rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome to LLM Council
          </h1>
          <p className="text-text-secondary">
            Choose how you want the council to deliberate
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {modeOptions.map((option) => (
            <button
              key={option.mode}
              onClick={() => handleSelectMode(option.mode)}
              className="group p-6 rounded-xl border-2 border-border hover:border-primary transition-all text-left bg-surface-elevated hover:bg-primary-light"
            >
              <div className="flex items-center gap-3 mb-3">
                {option.icon === 'zap' ? (
                  <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ) : option.icon === 'scale' ? (
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-text-primary">
                    {option.title}
                  </h2>
                  {option.isPremium && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                      Premium
                    </span>
                  )}
                </div>
              </div>
              <p className="text-text-secondary mb-4">
                {option.description}
              </p>
              <ul className="space-y-2">
                {option.details.map((detail, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-text-muted">
                    <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {detail}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          You can change the mode anytime using the toggle in the bottom-left corner
        </p>
      </div>
    </div>
  );
}
