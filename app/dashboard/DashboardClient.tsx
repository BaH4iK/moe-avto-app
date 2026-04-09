'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Wrench, ShieldAlert, CloudSun, AlertTriangle, 
  Wallet, Search, RefreshCw, Star, Loader2, BarChart3, 
  MapPin, ChevronRight, Fuel, Navigation, Smartphone
} from 'lucide-react'

export default function DashboardClient() {
  const supabase = createClient()
  const router = useRouter()
  
  const [profile, setProfile] = useState<any>(null)
  const [monthlyExpenses, setMonthlyExpenses] = useState(0)
  const [totalMileage, setTotalMileage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isStandalone, setIsStandalone] = useState(false) // Для проверки PWA
  
  const [daysToInsurance, setDaysToInsurance] = useState<number | null>(null)
  const [kmToService, setKmToService] = useState<number | null>(null)

  useEffect(() => {
    // Проверка: запущено ли приложение как PWA (на главном экране)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true)
    }

    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData)

        if (profileData?.insurance_expiry) {
          const expiry = new Date(profileData.insurance_expiry)
          const diffTime = expiry.getTime() - new Date().getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          setDaysToInsurance(diffDays)
        }

        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        const { data: expenses } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)

        if (expenses) {
          const monthTotal = expenses
            .filter(e => e.date >= firstDayOfMonth)
            .reduce((acc, curr) => acc + Number(curr.amount), 0)
          setMonthlyExpenses(monthTotal)

          const maxMileage = Math.max(...expenses.map(e => e.mileage || 0), profileData?.car_mileage || 0)
          setTotalMileage(maxMileage)

          const serviceExpenses = expenses
            .filter(e => e.category === 'Сервис' || e.category === 'ТО')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          if (serviceExpenses.length > 0 && profileData?.service_interval) {
            const lastServiceMileage = serviceExpenses[0].mileage || 0
            const nextServiceAt = lastServiceMileage + profileData.service_interval
            setKmToService(nextServiceAt - maxMileage)
          }
        }
      }
      setLoading(false)
    }
    loadDashboardData()
  }, [supabase])

  if (loading) return null // Просто возвращаем пустоту, пока layout показывает машинку

  return (
    <main className="page active" style={{ paddingBottom: '140px' }}>
      {/* ── ШАПКА ── */}
      <div className="pg-head" style={{ textAlign: 'center', marginBottom: 'var(--s6)' }}>
        <h1 className="pg-title" style={{ fontSize: '26px', fontWeight: 900 }}>
          {profile?.car_brand || 'Geely'} {profile?.car_model || 'Monjaro'}
        </h1>
        <p className="pg-sub">
          {totalMileage.toLocaleString()} км · {profile?.city || 'Севастополь'}
        </p>
      </div>

      {/* ── БЛОК "ВСЁ ПОД КОНТРОЛЕМ" ── */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #1c1c1c 0%, #111110 100%)', 
        border: '1px solid var(--divider)',
        padding: '20px',
        marginBottom: '16px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Всё под контролем 👌</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
              ТО через <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{kmToService ? `${kmToService.toLocaleString()} км` : '—'}</span> · 
              ОСАГО <span style={{ color: (daysToInsurance && daysToInsurance < 15) ? '#ff4b4b' : 'var(--primary)', fontWeight: 800 }}>
                {daysToInsurance ? (daysToInsurance > 0 ? `${daysToInsurance} дн.` : 'Просрочен') : '—'}
              </span>
            </p>
          </div>
          <div style={{ fontSize: '38px' }}>🚗</div>
        </div>
      </div>

      {/* ── СЕТКА СТАТИСТИКИ ── */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px', 
        marginBottom: '20px' 
      }}>
        <div className="card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>Расход за месяц</p>
          <h2 style={{ fontSize: '22px', fontWeight: 900 }}>{monthlyExpenses.toLocaleString()} ₽</h2>
          <p style={{ fontSize: '10px', color: '#00c853', marginTop: '4px' }}>↗ +8% к прошлому</p>
        </div>
        
        <div className="card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>Пробег в месяц</p>
          <h2 style={{ fontSize: '22px', fontWeight: 900 }}>2 140 км</h2>
          <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>— средний</p>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>Партнёры рядом</p>
          <h2 style={{ fontSize: '22px', fontWeight: 900 }}>34</h2>
          <p style={{ fontSize: '10px', color: '#00c853', marginTop: '4px' }}>● {profile?.city || 'Севастополь'}</p>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>Скидок активно</p>
          <h2 style={{ fontSize: '22px', fontWeight: 900 }}>6</h2>
          <p style={{ fontSize: '10px', color: 'var(--primary)', marginTop: '4px' }}>🏷️ от партнёров</p>
        </div>
      </div>

      {/* ── НАПОМИНАНИЯ ── */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-h">
          <span className="card-t">Напоминания</span>
          <span onClick={() => router.push('/reminders')} style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}>Все</span>
        </div>
        
        <div className="rem-row" style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--divider)', gap: '12px' }}>
          <div className={`rem-ico ${daysToInsurance && daysToInsurance < 15 ? 'r' : 'b'}`}><ShieldAlert size={18} /></div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>ОСАГО истекает</h4>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Через {daysToInsurance || '—'} дней · 15 апреля</p>
          </div>
          <span className="badge br" style={{ fontSize: '10px' }}>Срочно</span>
        </div>

        <div className="rem-row" style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--divider)', gap: '12px' }}>
          <div className="rem-ico y"><Wrench size={18} /></div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Замена масла (ТО)</h4>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Через ~{kmToService?.toLocaleString() || '1 200'} км</p>
          </div>
          <span className="badge bo" style={{ fontSize: '10px' }}>Скоро</span>
        </div>

        <div className="rem-row" style={{ display: 'flex', alignItems: 'center', padding: '14px 0', gap: '12px' }}>
          <div className="rem-ico b"><CloudSun size={18} /></div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Погода для мойки ☀️</h4>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{profile?.wash_reminder_days || 3} дн. без осадков в Севастополе</p>
          </div>
          <span className="badge bb" style={{ fontSize: '10px' }}>Умный совет</span>
        </div>
      </div>

      {/* ── БЫСТРЫЕ ДЕЙСТВИЯ ── */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '10px',
        marginBottom: '24px'
      }}>
        <div className="card" onClick={() => router.push('/expenses')} style={{ padding: '16px 4px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{ color: 'var(--primary)' }}><Wallet size={20} /></div>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)' }}>Траты</span>
        </div>
        <div className="card" style={{ padding: '16px 4px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ color: 'var(--primary)' }}><Search size={20} /></div>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)' }}>Сервис</span>
        </div>
        <div className="card" onClick={() => router.push('/market')} style={{ padding: '16px 4px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{ color: 'var(--primary)' }}><RefreshCw size={20} /></div>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)' }}>Базар</span>
        </div>
        <div className="card" style={{ padding: '16px 4px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ color: 'var(--primary)' }}><Star size={20} /></div>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)' }}>Рейтинг</span>
        </div>
      </div>

      {/* ── БАННЕР "ДОБАВЬТЕ НА ГЛАВНЫЙ ЭКРАН" ── */}
      {!isStandalone && (
        <div className="card" style={{ 
          background: 'rgba(255, 107, 0, 0.05)', 
          border: '1px solid var(--primary-hl)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            width: '42px', height: '42px', borderRadius: '12px', 
            background: 'var(--primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Smartphone size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '2px' }}>Добавьте на главный экран</h4>
            <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.4 }}>
              Safari → Поделиться → «На экран «Домой» — и AutoMate работает как приложение
            </p>
          </div>
        </div>
      )}
    </main>
  )
}