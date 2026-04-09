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
    name: '', 
    car_brand: '',
    car_model: '',
    car_year: '',
    car_mileage: '',
    city: '', 
    insurance_expiry: ''
  })

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  const handleFinish = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: formData.name,
        car_brand: formData.car_brand,
        car_model: formData.car_model,
        car_year: formData.car_year,
        car_mileage: parseInt(formData.car_mileage) || 0,
        city: formData.city || 'Севастополь',
        insurance_expiry: formData.insurance_expiry,
        onboarded: true,
        updated_at: new Date().toISOString()
      })

      if (!error) {
        // Принудительный редирект для исключения ошибки "This page couldn't load"
        window.location.replace('/dashboard')
      } else {
        alert('Ошибка сохранения: ' + error.message)
      }
    }
    setLoading(false)
  }

  return (
    <main className="page active" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100dvh',
      padding: '0 var(--s6) env(safe-area-inset-bottom)',
      gap: 0 
    }}>
      
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        paddingTop: 'calc(var(--s8) + env(safe-area-inset-top))', 
        marginBottom: 'var(--s8)' 
      }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ 
            height: '4px', 
            flex: 1, 
            borderRadius: '2px', 
            background: s <= step ? 'var(--primary)' : 'var(--surface2)',
            transition: '0.3s'
          }} />
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        {step === 1 && (
          <div className="fade-in">
            <h1 className="pg-title" style={{ fontSize: '32px', marginBottom: 'var(--s2)' }}>Как вас зовут?</h1>
            <p className="pg-sub" style={{ marginBottom: 'var(--s8)' }}>Давайте познакомимся, чтобы общение было приятным</p>
            
            <div className="ffield">
              <label className="inp-label">Ваше имя</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--muted)' }} />
                <input 
                  className="inp" 
                  style={{ paddingLeft: '44px' }}
                  placeholder="Иван" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <h1 className="pg-title" style={{ fontSize: '32px' }}>Ваш автомобиль</h1>
            <p className="pg-sub" style={{ marginBottom: 'var(--s8)' }}>Настроим сервис под вашу машину</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
              <div className="ffield">
                <label className="inp-label">Марка</label>
                <input className="inp" placeholder="Напр. Geely" value={formData.car_brand} onChange={e => setFormData({...formData, car_brand: e.target.value})} />
              </div>
              <div className="ffield">
                <label className="inp-label">Модель</label>
                <input className="inp" placeholder="Напр. Monjaro" value={formData.car_model} onChange={e => setFormData({...formData, car_model: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in">
            <h1 className="pg-title" style={{ fontSize: '32px' }}>Детали</h1>
            <p className="pg-sub" style={{ marginBottom: 'var(--s8)' }}>Это нужно для расчета ТО и поиска мастеров</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
              <div className="ffield">
                <label className="inp-label">Текущий пробег (км)</label>
                <input className="inp" type="number" placeholder="18500" value={formData.car_mileage} onChange={e => setFormData({...formData, car_mileage: e.target.value})} />
              </div>
              <div className="ffield">
                <label className="inp-label">Ваш город</label>
                <input className="inp" placeholder="Севастополь" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="fade-in">
            <h1 className="pg-title" style={{ fontSize: '32px' }}>Почти готово!</h1>
            <p className="pg-sub" style={{ marginBottom: 'var(--s8)' }}>Когда заканчивается ваша страховка?</p>
            
            <div className="ffield">
              <label className="inp-label">Дата окончания ОСАГО</label>
              <input 
                className="inp" 
                type="date" 
                value={formData.insurance_expiry} 
                onChange={e => setFormData({...formData, insurance_expiry: e.target.value})} 
              />
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        paddingBottom: 'calc(var(--s8) + 60px + env(safe-area-inset-bottom))', 
        paddingTop: 'var(--s4)',
        background: 'var(--bg)',
        zIndex: 10
      }}>
        {step > 1 && (
          <button className="btn btn-outline" style={{ flex: 1, height: '56px' }} onClick={prevStep}>
            <ArrowLeft size={18} />
          </button>
        )}
        
        {step < 4 ? (
          <button 
            className="btn btn-primary" 
            style={{ flex: 3, height: '56px' }} 
            onClick={nextStep}
            disabled={step === 1 && !formData.name}
          >
            Далее <ChevronRight size={18} />
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            style={{ flex: 3, height: '56px' }} 
            onClick={handleFinish}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Начать пользоваться'}
          </button>
        )}
      </div>
    </main>
  )
}