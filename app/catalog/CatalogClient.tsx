'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, MapPin, Phone, Globe, Star, Wrench, 
  Fuel, Sparkles, LifeBuoy, Disc, ArrowLeft
} from 'lucide-react'

// Твои данные из таблицы (Севастополь)
const CATALOG_ITEMS = [
  { id: 1, category: 'СТО', name: 'Цех 313', address: 'ул. Правды, 28', phone: '+7 (978) 101-18-88', site: '' },
  { id: 2, category: 'СТО', name: 'СТО Мастеров', address: 'Фиолентовское ш., 3/2', phone: '+7 (918) 501-44-41', site: 'sto-masterov-sev.clients.site' },
  { id: 3, category: 'СТО', name: 'КарМастер', address: 'ул. Промышленная, 8', phone: '+7 (978) 266-26-03', site: 'stokarmaster92.ru' },
  { id: 4, category: 'СТО', name: 'Fit Service', address: 'Фиолентовское ш., 9В/2', phone: '+7 903 456 8495', site: 'sevastopol.fitauto.ru' },
  { id: 5, category: 'СТО', name: 'Айроверс', address: 'ул. Стахановцев, 1А', phone: '+7 (978) 555-33-30', site: 'arvs.ru' },
  { id: 6, category: 'Шиномонтаж', name: 'Доктор шин', address: 'просп. Героев Сталинграда, 29', phone: '', site: '' },
  { id: 7, category: 'Эвакуатор', name: 'АвтоЭвакуатор92', address: 'Курганная ул., 6', phone: '+7 (978) 556-68-98', site: 'avtoevakuator92.clients.site' },
  { id: 8, category: 'Эвакуатор', name: 'Спас-Авто', address: 'ул. Хрусталёва, 76А', phone: '+7 (978) 145-05-83', site: 'sevastopol.eva-kyator.ru' },
  { id: 9, category: 'Топливо', name: 'АЗС Мустанг', address: 'Севастополь', phone: '', site: '' },
  { id: 10, category: 'Топливо', name: 'АЗС ТЭС', address: 'Севастополь', phone: '', site: '' },
  { id: 11, category: 'Топливо', name: 'АЗС АТАН', address: 'Севастополь', phone: '', site: '' },
  { id: 12, category: 'Детейлинг', name: 'DACAR Detailing', address: 'ул. Шелкунова, 12', phone: '+7 (978) 117-68-69', site: 'vk.link/dacar_92' },
  { id: 13, category: 'Детейлинг', name: 'Sattva Detailing', address: 'Столетовский просп., 71', phone: '+7 (978) 785-29-05', site: 'технотим.рф' },
  { id: 14, category: 'Детейлинг', name: 'Edelvice', address: 'ул. Хрусталёва, 74Д', phone: '+7 (978) 519-23-39', site: 'edelvice.ru' },
  { id: 15, category: 'Детейлинг', name: 'SevDetailing', address: 'Балаклавское ш., 35', phone: '+7 (978) 713-71-39', site: 'sevdetailing.ru' },
]

const FILTERS = ['Все', 'СТО', 'Детейлинг', 'Шиномонтаж', 'Эвакуатор', 'Топливо']

export default function CatalogClient() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('Все')
  const [searchQuery, setSearchQuery] = useState('')

  // Иконки под каждую категорию
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'СТО': return <Wrench size={16} color="#00c853" />
      case 'Детейлинг': return <Sparkles size={16} color="#b388ff" />
      case 'Топливо': return <Fuel size={16} color="var(--primary)" />
      case 'Эвакуатор': return <LifeBuoy size={16} color="var(--red)" />
      case 'Шиномонтаж': return <Disc size={16} color="#2979ff" />
      default: return <Star size={16} color="var(--primary)" />
    }
  }

  // Умная фильтрация
  const filteredItems = CATALOG_ITEMS.filter(item => {
    const matchesFilter = activeFilter === 'Все' || item.category === activeFilter
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <main className="page active" style={{ paddingBottom: '120px' }}>
      
      {/* ── ШАПКА С КНОПКОЙ НАЗАД ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--s6)' }}>
        <button onClick={() => router.back()} className="icon-btn" style={{ background: 'var(--surface)', borderRadius: '50%', flexShrink: 0 }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="pg-title" style={{ marginBottom: '2px', fontSize: '24px' }}>Каталог</h1>
          <p className="pg-sub" style={{ fontSize: '13px' }}>Проверенные сервисы Севастополя</p>
        </div>
      </div>

      {/* ── СТРОКА ПОИСКА ── */}
      <div style={{ position: 'relative', marginBottom: 'var(--s4)' }}>
        <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
        <input 
          className="inp" 
          placeholder="Поиск по названию или адресу..." 
          style={{ paddingLeft: '44px', borderRadius: '16px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ── СВАЙП-ФИЛЬТРЫ ── */}
      <div style={{ 
        display: 'flex', gap: '8px', marginBottom: 'var(--s6)', 
        overflowX: 'auto', paddingBottom: '8px',
        scrollbarWidth: 'none', msOverflowStyle: 'none'
      }}>
        {FILTERS.map(f => (
          <button 
            key={f} 
            className={`chip ${activeFilter === f ? 'active' : ''}`} 
            onClick={() => setActiveFilter(f)}
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── СПИСОК КАРТОЧЕК ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div key={item.id} className="card" style={{ padding: '20px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    {getCategoryIcon(item.category)}
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--muted)' }}>
                      {item.category}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{item.name}</h3>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text)' }}>
                  <MapPin size={16} style={{ color: 'var(--muted)', marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', lineHeight: 1.4 }}>{item.address}</span>
                </div>
                
                {item.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text)' }}>
                    <Phone size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.phone}</span>
                  </div>
                )}

                {item.site && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text)' }}>
                    <Globe size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                    <a href={`https://${item.site}`} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}>
                      {item.site}
                    </a>
                  </div>
                )}
              </div>

              {/* ── КНОПКИ ДЕЙСТВИЙ ── */}
              <div style={{ display: 'grid', gridTemplateColumns: item.phone ? '1fr 1fr' : '1fr', gap: '10px' }}>
                {item.phone && (
                  <a href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`} style={{ textDecoration: 'none' }}>
                    <button className="btn btn-primary btn-full" style={{ height: '44px', fontSize: '13px', borderRadius: '12px' }}>
                      Позвонить
                    </button>
                  </a>
                )}
                <a 
                  href={`https://yandex.ru/maps/?text=Севастополь+${encodeURIComponent(item.address)}`} 
                  target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}
                >
                  <button className="btn" style={{ height: '44px', width: '100%', fontSize: '13px', borderRadius: '12px', background: 'var(--surface2)', color: 'var(--text)', border: 'none', fontWeight: 700 }}>
                    На карте
                  </button>
                </a>
              </div>

            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
            <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p>Ничего не найдено</p>
          </div>
        )}
      </div>
    </main>
  )
}