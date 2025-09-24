// src/components/animations/fade-in.tsx
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface FadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
}

export function FadeIn({ 
  children, 
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 30,
  className = '',
  once = true
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once });

  const directionVariants = {
    up: { y: distance, opacity: 0 },
    down: { y: -distance, opacity: 0 },
    left: { x: distance, opacity: 0 },
    right: { x: -distance, opacity: 0 },
    none: { opacity: 0 }
  };

  const initialVariant = directionVariants[direction];
  const animateVariant = { x: 0, y: 0, opacity: 1 };

  return (
    <motion.div
      ref={ref}
      initial={initialVariant}
      animate={isInView ? animateVariant : initialVariant}
      transition={{ 
        duration, 
        delay,
        ease: [0.25, 0.1, 0.25, 1.0] // Custom ease for smooth animation
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Komponen untuk staggered children animation
export function FadeInStagger({ 
  children, 
  staggerDelay = 0.1,
  className = '',
  ...props 
}: FadeInProps & { staggerDelay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { y: 30, opacity: 0 },
                visible: { y: 0, opacity: 1 }
              }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] }}
            >
              {child}
            </motion.div>
          ))
        : <motion.div
            variants={{
              hidden: { y: 30, opacity: 0 },
              visible: { y: 0, opacity: 1 }
            }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] }}
          >
            {children}
          </motion.div>
      }
    </motion.div>
  );
}
