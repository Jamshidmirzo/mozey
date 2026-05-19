import { unstable_setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/sections/hero';
import { Features } from '@/components/sections/features';
import { Screenshots } from '@/components/sections/screenshots';
import { Statistics } from '@/components/sections/statistics';
import { Download } from '@/components/sections/download';
import { CustomCursor } from '@/components/effects/custom-cursor';

export default function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  return (
    <>
      <CustomCursor />
      <Header />
      <main>
        <Hero />
        <Features />
        <Screenshots />
        <Statistics />
        <Download />
      </main>
      <Footer />
    </>
  );
}
