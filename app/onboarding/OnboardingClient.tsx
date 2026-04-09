'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Car, MapPin, Calendar, Gauge, ChevronRight, 
  ArrowLeft, Check, Loader2, User 
} from 'lucide-react'

export default function OnboardingClient() {
  const supabase = createClient()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '', car_brand: '', car_model: '', car_year: '', car_mileage: '', city: '', insurance_expiry: ''
  })

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  const handleFinish = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id, full_name: formData.name, car_brand: formData.car_brand,
        car_model: formData.car_model, car_year: formData.car_year,
        car_mileage: parseInt(formData.car_mileage) || 0,
        city: formData.city || 'Севастополь', onboarded: true, updated_at: new Date().toISOString()
      })
      if (!error) window.location.replace('/dashboard')
      else alert('Ошибка сохранения: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <main className="page active" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: 'calc(100vh - 60px)', // Высота экрана за вычетом топбара
      padding: '0 var(--s6) env(safe-area-inset-bottom)',
    }}>
      
      {/* Прогресс-бар */}
      <div style={{ 
        display: 'flex', gap: '8px', 
        paddingTop: 'calc(var(--s8) + env(safe-area-inset-top))', 
        marginBottom: 'var(--s8)' 
      }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ height: '4px', flex: 1, borderRadius: '2px', background: s <= step ? 'var(--primary)' : 'var(--surface2)' }} />
        ))}
      </div>

      {/* КОНТЕНТ ШАГА */}
      <div style={{ flex: 1 }}> {/* flex: 1 заставляет этот блок занять всё свободное место, выталкивая кнопки вниз */}
        {step === 1 && (
          <div className="fade-in">
            <h1 className="pg-title" style={{ fontSize: '32px', marginBottom: 'var(--s2)' }}>Как вас зовут?</h1>
            <p className="pg-sub" style={{ marginBottom: 'var(--s8)' }}>Давайте познакомимся</p>
            <div className="ffield">
              <label className="inp-label">Ваше имя</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--muted)' }} />
                <input className="inp" style={{ paddingLeft: '44px' }} placeholder="Иван" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <h1 className="pg-title" style={{ fontSize: '32px' }}>Ваш автомобиль</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)', marginTop: '24px' }}>
              <div className="ffield"><input className="inp" placeholder="Марка" value={formData.car_brand} onChange={e => setFormData({...formData, car_brand: e.target.value})} /></div>
              <div className="ffield"><input className="inp" placeholder="Модель" value={formData.car_model} onChange={e => setFormData({...formData, car_model: e.target.value})} /></div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in">
            <h1 className="pg-title" style={{ fontSize: '32px' }}>Детали</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)', marginTop: '24px' }}>
              <div className="ffield"><input className="inp" type="number" placeholder="Пробег" value={formData.car_mileage} onChange={e => setFormData({...formData, car_mileage: e.target.value})} /></div>
              <div className="ffield"><input className="inp" placeholder="Ваш город" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="fade-in">
            <h1 className="pg-title" style={{ fontSize: '32px' }}>Почти готово!</h1>
            <div className="ffield" style={{marginTop:'24px'}}>
              <label className="inp-label">Дата окончания ОСАГО</label>
              <input className="inp" type="date" value={formData.insurance_expiry} onChange={e => setFormData({...formData, insurance_expiry: e.target.value})} />
            </div>
          </div>
        )}
      </div>

      {/* КНОПКИ (ВНИЗУ ПОТОКА) */}
      <div style={{ 
        display: 'flex', gap: '12px', 
        paddingBottom: 'calc(40px + env(safe-area-inset-bottom))', // Большой отступ от BottomNav
        paddingTop: '20px',
        marginTop: 'auto' // Прижимает кнопки к низу, если контента мало
      }}>
        {step > 1 && (
          <button className="btn btn-outline" style={{ flex: 1, height: '56px', borderRadius: '16px' }} onClick={prevStep}><ArrowLeft size={18} /></button>
        )}
        <button 
          className="btn btn-primary" 
          style={{ flex: 3, height: '56px', borderRadius: '16px', fontWeight: 700 }} 
          onClick={step < 4 ? nextStep : handleFinish}
          disabled={step === 1 && !formData.name}
        >
          {step < 4 ? <>Далее <ChevronRight size={18} /></> : (loading ? <Loader2 className="animate-spin" /> : 'Начать пользоваться')}
        </button>
      </div>
    </main>
  )
}