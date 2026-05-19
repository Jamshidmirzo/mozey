'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { StoreBadge } from '@/components/ui/store-badge';
import { MagneticButton } from '@/components/effects/magnetic-button';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '@/lib/constants';

export function Download() {
  const t = useTranslations('download');

  return (
    <section id="download" className="section-padding bg-white">
      <div className="container-landing">
        <motion.div
          className="relative overflow-hidden rounded-[2.5rem] bg-deep-blue px-8 py-20 sm:px-16 sm:py-28"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-museum-gold/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-museum-gold/5 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23D4A853' stroke-width='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px',
            }}
          />

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <motion.span
              className="text-sm font-semibold uppercase tracking-widest text-museum-gold"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {t('sectionLabel')}
            </motion.span>

            <motion.h2
              className="mt-6 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
              style={{ lineHeight: 1 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t('title')}
            </motion.h2>

            <motion.p
              className="mt-6 text-lg text-gray-400 sm:text-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <MagneticButton strength={0.25}>
                <StoreBadge store="apple" href={APP_STORE_URL} />
              </MagneticButton>
              <MagneticButton strength={0.25}>
                <StoreBadge store="google" href={GOOGLE_PLAY_URL} />
              </MagneticButton>
            </motion.div>

            <motion.div
              className="mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-white/5 backdrop-blur-sm">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#D4A853"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto"
                  >
                    <rect width="5" height="5" x="3" y="3" rx="1" />
                    <rect width="5" height="5" x="16" y="3" rx="1" />
                    <rect width="5" height="5" x="3" y="16" rx="1" />
                    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                    <path d="M21 21v.01" />
                    <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                    <path d="M3 12h.01" />
                    <path d="M12 3h.01" />
                    <path d="M12 16v.01" />
                    <path d="M16 12h1" />
                    <path d="M21 12v.01" />
                    <path d="M12 21v-1" />
                  </svg>
                  <p className="mt-2 text-xs text-gray-500">QR Code</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                {t('qrHint')}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
