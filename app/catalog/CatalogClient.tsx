'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

const partnersData = [
  {
    id: 1, category: '⛽ Топливо', icon: '⛽', title: 'Лукойл — АЗС Севастополь',
    desc: 'Сеть заправок · 8 точек в городе · круглосуточно',
    rating: 4.6, reviews: '2.1к',
    badges: [], discount: '−7% для МоёАвто',
    promo: '🎁 Скидка 7% на топливо по QR-коду из приложения · Действует до 30 апреля'
  },
  {
    id: 2, category: '🔧 СТО', icon: '🔧', title: 'Авто-Люкс',
    desc: 'Мультибрендовый сервис · ремонт и диагностика',
    rating: 4.8, reviews: 520,
    badges: [{ text: 'Проверен', color: 'bg' }], discount: null, promo: null, hasButtons: true
  },
  {
    id: 4, category: '🧽 Автомойки', icon: '🧽', title: 'Остров',
    desc: 'Автомойка · удобный заезд · Севастополь',
    rating: 4.7, reviews: 205,
    badges: [], discount: '−10% будни', promo: null
  },
  {
    id: 5, category: '🛡️ Страхование', icon: '🛡️', title: 'Ингосстрах',
    desc: 'ОСАГО, КАСКО · Оформление онлайн за 5 минут',
    rating: 4.9, reviews: 840,
    badges: [{ text: 'Онлайн', color: 'bb' }], discount: null, promo: null, hasButtons: true
  },
  {
    id: 7, category: '🚜 Эвакуатор', icon: '🚜', title: 'Спас-Крым 24/7',
    desc: 'Эвакуатор · Подача от 15 минут по Севастополю',
    rating: 5.0, reviews: 94,
    badges: [{ text: 'Круглосуточно', color: 'br' }], discount: null, promo: null, hasButtons: true
  },
  {
    id: 8, category: '🛞 Шиномонтаж', icon: '🛞', title: '5 Колесо',
    desc: 'Сеть шиномонтажных мастерских · Балансировка',
    rating: 4.5, reviews: 320,
    badges: [], discount: null, promo: null
  },
  {
    id: 9, category: '📦 Запчасти', icon: '📦', title: 'Exist.ru Севастополь',
    desc: 'Автозапчасти в наличии и под заказ · Хрусталева, 74',
    rating: 4.7, reviews: '1.5к',
    badges: [{ text: 'В наличии', color: 'bg' }], discount: null, promo: '🚚 Доставка по городу от 2000 ₽ бесплатно'
  },
  {
    id: 10, category: '✨ Детейлинг', icon: '✨', title: 'Royal Detailing',
    desc: 'Полировка кузова, химчистка, керамика 9H',
    rating: 4.9, reviews: 156,
    badges: [{ text: 'Премиум', color: 'bo' }], discount: '−15% на керамику', promo: null, hasButtons: true
  },
  {
    id: 11, category: '👨‍🔧 Частные мастера', icon: '👨‍🔧', title: 'Мастер Андрей (Ходовая)',
    desc: 'Ремонт подвески, замена ГРМ, диагностика · Гаражный кооператив "Волна"',
    rating: 5.0, reviews: 42,
    badges: [{ text: 'Выезд', color: 'bb' }], discount: null, promo: '👨‍🔧 Скидка на первый заезд 500 ₽'
  }
]

const categories = [
  '🔧 СТО', '🛞 Шиномонтаж', '📦 Запчасти', '🛡️ Страхование', 
  '🚜 Эвакуатор', '⛽ Топливо', '✨ Детейлинг', '🧽 Автомойки', '👨‍🔧 Частные мастера'
]

export default function CatalogClient() {
  const [activeChip, setActiveChip] = useState('🔧 СТО')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPartners = partnersData.filter(partner => {
    const matchesCategory = partner.category === activeChip
    const matchesSearch = partner.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          partner.desc.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main className="page active" style={{ paddingBottom: '120px' }}>
      <div className="pg-head">
        <h1 className="pg-title">Партнёры и сервисы</h1>
        <p className="pg-sub">Севастополь · прямая запись к мастерам</p>
      </div>

      <div className="search-wrap">
        <div className="search-ico"><Search size={16} /></div>
        <input 
          className="inp" 
          type="search" 
          placeholder="Поиск по названию или услуге..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ── ИСПРАВЛЕННЫЕ КАТЕГОРИИ: АВТО-ШИРИНА ── */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px',
        margin: 'var(--s4) 0' 
      }}>
        {categories.map(cat => (
          <div 
            key={cat} 
            className={`chip ${activeChip === cat ? 'active' : ''}`}
            style={{ 
              width: 'auto', // Рамка подстраивается под текст
              fontSize: '12px',
              padding: '10px 16px', // Комфортные отступы для длинных названий
              whiteSpace: 'nowrap', // Текст не переносится внутри рамки
              fontWeight: 700
            }}
            onClick={() => setActiveChip(cat)}
          >
            {cat}
          </div>
        ))}
      </div>

      <p className="section-label" style={{ borderTop: '1px solid var(--divider)', paddingTop: 'var(--s6)', marginBottom: 'var(--s4)' }}>
        {activeChip} в Севастополе
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
        {filteredPartners.length > 0 ? (
          filteredPartners.map(partner => (
            <div key={partner.id} className="pcard" style={{ padding: '20px', border: '1px solid var(--divider)' }}>
              <div className="pcard-top">
                <div className="pcard-img" style={{ fontSize: '24px' }}>{partner.icon}</div>
                <div className="pcard-info">
                  <h3 style={{ fontSize: '18px', fontWeight: 900 }}>{partner.title}</h3>
                  <p style={{ fontSize: '13px', margin: '4px 0' }}>{partner.desc}</p>
                  <div className="pcard-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    <div className="rating-row" style={{ background: 'var(--surface2)', padding: '2px 8px', borderRadius: '8px' }}>
                      <span className="star" style={{ color: '#ffb000' }}>★</span>
                      <span style={{ fontWeight: 800, fontSize: '13px' }}>{partner.rating}</span>
                      <span style={{ color: 'var(--muted)', fontSize: '12px', marginLeft: '2px' }}>({partner.reviews})</span>
                    </div>
                    {partner.discount && <div className="pcard-discount" style={{ fontSize: '11px' }}>{partner.discount}</div>}
                    {partner.badges.map((b, i) => (
                      <span key={i} className={`badge ${b.color}`} style={{ fontSize: '11px' }}>{b.text}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              {partner.promo && (
                <div style={{ background: 'rgba(255,107,0,0.1)', color: 'var(--primary)', borderRadius: '14px', padding: '12px 16px', fontSize: '12px', fontWeight: 700, marginTop: '12px' }}>
                  {partner.promo}
                </div>
              )}
              {partner.hasButtons && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1.5, height: '44px', borderRadius: '12px', fontWeight: 800 }}>Записаться</button>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1, height: '44px', borderRadius: '12px', fontWeight: 800 }}>Позвонить</button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--s10) 0', color: 'var(--muted)' }}>
            <p style={{ fontSize: '14px' }}>В этой категории пока нет партнёров 😔</p>
          </div>
        )}
      </div>
    </main>
  )
}