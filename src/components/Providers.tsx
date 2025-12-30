'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { ReactNode, useEffect } from 'react'
import { setCurrentUser } from '@/lib/storage'

interface ProvidersProps {
  children: ReactNode
}

// Syncs the user session with localStorage storage keys
function StorageUserSync({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return

    if (session?.user) {
      // Use email as unique identifier (or id if available)
      const userId = session.user.id || session.user.email || null
      setCurrentUser(userId)
    } else {
      // User signed out - use shared storage
      setCurrentUser(null)
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
