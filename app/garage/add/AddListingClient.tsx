'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Car, PlusCircle, CheckCircle2 } from 'lucide-react'

export default function AddListingClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1) 
  const [source, setSource] = useState('') 
  
  // Имитация загрузки для анимации машинки
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const myGarageCar = { brand: 'Geely', model: 'Monjaro', year: '2024', mileage: '6 500' }

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    transmission: 'Автоматическая',
    engineSize: '', 
    year: '',
    price: '',
    mileage: ''
  })

  const selectSource = (src: string) => {
    setSource(src)
    if (src === 'garage') {
      setFormData({
        brand: myGarageCar.brand,
        model: myGarageCar.model,
        transmission: 'Автоматическая',
        engineSize: '2.0',
        year: myGarageCar.year,
        price: '',
        mileage: myGarageCar.mileage
      })
    }
    setStep(2)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
    setTimeout(() => router.push('/market'), 2000)
  }

  if (loading) return null

  return (
    <main className="page active" style={{ paddingBottom: '40px' }}>
      <div className="pg-head" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => step === 1 ? router.back() : setStep(1)} className="icon-btn" style={{ background: 'var(--surface)' }}>
          <ArrowLeft size={20}/>
        </button>
        <h1 className="pg-title" style={{ fontSize: '20px' }}>Разместить объявление</h1>
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          <p className="section-label">Выберите автомобиль для продажи</p>
          
          <div className="card" onClick={() => selectSource('garage')} style={{ cursor: 'pointer', border: source === 'garage' ? '2px solid var(--primary)' : '1px solid var(--divider)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-hl)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Car size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 800 }}>Из моего гаража</h3>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{myGarageCar.brand} {myGarageCar.model}</p>
              </div>
            </div>
          </div>

          <div className="card" onClick={() => selectSource('new')} style={{ cursor: 'pointer', border: source === 'new' ? '2px solid var(--primary)' : '1px solid var(--divider)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--surface2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusCircle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 800 }}>Новое авто</h3>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Ввести данные вручную</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="ffield">
              <label className="inp-label">Марка и модель</label>
              <input 
                className="inp" 
                required 
                placeholder="Например: Geely Monjaro" 
                value={source === 'garage' ? `${formData.brand} ${formData.model}` : undefined} 
                onChange={e => {
                   const [b, ...m] = e.target.value.split(' ');
                   setFormData({...formData, brand: b || '', model: m.join(' ')})
                }}
                disabled={source === 'garage'}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <div className="ffield">
                <label className="inp-label">Год</label>
                <input 
                  className="inp" 
                  type="text" 
                  required 
                  placeholder="2024" 
                  value={formData.year} 
                  onChange={e => setFormData({...formData, year: e.target.value})} 
                />
              </div>
              <div className="ffield">
                <label className="inp-label">Пробег, км</label>
                <input className="inp" type="text" required placeholder="6 500" value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} />
              </div>
            </div>

            <div className="ffield" style={{ marginTop: '12px' }}>
              <label className="inp-label">Цена, ₽</label>
              <input className="inp" type="text" required placeholder="4 500 000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ height: '56px', borderRadius: '16px' }}>
            Опубликовать
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '40px' }}>
          <div style={{ color: '#00c853', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            <CheckCircle2 size={64} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '8px' }}>Объявление создано!</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Сейчас вы будете перенаправлены на маркет...</p>
        </div>
      )}
    </main>
  )
}