import { getMemberColor, getMemberIcon } from '../../utils/memberConfig';

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
  const { color } = getMemberColor(memberId);
  const iconPath = getMemberIcon(memberId);
  const sizeClass = sizes[size];
  const iconSize = iconSizes[size];

  return (
    <div 
      className={`${sizeClass} rounded-full flex items-center justify-center ring-1 ring-white/10`}
      style={{ backgroundColor: `${color}20` }}
    > 
      <svg 
        className={iconSize} 
        fill="currentColor" 
        viewBox="0 0 24 24"
        style={{ color }}
      >
        <path d={iconPath} />
      </svg>
    </div>
  );
}
