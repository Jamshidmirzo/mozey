import Link from 'next/link';

export default function NotFound() {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-warm-white font-sans">
        <div className="text-center">
          <h1 className="font-display text-6xl font-bold text-museum-gold">
            404
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Page not found
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-deep-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-deep-blue-500"
          >
            Go Home
          </Link>
        </div>
      </body>
    </html>
  );
}
