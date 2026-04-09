'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, MapPin, MessageCircle, 
  Send, User2, Clock, Loader2, Share2, ShieldCheck
} from 'lucide-react'

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  const loadData = useCallback(async () => {
    if (!id) return

    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    // Загружаем пост и профиль владельца
    const { data: postData, error } = await supabase
      .from('posts')
      .select('*, profiles(full_name, avatar_url)')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Ошибка загрузки поста:', error.message)
    }

    if (postData) {
      setPost(postData)
      
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true })
      
      if (commentsData) setComments(commentsData)
    }
    setLoading(false)
  }, [supabase, id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser || !id) return

    setSending(true)
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', currentUser.id)
      .single()

    const { error } = await supabase.from('comments').insert({
      post_id: id,
      user_id: currentUser.id,
      user_name: profile?.full_name || currentUser.email?.split('@')[0] || 'Водитель',
      content: newComment.trim()
    })

    if (!error) {
      setNewComment('')
      loadData()
    }
    setSending(false)
  }

  if (loading) return (
    <div className="page active" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
      <Loader2 className="animate-spin" size={32} color="var(--primary)" />
    </div>
  )

  if (!post) return (
    <div className="page active" style={{textAlign:'center', padding:'100px 20px'}}>
      <h2 style={{fontWeight: 900, fontSize: '24px'}}>Объявление не найдено</h2>
      <p style={{color:'var(--muted)', marginTop:'10px'}}>Проверьте ID или вернитесь на Базар</p>
      <button onClick={() => router.push('/market')} className="btn btn-primary" style={{marginTop:'24px'}}>Вернуться на базар</button>
    </div>
  )

  return (
    <main className="page active" style={{ padding: 0, background: 'var(--bg)', paddingBottom: '120px' }}>
      {/* HEADER & IMAGE */}
      <div style={{ position: 'relative', height: '350px', width: '100%' }}>
        <button 
          onClick={() => router.back()} 
          className="icon-btn" 
          style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'white' }}
        >
          <ArrowLeft size={20}/>
        </button>
        <button 
          style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'white' }}
          className="icon-btn"
        >
          <Share2 size={20}/>
        </button>
        <img src={post.main_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to top, var(--bg), transparent)' }}></div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: '0 var(--s6)', marginTop: '-30px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '4px' }}>{post.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '14px' }}>
              <MapPin size={14} /> {post.city} · <Clock size={14} /> {new Date(post.created_at).toLocaleDateString('ru-RU')}
            </div>
          </div>
          <div style={{ background: 'var(--primary-hl)', color: 'var(--primary)', padding: '12px 18px', borderRadius: '16px', fontWeight: 900, fontSize: '22px' }}>
            {post.price?.toLocaleString()} ₽
          </div>
        </div>

        {/* ПРОВЕРКА */}
        <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', border: '1px solid var(--divider)' }}>
          <div style={{ color: '#00c853' }}><ShieldCheck size={24}/></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px' }}>Проверено через VIN</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Юридически чист, без ДТП и залогов</div>
          </div>
        </div>

        {/* ОПИСАНИЕ */}
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>Описание</h3>
        <div className="card" style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{post.description}</p>
        </div>

        {/* КОММЕНТАРИИ */}
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircle size={20} className="c-primary" /> Обсуждение ({comments.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.length > 0 ? comments.map(comment => (
            <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User2 size={20} className="c-muted" />
              </div>
              <div style={{ background: 'var(--surface)', padding: '14px 18px', borderRadius: '0 18px 18px 18px', flex: 1, border: '1px solid var(--divider)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>{comment.user_name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.5 }}>{comment.content}</p>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)', background: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--divider)' }}>
              Вопросов пока нет. Будьте первым!
            </div>
          )}
        </div>
      </div>

      {/* INPUT FIXED */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg)', padding: '16px 20px 40px', borderTop: '1px solid var(--divider)', zIndex: 100 }}>
        <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              className="inp" 
              style={{ borderRadius: '24px', height: '52px', paddingLeft: '20px', background: 'var(--surface)' }} 
              placeholder="Задать вопрос владельцу..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={sending || !newComment.trim()} 
            style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px var(--primary-hl)' }}
          >
            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} style={{ marginLeft: '3px' }} />}
          </button>
        </form>
      </div>
    </main>
  )
}