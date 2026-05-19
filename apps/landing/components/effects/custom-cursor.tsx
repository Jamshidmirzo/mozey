'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    const onOverInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('a, button, [role="button"], input, textarea, select, [data-magnetic]')
      ) {
        setHovering(true);
      }
    };

    const onOutInteractive = () => setHovering(false);

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseover', onOverInteractive);
    document.addEventListener('mouseout', onOutInteractive);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseover', onOverInteractive);
      document.removeEventListener('mouseout', onOutInteractive);
    };
  }, [x, y, visible]);

  if (!visible) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-museum-gold mix-blend-difference"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          width: hovering ? 48 : 12,
          height: hovering ? 48 : 12,
          opacity: hovering ? 0.4 : 0.8,
          transition: 'width 0.3s, height 0.3s, opacity 0.3s',
        }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full border border-museum-gold/30"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          width: hovering ? 64 : 40,
          height: hovering ? 64 : 40,
          opacity: hovering ? 0.6 : 0.3,
          transition: 'width 0.4s, height 0.4s, opacity 0.4s',
        }}
      />
    </>
  );
}
