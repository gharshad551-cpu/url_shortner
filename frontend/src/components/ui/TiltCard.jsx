import React, { useRef, useState, useCallback } from 'react';

const TiltCard = ({ children, className = '', tiltMaxAngleX = 10, tiltMaxAngleY = 10, ...props }) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse position relative to center of card (-1 to +1)
    const mouseX = (e.clientX - rect.left - width / 2) / (width / 2);
    const mouseY = (e.clientY - rect.top - height / 2) / (height / 2);

    // Calculate rotation
    const rotateX = -mouseY * tiltMaxAngleX;
    const rotateY = mouseX * tiltMaxAngleY;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  }, [tiltMaxAngleX, tiltMaxAngleY]);

  const handleMouseLeave = useCallback(() => {
    setTransform(`perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
  }, []);

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{ transform }}
      {...props}
    >
      {children}
    </div>
  );
};

export default TiltCard;
