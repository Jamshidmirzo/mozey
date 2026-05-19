'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function FeatureCard({
  title,
  description,
  icon,
  iconBg,
  iconColor,
}: FeatureCardProps) {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-museum-gold/20 hover:shadow-lg hover:shadow-museum-gold/5 sm:p-8"
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {/* Top accent line on hover */}
      <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gold-gradient transition-transform duration-300 group-hover:scale-x-100" />

      {/* Icon */}
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
          iconBg,
          iconColor
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <h3 className="mt-5 text-lg font-semibold text-deep-blue">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">
        {description}
      </p>
    </motion.div>
  );
}
