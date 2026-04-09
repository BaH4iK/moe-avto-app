'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, MessageCircle, Send, ShieldCheck, Trash2, Clock, Loader2, Share2, Pencil, AlertCircle, CheckCircle2, Gauge, Calendar, Zap, Settings2 } from 'lucide-react'

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params), supabase = createClient(), router = useRouter()
  const [data, setData] = useState<{post: any, author: any, comments: any[]}>({post: null, author: null, comments: []})
  const [loading, setLoading] = useState(true), [newComment, setNewComment] = useState(''), [user, setUser] = useState<any>(null), [sending, setSending] = useState(false)
  
  const [toast, setToast] = useState<{show: boolean, msg: string, type: 'success' | 'error'}>({ show: false, msg: '', type: 'success' })
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const showMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type }); setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000)
  }

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser(); setUser(user)
    
    const { data: post } = await supabase
      .from('posts')
      .select('id, title, price, description, main_photo, city, created_at, user_id, year, engine, mileage, transmission')
      .eq('id', id)
      .maybeSingle()

    if (!post) return setLoading(false)
    
    const [{ data: author }, { data: comments }] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', post.user_id).single(),
      supabase.from('comments').select('*').eq('post_id', id).order('created_at', { ascending: true })
    ])
    
    setData({ post, author, comments: comments || [] }); setLoading(false)
  }, [id, supabase])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    setIsDeleting(true)
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (!error) {
      showMsg('Объявление удалено')
      setTimeout(() => router.push('/market'), 1000)
    } else {
      showMsg('Ошибка удаления', 'error')
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  const send = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newComment.trim() || sending) return; setSending(true)
    const { error } = await supabase.from('comments').insert({ 
      post_id: id, user_id: user?.id, 
      user_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Водитель', 
      content: newComment.trim() 
    })
    if (!error) { setNewComment(''); load(); showMsg('Комментарий отправлен') } else { showMsg('Ошибка', 'error') }
    setSending(false)
  }

  if (loading) return null
  const isOwner = user?.id === data.post?.user_id

  return (
    <main className="page active" style={{ padding: 0, background: 'var(--bg)', paddingBottom: '160px', paddingTop: '64px', minHeight: '100vh', overflowY: 'auto' }}>
      
      {/* TOAST */}
      {toast.show && (
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1200, background: 'var(--surface)', padding: '12px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--divider)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} color="#00c853"/> : <AlertCircle size={18} color="#ff3b30"/>}
          <span style={{ fontSize: '14px', fontWeight: 700 }}>{toast.msg}</span>
        </div>
      )}

      {/* МОДАЛКА УДАЛЕНИЯ */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'var(--bg)', borderRadius: '28px', padding: '28px', width: '100%', maxWidth: '340px', border: '1px solid var(--divider)', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,59,48,0.1)', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ff3b30' }}>
              <Trash2 size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>Удалить?</h3>
            <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '32px' }}>Вы точно хотите удалить объявление?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowConfirm(false)} className="btn-secondary" style={{ flex: 1, height: '54px', borderRadius: '16px' }}>Нет</button>
              <button onClick={handleDelete} disabled={isDeleting} className="btn-primary" style={{ flex: 1, height: '54px', borderRadius: '16px', background: '#ff3b30' }}>
                {isDeleting ? <Loader2 size={20} className="animate-spin" /> : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ФОТО И ИНФО */}
      <div style={{ position: 'relative', height: '380px', width: '100%', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '16px', left: '20px', right: '20px', zIndex: 10, display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => router.back()} className="icon-btn" style={{ background: 'rgba(0,0,0,0.4)', color: 'white' }}><ArrowLeft size={20}/></button>
          <div style={{ display: 'flex', gap: '10px' }}>
            {isOwner && (
              <>
                <button onClick={() => router.push(`/market/edit/${id}`)} className="icon-btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}><Pencil size={20}/></button>
                <button onClick={() => setShowConfirm(true)} className="icon-btn" style={{ background: 'rgba(255,59,48,0.5)', color: 'white' }}><Trash2 size={20}/></button>
              </>
            )}
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); showMsg('Ссылка скопирована') }} className="icon-btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}><Share2 size={20}/></button>
          </div>
        </div>

        <img src={data.post.main_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 20px 20px', background: 'linear-gradient(to top, var(--bg) 0%, rgba(17,17,16,0.8) 60%, transparent 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '4px', color: 'white' }}>{data.post.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {data.post.city}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {new Date(data.post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '10px 18px', borderRadius: '16px', fontWeight: 900, fontSize: '18px', boxShadow: '0 4px 20px rgba(255,107,0,0.5)' }}>
            {data.post.price?.toLocaleString()} ₽
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        {/* ХАРАКТЕРИСТИКИ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'ГОД', value: data.post.year, icon: <Calendar size={18} /> },
            { label: 'ДВИГАТЕЛЬ', value: data.post.engine ? `${data.post.engine} л.` : null, icon: <Zap size={18} /> },
            { label: 'ПРОБЕГ', value: data.post.mileage ? `${data.post.mileage.toLocaleString()} км` : null, icon: <Gauge size={18} /> },
            { label: 'КПП', value: data.post.transmission, icon: <Settings2 size={18} /> }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--divider)' }}>
              <div className="c-primary">{item.icon}</div>
              <div>
                <p style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>{item.label}</p>
                <p style={{ fontSize: '14px', fontWeight: 900 }}>{item.value || '—'}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', padding: '14px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', border: '1px solid var(--divider)' }}>
          <ShieldCheck size={22} color="#00c853"/>
          <div style={{ fontSize: '12px', fontWeight: 700 }}>{isOwner ? 'Это ваше объявление' : `Владелец: ${data.author?.full_name || 'Водитель'}`}</div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '12px' }}>Описание</h3>
          <div style={{ padding: '16px', borderRadius: '20px', background: 'var(--surface)', border: '1px solid var(--divider)' }}>
            <p style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{data.post.description}</p>
          </div>
        </div>

        {/* ОБСУЖДЕНИЕ */}
        <div style={{ marginBottom: '100px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={20} className="c-primary" /> Обсуждение ({data.comments.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900, color: 'var(--primary)', fontSize: '14px' }}>{c.user_name?.[0].toUpperCase() || 'В'}</div>
                <div style={{ background: 'var(--surface)', padding: '12px 14px', borderRadius: '0 16px 16px 16px', flex: 1, border: '1px solid var(--divider)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>{c.user_name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p style={{ fontSize: '13px' }}>{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ВВОД */}
      <div style={{ position: 'fixed', bottom: '65px', left: 0, right: 0, background: 'var(--bg)', padding: '12px 20px', borderTop: '1px solid var(--divider)', zIndex: 1000 }}>
        <form onSubmit={send} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input className="inp" style={{ borderRadius: '20px', height: '52px', fontSize: '14px' }} placeholder={isOwner ? "Ответить..." : "Спросить владельца..."} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
          <button type="submit" disabled={sending} style={{ width: '52px', height: '52px', borderRadius: '18px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </main>
  )
}