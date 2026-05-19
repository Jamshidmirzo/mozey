'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

const MAGNETIC_RADIUS = 100;

const springConfig = { damping: 15, stiffness: 200, mass: 0.5 };

export function MagneticButton({
  children,
  className,
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MAGNETIC_RADIUS) {
      // Pull strength scales linearly within the radius, capped at 12px
      const pull = strength * (1 - dist / MAGNETIC_RADIUS);
      const maxDisplacement = 12;
      const moveX = Math.max(-maxDisplacement, Math.min(maxDisplacement, dx * pull));
      const moveY = Math.max(-maxDisplacement, Math.min(maxDisplacement, dy * pull));

      x.set(moveX);
      y.set(moveY);
    } else {
      x.set(0);
      y.set(0);
    }
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
