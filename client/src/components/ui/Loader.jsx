/**
 * ══════════════════════════════════════════════════════════════
 *  Loader Component (Design System)
 *  Gradient rotating ring with glowing center
 * ══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { motion } from 'framer-motion';

const sizes = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-2',
  lg: 'w-16 h-16 border-3',
};

const Loader = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={`${sizes[size]} rounded-full border-t-cyan-400 border-r-purple-500 border-b-cyan-400/20 border-l-purple-500/20`}
        />
        <div className="absolute inset-0 rounded-full blur-sm bg-gradient-to-r from-cyan-400/30 to-purple-500/30 -z-10 animate-pulse" />
      </div>
      {text && <p className="text-xs text-dark-300 font-medium tracking-wide animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
