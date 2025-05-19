
'use client';

import React, { useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  SpringOptions,
} from 'framer-motion';

type SpotlightProps = {
  children?: React.ReactNode;
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
};

export function Spotlight({
  children,
  className = '',
  size = 200,
  springOptions,
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, springOptions);
  const springY = useSpring(mouseY, springOptions);

  const background = useMotionTemplate`radial-gradient(${size}px circle at ${springX}px ${springY}px, ${className})`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseXVal = e.clientX - rect.left;
    const mouseYVal = e.clientY - rect.top;

    mouseX.set(mouseXVal);
    mouseY.set(mouseYVal);
  };

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background }}
      onMouseMove={handleMouseMove}
    >
      {children}
    </motion.div>
  );
}
