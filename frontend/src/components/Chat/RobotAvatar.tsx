import { getMemberIcon } from '../../utils/memberConfig';

interface RobotAvatarProps {
  memberId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

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
  const iconPath = getMemberIcon(memberId);
  const sizeClass = sizes[size];
  const iconSize = iconSizes[size];
  const isSenator = memberId === 'senator';

  return (
    <div 
      className={`${sizeClass} rounded-full flex items-center justify-center ring-1 ring-border ${
        isSenator ? 'bg-surface-elevated' : 'bg-surface'
      }`}
    > 
      <svg 
        className={`${iconSize} text-text-primary`}
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d={iconPath} />
      </svg>
    </div>
  );
}
