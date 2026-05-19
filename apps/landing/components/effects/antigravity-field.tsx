'use client';

import { useCallback, useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  opacity: number;
  driftSpeedX: number;
  driftSpeedY: number;
  sineAmplitude: number;
  sineFrequency: number;
  phase: number;
  vx: number;
  vy: number;
}

interface AntigravityFieldProps {
  particleCount?: number;
  className?: string;
  colorScheme?: 'dark' | 'light';
}

const REPULSION_RADIUS = 150;
const REPULSION_STRENGTH = 8000;
const SPRING_STIFFNESS = 0.02;
const DAMPING = 0.92;

function createParticles(
  count: number,
  width: number,
  height: number,
  colorScheme: 'dark' | 'light',
): Particle[] {
  const palette =
    colorScheme === 'dark'
      ? ['#D4A853', '#D4A853', '#FFFFFF']
      : ['#1B365D', '#1B365D', '#D4A853'];

  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;

    particles.push({
      x,
      y,
      baseX: x,
      baseY: y,
      size: 2 + Math.random() * 4,
      color: palette[Math.floor(Math.random() * palette.length)],
      opacity: 0.15 + Math.random() * 0.6,
      driftSpeedX: (Math.random() - 0.5) * 0.3,
      driftSpeedY: (Math.random() - 0.5) * 0.3,
      sineAmplitude: 5 + Math.random() * 15,
      sineFrequency: 0.005 + Math.random() * 0.015,
      phase: Math.random() * Math.PI * 2,
      vx: 0,
      vy: 0,
    });
  }

  return particles;
}

export function AntigravityField({
  particleCount = 60,
  className,
  colorScheme = 'dark',
}: AntigravityFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const initParticles = useCallback(
    (width: number, height: number) => {
      particlesRef.current = createParticles(
        particleCount,
        width,
        height,
        colorScheme,
      );
    },
    [particleCount, colorScheme],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;

    function resize() {
      if (!canvas || !ctx) return;
      const target = parent ?? document.documentElement;
      const w = target.clientWidth;
      const h = target.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const prevW = sizeRef.current.w;
      const prevH = sizeRef.current.h;
      sizeRef.current = { w, h };

      if (prevW === 0 || prevH === 0) {
        initParticles(w, h);
      } else {
        const scaleX = w / prevW;
        const scaleY = h / prevH;
        for (const p of particlesRef.current) {
          p.baseX *= scaleX;
          p.baseY *= scaleY;
          p.x *= scaleX;
          p.y *= scaleY;
        }
      }
    }

    resize();

    const resizeObserver = new ResizeObserver(resize);
    if (parent) {
      resizeObserver.observe(parent);
    }
    window.addEventListener('resize', resize);

    function onMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    }

    function onMouseLeave() {
      mouseRef.current.active = false;
    }

    function onTouchMove(e: TouchEvent) {
      if (!canvas) return;
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = touch.clientX - rect.left;
      mouseRef.current.y = touch.clientY - rect.top;
      mouseRef.current.active = true;
    }

    function onTouchEnd() {
      mouseRef.current.active = false;
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);

    function animate() {
      if (!ctx) return;
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      timeRef.current++;
      const t = timeRef.current;
      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      for (const p of particles) {
        // Autonomous floating: gentle drift + sine wave
        const floatX =
          p.baseX +
          p.driftSpeedX * t +
          Math.sin(t * p.sineFrequency + p.phase) * p.sineAmplitude;
        const floatY =
          p.baseY +
          p.driftSpeedY * t +
          Math.cos(t * p.sineFrequency * 0.7 + p.phase) *
            p.sineAmplitude *
            0.6;

        // Wrap base positions to keep particles in view over time
        const wrappedFloatX = ((floatX % w) + w) % w;
        const wrappedFloatY = ((floatY % h) + h) % h;

        // Spring toward floating target
        const targetX = wrappedFloatX;
        const targetY = wrappedFloatY;

        let forceX = (targetX - p.x) * SPRING_STIFFNESS;
        let forceY = (targetY - p.y) * SPRING_STIFFNESS;

        // Antigravity repulsion from cursor
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist < REPULSION_RADIUS && dist > 0.1) {
            // Inverse-square repulsion, clamped to avoid extreme values
            const strength = Math.min(
              REPULSION_STRENGTH / (distSq + 100),
              15,
            );
            forceX += (dx / dist) * strength;
            forceY += (dy / dist) * strength;
          }
        }

        p.vx = (p.vx + forceX) * DAMPING;
        p.vy = (p.vy + forceY) * DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', resize);
      resizeObserver.disconnect();
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
    />
  );
}
