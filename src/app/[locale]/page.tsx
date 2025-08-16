// src/app/[locale]/page.tsx
import { auth } from '@/auth'

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to GFSAMS Identity Client
        </h1>
        
        <p className="text-sm text-gray-500 mb-4">
          Current locale: {locale}
        </p>
        
        {session ? (
          <div className="p-4 bg-green-100 rounded-lg">
            <p className="text-green-800">
              You are logged in as {session.user?.email}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-yellow-100 rounded-lg">
            <p className="text-yellow-800">
              Please log in to continue
            </p>
          </div>
        )}
      </div>
    </main>
  )
}