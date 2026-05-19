'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { StoreBadge } from '@/components/ui/store-badge';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '@/lib/constants';
import { AntigravityField } from '@/components/effects/antigravity-field';

export function Hero() {
  const t = useTranslations('hero');
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-deep-blue"
    >
      <AntigravityField
        className="absolute inset-0 z-0"
        particleCount={70}
        colorScheme="dark"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-deep-blue/80" />

      <motion.div
        className="container-landing relative z-10 py-32 text-center"
        style={{ y, opacity, scale }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-museum-gold/30 bg-museum-gold/10 px-5 py-2 text-sm font-medium text-museum-gold backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-museum-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-museum-gold" />
            </span>
            {t('badge')}
          </span>
        </motion.div>

        <motion.h1
          className="mx-auto mt-8 max-w-5xl font-display text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-9xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('title')}
        </motion.h1>

        <motion.p
          className="mx-auto mt-4 font-display text-2xl text-museum-gold sm:text-3xl md:text-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('subtitle')}
        </motion.p>

        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-400 sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {t('description')}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <StoreBadge store="apple" href={APP_STORE_URL} />
          <StoreBadge store="google" href={GOOGLE_PLAY_URL} />
        </motion.div>

        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <motion.div
            className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/20 p-1.5"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div className="h-2 w-1 rounded-full bg-museum-gold" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
