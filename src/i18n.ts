// src/i18n.ts
import { getRequestConfig } from 'next-intl/server'

const locales = ['en', 'ar']

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale)) {
    locale = 'en'
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})