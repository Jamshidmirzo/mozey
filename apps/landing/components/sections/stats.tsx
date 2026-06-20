import { getTranslations } from 'next-intl/server';
import { fetchStats } from '@/lib/api';

export async function Stats({ locale }: { locale: string }) {
  const [t, stats] = await Promise.all([
    getTranslations({ locale, namespace: 'stats' }),
    fetchStats(),
  ]);

  // When the DB is empty (fresh install / dev) we render an em-dash instead
  // of a stale hardcoded "281" — a marketing number lying about reality is
  // exactly the bug this section is fixing.
  const fmt = (n: number) => (n > 0 ? n.toLocaleString('ru-RU') : '—');

  const cells = [
    { value: fmt(stats.museums), key: 'museums' as const },
    { value: fmt(stats.places), key: 'places' as const },
    { value: fmt(stats.regions), key: 'regions' as const },
    { value: String(stats.languages), key: 'languages' as const },
  ];

  return (
    <section style={{ background: '#1E1813', color: '#F2EADC' }}>
      <div
        className="mx-auto max-w-[1200px]"
        style={{ padding: '64px clamp(20px, 4vw, 40px)' }}
      >
        <div
          className="grid gap-8"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          }}
        >
          {cells.map((s, i) => (
            <div key={i} className="text-center">
              <div
                className="font-serif font-medium text-white"
                style={{
                  fontSize: 'clamp(46px, 6vw, 68px)',
                  lineHeight: 1,
                  letterSpacing: -1,
                }}
              >
                {s.value}
              </div>
              <div className="font-ui text-[15.5px] mt-[10px]" style={{ color: 'rgba(242,234,220,0.66)' }}>
                {t(s.key)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
