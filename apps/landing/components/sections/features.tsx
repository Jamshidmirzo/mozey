'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

const features = [
  { key: 'offline', color: '#059669', bg: 'bg-emerald-50', icon: 'M2 20h.01M7 20v-4M12 20v-8M17 20V8M2 2l20 20' },
  { key: 'languages', color: '#2563eb', bg: 'bg-blue-50', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20M2 12h20' },
  { key: 'museums', color: '#d97706', bg: 'bg-amber-50', icon: 'M2 20h20M5 20V8l7-5 7 5v12M9 20v-6h6v6M9 12h6' },
  { key: 'darkMode', color: '#7c3aed', bg: 'bg-violet-50', icon: 'M12 3a6 6 0 009 9 9 9 0 11-9-9z' },
  { key: 'search', color: '#e11d48', bg: 'bg-rose-50', icon: 'M11 11m-8 0a8 8 0 1016 0 8 8 0 10-16 0M21 21l-4.3-4.3' },
  { key: 'favorites', color: '#ea580c', bg: 'bg-orange-50', icon: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z' },
] as const;

export function Features() {
  const t = useTranslations('features');

  return (
    <section id="features" className="section-padding bg-white">
      <div className="container-landing">
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
          <h2 className="heading-section mt-4">
            {t('title')}
          </h2>
          <p className="text-body-large mt-6">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.key}
              className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 transition-all duration-500 hover:border-gray-200 hover:shadow-2xl hover:shadow-black/5"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-museum-gold/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} transition-transform duration-500 group-hover:scale-110`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={feature.color}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={feature.icon} />
                </svg>
              </div>

              <h3 className="mt-6 text-xl font-semibold text-deep-blue">
                {t(`${feature.key}.title`)}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-gray-500">
                {t(`${feature.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
