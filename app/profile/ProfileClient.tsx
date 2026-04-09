'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  MapPin, Bell, LogOut, Camera, ChevronRight, Save, Loader2, X, Search, 
  Car, UserCircle2, PlusCircle, Trash2, CheckCircle2 
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
  "Сургут", "Владимир", "Чита", "Архангельск", "Нижний Тагил", "Smolensk",
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
  const [isEditingCar, setIsEditingCar] = useState(false)
  const [showCityPicker, setShowCityPicker] = useState(false)
  const [searchCity, setSearchCity] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [carPhotos, setCarPhotos] = useState<any[]>([])

  const [userData, setUserData] = useState<{
    name: string;
    city: string;
    avatarUrl: string | null;
    car: {
      brand: string;
      model: string;
      year: string;
      mileage: string;
      engine_volume: string;
      vin_code: string; // ДОБАВЛЕНО ПОЛЕ VIN
    }
  }>({
    name: 'Водитель',
    city: 'Не указан',
    avatarUrl: null,
    car: { 
      brand: '—', 
      model: '—', 
      year: '—', 
      mileage: '0',
      engine_volume: '',
      vin_code: ''
    }
  })

  const loadProfileData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        setUserData({
          name: profile.full_name || 'Водитель',
          city: profile.city || 'Севастополь',
          avatarUrl: profile.avatar_url || null,
          car: {
            brand: profile.car_brand || '—',
            model: profile.car_model || '—',
            year: profile.car_year || '—',
            mileage: profile.car_mileage?.toString() || '0',
            engine_volume: profile.engine_volume?.toString() || '',
            vin_code: profile.vin_code || '' // ЗАГРУЗКА ИЗ БД
          }
        })
      }
      const { data: photos } = await supabase.from('car_photos').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
      if (photos) setCarPhotos(photos)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadProfileData()
  }, [loadProfileData])

  const updateProfile = async (newData: any) => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      city: newData.city,
      car_brand: newData.car.brand,
      car_model: newData.car.model,
      car_year: parseInt(newData.car.year) || null,
      engine_volume: newData.car.engine_volume ? parseFloat(newData.car.engine_volume.toString().replace(',', '.')) : null,
      car_mileage: parseInt(newData.car.mileage) || 0,
      vin_code: newData.car.vin_code || null, // СОХРАНЕНИЕ В БД
      updated_at: new Date().toISOString()
    })
    if (error) alert('Ошибка: ' + error.message)
    setSaving(false)
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
    else setCarPhotos(prev => [...prev, { photo_url: publicUrl, created_at: new Date().toISOString() }]);
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

  if (loading && !saving) return <main className="page active" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>Загрузка...</main>

  return (
    <main className="page active" style={{ paddingBottom: '100px' }}>
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
                    setUserData(updated); updateProfile(updated);
                    setShowCityPicker(false); setSearchCity('');
                  }}
                  style={{ padding: '18px 0', borderBottom: '1px solid var(--divider)', color: userData.city === city ? 'var(--primary)' : 'var(--text)', display:'flex', justifyContent:'space-between' }}>
                  {city}
                  {userData.city === city && <CheckCircle2 size={18} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="pg-head">
        <h1 className="pg-title">Профиль</h1>
        {uploadingPhoto && <span style={{fontSize:'10px', color:'var(--primary)'}}><Loader2 className="animate-spin" size={10}/> Обновление...</span>}
      </div>

      <div className="profile-ava-wrap" style={{textAlign:'center', marginBottom:'var(--s6)'}}>
        <label htmlFor="ava-upload" className="profile-ava" style={{width:90, height:90, background:'var(--surface2)', color:'var(--muted)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', fontSize:'32px', fontWeight:800, position:'relative', cursor: 'pointer', overflow:'hidden'}}>
          {userData.avatarUrl ? (
            <img src={userData.avatarUrl} alt="Аватар" style={{width:'100%', height:'100%', objectFit: 'cover'}} />
          ) : (
            <UserCircle2 size={40}/>
          )}
          <div className="ava-edit" style={{position:'absolute', bottom:0, right:0, background:'var(--primary)', color:'white', borderRadius:'50%', padding:'6px', border:'2px solid var(--bg)'}}><Camera size={14}/></div>
          <input id="ava-upload" type="file" accept="image/*" onChange={handleAvatarUpload} style={{display:'none'}} disabled={uploadingPhoto} />
        </label>
        
        <h2 style={{marginTop:'var(--s3)', fontSize:'20px'}}>{userData.name}</h2>
        <p className="pg-sub">ID: {user?.id.slice(0,8)}</p>
      </div>

      <div className="card">
        <div className="card-h">
          <span className="card-t">Мой автомобиль</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setIsEditingCar(!isEditingCar)}>{isEditingCar ? 'Отмена' : 'Изменить'}</button>
        </div>
        {isEditingCar ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
            <div className="frow" style={{ gap: '10px' }}>
              <div className="ffield" style={{flex: 1}}><label className="inp-label">Марка</label><input className="inp" value={userData.car.brand} onChange={e => setUserData({...userData, car: {...userData.car, brand: e.target.value}})} /></div>
              <div className="ffield" style={{flex: 1}}><label className="inp-label">Модель</label><input className="inp" value={userData.car.model} onChange={e => setUserData({...userData, car: {...userData.car, model: e.target.value}})} /></div>
            </div>
            <div className="frow" style={{ gap: '10px' }}>
              <div className="ffield" style={{flex: 1}}>
                <label className="inp-label">Объем двигателя</label>
                <input className="inp" type="text" placeholder="Напр. 2.0" value={userData.car.engine_volume} onChange={e => setUserData({...userData, car: {...userData.car, engine_volume: e.target.value}})} />
              </div>
            </div>
            {/* НОВОЕ ПОЛЕ ДЛЯ VIN КОДА */}
            <div className="ffield">
              <label className="inp-label">VIN-код</label>
              <input className="inp" type="text" placeholder="XTA..." value={userData.car.vin_code} onChange={e => setUserData({...userData, car: {...userData.car, vin_code: e.target.value.toUpperCase()}})} style={{ textTransform: 'uppercase' }} />
            </div>
            <button className="btn btn-primary btn-full" onClick={() => { setIsEditingCar(false); updateProfile(userData); }} disabled={saving}>Сохранить</button>
          </div>
        ) : (
          <div className="car-mini active" style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <div className="rem-ico o" style={{background:'var(--primary-hl)', color:'var(--primary)'}}><Car size={20} /></div>
            <div style={{flex:1}}>
              <h4>{userData.car.brand} {userData.car.model} {userData.car.engine_volume ? `(${userData.car.engine_volume}л)` : ''}</h4>
              <p className="pg-sub">{userData.car.year} г.в. · {userData.car.mileage} км</p>
              {/* ОТОБРАЖЕНИЕ VIN КОДА */}
              {userData.car.vin_code && <p style={{ fontSize: '10px', color: 'var(--primary)', marginTop: '4px', letterSpacing: '0.05em', fontWeight: 600 }}>VIN: {userData.car.vin_code}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{marginTop:'var(--s4)'}}>
        <div className="card-h">
          <span className="card-t">Галерея</span>
          <span className="pg-sub">{carPhotos.length} / 10</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: 'var(--s2)' }}>
          {carPhotos.map(photo => (
            <div key={photo.id} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--divider)' }}>
              <img src={photo.photo_url} alt="Машина" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => deleteCarPhoto(photo.id, photo.photo_url)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: 'var(--red)', padding: '4px' }}>
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

      <div className="card" style={{marginTop:'var(--s4)'}}>
        <div className="card-h"><span className="card-t">Настройки</span></div>
        <div className="tog-row" onClick={() => setShowCityPicker(true)} style={{ cursor: 'pointer', padding:'12px 0', borderBottom:'1px solid var(--divider)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
            <MapPin size={18} className="c-muted" />
            <div className="tog-info">
              <h4>Ваш город</h4>
              <p style={{color:'var(--primary)'}}>{userData.city}</p>
            </div>
          </div>
          <ChevronRight size={18} className="c-muted" />
        </div>
      </div>

      <button className="btn btn-outline btn-full" onClick={handleLogout} style={{ color: 'var(--red)', borderColor: 'rgba(255,75,75,0.2)', height: '54px', marginTop: 'var(--s6)' }}>
        <LogOut size={18} /> Выйти
      </button>
    </main>
  )
}