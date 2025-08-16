// src/app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { auth } from "@/auth"
import { authOptions } from '@/lib/auth';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations('home');
  const session = await auth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {t('subtitle')}
          </p>
          
          <div className="mt-10 flex justify-center space-x-4">
            {session ? (
              <>
                <Link
                  href={`/${locale}/dashboard`}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {t('dashboard')}
                </Link>
                <Link
                  href={`/${locale}/profile`}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {t('profile')}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/auth/signin`}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {t('signIn')}
                </Link>
                <Link
                  href={`/${locale}/auth/signup`}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {t('signUp')}
                </Link>
              </>
            )}
          </div>

          {session && (
            <div className="mt-10 bg-white rounded-lg shadow p-6 max-w-md mx-auto">
              <p className="text-gray-600">
                {t('welcome')}, <span className="font-semibold">{session.user.name}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}