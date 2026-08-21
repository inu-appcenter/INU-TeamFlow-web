// src/fonts/logoFonts.ts
import localFont from 'next/font/local';

export const Ganpan = localFont({
  src: '../../public/fonts/logo/KCC-Ganpan.woff2',
  variable: '--font-logo-Ganpan',
  display: 'swap',
});

export const cafe24Nyangi = localFont({
  src: '../../public/fonts/logo/Cafe24Nyangi-B-v1.0.woff2',
  variable: '--font-logo-nyangi',
  display: 'swap',
});

export const chab = localFont({
  src: '../../public/fonts/logo/chab.ttf',
  variable: '--font-logo-chab',
  display: 'swap',
});

export const sinchon = localFont({
  src: '../../public/fonts/logo/sinchon.ttf',
  variable: '--font-logo-sinchon',
  display: 'swap',
});
