'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Tag, RefreshCw, MapPin, MessageCircle, 
  Plus, Search, Car 
} from 'lucide-react'

export default function MarketPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Все')

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Загружаем данные профиля
        const { data: profileData } = await supabase
          .from('profiles')
          .select('car_brand, car_model, city')
          .eq('id', user.id)
          .single()
        setProfile(profileData)

        // Загружаем объявления
        const { data: marketPosts } = await supabase
          .from('posts')
          .select('*, comments(count)')
          .order('created_at', { ascending: false })
        if (marketPosts) setPosts(marketPosts)
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  // Если загрузка идет, возвращаем null для работы глобального PageLoader
  if (loading) return null

  return (
    <main className="page active" style={{ paddingBottom: '100px' }}>
      <div className="pg-head" style={{ textAlign: 'center', marginBottom: 'var(--s6)' }}>
        <h1 className="pg-title">Купить / Обменять</h1>
        <p className="pg-sub">{profile?.city || 'Севастополь'} · автомобили от проверенных лиц</p>
      </div>

      {/* КАРТОЧКА ТВОЕГО АВТО */}
      <div className="card" style={{ 
        background: 'var(--surface)', 
        padding: '20px', 
        marginBottom: '24px',
        border: '1px solid var(--divider)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ 
            width: '54px', height: '54px', borderRadius: '14px', 
            background: 'var(--primary-hl)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Car size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
              Ваш {profile?.car_brand || 'Автомобиль'} {profile?.car_model || ''}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Рыночная цена: <span style={{ color: 'var(--primary)', fontWeight: 800 }}>~ по запросу</span>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, fontWeight: 700 }} 
            onClick={() => router.push('/market/create')}
          >
            <Tag size={16} /> Продать
          </button>
          <button className="btn btn-outline" style={{ flex: 1, fontWeight: 700 }}>
            <RefreshCw size={16} /> Обменять
          </button>
        </div>
      </div>

      {/* ТАБЫ ФИЛЬТРАЦИИ */}
      <div className="chips" style={{ marginBottom: '20px' }}>
        {['Все', 'Автосалоны', 'Частники'].map(t => (
          <div 
            key={t} 
            className={`chip ${activeTab === t ? 'active' : ''}`} 
            onClick={() => setActiveTab(t)}
          >
            {t}
          </div>
        ))}
      </div>

      {/* ЛЕНТА ОБЪЯВЛЕНИЙ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {posts.map(post => (
          <div 
            key={post.id} 
            className="card" 
            style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} 
            onClick={() => router.push(`/market/${post.id}`)}
          >
            <div style={{ position: 'relative', height: '210px' }}>
              <img src={post.main_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ 
                position: 'absolute', top: '12px', right: '12px', 
                background: 'rgba(0,0,0,0.6)', padding: '4px 10px', 
                borderRadius: '8px', fontSize: '10px', fontWeight: 800, 
                color: '#00c853', backdropFilter: 'blur(8px)' 
              }}>
                Частник
              </div>
            </div>
            <div style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '17px', fontWeight: 800 }}>{post.title}</h4>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{post.city}</p>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)', marginTop: '10px' }}>
                {post.price?.toLocaleString()} ₽
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}