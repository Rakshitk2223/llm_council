const MEMBER_COLORS = [
  { name: 'alpha', hue: 270, color: '#a78bfa' },
  { name: 'beta', hue: 185, color: '#22d3ee' },
  { name: 'gamma', hue: 30, color: '#fb923c' },
  { name: 'delta', hue: 340, color: '#f472b6' },
  { name: 'epsilon', hue: 145, color: '#4ade80' },
  { name: 'zeta', hue: 200, color: '#38bdf8' },
  { name: 'eta', hue: 55, color: '#facc15' },
  { name: 'theta', hue: 0, color: '#f87171' },
];

const SENATOR_COLOR = { name: 'senator', hue: 45, color: '#facc15' };

const MEMBER_ICONS = [
  'M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2M7.5 13A2.5 2.5 0 005 15.5 2.5 2.5 0 007.5 18a2.5 2.5 0 002.5-2.5A2.5 2.5 0 007.5 13m9 0a2.5 2.5 0 00-2.5 2.5 2.5 2.5 0 002.5 2.5 2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-2.5-2.5z',
  'M17.5 15.5c0 1.93-1.57 3.5-3.5 3.5H10c-1.93 0-3.5-1.57-3.5-3.5V13c0-1.93 1.57-3.5 3.5-3.5h4c1.93 0 3.5 1.57 3.5 3.5v2.5zM12 2C9.24 2 7 4.24 7 7h2c0-1.66 1.34-3 3-3s3 1.34 3 3h2c0-2.76-2.24-5-5-5zm-1 11.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z',
  'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z',
  'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm3-6c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z',
  'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
  'M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z',
  'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z',
  'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getMemberColor(memberId: string): { color: string; hue: number } {
  if (memberId === 'senator') {
    return SENATOR_COLOR;
  }
  
  const knownIndex = MEMBER_COLORS.findIndex(c => c.name === memberId);
  if (knownIndex !== -1) {
    return MEMBER_COLORS[knownIndex];
  }
  
  const hash = hashString(memberId);
  const index = hash % MEMBER_COLORS.length;
  return MEMBER_COLORS[index];
}

export function getMemberIcon(memberId: string): string {
  if (memberId === 'senator') {
    return 'M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z';
  }
  
  const knownIndex = MEMBER_COLORS.findIndex(c => c.name === memberId);
  if (knownIndex !== -1) {
    return MEMBER_ICONS[knownIndex % MEMBER_ICONS.length];
  }
  
  const hash = hashString(memberId);
  const index = hash % MEMBER_ICONS.length;
  return MEMBER_ICONS[index];
}

export function getMemberColorStyle(memberId: string): {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
} {
  const { color } = getMemberColor(memberId);
  return {
    backgroundColor: `${color}20`,
    borderColor: color,
    textColor: color,
    glowColor: `${color}40`,
  };
}

export function getMemberBorderClass(memberId: string): string {
  const knownMembers = ['alpha', 'beta', 'gamma', 'senator'];
  if (knownMembers.includes(memberId)) {
    return `border-l-${memberId}`;
  }
  return '';
}

export { MEMBER_COLORS, SENATOR_COLOR };
