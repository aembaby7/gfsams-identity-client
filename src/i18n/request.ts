// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { locales } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    locale = 'ar'; // Default to Arabic
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});