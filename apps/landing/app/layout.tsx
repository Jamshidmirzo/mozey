import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://mozey.uz'),
  title: {
    default: "O'zbekiston Muzeylari",
    template: "%s | O'zbekiston Muzeylari",
  },
  description:
    "O'zbekiston bo'ylab 281 ta muzey va 101 ta tarixiy joyni kashf eting.",
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    alternateLocale: ['ru_RU', 'en_US'],
    siteName: "O'zbekiston Muzeylari",
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
