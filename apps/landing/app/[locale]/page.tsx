import { unstable_setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/sections/hero';
import { Features } from '@/components/sections/features';
import { Catalog } from '@/components/sections/catalog';
import { MapSection } from '@/components/sections/map-section';
import { Stats } from '@/components/sections/stats';
import { Reviews } from '@/components/sections/reviews';
import { FAQ } from '@/components/sections/faq';
import { CTA } from '@/components/sections/cta';
import { fetchMuseums, fetchStats } from '@/lib/api';

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  // Hero phone-preview is a marketing surface — must never look empty, so
  // we explicitly opt into the hardcoded fallback here. Catalog/Map/Stats
  // do NOT use that fallback — they show real DB state.
  const [previewItems, stats] = await Promise.all([
    fetchMuseums(locale, { fallbackToHardcoded: true }),
    fetchStats(),
  ]);

  return (
    <>
      <Header />
      <main>
        <Hero previewItems={previewItems.slice(0, 3)} totalMuseums={stats.museums || undefined} locale={locale} />
        <Features />
        <Catalog />
        <MapSection locale={locale} />
        <Stats locale={locale} />
        <Reviews />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
