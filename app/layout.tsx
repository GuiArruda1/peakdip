import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWARegistration from '@/components/PWARegistration';
import JarvisDailyBriefingBot from '@/components/JarvisDailyBriefingBot';

export const metadata: Metadata = {
  title: 'PEAK Dip Hunter | S&P 500 & Crypto Timing Engine',
  description:
    'Institutional-grade timing and dip-buying analytics platform for Bitcoin and S&P 500 featuring Machine Learning regimes, 200-SMA retests, 30-day drawdown Z-scores, and seasonality matrices.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PEAK Dip',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#080B11',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark overflow-x-hidden max-w-full">
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#080B11] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <PWARegistration />
        <JarvisDailyBriefingBot />
        {children}
      </body>
    </html>
  );
}
