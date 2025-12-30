import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'BloomGuide - AI That Teaches, Not Answers',
  description: 'An ethical AI learning assistant that guides students through concepts instead of handing out solutions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
