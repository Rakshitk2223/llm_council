import { useState } from 'react';

import type { VotingResult } from '../../types';
import { RobotAvatar } from './RobotAvatar';

interface VotingDisplayProps {
  results: VotingResult[];
  mapping: Record<string, string>;
  votes?: Record<string, Record<string, Record<string, number>>>;
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'bg-green-500';
  if (score >= 6) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getScoreTextColor(score: number): string {
  if (score >= 8) return 'text-green-400';
  if (score >= 6) return 'text-yellow-400';
  return 'text-red-400';
}

export function VotingDisplay({ results, mapping, votes }: VotingDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4 glass-elevated rounded-xl overflow-hidden">
      <div
        className="px-4 py-3 border-b border-border flex items-center justify-between cursor-pointer hover:bg-surface-elevated/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-semibold text-sm bg-gradient-to-r from-alpha via-beta to-gamma bg-clip-text text-transparent">
          Council Ratings
        </span>
        <button className="text-text-muted hover:text-text text-sm flex items-center gap-1">
          {isExpanded ? 'Hide' : 'Show'} Details
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="px-4 py-4 space-y-3">
        {results.map((result, idx) => {
          const score = result.overallAverage || 0;
          const percentage = (score / 10) * 100;

          return (
            <div key={result.memberId} className="flex items-center gap-3">
              <RobotAvatar memberId={result.memberId} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{result.memberName}</span>
                    {idx === 0 && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                        Top Rated
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-bold ${getScoreTextColor(score)}`}>
                    {score.toFixed(1)}
                  </span>
                </div>
                <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreColor(score)} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border pt-4">
          <div className="text-xs text-text-muted mb-3">Detailed Breakdown</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="py-2 text-left font-medium">Response</th>
                <th className="py-2 text-center font-medium">Accuracy</th>
                <th className="py-2 text-center font-medium">Relevance</th>
                <th className="py-2 text-center font-medium">Clarity</th>
                <th className="py-2 text-center font-medium">Complete</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => {
                const scores = result.averageScores || {
                  accuracy: 0,
                  relevance: 0,
                  clarity: 0,
                  completeness: 0,
                };
                return (
                  <tr key={result.memberId} className="border-b border-border/50 last:border-0">
                    <td className="py-2 flex items-center gap-2">
                      <RobotAvatar memberId={result.memberId} size="xs" />
                      <span className="text-sm">{result.memberName}</span>
                    </td>
                    <td className={`py-2 text-center ${getScoreTextColor(scores.accuracy || 0)}`}>
                      {(scores.accuracy || 0).toFixed(1)}
                    </td>
                    <td className={`py-2 text-center ${getScoreTextColor(scores.relevance || 0)}`}>
                      {(scores.relevance || 0).toFixed(1)}
                    </td>
                    <td className={`py-2 text-center ${getScoreTextColor(scores.clarity || 0)}`}>
                      {(scores.clarity || 0).toFixed(1)}
                    </td>
                    <td className={`py-2 text-center ${getScoreTextColor(scores.completeness || 0)}`}>
                      {(scores.completeness || 0).toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
