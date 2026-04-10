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
  const [monthlyMileage, setMonthlyMileage] = useState(0) // НОВОЕ СВОЙСТВО
  const [loading, setLoading] = useState(true)
  const [isStandalone, setIsStandalone] = useState(false)
  
  const [daysToInsurance, setDaysToInsurance] = useState<number | null>(null)
  const [kmToService, setKmToService] = useState<number | null>(null)

  useEffect(() => {
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

        // Расчет дней до ОСАГО
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
          // Расходы за месяц
          const monthTotal = expenses
            .filter(e => e.date >= firstDayOfMonth)
            .reduce((acc, curr) => acc + Number(curr.amount), 0)
          setMonthlyExpenses(monthTotal)

          // Максимальный пробег (одометр)
          const maxMileage = Math.max(...expenses.map(e => e.mileage || 0), profileData?.car_mileage || 0)
          setTotalMileage(maxMileage)

          // РЕАЛЬНЫЙ ПРОБЕГ ЗА МЕСЯЦ
          const expensesWithMileage = expenses.filter(e => e.mileage && e.mileage > 0)
          let calcMonthlyMileage = 0
          if (expensesWithMileage.length > 0) {
            const thisMonth = expensesWithMileage.filter(e => e.date >= firstDayOfMonth)
            const past = expensesWithMileage.filter(e => e.date < firstDayOfMonth)
            
            if (thisMonth.length > 0) {
              const maxThisMonth = Math.max(...thisMonth.map(e => e.mileage))
              if (past.length > 0) {
                const maxPast = Math.max(...past.map(e => e.mileage))
                calcMonthlyMileage = maxThisMonth - maxPast
              } else {
                const minThisMonth = Math.min(...thisMonth.map(e => e.mileage))
                calcMonthlyMileage = maxThisMonth - minThisMonth
              }
            }
          }
          setMonthlyMileage(Math.max(0, calcMonthlyMileage))

          // Расчет ТО
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

  if (loading) return null

  // Умные статусы для ОСАГО
  const getInsuranceStatus = (days: number | null) => {
    if (days === null) return { color: '#00c853', bg: 'rgba(0,200,83,0.1)', text: 'Спокойно', style: { background: 'rgba(0,200,83,0.1)', color: '#00c853' } }
    if (days < 10) return { color: '#ff4b4b', bg: 'rgba(255,75,75,0.1)', text: 'Срочно', style: { background: 'var(--red)', color: 'white' } }
    if (days <= 30) return { color: '#ffa726', bg: 'rgba(255,167,38,0.1)', text: 'Скоро', style: { background: '#ffa726', color: 'white' } }
    return { color: '#00c853', bg: 'rgba(0,200,83,0.1)', text: 'Спокойно', style: { background: 'rgba(0,200,83,0.1)', color: '#00c853' } }
  }

  // Умные статусы для ТО
  const getServiceStatus = (km: number | null) => {
    if (km === null) return { color: '#00c853', bg: 'rgba(0,200,83,0.1)', text: 'Спокойно', style: { background: 'rgba(0,200,83,0.1)', color: '#00c853' } }
    if (km < 500) return { color: '#ff4b4b', bg: 'rgba(255,75,75,0.1)', text: 'Срочно', style: { background: 'var(--red)', color: 'white' } }
    if (km <= 1500) return { color: '#ffa726', bg: 'rgba(255,167,38,0.1)', text: 'Скоро', style: { background: '#ffa726', color: 'white' } }
    return { color: '#00c853', bg: 'rgba(0,200,83,0.1)', text: 'Спокойно', style: { background: 'rgba(0,200,83,0.1)', color: '#00c853' } }
  }

  const insStatus = getInsuranceStatus(daysToInsurance)
  const srvStatus = getServiceStatus(kmToService)

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
              ТО через <span style={{ color: srvStatus.color, fontWeight: 800 }}>{kmToService !== null ? `${kmToService.toLocaleString()} км` : '—'}</span> · 
              ОСАГО <span style={{ color: insStatus.color, fontWeight: 800 }}>
                {daysToInsurance !== null ? (daysToInsurance > 0 ? `${daysToInsurance} дн.` : 'Просрочен') : '—'}
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
          <p style={{ fontSize: '10px', color: '#00c853', marginTop: '4px' }}>за этот месяц</p>
        </div>
        
        <div className="card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>Пробег в месяц</p>
          <h2 style={{ fontSize: '22px', fontWeight: 900 }}>{monthlyMileage.toLocaleString()} км</h2>
          <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>за этот месяц</p>
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
          <div style={{ width: 36, height: 36, borderRadius: 12, background: insStatus.bg, color: insStatus.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>ОСАГО истекает</h4>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Через {daysToInsurance !== null ? daysToInsurance : '—'} дней</p>
          </div>
          <span className="badge" style={{ fontSize: '10px', ...insStatus.style }}>{insStatus.text}</span>
        </div>

        <div className="rem-row" style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--divider)', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: srvStatus.bg, color: srvStatus.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Замена масла (ТО)</h4>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Через ~{kmToService !== null ? kmToService.toLocaleString() : '—'} км</p>
          </div>
          <span className="badge" style={{ fontSize: '10px', ...srvStatus.style }}>{srvStatus.text}</span>
        </div>

        <div className="rem-row" style={{ display: 'flex', alignItems: 'center', padding: '14px 0', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(0,122,255,0.1)', color: '#0a84ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloudSun size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Погода для мойки ☀️</h4>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{profile?.wash_reminder_days || 3} дн. без осадков в Севастополе</p>
          </div>
          <span className="badge" style={{ fontSize: '10px', background: 'rgba(0,122,255,0.1)', color: '#0a84ff' }}>Умный совет</span>
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