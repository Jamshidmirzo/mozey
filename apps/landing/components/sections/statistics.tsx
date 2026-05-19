'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { STATISTICS } from '@/lib/constants';
import { Counter } from '@/components/ui/counter';
import { AntigravityField } from '@/components/effects/antigravity-field';

const stats = [
  { key: 'museums' as const, value: STATISTICS.museums, suffix: '+' },
  { key: 'historicalPlaces' as const, value: STATISTICS.historicalPlaces, suffix: '+' },
  { key: 'languages' as const, value: STATISTICS.languages, suffix: '' },
  { key: 'regions' as const, value: STATISTICS.regions, suffix: '' },
];

export function Statistics() {
  const t = useTranslations('statistics');

  return (
    <section id="statistics" className="relative section-padding overflow-hidden bg-deep-blue">
      <AntigravityField
        className="absolute inset-0 z-0"
        particleCount={40}
        colorScheme="dark"
      />

      <div className="container-landing relative z-10">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-museum-gold">
            {t('sectionLabel')}
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl" style={{ lineHeight: 1 }}>
            {t('title')}
          </h2>
          <p className="mt-6 text-lg text-gray-400 sm:text-xl">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="mt-20 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.key}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm transition-all duration-500 hover:border-museum-gold/30 hover:bg-white/10"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-museum-gold to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="font-display text-5xl font-bold text-museum-gold sm:text-6xl">
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-3 text-sm font-medium text-gray-400 sm:text-base">
                {t(stat.key)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
