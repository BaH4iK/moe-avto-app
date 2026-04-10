'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Car, Plus, Loader2, ChevronRight, 
  Check, Camera, Info, MapPin, AlertCircle
} from 'lucide-react'

export default function CreatePostPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [step, setStep] = useState(1) 
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [userPhotos, setUserPhotos] = useState<any[]>([])
  const [garageProfile, setGarageProfile] = useState<any>(null) // НОВОЕ: Стейт для хранения профиля
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    engine: '',
    transmission: '',
    mileage: '',
    price: '',
    description: '',
    main_photo: '',
    city: ''
  })

  // Валидация: проверяем заполнение критичных полей
  const isFormValid = 
    formData.brand.trim() !== '' && 
    formData.model.trim() !== '' && 
    formData.price.trim() !== '' && 
    formData.city.trim() !== '' &&
    formData.main_photo !== '';

  useEffect(() => {
    async function initData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: photos } = await supabase.from('car_photos').select('*').eq('user_id', user.id)
        if (photos) setUserPhotos(photos)
        
        // ИСПРАВЛЕНО: Получаем весь профиль, чтобы вывести марку и модель авто
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (profile) {
          setGarageProfile(profile)
          if (profile.city) setFormData(prev => ({ ...prev, city: profile.city }))
        }
      }
      setLoading(false)
    }
    initData()
  }, [supabase])

  const selectFromGarage = () => {
    // ИСПРАВЛЕНО: Берем данные сразу из загруженного профиля
    if (garageProfile) {
      setFormData({
        ...formData,
        brand: garageProfile.car_brand || '',
        model: garageProfile.car_model || '',
        year: garageProfile.car_year?.toString() || '',
        mileage: garageProfile.car_mileage?.toString() || '',
        city: garageProfile.city || formData.city
      })
    }
    setStep(2)
  }

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setPublishing(true)
    const file = e.target.files[0]
    const { data: { user } } = await supabase.auth.getUser()
    const filePath = `${user?.id}/market_${Date.now()}.${file.name.split('.').pop()}`

    const { error: uploadError } = await supabase.storage.from('car-photos').upload(filePath, file)
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('car-photos').getPublicUrl(filePath)
      setFormData({ ...formData, main_photo: publicUrl })
    }
    setPublishing(false)
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setPublishing(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('posts').insert({
      user_id: user?.id,
      title: `${formData.brand} ${formData.model}`,
      price: parseFloat(formData.price),
      description: formData.description,
      city: formData.city,
      main_photo: formData.main_photo
    })

    if (!error) {
      router.push('/market')
      router.refresh()
    } else {
      alert('Ошибка: ' + error.message)
      setPublishing(false)
    }
  }

  if (loading) return (
    <div className="page active" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
      <Loader2 className="animate-spin" size={32} color="var(--primary)" />
    </div>
  )

  return (
    <main className="page active" style={{ paddingBottom: '100px' }}>
      <div className="pg-head" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => step === 1 ? router.back() : setStep(1)} className="icon-btn">
          <ArrowLeft size={20}/>
        </button>
        <h1 className="pg-title" style={{marginBottom:0}}>{step === 1 ? 'Новое объявление' : 'Детали авто'}</h1>
      </div>

      {step === 1 ? (
        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" onClick={selectFromGarage} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', cursor: 'pointer' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary-hl)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Car size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Авто из гаража</h3>
              {/* ИСПРАВЛЕНО: Динамический вывод марки и модели из профиля */}
              <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                {garageProfile?.car_brand || garageProfile?.car_model 
                  ? `Ваш ${garageProfile.car_brand || ''} ${garageProfile.car_model || ''}`.trim()
                  : 'Автомобиль не указан'}
              </p>
            </div>
            <ChevronRight size={20} className="c-muted" />
          </div>

          <div className="card" onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', cursor: 'pointer' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--surface2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Другая машина</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Ввести данные вручную</p>
            </div>
            <ChevronRight size={20} className="c-muted" />
          </div>
        </div>
      ) : (
        <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
          
          {/* ФОТО С ИНДИКАТОРОМ */}
          <div className="card">
            <div className="card-h">
              <span className="card-t">Главное фото <span style={{color:'#ff4b4b'}}>*</span></span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px' }}>
              <label style={{ aspectRatio: '1/1', borderRadius: '16px', border: '2px dashed var(--divider)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--bg)' }}>
                <Camera size={24} className={formData.main_photo ? 'c-muted' : 'c-primary'} />
                <span style={{fontSize: '11px', marginTop: '4px'}}>Загрузить</span>
                <input type="file" hidden accept="image/*" onChange={handleUploadPhoto} />
              </label>
              {userPhotos.map(photo => (
                <div key={photo.id} onClick={() => setFormData({...formData, main_photo: photo.photo_url})}
                  style={{ aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: formData.main_photo === photo.photo_url ? '3px solid var(--primary)' : '1px solid var(--divider)', cursor: 'pointer' }}>
                  <img src={photo.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {formData.main_photo === photo.photo_url && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,107,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={20} color="white" style={{background:'var(--primary)', borderRadius:'50%', padding:'2px'}}/></div>}
                </div>
              ))}
            </div>
            {!formData.main_photo && <div style={{fontSize: '11px', color: '#ff4b4b', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px'}}><AlertCircle size={12}/> Выберите фото из гаража или загрузите новое</div>}
          </div>

          {/* ПОЛЯ ВВОДА */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="frow">
               <div className="ffield">
                  <label className="inp-label">Марка <span style={{color:'#ff4b4b'}}>*</span></label>
                  <input className="inp" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="Geely" required />
               </div>
               <div className="ffield">
                  <label className="inp-label">Модель <span style={{color:'#ff4b4b'}}>*</span></label>
                  <input className="inp" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="Monjaro" required />
               </div>
            </div>
            
            <div className="frow">
               <div className="ffield">
                  <label className="inp-label">Год</label>
                  <input className="inp" type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="2023" />
               </div>
               <div className="ffield">
                  <label className="inp-label">Пробег</label>
                  <input className="inp" type="number" value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} placeholder="15000" />
               </div>
            </div>

            <div className="frow">
               <div className="ffield">
                  <label className="inp-label">Цена (₽) <span style={{color:'#ff4b4b'}}>*</span></label>
                  <input className="inp" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="4200000" required />
               </div>
               <div className="ffield">
                  <label className="inp-label">Город <span style={{color:'#ff4b4b'}}>*</span></label>
                  <div style={{position: 'relative'}}>
                    <input className="inp" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Севастополь" required />
                    <MapPin size={16} style={{position:'absolute', right:12, top:14, color:'var(--muted)'}}/>
                  </div>
               </div>
            </div>

            <div className="ffield">
              <label className="inp-label" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <Info size={14} className="c-primary" /> Описание
              </label>
              <textarea 
                className="inp" 
                style={{ minHeight: '120px', paddingTop: '12px', borderRadius: '16px', resize: 'none' }} 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Расскажите об истории обслуживания, комплектации..."
              />
            </div>
          </div>

          <div style={{padding: '0 10px'}}>
            <button 
              className="btn btn-primary btn-full" 
              type="submit" 
              disabled={publishing || !isFormValid} 
              style={{ 
                height: '58px', 
                fontSize: '16px', 
                fontWeight: 800,
                opacity: isFormValid ? 1 : 0.5,
                boxShadow: isFormValid ? '0 6px 20px var(--primary-hl)' : 'none'
              }}
            >
              {publishing ? <Loader2 className="animate-spin" /> : 'Опубликовать'}
            </button>
            {!isFormValid && <p style={{textAlign: 'center', fontSize: '11px', color: 'var(--muted)', marginTop: '12px'}}>Заполните обязательные поля со звездочкой и добавьте фото</p>}
          </div>
        </form>
      )}
    </main>
  )
}