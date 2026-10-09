/**
 * ══════════════════════════════════════════════════════════════
 *  Badge Component (Design System)
 *  Variants: cyan, purple, emerald, amber, rose, neutral
 * ══════════════════════════════════════════════════════════════
 */

import React from 'react';

const variants = {
  cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-400/30',
  purple: 'bg-purple-500/10 text-purple-300 border-purple-400/30',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-400/30',
  rose: 'bg-rose-500/10 text-rose-300 border-rose-400/30',
  neutral: 'bg-white/[0.05] text-dark-200 border-white/10',
};

const dotColors = {
  cyan: 'bg-cyan-400',
  purple: 'bg-purple-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
  neutral: 'bg-dark-300',
};

const Badge = ({
  children,
  variant = 'cyan',
  dot = false,
  icon: Icon,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border backdrop-blur-md select-none ${variants[variant]} ${sizeClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />}
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
