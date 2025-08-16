// src/app/[locale]/dashboard/page.tsx
import { auth } from "@/auth"

import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const session = await auth()
  
  // This check is redundant if middleware is working, but good for safety
  if (!session) {
    redirect(`/${locale}/auth/signin`);
  }

  const t = await getTranslations('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {t('title')}
            </h1>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {t('userInfo')}
                </h2>
                
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      {t('name')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session.user.name}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      {t('email')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session.user.email}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      {t('username')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session.user.username || 'N/A'}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      {t('roles')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session.user.roles?.join(', ') || 'No roles assigned'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Client Component for interactive features */}
            <DashboardClient />
          </div>
        </div>
      </div>
    </div>
  );
}