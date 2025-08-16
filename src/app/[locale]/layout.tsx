// src/app/[locale]/layout.tsx
import { notFound } from 'next/navigation'
import { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

const locales = ['en', 'ar'] // Add your supported locales

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params
  
  // Validate locale
  if (!locales.includes(locale)) {
    notFound()
  }

  // Get messages for the locale
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </NextIntlClientProvider>
  )
}