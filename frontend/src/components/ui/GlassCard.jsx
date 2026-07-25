import React from 'react';

const GlassCard = ({ children, className = '', hoverGlow = false, ...props }) => {
  const handleMouseMove = (e) => {
    if (!hoverGlow) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const hoverClass = hoverGlow ? 'group hover:border-tertiary/30 transition-all duration-500' : '';

  return (
    <div 
      className={`glass-card rounded-xl relative overflow-hidden ${hoverClass} ${className}`}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
