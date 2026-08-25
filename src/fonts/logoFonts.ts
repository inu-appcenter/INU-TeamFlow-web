// src/fonts/logoFonts.ts
import localFont from 'next/font/local';

export const cafe24Nyangi = localFont({
  src: '../../public/fonts/logo/Cafe24Nyangi-B-v1.0.woff2',
  variable: '--font-logo-nyangi',
  display: 'swap',
});

export const circulat = localFont({
  src: '../../public/fonts/logo/circulat.ttf',
  variable: '--font-logo-circulat',
  display: 'swap',
});
