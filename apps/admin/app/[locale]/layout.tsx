import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/request';
import { Providers } from '@/components/layout/providers';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <Providers locale={locale} messages={messages}>
      {children}
    </Providers>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
