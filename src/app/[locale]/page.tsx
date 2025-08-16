// src/app/[locale]/page.tsx
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('common');
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          {t('welcome')}
        </h1>
        <p className="text-lg text-gray-600">
          GFSAMS Identity Client
        </p>
      </div>
    </div>
  );
}