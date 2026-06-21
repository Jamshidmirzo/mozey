import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="uz">
      <head>
        <title>404 - Sahifa topilmadi</title>
        <meta name="robots" content="noindex" />
      </head>
      <body className="flex min-h-screen items-center justify-center bg-canvas font-sans">
        <div className="text-center px-6">
          <h1 className="font-serif text-7xl font-bold text-primary">
            404
          </h1>
          <p className="mt-4 text-lg text-ink2">
            Sahifa topilmadi / Page not found
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
            style={{ boxShadow: '0 6px 18px rgba(21,94,122,0.28)' }}
          >
            Bosh sahifa / Home
          </Link>
        </div>
      </body>
    </html>
  );
}
