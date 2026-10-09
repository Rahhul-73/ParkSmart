/**
 * ══════════════════════════════════════════════════════════════
 *  Input Component (Design System)
 *  Floating label support, icons, error handling, focus glows
 * ══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(
  (
    {
      label,
      type = 'text',
      placeholder = ' ',
      error,
      helperText,
      icon: Icon,
      floating = false,
      className = '',
      id,
      name,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

    if (floating) {
      return (
        <div className="w-full">
          <div className="relative">
            {Icon && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none z-10">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <input
              ref={ref}
              id={inputId}
              name={name}
              type={computedType}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              className={`peer w-full bg-[#12131f]/70 border ${
                error
                  ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20'
              } text-white placeholder-transparent text-sm rounded-xl px-4 pt-6 pb-2 outline-none transition-all duration-300 focus:ring-4 backdrop-blur-md ${
                Icon ? 'pl-11' : 'pl-4'
              } ${isPassword ? 'pr-11' : 'pr-4'} ${className}`}
              {...props}
            />
            {label && (
              <label
                htmlFor={inputId}
                className={`absolute text-xs duration-300 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] ${
                  Icon ? 'left-11' : 'left-4'
                } peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-cyan-400 ${
                  error ? 'text-rose-400' : 'text-dark-400'
                } pointer-events-none`}
              >
                {label}
              </label>
            )}
            {isPassword && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
          {error && <p className="text-xs text-rose-400 mt-1.5 ml-1">{error}</p>}
          {!error && helperText && <p className="text-xs text-dark-400 mt-1 ml-1">{helperText}</p>}
        </div>
      );
    }

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-dark-300 mb-1.5 ml-0.5">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={computedType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full bg-[#12131f]/70 border ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20'
            } text-white placeholder-dark-400 text-sm rounded-xl py-3 px-4 outline-none transition-all duration-300 focus:ring-4 backdrop-blur-md ${
              Icon ? 'pl-11' : 'pl-4'
            } ${isPassword ? 'pr-11' : 'pr-4'} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-rose-400 mt-1.5 ml-1">{error}</p>}
        {!error && helperText && <p className="text-xs text-dark-400 mt-1 ml-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
