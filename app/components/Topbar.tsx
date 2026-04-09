'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

export default function Topbar() {
  const supabase = createClient()
  const pathname = usePathname()
  
  const [carInfo, setCarInfo] = useState({
    brand: 'Моё',
    model: 'АВТО',
    mileage: 0,
    city: 'Севастополь'
  })

  // Скрываем топбар на страницах авторизации и онбординга
  const isAuthPage = pathname === '/auth' || pathname === '/onboarding'
  if (isAuthPage) return null

  useEffect(() => {
    let isMounted = true

    async function getCarData() {
      try {
        // Используем getSession для предотвращения конфликтов сессий
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && isMounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('car_brand, car_model, car_mileage, city')
            .eq('id', session.user.id)
            .single()

          if (profile && isMounted) {
            setCarInfo({
              brand: profile.car_brand || 'Мой',
              model: profile.car_model || 'Автомобиль',
              mileage: profile.car_mileage || 0,
              city: profile.city || 'Крым'
            })
          }
        }
      } catch (e) {
        console.error('Ошибка загрузки данных в Topbar:', e)
      }
    }

    getCarData()

    // Real-time подписка на изменения профиля
    const channel = supabase
      .channel('profile_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        if (payload.new && isMounted) {
          setCarInfo({
            brand: payload.new.car_brand,
            model: payload.new.car_model,
            mileage: payload.new.car_mileage,
            city: payload.new.city
          })
        }
      })
      .subscribe()

    return () => { 
      isMounted = false
      supabase.removeChannel(channel) 
    }
  }, [supabase])

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      background: 'rgba(17, 17, 16, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--divider)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      paddingTop: 'env(safe-area-inset-top)'
    }}>
      <div style={{ 
        fontSize: '14px', 
        fontWeight: 900, 
        textAlign: 'center',
        letterSpacing: '-0.3px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
          <span style={{ color: 'var(--text)' }}>{carInfo.brand}</span>
          <span style={{ color: 'var(--primary)' }}>{carInfo.model}</span>
        </div>
        <div style={{ 
          fontSize: '10px', 
          color: 'var(--muted)', 
          fontWeight: 700, 
          marginTop: '2px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {carInfo.city} · {carInfo.mileage.toLocaleString()} км
        </div>
      </div>
    </header>
  )
}