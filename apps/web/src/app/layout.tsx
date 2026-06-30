import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cuentas',
  description: 'Gestiona tus ingresos y gastos',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cuentas',
  },
}

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')`,
          }}
        />
      </body>
    </html>
  )
}
