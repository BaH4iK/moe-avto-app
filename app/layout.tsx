'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'
import Topbar from './components/Topbar'
import BottomNav from './components/BottomNav'
import PageLoader from './components/PageLoader'

const inter = Inter({ subsets: ['cyrillic', 'latin'], variable: '--font-b' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-d' })

// Компонент для отслеживания смены пути и параметров
function NavigationWatcher({ setIsNavigating }: { setIsNavigating: (val: boolean) => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastPath = useRef(pathname)

  useEffect(() => {
    if (pathname !== lastPath.current) {
      lastPath.current = pathname
    }
  }, [pathname, searchParams])

  return null
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()

  // Логика запуска лоадера при смене страницы
  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => {
      setIsNavigating(false)
      window.scrollTo(0, 0)
    }, 1200) // 1.2 секунды — идеальное время для проезда машинки

    return () => clearTimeout(timer)
  }, [pathname])

  // Перехват кликов по ссылкам для мгновенного включения лоадера
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      if (anchor && anchor.href && anchor.host === window.location.host) {
        if (anchor.href !== window.location.href && !anchor.href.includes('#')) {
          setIsNavigating(true)
        }
      }
    }
    document.addEventListener('click', handleLinkClick)
    return () => document.removeEventListener('click', handleLinkClick)
  }, [])

  return (
    <html lang="ru">
      <head>
        <title>МоёАВТО — твой личный автопомощник</title>
        <meta name="description" content="Учёт расходов, гараж и запись к мастерам в Севастополе." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        
        {/* Настройки PWA для МоёАВТО */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="МоёАВТО" />
        <meta name="theme-color" content="#111110" />
        
        {/* Иконка для iPhone */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <Suspense fallback={null}>
          <NavigationWatcher setIsNavigating={setIsNavigating} />
        </Suspense>

        {/* Наш фирменный лоадер с машинкой */}
        {isNavigating && <PageLoader />}

        <Topbar />
        
        <div style={{ 
          opacity: isNavigating ? 0 : 1, 
          visibility: isNavigating ? 'hidden' : 'visible',
          transition: 'opacity 0.4s ease',
          minHeight: '100vh',
          paddingTop: '60px' 
        }}>
          {children}
        </div>

        <BottomNav />
      </body>
    </html>
  )
}