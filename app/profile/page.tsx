'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  User2, MapPin, Car, Calendar, Save, LogOut, 
  Loader2, ArrowLeft, Camera, Wrench, ShieldAlert
} from 'lucide-react'
import Toast from '../components/Toast'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Все стейты из твоего файла + добавили VIN
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [carBrand, setCarBrand] = useState('')
  const [carModel, setCarModel] = useState('')
  const [carYear, setCarYear] = useState('')
  const [engineVol, setEngineVol] = useState('')
  const [mileage, setMileage] = useState('')
  const [vinCode, setVinCode] = useState('') // НОВОЕ ПОЛЕ
  const [insuranceDate, setInsuranceDate] = useState('')
  const [serviceInterval, setServiceInterval] = useState(10000)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setFullName(data.full_name || '')
          setCity(data.city || 'Севастополь')
          setCarBrand(data.car_brand || '')
          setCarModel(data.car_model || '')
          setCarYear(data.car_year?.toString() || '')
          setEngineVol(data.engine_volume?.toString() || '')
          setMileage(data.car_mileage?.toString() || '')
          setVinCode(data.vin_code || '') // ЗАГРУЖАЕМ VIN
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
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName || null,
        city: city || null,
        car_brand: carBrand || null,
        car_model: carModel || null,
        car_year: parseInt(carYear) || null,
        engine_volume: engineVol ? parseFloat(engineVol.replace(',', '.')) : null,
        car_mileage: parseInt(mileage) || 0,
        vin_code: vinCode || null, // СОХРАНЯЕМ VIN
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
      {showToast && <Toast message="Данные сохранены!" onClose={() => setShowToast(false)} />}

      {/* ШАПКА КАК НА РИСУНКЕ */}
      <div className="pg-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => router.back()} className="icon-btn" style={{background:'var(--surface)'}}><ArrowLeft size={20}/></button>
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/auth'))} className="icon-btn" style={{ color: '#ff4b4b', background: 'rgba(255,75,75,0.1)' }}><LogOut size={20} /></button>
      </div>

      {/* АВАТАР И ИМЯ КАК НА РИСУНКЕ */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 900, color: 'var(--primary)' }}>
            {fullName ? fullName[0].toUpperCase() : <User2 size={36} />}
          </div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--bg)' }}><Camera size={14} /></div>
        </div>
        <h2 style={{ marginTop: '12px', fontSize: '18px', fontWeight: 800 }}>{fullName || 'Имя не указано'}</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* ЛИЧНЫЕ ДАННЫЕ */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.7 }}>
            <User2 size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Личные данные</span>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input className="inp" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ввод имени" />
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
              <input className="inp" style={{ paddingLeft: '44px' }} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ввод города" />
            </div>
          </div>
        </section>

        {/* МОЙ АВТОМОБИЛЬ ПО ТВОЕМУ ЭСКИЗУ */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.7 }}>
            <Car size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Мой Автомобиль</span>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input className="inp" value={carBrand} onChange={(e) => setCarBrand(e.target.value)} placeholder="Марка" />
              <input className="inp" value={carModel} onChange={(e) => setCarModel(e.target.value)} placeholder="Модель" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <input className="inp" type="number" style={{ padding: '0 8px', textAlign: 'center' }} value={carYear} onChange={(e) => setCarYear(e.target.value)} placeholder="Год" />
              <input className="inp" type="text" style={{ padding: '0 8px', textAlign: 'center' }} value={engineVol} onChange={(e) => setEngineVol(e.target.value)} placeholder="Объем" />
              <input className="inp" type="number" style={{ padding: '0 8px', textAlign: 'center' }} value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="Пробег" />
            </div>
            {/* ПОЛЕ VIN */}
            <input className="inp" style={{ textTransform: 'uppercase' }} value={vinCode} onChange={(e) => setVinCode(e.target.value.toUpperCase())} placeholder="VIN-код" />
          </div>
        </section>

        {/* СТРАХОВАНИЕ ОСАГО (ИСПРАВЛЕН ХАК ДЛЯ SAFARI) */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.7 }}>
            <ShieldAlert size={16} style={{ color: 'var(--red)' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Страхование ОСАГО</span>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Дата окончания полиса</label>
            <input 
              className="inp" 
              type="date" 
              style={{ width: '100%', boxSizing: 'border-box', WebkitAppearance: 'none', backgroundClip: 'padding-box', margin: 0, colorScheme: 'dark' }} 
              value={insuranceDate} 
              onChange={(e) => setInsuranceDate(e.target.value)} 
            />
          </div>
        </section>

        {/* ОБСЛУЖИВАНИЕ ТО (ИСПРАВЛЕН ХАК ДЛЯ SAFARI) */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.7 }}>
            <Wrench size={16} className="c-primary" />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Обслуживание (ТО)</span>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Периодичность (интервал)</label>
            <select 
              className="inp" 
              style={{ width: '100%', boxSizing: 'border-box', WebkitAppearance: 'none', backgroundClip: 'padding-box', margin: 0 }} 
              value={serviceInterval} 
              onChange={(e) => setServiceInterval(Number(e.target.value))}
            >
              {[5000, 6000, 7000, 8000, 10000, 15000].map(v => (
                <option key={v} value={v}>Каждые {v.toLocaleString()} км</option>
              ))}
            </select>
          </div>
        </section>
      </div>

      <div style={{ position: 'fixed', bottom: '100px', left: '20px', right: '20px', zIndex: 10 }}>
        <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saving} style={{ height: '56px', borderRadius: '18px', fontWeight: 800 }}>
          {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} style={{marginRight:'8px'}}/> Сохранить изменения</>}
        </button>
      </div>
    </main>
  )
}