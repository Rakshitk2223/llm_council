import React from 'react';

interface RobotAvatarProps {
  memberId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const avatarColors: Record<string, { bg: string; accent: string }> = {
  alpha: { bg: 'bg-alpha/20', accent: 'text-alpha' },
  beta: { bg: 'bg-beta/20', accent: 'text-beta' },
  gamma: { bg: 'bg-gamma/20', accent: 'text-gamma' },
  senator: { bg: 'bg-senator/20', accent: 'text-senator' },
};

const sizes = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const iconSizes = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function RobotAvatar({ memberId, size = 'md' }: RobotAvatarProps) {
  const colors = avatarColors[memberId] || avatarColors.alpha;
  const sizeClass = sizes[size];
  const iconSize = iconSizes[size];
  const isSenator = memberId === 'senator';

  return (
    <div className={`${sizeClass} ${colors.bg} rounded-full flex items-center justify-center ring-1 ring-white/10`}> 
      {isSenator ? (
        <svg className={`${iconSize} ${colors.accent}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z" />
        </svg>
      ) : (
        <svg className={`${iconSize} ${colors.accent}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2M7.5 13A2.5 2.5 0 005 15.5 2.5 2.5 0 007.5 18a2.5 2.5 0 002.5-2.5A2.5 2.5 0 007.5 13m9 0a2.5 2.5 0 00-2.5 2.5 2.5 2.5 0 002.5 2.5 2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-2.5-2.5z" />
        </svg>
      )}
    </div>
  );
}
