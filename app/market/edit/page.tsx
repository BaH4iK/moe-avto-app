'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, Camera } from 'lucide-react'

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params), supabase = createClient(), router = useRouter()
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{show: boolean, msg: string, type: 'success' | 'error'}>({ show: false, msg: '', type: 'success' })
  
  const [form, setForm] = useState({
    title: '',
    price: '',
    city: '',
    description: '',
    main_photo: ''
  })

  const showMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000)
  }

  const loadPost = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: post } = await supabase.from('posts').select('*').eq('id', id).single()
    
    if (post) {
      if (post.user_id !== user?.id) {
        router.push(`/market/${id}`)
        return
      }
      setForm({
        title: post.title,
        price: post.price.toString(),
        city: post.city,
        description: post.description,
        main_photo: post.main_photo
      })
    }
    setLoading(false)
  }, [id, supabase, router])

  useEffect(() => { loadPost() }, [loadPost])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('posts').update({
      title: form.title,
      price: parseInt(form.price),
      city: form.city,
      description: form.description,
      main_photo: form.main_photo
    }).eq('id', id)

    if (!error) {
      showMsg('Объявление обновлено')
      setTimeout(() => router.push(`/market/${id}`), 1000)
    } else {
      showMsg('Ошибка при сохранении', 'error')
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <main className="page active" style={{ background: 'var(--bg)', paddingTop: '64px', paddingBottom: '100px' }}>
      
      {/* TOAST */}
      {toast.show && (
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'var(--surface)', padding: '12px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--divider)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)' }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} color="#00c853"/> : <AlertCircle size={18} color="#ff3b30"/>}
          <span style={{ fontSize: '14px', fontWeight: 700 }}>{toast.msg}</span>
        </div>
      )}

      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => router.back()} className="icon-btn"><ArrowLeft size={22}/></button>
        <h1 style={{ fontSize: '20px', fontWeight: 900 }}>Редактирование</h1>
      </div>

      <form onSubmit={handleSave} style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '24px', overflow: 'hidden', border: '2px dashed var(--divider)' }}>
          <img src={form.main_photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera color="white" size={32}/>
          </div>
        </div>

        <div className="input-group">
          <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--muted)', marginLeft: '12px', marginBottom: '6px', display: 'block' }}>Название объявления</label>
          <input className="inp" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--muted)', marginLeft: '12px', marginBottom: '6px', display: 'block' }}>Цена (₽)</label>
            <input className="inp" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--muted)', marginLeft: '12px', marginBottom: '6px', display: 'block' }}>Город</label>
            <input className="inp" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--muted)', marginLeft: '12px', marginBottom: '6px', display: 'block' }}>Описание</label>
          <textarea className="inp" style={{ height: '150px', padding: '16px', borderRadius: '20px', resize: 'none' }} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
        </div>

        <button type="submit" disabled={saving} className="btn-primary" style={{ height: '56px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '16px', fontWeight: 900 }}>
          {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {saving ? 'Сохраняем...' : 'Сохранить изменения'}
        </button>
      </form>
    </main>
  )
}