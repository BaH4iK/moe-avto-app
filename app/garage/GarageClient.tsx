'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tag, Car, Loader2 } from 'lucide-react'

export default function GarageClient() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
          setProfile(profileData)
          const { data: marketData } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
          if (marketData) setListings(marketData)
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [supabase])

  if (loading) return null

  return (
    <main className="page active" style={{ paddingBottom: '100px' }}>
      <div className="pg-head">
        <h1 className="pg-title">Гараж</h1>
        <p className="pg-sub">Управление вашим авто</p>
      </div>

      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #1c1c1c 0%, #111110 100%)', 
        border: '1px solid var(--divider)', padding: '24px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div className="rem-ico b" style={{ width: '60px', height: '60px' }}><Car size={32} /></div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 900 }}>{profile?.car_brand || 'Geely'} {profile?.car_model || 'Monjaro'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
              {profile?.car_year || '2024'} г.в. · {profile?.car_mileage?.toLocaleString() || 0} км
            </p>
          </div>
        </div>

        {/* КНОПКА «ОБМЕНЯТЬ» УДАЛЕНА, «ПРОДАТЬ» ТЕПЕРЬ НА ВСЮ ШИРИНУ */}
        <div style={{ display: 'flex' }}>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', height: '52px', borderRadius: '14px', fontWeight: 800, gap: '10px' }} 
            onClick={() => router.push('/market/create')}
          >
            <Tag size={18} /> 
            Выставить на продажу
          </button>
        </div>
      </div>

      <div className="pg-head" style={{ marginTop: '32px' }}>
        <h2 className="pg-title" style={{ fontSize: '20px' }}>Актуальное на рынке</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {listings.map(post => (
          <div key={post.id} className="card" style={{ padding: 0, overflow: 'hidden' }} onClick={() => router.push(`/market/${post.id}`)}>
            <div style={{ position: 'relative', height: '180px' }}>
              <img src={post.main_photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            </div>
            <div style={{ padding: '16px' }}>
              <h4 style={{ fontWeight: 800 }}>{post.title}</h4>
              <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)', marginTop: '8px' }}>{post.price?.toLocaleString()} ₽</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}