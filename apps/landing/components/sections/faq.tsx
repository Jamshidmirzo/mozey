'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Overline } from '@/components/ui/overline';

const faqKeys = ['1', '2', '3', '4', '5'] as const;

export function FAQ() {
  const t = useTranslations('faq');
  const [open, setOpen] = useState(0);

  return (
    <section
      className="mx-auto max-w-[820px]"
      style={{ padding: '50px clamp(20px, 4vw, 40px) 40px' }}
    >
      {/* Header */}
      <div className="text-center mb-8">
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

      {/* Accordion */}
      <div className="flex flex-col gap-3">
        {faqKeys.map((num, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className="bg-surface overflow-hidden"
              style={{
                borderRadius: 18,
                border: '0.5px solid rgba(30,24,19,0.06)',
              }}
            >
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full border-none bg-transparent cursor-pointer flex items-center justify-between gap-4 text-left"
                style={{ padding: '20px 24px' }}
              >
                <span className="font-serif text-[20px] font-medium text-ink -tracking-[0.2px]">
                  {t(`q${num}`)}
                </span>
                <span
                  className="flex-shrink-0 flex transition-transform duration-300"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                  }}
                >
                  <ChevronDown size={20} color="#A99F8E" strokeWidth={2} />
                </span>
              </button>
              <div
                className="overflow-hidden"
                style={{
                  maxHeight: isOpen ? 220 : 0,
                  transition:
                    'max-height 340ms cubic-bezier(.2,.8,.2,1)',
                }}
              >
                <p
                  className="font-ui text-[15.5px] leading-[1.6] text-ink2 m-0"
                  style={{ padding: '0 24px 22px' }}
                >
                  {t(`a${num}`)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
