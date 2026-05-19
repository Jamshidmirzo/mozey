'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CONTENT_LANGUAGES } from '@/lib/constants';

interface LanguageTabsProps {
  children: (lang: string) => React.ReactNode;
  defaultValue?: string;
}

export function LanguageTabs({ children, defaultValue = 'uz' }: LanguageTabsProps) {
  const t = useTranslations('languages');

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {CONTENT_LANGUAGES.map((lang) => (
          <TabsTrigger key={lang} value={lang}>
            {t(`tab${lang.charAt(0).toUpperCase() + lang.slice(1)}` as 'tabUz' | 'tabRu' | 'tabEn')}
            {' - '}
            {t(lang as 'uz' | 'ru' | 'en')}
          </TabsTrigger>
        ))}
      </TabsList>
      {CONTENT_LANGUAGES.map((lang) => (
        <TabsContent key={lang} value={lang} forceMount className="space-y-4 mt-4 data-[state=inactive]:hidden">
          {children(lang)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
