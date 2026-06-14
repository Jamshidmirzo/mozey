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

export default function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Catalog />
        <MapSection />
        <Stats />
        <Reviews />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
