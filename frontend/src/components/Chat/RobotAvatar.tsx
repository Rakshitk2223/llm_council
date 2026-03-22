import { getMemberIcon } from '../../utils/memberConfig';

interface RobotAvatarProps {
  memberId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizes = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

const gradients = {
  alpha: 'from-member-alpha to-member-beta',
  beta: 'from-member-beta to-member-gamma',
  gamma: 'from-member-gamma to-accent',
  senator: 'from-accent to-member-alpha',
  default: 'from-primary to-accent',
};

const getGradient = (memberId: string) => {
  if (memberId === 'senator') return gradients.senator;
  if (memberId.includes('1') || memberId === 'alpha') return gradients.alpha;
  if (memberId.includes('2') || memberId === 'beta') return gradients.beta;
  if (memberId.includes('3') || memberId === 'gamma') return gradients.gamma;
  return gradients.default;
};

export function RobotAvatar({ memberId, size = 'md' }: RobotAvatarProps) {
  const iconPath = getMemberIcon(memberId);
  const sizeClass = sizes[size];
  const gradient = getGradient(memberId);
  const isSenator = memberId === 'senator';

  return (
    <div 
      className={`${sizeClass} rounded-xl flex items-center justify-center shadow-md ${
        isSenator ? 'ring-2 ring-accent/50' : ''
      } bg-gradient-to-br ${gradient}`}
    >
      <div className="w-[85%] h-[85%] rounded-lg bg-bg-primary/90 flex items-center justify-center">
        <svg 
          className={`${size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'} text-text-primary`}
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d={iconPath} />
        </svg>
      </div>
    </div>
  );
}
