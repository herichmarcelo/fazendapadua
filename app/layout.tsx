import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import InstallPrompt from '@/components/pwa/InstallPrompt'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Controle de Cercas - Fazenda Santo Antônio de Pádua',
  description: 'Sistema de gestão de cercas para agronegócio',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CercasApp',
  },
  icons: [
    { rel: 'icon', url: '/icon-192.png' },
    { rel: 'apple-touch-icon', url: '/icon-192.png' },
  ],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#009739',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        <div className="app-layout-wrapper" style={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)',
          paddingBottom: '4rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background elements */}
          <div className="print:hidden" style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(0, 151, 57, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }} />
          <div className="print:hidden" style={{
            position: 'absolute',
            bottom: '200px',
            left: '-100px',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }} />
          
          {children}

          {/* Banner Automático de Instalação PWA para Android e iOS */}
          <InstallPrompt />
        </div>
      </body>
    </html>
  )
}