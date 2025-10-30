import React from 'react';

interface SnowfallProps {
  count?: number;
  minSize?: number;
  maxSize?: number;
  shape?: 'circle' | 'star';
}

// A simple component to render the animated snowflakes
const Snowfall: React.FC<SnowfallProps> = ({ count = 50, minSize = 1, maxSize = 5, shape = 'circle' }) => {
  // Create an array of snowflakes with random styles for a natural look
  const snowflakes = Array.from({ length: count }).map((_, i) => {
    const size = Math.random() * (maxSize - minSize) + minSize;
    const style = {
      width: `${size}px`,
      height: `${size}px`,
      left: `${Math.random() * 100}vw`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${Math.random() * 10 + 5}s`,
      opacity: Math.random() * 0.7 + 0.3,
    };
    return <div key={i} className={`snowflake snowflake-${shape}`} style={style}></div>;
  });

  return <div className="snowfall-container" aria-hidden="true">{snowflakes}</div>;
};

export default Snowfall;