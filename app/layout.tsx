import { ClerkProvider } from '@clerk/nextjs'

import { ModalProvider } from '@/providers/modal-provider'
import { ToasterProvider } from '@/providers/toast-provider'

import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/providers/theme-provider'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans">
          <ThemeProvider  
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <ToasterProvider />
            <ModalProvider/>  
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
