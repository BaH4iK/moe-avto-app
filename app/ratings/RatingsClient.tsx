'use client'

import { useState } from 'react'
import { Trophy, Star, TrendingUp } from 'lucide-react'

const ratingsData = {
  'Сервисы': [
    { id: 1, icon: '🔧', title: 'Авто-Люкс', desc: 'Лучший сервис по ходовой · 2026', score: 4.9, count: '1 240 отзывов' },
    { id: 2, icon: '🛠️', title: 'Bosch Service', desc: 'Лидер по диагностике электроники', score: 4.8, count: '890 отзывов' },
    { id: 3, icon: '🧽', title: 'Sattva Detailing', desc: 'Премиум уход и защита кузова', score: 4.8, count: '450 отзывов' }
  ],
  'Запчасти': [
    { id: 4, icon: '📦', title: 'Exist.ru', desc: 'Самый большой склад в наличии', score: 4.7, count: '3 100 заказов' },
    { id: 5, icon: '⚙️', title: 'AutoDocs', desc: 'Лучшие цены на оригиналы Toyota', score: 4.6, count: '1 150 заказов' },
    { id: 6, icon: '🔋', title: 'Аккумулятор-Центр', desc: 'Гарантия и сервис батарей', score: 4.9, count: '620 заказов' }
  ],
  'Марки авто': [
    { id: 7, icon: '🇯🇵', title: 'Toyota', desc: 'Самый высокий индекс надежности', score: 4.9, count: 'ТОП-1 в Крыму' },
    { id: 8, icon: '🇰🇷', title: 'Kia / Hyundai', desc: 'Лучшая цена обслуживания', score: 4.7, count: 'ТОП-2 по продажам' },
    { id: 9, icon: '🇩🇪', title: 'BMW', desc: 'Лидер по удовольствию от вождения', score: 4.5, count: 'Выбор молодежи' }
  ]
}

export default function RatingsClient() {
  const [activeTab, setActiveTab] = useState('Сервисы')

  return (
    <main className="page active">
      <div className="pg-head">
        <h1 className="pg-title">Народный рейтинг</h1>
        <p className="pg-sub">На основе 15 000 оценок жителей Севастополя</p>
      </div>

      {/* ── ТАБЫ (ПЕРЕКЛЮЧАТЕЛЬ) ── */}
      <div className="rtabs">
        {Object.keys(ratingsData).map(tab => (
          <div 
            key={tab} 
            className={`rtab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* ── ЛИДЕР МЕСЯЦА (ГЕРОЙ-КАРТОЧКА) ── */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--yellow-hl), var(--surface2))', borderColor: 'var(--yellow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)' }}>
          <div className="rem-ico y" style={{ width: 56, height: 56 }}>
            <Trophy size={28} />
          </div>
          <div>
            <span className="badge by" style={{ marginBottom: '4px' }}>Выбор месяца</span>
            <h3 style={{ fontWeight: 700 }}>{ratingsData[activeTab][0].title}</h3>
            <p style={{ fontSize: 'var(--xs)', color: 'var(--muted)' }}>Держит планку 4.9 уже 3 месяца</p>
          </div>
        </div>
      </div>

      <p className="section-label">Топ по категории {activeTab.toLowerCase()}</p>

      {/* ── СПИСОК РЕЙТИНГА ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
        {ratingsData[activeTab].map((item, index) => (
          <div key={item.id} className="rcard">
            <div style={{ fontSize: 'var(--sm)', fontWeight: 800, color: index === 0 ? 'var(--yellow)' : 'var(--faint)', width: '20px' }}>
              #{index + 1}
            </div>
            <div className="rcard-ava">{item.icon}</div>
            <div className="rcard-info">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
            <div className="rcard-score-wrap">
              <div className="rcard-score">{item.score}</div>
              <div className="rcard-count">{item.count}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── ИНФО-БЛОК ── */}
      <div className="card" style={{ marginTop: 'var(--s2)', borderStyle: 'dashed' }}>
        <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}>
          <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
          <p style={{ fontSize: 'var(--xs)', color: 'var(--muted)', lineHeight: 1.4 }}>
            Рейтинг обновляется каждую неделю. Оставьте свой отзыв в профиле партнёра, чтобы повлиять на результат!
          </p>
        </div>
      </div>
    </main>
  )
}