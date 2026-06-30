import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cuentas',
    short_name: 'Cuentas',
    description: 'Gestiona tus ingresos y gastos',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#4f46e5',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  }
}
