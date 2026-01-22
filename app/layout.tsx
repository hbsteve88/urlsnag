import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthContext'
import { ToastProvider } from '@/components/ToastContext'
import SystemNotificationListener from '@/components/SystemNotificationListener'

export const metadata: Metadata = {
  title: 'URLSNAG - Buy & Sell Premium Domains',
  description: 'The marketplace for premium domain names',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        <AuthProvider>
          <ToastProvider>
            <SystemNotificationListener />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
