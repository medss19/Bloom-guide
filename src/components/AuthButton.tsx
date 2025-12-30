'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

export default function AuthButton() {
  const { data: session, status } = useSession()
  const [showMenu, setShowMenu] = useState(false)

  if (status === 'loading') {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
    )
  }

  if (session?.user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-10 h-10 rounded-full border-2 border-bloom-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-bloom-500 flex items-center justify-center text-white font-medium">
              {session.user.name?.[0] || session.user.email?.[0] || 'U'}
            </div>
          )}
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-12 z-50 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-medium text-gray-900 truncate">
                  {session.user.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {session.user.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMenu(false)
                  signOut({ callbackUrl: '/' })
                }}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 hover:text-bloom-600 hover:border-bloom-200 transition-all"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span className="text-sm font-medium">Sign in</span>
    </button>
  )
}
