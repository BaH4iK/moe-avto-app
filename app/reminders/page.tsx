'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, ShieldAlert, Wrench, CloudSun, 
  Save, Loader2, Info, ChevronRight, CheckCircle2,
  Calendar, Disc, Bell
} from 'lucide-react'

export default function RemindersPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  
  // Настройки напоминаний
  const [washDays, setWashDays] = useState(3)
  const [serviceInterval, setServiceInterval] = useState(10000)
  const [insuranceDate, setInsuranceDate] = useState('')
  const [tireReminder, setTireReminder] = useState(true)

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setProfile(data)
          if (data.wash_reminder_days) setWashDays(data.wash_reminder_days)
          if (data.service_interval) setServiceInterval(data.service_interval)
          if (data.insurance_expiry) setInsuranceDate(data.insurance_expiry)
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
        service_interval: serviceInterval,
        insurance_expiry: insuranceDate
      }).eq('id', user.id)

      if (!error) {
        alert('Настройки успешно сохранены!')
      } else {
        alert('Ошибка при сохранении: ' + error.message)
      }
    }
    setSaving(false)
  }

  // Расчет дней для плашки статуса
  const getInsDays = () => {
    if (!insuranceDate) return '—'
    const diff = new Date(insuranceDate).getTime() - new Date().getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? `${days} дн.` : 'Истекла'
  }

  if (loading) return null

  return (
    <main className="page active" style={{ paddingBottom: '160px' }}>
      {/* ── ШАПКА ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--s6)' }}>
        <button onClick={() => router.back()} className="icon-btn" style={{ background: 'var(--surface)', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="pg-title">Напоминания</h1>
          <p className="pg-sub">Контроль обслуживания авто</p>
        </div>
      </div>

      {/* ── КАРТОЧКИ ТЕКУЩЕГО СТАТУСА ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px', background: 'rgba(0,200,83,0.05)', border: '1px solid rgba(0,200,83,0.1)' }}>
          <ShieldAlert size={18} color="#00c853" style={{ marginBottom: '8px' }} />
          <p style={{ fontSize: '11px', color: 'var(--muted)' }}>ОСАГО через</p>
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{getInsDays()}</h3>
        </div>
        <div className="card" style={{ padding: '16px', background: 'rgba(255,107,0,0.05)', border: '1px solid rgba(255,107,0,0.1)' }}>
          <Wrench size={18} color="var(--primary)" style={{ marginBottom: '8px' }} />
          <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Масло (интервал)</p>
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{serviceInterval.toLocaleString()} км</h3>
        </div>
      </div>

      {/* ── СПИСОК НАСТРОЕК ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* СТРАХОВКА */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Calendar size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Страховой полис</span>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <label className="inp-label">Дата окончания ОСАГО</label>
            <input 
              type="date" 
              className="inp" 
              value={insuranceDate}
              onChange={(e) => setInsuranceDate(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </section>

        {/* ТЕХОБСЛУЖИВАНИЕ */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Wrench size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Сервисное ТО</span>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <label className="inp-label">Интервал замены масла</label>
            <select 
              className="inp" 
              style={{ width: '100%', WebkitAppearance: 'none' }}
              value={serviceInterval}
              onChange={(e) => setServiceInterval(Number(e.target.value))}
            >
              {[5000, 7000, 8000, 10000, 15000].map(v => (
                <option key={v} value={v}>Раз в {v.toLocaleString()} км</option>
              ))}
            </select>
          </div>
        </section>

        {/* ШИНЫ */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Disc size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Сезонные шины</span>
          </div>
          <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700 }}>Смена резины</p>
              <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Напоминать в апреле и ноябре</p>
            </div>
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
        </section>

        {/* МОЙКА */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CloudSun size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Умная мойка</span>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '12px' }}>
              Предлагать мойку, если нет дождя (дней):
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
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

      {/* ── КНОПКА СОХРАНЕНИЯ ── */}
      <div style={{ position: 'fixed', bottom: 'calc(90px + env(safe-area-inset-bottom))', left: '20px', right: '20px' }}>
        <button 
          className="btn btn-primary btn-full" 
          onClick={handleSave}
          disabled={saving}
          style={{ height: '56px', borderRadius: '18px', boxShadow: '0 8px 24px rgba(255,107,0,0.3)' }}
        >
          {saving ? <Loader2 className="animate-spin" /> : 'Сохранить настройки'}
        </button>
      </div>
    </main>
  )
}