import { useState } from 'react';

import type { VotingResult } from '../../types';
import { RobotAvatar } from './RobotAvatar';

interface VotingDisplayProps {
  results: VotingResult[];
  mapping: Record<string, string>;
  votes?: Record<string, Record<string, Record<string, number>>>;
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-text-primary';
  if (score >= 6) return 'text-text-secondary';
  return 'text-text-muted';
}

function getBarColor(score: number): string {
  if (score >= 8) return 'bg-text-primary';
  if (score >= 6) return 'bg-text-primary/70';
  return 'bg-text-primary/50';
}

export function VotingDisplay({ results, mapping, votes }: VotingDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (results.length === 0) return null;

  const hasScores = results.some((r) => r.overallAverage > 0);
  if (!hasScores) return null;

  return (
    <div className="mb-4">
      <div 
        className="glass inline-flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer hover:bg-surface-elevated/30 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-xs text-text-muted">Ratings:</span>
        <div className="flex items-center gap-4">
          {results.map((result, idx) => (
            <div key={result.memberId} className="flex items-center gap-1.5">
              <RobotAvatar memberId={result.memberId} size="xs" />
              <span className={`text-xs font-semibold ${getScoreColor(result.overallAverage || 0)}`}>
                {(result.overallAverage || 0).toFixed(1)}
              </span>
              {idx === 0 && (
                <span className="text-[10px] bg-text-primary/20 text-text-primary px-1.5 py-0.5 rounded-full">
                  top
                </span>
              )}
            </div>
          ))}
        </div>
        <svg
          className={`w-3 h-3 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isExpanded && (
        <div className="mt-2 glass-elevated rounded-xl p-4 animate-fade-in">
          <div className="space-y-2">
            {results.map((result) => {
              const score = result.overallAverage || 0;
              const percentage = (score / 10) * 100;
              const scores = result.averageScores || {};

              return (
                <div key={result.memberId} className="flex items-center gap-3">
                  <RobotAvatar memberId={result.memberId} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{result.memberName}</span>
                      <span className={`text-xs font-bold ${getScoreColor(score)}`}>
                        {score.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-1 bg-surface rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getBarColor(score)} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex gap-3 mt-1 text-[10px] text-text-muted">
                      <span>Acc: {(scores.accuracy || 0).toFixed(1)}</span>
                      <span>Rel: {(scores.relevance || 0).toFixed(1)}</span>
                      <span>Clr: {(scores.clarity || 0).toFixed(1)}</span>
                      <span>Cmp: {(scores.completeness || 0).toFixed(1)}</span>
                      <span>Cnf: {(scores.factual_confidence || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
