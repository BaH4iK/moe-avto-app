'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  MapPin, Bell, LogOut, Camera, ChevronRight, Save, Loader2, X, Search, 
  Car, UserCircle2, PlusCircle, Trash2, CheckCircle2, ShieldAlert, Wrench,
  ArrowLeft, Plus, User
} from 'lucide-react'

const ALL_CITIES = [
  "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань", 
  "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону",
  "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград", "Краснодар", 
  "Тюмень", "Саратов", "Тольятти", "Ижевск", "Барнаул", "Ульяновск", 
  "Иркутск", "Хабаровск", "Махачкала", "Владивосток", "Ярославль", 
  "Оренбург", "Томск", "Кемерово", "Рязань", "Набережные Челны", 
  "Астрахань", "Киров", "Пенза", "Севастополь", "Липецк", "Чебоксары", 
  "Балашиха", "Калининград", "Тула", "Курск", "Ставрополь", "Сочи", 
  "Улан-Удэ", "Тверь", "Магнитогорск", "Иваново", "Брянск", "Белгород",
  "Сургут", "Владимир", "Чита", "Архангельск", "Нижний Тагил", "Смоленск",
  "Калуга", "Якутск", "Саранск", "Череповец", "Курган", "Вологда",
  "Орел", "Подольск", "Грозный", "Мурманск", "Тамбов", "Стерлитамак",
  "Петрозаводск", "Кострома", "Нижневартовск", "Новороссийск", "Йошкар-Ола",
  "Таганрог", "Симферополь", "Керчь", "Евпатория", "Ялта", "Феодосия"
].sort((a, b) => {
  const top10 = ["Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань", "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону"];
  if (top10.includes(a) && !top10.includes(b)) return -1;
  if (!top10.includes(a) && top10.includes(b)) return 1;
  return a.localeCompare(b);
});

export default function ProfileClient() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showCityPicker, setShowCityPicker] = useState(false)
  const [searchCity, setSearchCity] = useState('')
  const [user, setUser] = useState<any>(null)
  const [carPhotos, setCarPhotos] = useState<any[]>([])

  const [userData, setUserData] = useState<{
    name: string;
    city: string;
    avatarUrl: string | null;
    insurance_expiry?: string;
    service_interval?: number;
    car: {
      brand: string;
      model: string;
      year: string;
      mileage: string;
      engine_volume: string;
      vin_code: string;
    }
  }>({
    name: '',
    city: '',
    avatarUrl: null,
    insurance_expiry: '',
    service_interval: 10000,
    car: { brand: '', model: '', year: '', mileage: '', engine_volume: '', vin_code: '' }
  })

  const loadProfileData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      
      const [profileRes, photosRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('car_photos').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
      ])
      
      if (profileRes.data) {
        setUserData({
          name: profileRes.data.full_name || '',
          city: profileRes.data.city || 'Севастополь',
          avatarUrl: profileRes.data.avatar_url || null,
          insurance_expiry: profileRes.data.insurance_expiry || '',
          service_interval: profileRes.data.service_interval || 10000,
          car: {
            brand: profileRes.data.car_brand || '',
            model: profileRes.data.car_model || '',
            year: profileRes.data.car_year?.toString() || '',
            mileage: profileRes.data.car_mileage?.toString() || '',
            engine_volume: profileRes.data.engine_volume?.toString() || '',
            vin_code: profileRes.data.vin_code || ''
          }
        })
      }
      
      if (photosRes.data) {
        setCarPhotos(photosRes.data)
      }
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadProfileData()
  }, [loadProfileData])

  const handleSaveAll = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: userData.name || null,
      city: userData.city || null,
      insurance_expiry: userData.insurance_expiry || null,
      service_interval: userData.service_interval,
      car_brand: userData.car.brand || null,
      car_model: userData.car.model || null,
      car_year: parseInt(userData.car.year) || null,
      engine_volume: userData.car.engine_volume ? parseFloat(userData.car.engine_volume.toString().replace(',', '.')) : null,
      car_mileage: parseInt(userData.car.mileage) || 0,
      vin_code: userData.car.vin_code || null,
      updated_at: new Date().toISOString()
    })
    
    if (error) {
      alert('Ошибка при сохранении: ' + error.message)
    } else {
      // Можно показать красивое уведомление, пока просто снимаем лоадинг
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    setUploadingPhoto(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
    if (uploadError) {
      alert('Ошибка загрузки: ' + uploadError.message);
      setUploadingPhoto(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', user.id);

    if (updateError) alert('Ошибка обновления: ' + updateError.message);
    else setUserData(prev => ({ ...prev, avatarUrl: publicUrl }));
    
    setUploadingPhoto(false);
  }

  const handleCarPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    setUploadingPhoto(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('car-photos').upload(filePath, file);
    if (uploadError) {
      alert('Ошибка загрузки: ' + uploadError.message);
      setUploadingPhoto(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('car-photos').getPublicUrl(filePath);
    const { error: insertError } = await supabase.from('car_photos').insert({ user_id: user.id, photo_url: publicUrl });

    if (insertError) alert('Ошибка сохранения: ' + insertError.message);
    else setCarPhotos(prev => [...prev, { id: Date.now().toString(), photo_url: publicUrl, created_at: new Date().toISOString() }]);
    
    setUploadingPhoto(false);
  }

  const deleteCarPhoto = async (photoId: string, photoUrl: string) => {
    setLoading(true);
    await supabase.from('car_photos').delete().eq('id', photoId);
    setCarPhotos(prev => prev.filter(p => p.id !== photoId));
    setLoading(false);
  }

  const filteredCities = useMemo(() => {
    return ALL_CITIES.filter(c => c.toLowerCase().includes(searchCity.toLowerCase()))
  }, [searchCity])

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    window.location.replace('/auth')
  }

  if (loading && !saving) return <main className="page active" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><Loader2 className="animate-spin" size={32} color="var(--primary)"/></main>

  return (
    <main className="page active" style={{ paddingBottom: '120px', paddingTop: 'var(--s4)' }}>
      
      {/* МОДАЛКА ВЫБОРА ГОРОДА */}
      {showCityPicker && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
          <div className="page active" style={{ background: 'var(--bg)', marginTop: '40px', borderRadius: '24px 24px 0 0', flex: 1, display:'flex', flexDirection:'column' }}>
            <div className="pg-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="pg-title">Ваш город</h2>
              <button onClick={() => setShowCityPicker(false)} className="icon-btn"><X /></button>
            </div>
            <div style={{ padding: '0 var(--s6) var(--s4)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--muted)' }} />
                <input className="inp" style={{ paddingLeft: '44px' }} placeholder="Найти город..." value={searchCity} onChange={(e) => setSearchCity(e.target.value)} autoFocus />
              </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 var(--s6) 40px' }}>
              {filteredCities.map(city => (
                <div key={city} onClick={() => {
                    const updated = { ...userData, city };
                    setUserData(updated); 
                    setShowCityPicker(false); 
                    setSearchCity('');
                  }}
                  style={{ padding: '18px 0', borderBottom: '1px solid var(--divider)', color: userData.city === city ? 'var(--primary)' : 'var(--text)', display:'flex', justifyContent:'space-between', cursor: 'pointer' }}>
                  {city}
                  {userData.city === city && <CheckCircle2 size={18} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ШАПКА: Назад и Выход */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s6)' }}>
        <button onClick={() => router.back()} className="icon-btn" style={{ background: 'var(--surface)', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </button>
        <button onClick={handleLogout} className="icon-btn" style={{ background: 'var(--surface)', borderRadius: '50%', color: 'var(--red)' }}>
          <LogOut size={20} />
        </button>
      </div>

      {/* АВАТАР */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--s8)' }}>
        <label htmlFor="ava-upload" style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--surface2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--surface)' }}>
            {userData.avatarUrl ? (
              <img src={userData.avatarUrl} alt="Аватар" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <UserCircle2 size={50} color="var(--muted)" />
            )}
          </div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '6px', border: '3px solid var(--bg)', display: 'flex' }}>
            <Plus size={16} strokeWidth={3} />
          </div>
          <input id="ava-upload" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={uploadingPhoto} />
        </label>
        {uploadingPhoto && <div style={{ fontSize: '10px', color: 'var(--primary)', marginTop: '4px' }}><Loader2 className="animate-spin" size={10} style={{ display: 'inline' }}/> Обновление...</div>}
        <h2 style={{ marginTop: 'var(--s3)', fontSize: '22px', fontWeight: 800 }}>{userData.name || 'Имя не указано'}</h2>
      </div>

      {/* ЛИЧНЫЕ ДАННЫЕ */}
      <div style={{ marginBottom: 'var(--s6)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--s3)', color: 'var(--muted)' }}>
          <User size={16} /> Личные данные
        </h3>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input className="inp" placeholder="Ввод имени" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }} onClick={() => setShowCityPicker(true)}>
            <input className="inp" placeholder="Ввод города" value={userData.city} readOnly style={{ pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* МОЙ АВТОМОБИЛЬ */}
      <div style={{ marginBottom: 'var(--s6)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--s3)', color: 'var(--muted)' }}>
          <Car size={16} /> Мой автомобиль
        </h3>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <div className="frow" style={{ gap: '10px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input className="inp" style={{ width: '100%', boxSizing: 'border-box' }} value={userData.car.brand} onChange={e => setUserData({...userData, car: {...userData.car, brand: e.target.value}})} placeholder="Марка" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input className="inp" style={{ width: '100%', boxSizing: 'border-box' }} value={userData.car.model} onChange={e => setUserData({...userData, car: {...userData.car, model: e.target.value}})} placeholder="Модель" />
            </div>
          </div>

          <div className="frow" style={{ gap: '10px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input className="inp" type="number" style={{ width: '100%', boxSizing: 'border-box', padding: '0 12px' }} value={userData.car.year} onChange={e => setUserData({...userData, car: {...userData.car, year: e.target.value}})} placeholder="Год" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input className="inp" type="text" style={{ width: '100%', boxSizing: 'border-box', padding: '0 12px' }} value={userData.car.engine_volume} onChange={e => setUserData({...userData, car: {...userData.car, engine_volume: e.target.value}})} placeholder="Объем" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input className="inp" type="number" style={{ width: '100%', boxSizing: 'border-box', padding: '0 12px' }} value={userData.car.mileage} onChange={e => setUserData({...userData, car: {...userData.car, mileage: e.target.value}})} placeholder="Пробег" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input className="inp" type="text" style={{ width: '100%', boxSizing: 'border-box', textTransform: 'uppercase' }} value={userData.car.vin_code} onChange={e => setUserData({...userData, car: {...userData.car, vin_code: e.target.value.toUpperCase()}})} placeholder="VIN" />
          </div>

        </div>
      </div>

      {/* СТРАХОВАНИЕ ОСАГО */}
      <div style={{ marginBottom: 'var(--s6)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--s3)', color: 'var(--muted)' }}>
          <ShieldAlert size={16} /> Страхование ОСАГО
        </h3>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
            <label className="inp-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Дата окончания полиса</label>
            <input 
              className="inp" 
              type="date" 
              value={userData.insurance_expiry} 
              onChange={e => setUserData({ ...userData, insurance_expiry: e.target.value })} 
              style={{ width: '100%', boxSizing: 'border-box', margin: 0, WebkitAppearance: 'none', backgroundClip: 'padding-box' }}
            />
          </div>
        </div>
      </div>

      {/* ОБСЛУЖИВАНИЕ ТО */}
      <div style={{ marginBottom: 'var(--s6)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--s3)', color: 'var(--muted)' }}>
          <Wrench size={16} /> Обслуживание (ТО)
        </h3>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
            <label className="inp-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Периодичность (интервал)</label>
            <select 
              className="inp" 
              value={userData.service_interval}
              onChange={e => setUserData({ ...userData, service_interval: Number(e.target.value) })}
              style={{ width: '100%', boxSizing: 'border-box', margin: 0, WebkitAppearance: 'none', backgroundClip: 'padding-box' }}
            >
              {[5000, 6000, 7000, 8000, 9000, 10000, 12000, 15000].map(val => (
                <option key={val} value={val}>Каждые {val.toLocaleString()} км</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ГЛАВНАЯ КНОПКА СОХРАНЕНИЯ */}
      <button 
        className="btn btn-primary btn-full" 
        onClick={handleSaveAll} 
        disabled={saving}
        style={{ height: '60px', fontSize: '16px', borderRadius: '16px', fontWeight: 800, marginBottom: 'var(--s6)' }}
      >
        {saving ? <Loader2 className="animate-spin" /> : 'Сохранить изменения'}
      </button>

      {/* ГАЛЕРЕЯ (Оставил в самом низу) */}
      <div className="card" style={{marginTop:'var(--s4)'}}>
        <div className="card-h">
          <span className="card-t">Галерея авто</span>
          <span className="pg-sub">{carPhotos.length} / 10</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: 'var(--s2)' }}>
          {carPhotos.map(photo => (
            <div key={photo.id} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--divider)' }}>
              <img src={photo.photo_url} alt="Машина" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => deleteCarPhoto(photo.id, photo.photo_url)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: 'var(--red)', padding: '4px', cursor: 'pointer' }}>
                <Trash2 size={12}/>
              </button>
            </div>
          ))}
          {carPhotos.length < 10 && (
            <label htmlFor="car-photo-upload" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '1/1', borderRadius: '12px', border: '1px dashed var(--divider)', color: 'var(--primary)', cursor: 'pointer' }}>
              {uploadingPhoto ? <Loader2 className="animate-spin"/> : <PlusCircle size={24}/>}
              <input id="car-photo-upload" type="file" accept="image/*" onChange={handleCarPhotoUpload} style={{display:'none'}} disabled={uploadingPhoto} />
            </label>
          )}
        </div>
      </div>

    </main>
  )
}