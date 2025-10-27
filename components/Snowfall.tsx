import React from 'react';

// A simple component to render the animated snowflakes
const Snowfall: React.FC = () => {
  // Create an array of 50 snowflakes with random styles for a natural look
  const snowflakes = Array.from({ length: 50 }).map((_, i) => {
    const style = {
      width: `${Math.random() * 4 + 1}px`,
      height: `${Math.random() * 4 + 1}px`,
      left: `${Math.random() * 100}vw`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${Math.random() * 10 + 5}s`,
      opacity: Math.random() * 0.7 + 0.3,
    };
    return <div key={i} className="snowflake" style={style}></div>;
  });

  return <div className="snowfall-container" aria-hidden="true">{snowflakes}</div>;
};

export default Snowfall;
