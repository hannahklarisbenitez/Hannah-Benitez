import React from 'react';
import logoImg from '../assets/images/regenerated_image_1793257154450.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'light',
  className = '',
  onClick
}) => {
  const iconSizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const isDark = variant === 'dark';

  return (
    <div 
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Official Quick Print Hub Logo Emblem */}
      <div className={`relative ${iconSizeClasses[size]} shrink-0 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center`}>
        <img 
          src={logoImg} 
          alt="Quick Print Hub logo" 
          className="w-full h-full object-contain" 
        />
      </div>

      {/* Brand Typographic Identity */}
      <div className="flex flex-col">
        <div className={`font-black tracking-tight flex items-center leading-none ${textSizes[size]}`}>
          <span className={isDark ? 'text-white' : 'text-slate-900'}>Quick Print</span>
          <span className="text-[#F4631E] ml-1 font-black">Hub</span>
        </div>
      </div>
    </div>
  );
};
