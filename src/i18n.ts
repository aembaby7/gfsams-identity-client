// src/i18n.ts
import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  // Await the locale
  const locale = await requestLocale || 'en';
  
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});