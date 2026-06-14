'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Overline } from '@/components/ui/overline';

const reviewKeys = ['review1', 'review2', 'review3'] as const;

export function Reviews() {
  const t = useTranslations('reviews');

  return (
    <section
      className="mx-auto max-w-[1200px]"
      style={{ padding: '70px clamp(20px, 4vw, 40px) 40px' }}
    >
      {/* Header */}
      <div className="text-center mb-9">
        <Overline color="#9C6F22">{t('overline')}</Overline>
        <h2
          className="font-serif font-medium text-ink m-0 mt-[10px]"
          style={{
            fontSize: 'clamp(30px, 4vw, 44px)',
            letterSpacing: -0.6,
          }}
        >
          {t('title')}
        </h2>
      </div>

      {/* Cards */}
      <div
        className="grid gap-5"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        {reviewKeys.map((key, i) => (
          <div
            key={i}
            className="bg-surface"
            style={{
              borderRadius: 22,
              padding: '28px 26px',
              border: '0.5px solid rgba(30,24,19,0.06)',
              boxShadow: '0 1px 2px rgba(30,24,19,0.04)',
            }}
          >
            {/* Stars */}
            <div className="flex gap-[3px] mb-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star
                  key={j}
                  size={17}
                  fill="#9C6F22"
                  color="#9C6F22"
                  strokeWidth={0}
                />
              ))}
            </div>

            {/* Quote */}
            <p
              className="font-serif text-[19px] leading-[1.5] text-ink m-0"
              style={{ letterSpacing: -0.2 }}
            >
              &laquo;{t(`${key}.text`)}&raquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-[11px] mt-[22px]">
              <div
                className="flex items-center justify-center rounded-full font-serif text-[17px] font-semibold text-primary"
                style={{
                  width: 38,
                  height: 38,
                  background: 'rgba(21,94,122,0.1)',
                }}
              >
                {t(`${key}.name`).charAt(0)}
              </div>
              <div>
                <div className="font-ui text-[14.5px] font-semibold text-ink">
                  {t(`${key}.name`)}
                </div>
                <div className="font-ui text-[13px] text-ink3">{t(`${key}.role`)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
