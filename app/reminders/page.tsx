'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, ShieldAlert, Wrench, CloudSun, 
  Save, Loader2, Calendar, Disc, ChevronRight
} from 'lucide-react'

export default function RemindersPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Настройки из БД
  const [washDays, setWashDays] = useState(3)
  const [serviceInterval, setServiceInterval] = useState(10000)
  const [insuranceDate, setInsuranceDate] = useState('')
  
  // Новые настройки (локально + сохранение в профиль)
  const [tireReminder, setTireReminder] = useState(true)
  const [springMonth, setSpringMonth] = useState('Апрель')
  const [autumnMonth, setAutumnMonth] = useState('Ноябрь')

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          if (data.wash_reminder_days) setWashDays(data.wash_reminder_days)
          if (data.service_interval) setServiceInterval(data.service_interval)
          if (data.insurance_expiry) setInsuranceDate(data.insurance_expiry)
          // Если в БД будут поля для шин, можно добавить их сюда:
          // if (data.tire_spring_month) setSpringMonth(data.tire_spring_month)
          // if (data.tire_autumn_month) setAutumnMonth(data.tire_autumn_month)
        }
      }
      setLoading(false)
    }
    loadSettings()
  }, [supabase])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('profiles').update({
        wash_reminder_days: washDays,
        insurance_expiry: insuranceDate
        // tire_spring_month: springMonth,
        // tire_autumn_month: autumnMonth
      }).eq('id', user.id)

      if (!error) {
        alert('Настройки успешно сохранены!')
      } else {
        alert('Ошибка сохранения: ' + error.message)
      }
    }
    setSaving(false)
  }

  if (loading) return null

  return (
    <main className="page active" style={{ 
      paddingBottom: '160px', 
      width: '100%', 
      maxWidth: '100vw', 
      overflowX: 'hidden', 
      boxSizing: 'border-box' 
    }}>
      {/* ── ШАПКА ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--s6)' }}>
        <button onClick={() => router.back()} className="icon-btn" style={{ background: 'var(--surface)', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="pg-title">Напоминания</h1>
          <p className="pg-sub">Настройка уведомлений</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        
        {/* СТРАХОВОЙ ПОЛИС */}
        <section style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Calendar size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Страховой полис</span>
          </div>
          <div className="card" style={{ padding: '16px', width: '100%', boxSizing: 'border-box' }}>
            <label className="inp-label">Дата окончания ОСАГО</label>
            <input 
              type="date" 
              className="inp" 
              value={insuranceDate}
              onChange={(e) => setInsuranceDate(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', fontSize: '16px', height: '48px' }} 
            />
          </div>
        </section>

        {/* СЕРВИСНОЕ ТО (ПЕРЕХОД В ПРОФИЛЬ) */}
        <section style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Wrench size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Сервисное ТО</span>
          </div>
          <div 
            className="card" 
            onClick={() => router.push('/profile')}
            style={{ 
              padding: '16px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700 }}>Интервал замены масла</p>
              <p style={{ fontSize: '16px', color: 'var(--primary)', fontWeight: 800, marginTop: '4px' }}>
                Раз в {serviceInterval.toLocaleString()} км
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--muted)' }}>
              <span style={{ fontSize: '11px' }}>Изменить</span>
              <ChevronRight size={18} />
            </div>
          </div>
        </section>

        {/* СМЕНА РЕЗИНЫ */}
        <section style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Disc size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Смена резины</span>
          </div>
          <div className="card" style={{ padding: '16px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tireReminder ? '16px' : '0' }}>
              <p style={{ fontSize: '14px', fontWeight: 700 }}>Уведомления</p>
              <div 
                onClick={() => setTireReminder(!tireReminder)}
                style={{ 
                  width: '46px', height: '24px', borderRadius: '12px', 
                  background: tireReminder ? 'var(--primary)' : 'var(--surface2)',
                  position: 'relative', transition: '0.3s', cursor: 'pointer'
                }}
              >
                <div style={{ 
                  width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                  position: 'absolute', top: '3px', left: tireReminder ? '25px' : '3px', transition: '0.3s'
                }} />
              </div>
            </div>

            {tireReminder && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="inp-label" style={{ fontSize: '10px' }}>Весна</label>
                  <select 
                    className="inp" 
                    value={springMonth} 
                    onChange={(e) => setSpringMonth(e.target.value)}
                    style={{ width: '100%', fontSize: '14px', height: '44px' }}
                  >
                    {['Март', 'Апрель', 'Май'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="inp-label" style={{ fontSize: '10px' }}>Осень / Зима</label>
                  <select 
                    className="inp" 
                    value={autumnMonth} 
                    onChange={(e) => setAutumnMonth(e.target.value)}
                    style={{ width: '100%', fontSize: '14px', height: '44px' }}
                  >
                    {['Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* УМНАЯ МОЙКА */}
        <section style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CloudSun size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Умная мойка</span>
          </div>
          <div className="card" style={{ padding: '16px', width: '100%', boxSizing: 'border-box' }}>
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '12px' }}>
              Предлагать мойку, если нет дождя (дней):
            </p>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              {[1, 2, 3, 5, 7].map(day => (
                <button 
                  key={day}
                  onClick={() => setWashDays(day)}
                  style={{ 
                    flex: 1, height: '40px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                    background: washDays === day ? 'var(--primary)' : 'var(--surface)',
                    color: washDays === day ? 'white' : 'var(--text)',
                    border: '1px solid var(--divider)', transition: '0.2s'
                  }}
                >
                  {day}д
                </button>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* КНОПКА СОХРАНЕНИЯ */}
      <div style={{ position: 'fixed', bottom: 'calc(90px + env(safe-area-inset-bottom))', left: '20px', right: '20px', zIndex: 100 }}>
        <button 
          className="btn btn-primary btn-full" 
          onClick={handleSave}
          disabled={saving}
          style={{ height: '56px', borderRadius: '18px', boxShadow: '0 8px 24px rgba(255,107,0,0.3)' }}
        >
          {saving ? <Loader2 className="animate-spin" /> : 'Сохранить изменения'}
        </button>
      </div>
    </main>
  )
}