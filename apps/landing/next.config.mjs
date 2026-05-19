import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@muzeylari/ui'],
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
