'use client'

import { Home, Wallet, MapPin, RefreshCw, Star, User } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  // Функция для определения активного таба
  const isActive = (path: string) => pathname.startsWith(path) ? 'active' : ''

  return (
    <nav className="bnav" role="navigation">
      <div className={`bni ${pathname === '/dashboard' ? 'active' : ''}`} onClick={() => router.push('/dashboard')}>
        <div className="bni-icon"><Home size={20} /></div>
        <span>Главная</span>
      </div>
      <div className={`bni ${isActive('/expenses')}`} onClick={() => router.push('/expenses')}>
        <div className="bni-icon"><Wallet size={20} /></div>
        <span>Расходы</span>
      </div>
      <div className={`bni ${isActive('/catalog')}`} onClick={() => router.push('/catalog')}>
        <div className="bni-icon"><MapPin size={20} /></div>
        <span>Партнёры</span>
      </div>
      <div className={`bni ${isActive('/garage')}`} onClick={() => router.push('/garage')}>
        <div className="bni-icon"><RefreshCw size={20} /></div>
        <span>Авто</span>
      </div>
      <div className={`bni ${isActive('/ratings')}`} onClick={() => router.push('/ratings')}>
        <div className="bni-icon"><Star size={20} /></div>
        <span>Рейтинги</span>
      </div>
      <div className={`bni ${isActive('/profile')}`} onClick={() => router.push('/profile')}>
        <div className="bni-icon"><User size={20} /></div>
        <span>Профиль</span>
      </div>
    </nav>
  )
}