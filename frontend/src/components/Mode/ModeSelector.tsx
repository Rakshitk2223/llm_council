import React from 'react';

import { useModeStore } from '../../stores/modeStore';
import type { CouncilMode } from '../../types';

interface ModeOption {
  mode: CouncilMode;
  title: string;
  description: string;
  details: string[];
  icon: string;
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
    title: 'Comprehensive Mode',
    description: 'Full deliberation with peer evaluation',
    details: [
      'Council members respond',
      'Blind peer voting on all responses',
      'Senator synthesizes with vote data',
      'Best for complex topics',
    ],
    icon: 'scale',
  },
];

export function ModeSelector() {
  const { setMode, setHasSelectedMode } = useModeStore();

  const handleSelectMode = (mode: CouncilMode) => {
    setMode(mode);
    setHasSelectedMode(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Axis Council
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose how you want the council to deliberate
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {modeOptions.map((option) => (
            <button
              key={option.mode}
              onClick={() => handleSelectMode(option.mode)}
              className="group p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all text-left bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <div className="flex items-center gap-3 mb-3">
                {option.icon === 'zap' ? (
                  <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                )}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {option.title}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {option.description}
              </p>
              <ul className="space-y-2">
                {option.details.map((detail, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {detail}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-6">
          You can change the mode anytime using the toggle in the bottom-left corner
        </p>
      </div>
    </div>
  );
}
