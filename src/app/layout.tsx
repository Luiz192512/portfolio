import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Background } from '@/components/layout/Background';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SkipLink } from '@/components/layout/SkipLink';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { dmMono, syne } from '@/lib/fonts';
import { SITE_TITLE, siteUrl } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE_TITLE, template: '%s | Luiz Gustavo Enz' },
  description:
    'Portfólio de Luiz Gustavo Enz, desenvolvedor full stack júnior e fundador da Enz Softwares, em Maringá, PR.',
  alternates: { canonical: '/' },
  openGraph: { locale: 'pt_BR', type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${dmMono.variable}`}>
      <body>
        <noscript>
          <style>{'[data-entry]{opacity:1!important;transform:none!important}'}</style>
        </noscript>
        <MotionProvider>
          <Background />
          <SkipLink />
          <Header />
          <main id="conteudo" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
