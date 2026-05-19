'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

const screenshots = [
  { src: '/screenshots/screen-1.svg', alt: 'Museum list view' },
  { src: '/screenshots/screen-2.svg', alt: 'Museum detail view' },
  { src: '/screenshots/screen-3.svg', alt: 'Historical places dark mode' },
];

export function Screenshots() {
  const t = useTranslations('screenshots');
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y3 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [-3, 3]);
  const rotate3 = useTransform(scrollYProgress, [0, 1], [3, -3]);

  const yValues = [y1, y2, y3];
  const rotateValues = [rotate1, undefined, rotate3];

  return (
    <section ref={ref} id="screenshots" className="section-padding overflow-hidden bg-gray-50">
      <div className="container-landing">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-deep-blue-400">
            {t('sectionLabel')}
          </span>
          <h2 className="heading-section mt-4">
            {t('title')}
          </h2>
          <p className="text-body-large mt-6">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="mt-20 flex items-center justify-center gap-6 sm:gap-10 lg:gap-16">
          {screenshots.map((screen, index) => (
            <motion.div
              key={index}
              className="relative flex-shrink-0"
              style={{
                y: yValues[index],
                rotate: rotateValues[index],
              }}
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-b from-museum-gold/20 to-transparent opacity-0 blur-2xl transition-opacity duration-500 hover:opacity-100" />

              <div className="relative overflow-hidden rounded-[2.5rem] border-[4px] border-gray-200 bg-white shadow-2xl shadow-black/10 transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src={screen.src}
                  alt={screen.alt}
                  width={270}
                  height={540}
                  className="h-[380px] w-[190px] object-cover sm:h-[480px] sm:w-[240px] lg:h-[580px] lg:w-[290px]"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
