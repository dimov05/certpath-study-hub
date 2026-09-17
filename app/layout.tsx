import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://certpath-cca-foundations.soft-loom-2658.chatgpt.site').replace(/\/$/, '');
const socialImage = `${siteUrl}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title: 'CertPath — Claude Architect Foundations',
  description: 'A free, local-first study platform for Claude Certified Architect – Foundations.',
  applicationName: 'CertPath',
  alternates: { canonical: siteUrl },
  openGraph: {
    title: 'CertPath — Claude Architect Foundations',
    description: 'Study with direction. Build production judgment.',
    type: 'website',
    url: siteUrl,
    images: [{ url: socialImage, width: 1200, height: 630, alt: 'CertPath study hub preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CertPath — Claude Architect Foundations',
    description: 'Study with direction. Build production judgment.',
    images: [socialImage],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body></html>;
}
