/**
 * ══════════════════════════════════════════════════════════════
 *  Card Component (Design System)
 *  Glassmorphism card (rgba(255,255,255,0.05)) with backdrop blur & neon glow
 * ══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  glow = false,
  onClick,
  ...props
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`relative rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/60 overflow-hidden transition-all duration-300 ${
        hover ? 'hover:border-cyan-400/30 hover:shadow-cyan-500/10' : ''
      } ${
        glow
          ? 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-500/10 before:to-purple-500/10 before:pointer-events-none'
          : ''
      } ${className}`}
      {...props}
    >
      {/* Top subtle highlight border line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};

export default Card;
