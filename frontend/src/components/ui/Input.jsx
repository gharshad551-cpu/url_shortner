import React, { useState } from 'react';

const Input = ({ 
  icon = null, 
  label = '',
  className = '', 
  wrapperClassName = '',
  value,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = value !== undefined && value !== null && value.toString().length > 0;
  const isFloating = isFocused || isFilled;

  return (
    <div className={`relative w-full group ${wrapperClassName}`}>
      {icon && (
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-tertiary transition-colors z-10 pointer-events-none">
          {icon}
        </span>
      )}
      
      <input 
        className={`peer w-full bg-surface-container-low border border-border-glass rounded-xl py-3.5 text-body-md focus:outline-none focus:border-tertiary/50 focus:ring-1 focus:ring-tertiary/50 transition-all text-on-surface placeholder:text-transparent ${icon ? 'pl-12 pr-4' : 'px-4'} ${className}`}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={label} // Keeps HTML valid, but we make it transparent in CSS
        {...props}
      />
      
      {label && (
        <label 
          className={`absolute ${icon ? 'left-12' : 'left-4'} transition-all duration-300 pointer-events-none text-on-surface-variant ${
            isFloating 
              ? '-top-2.5 text-xs bg-surface-container px-2 rounded-md text-tertiary font-bold shadow-sm' 
              : 'top-3.5 text-body-md'
          }`}
        >
          {label}
        </label>
      )}
      
      {/* Subtle bottom glow effect when focused */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-tertiary transition-all duration-500 peer-focus:w-full rounded-b-xl opacity-50"></div>
    </div>
  );
};

export default Input;
