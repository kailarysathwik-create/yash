import React from 'react';
import { motion } from 'framer-motion';

const Particles = () => {
  const particles = Array.from({ length: 25 });

  return (
    <div className="particle-container">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="particle"
          style={{
            width: Math.random() * 6 + 2 + 'px',
            height: Math.random() * 6 + 2 + 'px',
            left: Math.random() * 100 + 'vw',
            bottom: '-20px',
            opacity: Math.random() * 0.5 + 0.2,
          }}
          animate={{
            y: ['0vh', '-120vh'],
            x: [0, (Math.random() - 0.5) * 50],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            delay: Math.random() * 20,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default Particles;
