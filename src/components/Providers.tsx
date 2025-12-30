'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { ReactNode, useEffect, useRef } from 'react'
import { setCurrentUser, migrateAnonymousData, getCurrentUser } from '@/lib/storage'

interface ProvidersProps {
  children: ReactNode
}

// Syncs the user session with localStorage storage keys
function StorageUserSync({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const prevUserId = useRef<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (session?.user) {
      // Use email as unique identifier (or id if available)
      const userId = session.user.id || session.user.email || null

      // Check if user just logged in (was anonymous before)
      const wasAnonymous = prevUserId.current === null && getCurrentUser() === null

      // Set current user first
      setCurrentUser(userId)

      // Migrate anonymous data to user account on first login
      if (wasAnonymous && userId) {
        migrateAnonymousData(userId)
      }

      prevUserId.current = userId
    } else {
      // User signed out - clear current user context
      // Data stays saved under their user ID but we read from non-prefixed (empty) now
      setCurrentUser(null)
      prevUserId.current = null
    }
  }, [session, status])

  return <>{children}</>
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <StorageUserSync>
        {children}
      </StorageUserSync>
    </SessionProvider>
  )
}
