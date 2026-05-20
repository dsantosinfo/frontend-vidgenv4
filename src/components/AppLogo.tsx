// src/components/AppLogo.tsx
import React from 'react';
import { useBranding } from '../context/BrandingContext';

interface AppLogoProps {
  size?: number;
  iconOnly?: boolean;
  /** 'gradient' = fundo gradiente (login) | 'light' = fundo claro (sidebar) */
  variant?: 'gradient' | 'light';
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({
  size = 40,
  iconOnly = false,
  variant = 'gradient',
  className = '',
}) => {
  const { branding } = useBranding();
  const { app_name, tagline, color_from, color_to, logo_url } = branding;

  // Se há logo customizado, usa a imagem
  const icon = logo_url ? (
    <img
      src={logo_url}
      alt={app_name}
      width={size}
      height={size}
      style={{ borderRadius: 10, objectFit: 'contain' }}
    />
  ) : (
    // SVG padrão gerado com as cores do branding
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={app_name}
    >
      <defs>
        <linearGradient id="vg-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color_from} />
          <stop offset="100%" stopColor={color_to} />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10"
        fill={variant === 'gradient' ? 'url(#vg-grad)' : '#f1f5f9'} />
      <path d="M14 12 L30 20 L14 28 Z"
        fill={variant === 'gradient' ? '#fff' : color_from}
        opacity="0.95" />
      <circle cx="31" cy="10" r="3"
        fill={variant === 'gradient' ? '#fde68a' : color_to}
        opacity="0.9" />
    </svg>
  );

  if (iconOnly) return <span className={className}>{icon}</span>;

  const nameColor = variant === 'gradient' ? 'text-white' : 'text-slate-900';
  const subColor  = variant === 'gradient' ? 'text-white/70' : 'text-slate-500';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {icon}
      <div>
        <p className={`font-bold leading-tight ${nameColor}`} style={{ fontSize: size * 0.38 }}>
          {app_name}
        </p>
        <p className={`leading-tight ${subColor}`} style={{ fontSize: size * 0.21 }}>
          {tagline}
        </p>
      </div>
    </div>
  );
};

export default AppLogo;
