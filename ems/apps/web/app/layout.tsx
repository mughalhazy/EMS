import type { Metadata } from 'next'
import '@/styles/globals.css'
import '@/styles/components.css'
import '@/renderer/renderer.css'

export const metadata: Metadata = {
  title: { default: 'EMS', template: '%s | EMS' },
  description: 'Enterprise Event Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
