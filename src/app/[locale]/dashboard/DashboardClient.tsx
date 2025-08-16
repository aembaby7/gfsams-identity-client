'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

export default function DashboardClient() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard');

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: `/${locale}`,
      redirect: true 
    });
  };

  return (
    <div className="mt-6 flex space-x-3">
      <button
        onClick={() => router.push(`/${locale}/profile`)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {t('viewProfile')}
      </button>
      
      <button
        onClick={handleSignOut}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {t('signOut')}
      </button>
    </div>
  );
}