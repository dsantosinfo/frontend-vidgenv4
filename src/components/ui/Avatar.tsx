// src/components/ui/Avatar.tsx
import React from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

const SIZE: Record<AvatarSize, { wrapper: string; text: string }> = {
  xs: { wrapper: 'w-6 h-6',  text: 'text-[10px]' },
  sm: { wrapper: 'w-8 h-8',  text: 'text-xs' },
  md: { wrapper: 'w-10 h-10', text: 'text-sm' },
  lg: { wrapper: 'w-14 h-14', text: 'text-xl' },
};

const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'sm', className = '' }) => {
  const { wrapper, text } = SIZE[size];
  const initial = (name || '?')[0].toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ''}
        className={`${wrapper} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${wrapper} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shrink-0 ${text} ${className}`}
    >
      {initial}
    </div>
  );
};

export default Avatar;
