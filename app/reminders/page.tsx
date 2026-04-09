'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, ShieldAlert, Wrench, CloudSun, 
  Save, Loader2, Info, ChevronRight, CheckCircle2
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

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setProfile(data)
          if (data.wash_reminder_days) setWashDays(data.wash_reminder_days)
          if (data.service_interval) setServiceInterval(data.service_interval)
        }
      }
      setLoading(false)
    }
    loadSettings()
  }, [supabase])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from('profiles')
      .update({
        wash_reminder_days: washDays,
        service_interval: serviceInterval
      })
      .eq('id', user?.id)

    if (!error) {
      router.refresh()
      setTimeout(() => setSaving(false), 500)
    } else {
      alert('Ошибка сохранения')
      setSaving(false)
    }
  }

  if (loading) return <div className="page active" style={{display:'flex', justifyContent:'center', alignItems:'center'}}><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>

  return (
    <main className="page active" style={{ paddingBottom: '100px' }}>
      <div className="pg-head" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.back()} className="icon-btn" style={{background:'var(--surface)'}}>
          <ArrowLeft size={20}/>
        </button>
        <h1 className="pg-title" style={{marginBottom:0}}>Напоминания</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        
        {/* СТРАХОВКА */}
        <div className="card" style={{ borderLeft: '4px solid #ff4b4b' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div className="rem-ico r"><ShieldAlert size={20} /></div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Страховка ОСАГО</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                Истекает {profile?.insurance_expiry ? new Date(profile.insurance_expiry).toLocaleDateString('ru-RU') : 'не указано'}
              </p>
              <button 
                onClick={() => router.push('/profile')}
                style={{ marginTop: '12px', fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', padding: 0, fontWeight: 700, cursor: 'pointer' }}
              >
                Изменить дату в профиле
              </button>
            </div>
          </div>
        </div>

        {/* ТЕХОБСЛУЖИВАНИЕ */}
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div className="rem-ico y"><Wrench size={20} /></div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Тех. обслуживание</h3>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Интервал замены масла и фильтров</p>
              
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Через сколько км делать ТО?</label>
                <select 
                  className="inp" 
                  value={serviceInterval}
                  onChange={(e) => setServiceInterval(Number(e.target.value))}
                  style={{ background: 'var(--bg)', borderRadius: '12px', height: '48px' }}
                >
                  {[5000, 6000, 7000, 8000, 9000, 10000].map(val => (
                    <option key={val} value={val}>{val.toLocaleString()} км</option>
                  ))}
                </select>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.4 }}>
                <Info size={10} style={{display:'inline', marginRight: '4px'}}/> 
                Мы берем пробег из последнего чека в категории «Сервис» и прибавляем этот интервал.
              </p>
            </div>
          </div>
        </div>

        {/* МОЙКА */}
        <div className="card" style={{ borderLeft: '4px solid var(--blue)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div className="rem-ico b"><CloudSun size={20} /></div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Мойка</h3>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Умный совет на основе прогноза погоды</p>
              
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Порог дней без осадков</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 5, 7].map(day => (
                    <button 
                      key={day}
                      onClick={() => setWashDays(day)}
                      style={{ 
                        flex: 1, height: '40px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                        background: washDays === day ? 'var(--blue)' : 'var(--bg)',
                        color: washDays === day ? 'white' : 'var(--text)',
                        border: '1px solid var(--divider)', transition: '0.2s'
                      }}
                    >
                      {day}д
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 100, left: 20, right: 20 }}>
        <button 
          className="btn btn-primary btn-full" 
          onClick={handleSave}
          disabled={saving}
          style={{ height: '56px', borderRadius: '18px', boxShadow: '0 8px 24px rgba(255,107,0,0.3)' }}
        >
          {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} style={{marginRight:'8px'}}/> Сохранить настройки</>}
        </button>
      </div>
    </main>
  )
}