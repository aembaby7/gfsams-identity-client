// src/app/[locale]/layout.tsx
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { locales } from '@/i18n/config';
import Providers from '@/components/providers/Providers';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params (required in Next.js 15)
  const { locale } = await params;
  
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Load messages directly
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html 
      lang={locale} 
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers locale={locale}>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}