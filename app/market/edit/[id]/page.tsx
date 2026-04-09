'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, Camera } from 'lucide-react'

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{show: boolean, msg: string, type: 'success' | 'error'}>({ show: false, msg: '', type: 'success' })
  
  const [form, setForm] = useState({
    title: '',
    price: '',
    city: '',
    description: '',
    main_photo: '',
    year: '',
    engine: '',
    mileage: '',
    transmission: 'АКПП'
  })

  const showMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000)
  }

  const loadPost = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: post, error } = await supabase.from('posts').select('*').eq('id', id).single()
    
    if (error || !post) {
      showMsg('Объявление не найдено', 'error')
      setLoading(false)
      return
    }

    if (post.user_id !== user?.id) {
      router.push(`/market/${id}`)
      return
    }

    // Загружаем данные из базы в форму
    setForm({
      title: post.title || '',
      price: post.price?.toString() || '',
      city: post.city || '',
      description: post.description || '',
      main_photo: post.main_photo || '',
      year: post.year?.toString() || '',
      engine: post.engine || '',
      mileage: post.mileage?.toString() || '',
      transmission: post.transmission || 'АКПП'
    })
    setLoading(false)
  }, [id, supabase, router])

  useEffect(() => { loadPost() }, [loadPost])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Формируем объект для отправки, строго соблюдая названия колонок из твоего скриншота
    const updateData = {
      title: form.title,
      price: parseInt(form.price) || 0,
      city: form.city,
      description: form.description,
      main_photo: form.main_photo,
      year: form.year ? parseInt(form.year) : null,
      engine: form.engine || null,
      mileage: form.mileage ? parseInt(form.mileage) : null,
      transmission: form.transmission
    }

    console.log("Отправляем в базу:", updateData) // Для отладки в консоли

    const { error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)

    if (!error) {
      showMsg('Изменения сохранены')
      setTimeout(() => router.push(`/market/${id}`), 1000)
    } else {
      console.error("Ошибка Supabase:", error.message)
      showMsg('Ошибка сохранения: ' + error.message, 'error')
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <main className="page active" style={{ background: 'var(--bg)', paddingTop: '64px', paddingBottom: '120px', minHeight: '100vh', overflowY: 'auto' }}>
      
      {toast.show && (
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'var(--surface)', padding: '12px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--divider)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} color="#00c853"/> : <AlertCircle size={18} color="#ff3b30"/>}
          <span style={{ fontSize: '14px', fontWeight: 700 }}>{toast.msg}</span>
        </div>
      )}

      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button type="button" onClick={() => router.back()} className="icon-btn" style={{ background: 'var(--surface2)' }}><ArrowLeft size={22}/></button>
        <h1 style={{ fontSize: '22px', fontWeight: 900 }}>Редактирование</h1>
      </div>

      <form onSubmit={handleSave} style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--divider)' }}>
          <img src={form.main_photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Camera color="white" size={32}/></div>
        </div>

        <section>
          <p style={{ fontSize: '11px', fontWeight: 900, color: 'var(--muted)', marginBottom: '12px', letterSpacing: '1px' }}>ТЕХНИЧЕСКИЕ ДАННЫЕ</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input className="inp" placeholder="Марка и Модель" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <input className="inp" type="number" placeholder="Год выпуска" value={form.year} onChange={e => setForm({...form, year: e.target.value})} required />
              </div>
              <div style={{ flex: 1 }}>
                <input className="inp" placeholder="Объем двигателя" value={form.engine} onChange={e => setForm({...form, engine: e.target.value})} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <input className="inp" type="number" placeholder="Пробег (км)" value={form.mileage} onChange={e => setForm({...form, mileage: e.target.value})} required />
              </div>
              <div style={{ flex: 1 }}>
                <select className="inp" value={form.transmission} onChange={e => setForm({...form, transmission: e.target.value})} style={{ appearance: 'none', background: 'var(--surface)' }}>
                  <option value="АКПП">АКПП</option>
                  <option value="МКПП">МКПП</option>
                  <option value="Робот">Робот</option>
                  <option value="Вариатор">Вариатор</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section>
          <p style={{ fontSize: '11px', fontWeight: 900, color: 'var(--muted)', marginBottom: '12px', letterSpacing: '1px' }}>ЦЕНА И ЛОКАЦИЯ</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input className="inp" type="number" placeholder="Цена (₽)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required style={{ flex: 1.5 }} />
            <input className="inp" placeholder="Город" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required style={{ flex: 1 }} />
          </div>
        </section>

        <section>
          <p style={{ fontSize: '11px', fontWeight: 900, color: 'var(--muted)', marginBottom: '12px', letterSpacing: '1px' }}>ОПИСАНИЕ</p>
          <textarea className="inp" style={{ height: '140px', padding: '16px', borderRadius: '20px', lineHeight: 1.5 }} placeholder="Расскажите подробности..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
        </section>

        <button type="submit" disabled={saving} className="btn-primary" style={{ height: '58px', borderRadius: '20px', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 8px 25px rgba(255, 107, 0, 0.3)' }}>
          {saving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
          {saving ? 'СОХРАНЕНИЕ...' : 'ОПУБЛИКОВАТЬ ИЗМЕНЕНИЯ'}
        </button>

      </form>
    </main>
  )
}