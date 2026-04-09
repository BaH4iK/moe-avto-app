'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  User2, MapPin, Car, Calendar, Save, LogOut, 
  Loader2, ArrowLeft, Camera, Wrench, Settings2
} from 'lucide-react'
import Toast from '../components/Toast'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [carBrand, setCarBrand] = useState('')
  const [carModel, setCarModel] = useState('')
  const [carYear, setCarYear] = useState('')
  const [engineVol, setEngineVol] = useState('')
  const [mileage, setMileage] = useState('')
  const [insuranceDate, setInsuranceDate] = useState('')
  const [serviceInterval, setServiceInterval] = useState(10000)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setProfile(data)
          setFullName(data.full_name || '')
          setCity(data.city || 'Севастополь')
          setCarBrand(data.car_brand || '')
          setCarModel(data.car_model || '')
          setCarYear(data.car_year?.toString() || '')
          setEngineVol(data.engine_volume?.toString() || '')
          setMileage(data.car_mileage?.toString() || '')
          setInsuranceDate(data.insurance_expiry || '')
          setServiceInterval(data.service_interval || 10000)
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Подготовка данных для МоёАВТО
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        city: city,
        car_brand: carBrand,
        car_model: carModel,
        car_year: parseInt(carYear) || null,
        // Сохраняем объем как число, заменяя запятую на точку для надежности
        engine_volume: engineVol ? parseFloat(engineVol.replace(',', '.')) : null,
        car_mileage: parseInt(mileage) || 0,
        insurance_expiry: insuranceDate || null,
        service_interval: serviceInterval
      })
      .eq('id', user?.id)

    if (!error) {
      setShowToast(true)
      router.refresh()
    } else {
      alert("Ошибка МоёАВТО: " + error.message)
    }
    setSaving(false)
  }

  if (loading) return null

  return (
    <main className="page active" style={{ paddingBottom: '140px', paddingTop: '10px' }}>
      {showToast && <Toast message="Данные МоёАВТО сохранены!" onClose={() => setShowToast(false)} />}

      <div className="pg-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => router.back()} className="icon-btn" style={{background:'var(--surface)'}}><ArrowLeft size={20}/></button>
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/auth'))} className="icon-btn" style={{ color: '#ff4b4b', background: 'rgba(255,75,75,0.1)' }}><LogOut size={20} /></button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 900, color: 'var(--primary)' }}>
            {fullName ? fullName[0].toUpperCase() : <User2 size={36} />}
          </div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--bg)' }}><Camera size={14} /></div>
        </div>
        <h2 style={{ marginTop: '12px', fontSize: '18px', fontWeight: 800 }}>{fullName || 'Водитель'}</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.7 }}>
            <User2 size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Личные данные</span>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input className="inp" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Имя Фамилия" />
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
              <input className="inp" style={{ paddingLeft: '44px' }} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Город" />
            </div>
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.7 }}>
            <Car size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Мой Автомобиль</span>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input className="inp" value={carBrand} onChange={(e) => setCarBrand(e.target.value)} placeholder="Марка" />
              <input className="inp" value={carModel} onChange={(e) => setCarModel(e.target.value)} placeholder="Модель" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input className="inp" type="number" value={carYear} onChange={(e) => setCarYear(e.target.value)} placeholder="Год" />
              <input className="inp" type="text" value={engineVol} onChange={(e) => setEngineVol(e.target.value)} placeholder="Объем двигателя (напр. 2.0)" />
            </div>
            <div style={{ position: 'relative' }}>
              <Settings2 size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
              <input className="inp" style={{ paddingLeft: '44px' }} value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="Текущий пробег (км)" />
            </div>
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.7 }}>
            <Calendar size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Страхование ОСАГО</span>
          </div>
          <div className="card" style={{ background: 'rgba(255, 107, 0, 0.03)', border: '1px solid var(--primary-hl)' }}>
            <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Дата окончания полиса</label>
            <input className="inp" type="date" style={{ colorScheme: 'dark' }} value={insuranceDate} onChange={(e) => setInsuranceDate(e.target.value)} />
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.7 }}>
            <Wrench size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Обслуживание (ТО)</span>
          </div>
          <div className="card">
            <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Периодичность (интервал)</label>
            <select className="inp" value={serviceInterval} onChange={(e) => setServiceInterval(Number(e.target.value))}>
              {[5000, 6000, 7000, 8000, 10000, 15000].map(v => (
                <option key={v} value={v}>Каждые {v.toLocaleString()} км</option>
              ))}
            </select>
          </div>
        </section>
      </div>

      <div style={{ position: 'fixed', bottom: '100px', left: '20px', right: '20px', zIndex: 10 }}>
        <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saving} style={{ height: '56px', borderRadius: '18px' }}>
          {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} style={{marginRight:'8px'}}/> Сохранить изменения</>}
        </button>
      </div>
    </main>
  )
}