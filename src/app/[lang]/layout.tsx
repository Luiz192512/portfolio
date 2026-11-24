import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Background } from '@/components/layout/Background';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SkipLink } from '@/components/layout/SkipLink';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { dmMono, syne } from '@/lib/fonts';
import { LocaleProvider } from '@/lib/i18n/client';
import { hasLocale, localePath, LOCALES } from '@/lib/i18n/locales';
import { SITE_NAME, siteUrl } from '@/lib/site';
import './globals.css';

const SEO = {
  pt: {
    title: 'Luiz Gustavo Enz | Desenvolvedor Full Stack',
    description:
      'Portfólio de Luiz Gustavo Enz, desenvolvedor full stack júnior com foco em IA e fundador da Enz Softwares, em Maringá, PR.',
    og: 'pt_BR',
    html: 'pt-BR',
  },
  en: {
    title: 'Luiz Gustavo Enz | Full Stack Developer',
    description:
      'Portfolio of Luiz Gustavo Enz, junior full stack developer focused on AI and founder of Enz Softwares, based in Maringá, Brazil.',
    og: 'en_US',
    html: 'en',
  },
} as const;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const seo = SEO[lang];
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: seo.title, template: '%s | Luiz Gustavo Enz' },
    description: seo.description,
    alternates: {
      canonical: localePath(lang),
      languages: { 'pt-BR': localePath('pt'), en: localePath('en') },
    },
    // url resolves against metadataBase, so each environment gets its own absolute address.
    openGraph: { locale: seo.og, type: 'website', url: localePath(lang), siteName: SITE_NAME },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
  colorScheme: 'dark',
};

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={SEO[lang].html} className={`${syne.variable} ${dmMono.variable}`}>
      <body>
        <noscript>
          <style>{'[data-entry]{opacity:1!important;transform:none!important}'}</style>
        </noscript>
        <LocaleProvider locale={lang}>
          <MotionProvider>
            <Background />
            <SkipLink />
            <Header />
            <main id="conteudo" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <Footer />
          </MotionProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
