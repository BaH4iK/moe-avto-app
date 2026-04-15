'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, MapPin, Phone, Globe, Star, Wrench, 
  Fuel, Sparkles, LifeBuoy, Disc, ArrowLeft,
  Droplets, ShoppingBag, ShieldCheck, UserCog
} from 'lucide-react'

// Полная база данных партнеров из таблицы
const CATALOG_ITEMS = [
  // СТО
  { id: 1, category: 'СТО', name: 'Цех 313', address: 'ул. Правды, 28', phone: '+7 (978) 101-18-88', site: '' },
  { id: 2, category: 'СТО', name: 'СТО Мастеров', address: 'Фиолентовское ш., 3/2', phone: '+7 (918) 501-44-41', site: 'sto-masterov-sev.clients.site' },
  { id: 3, category: 'СТО', name: 'КарМастер', address: 'ул. Промышленная, 8', phone: '+7 (978) 266-26-03', site: 'stokarmaster92.ru' },
  { id: 4, category: 'СТО', name: 'Fit Service', address: 'Фиолентовское ш., 9В/2', phone: '+7 (903) 456-84-95', site: 'sevastopol.fitauto.ru' },
  { id: 5, category: 'СТО', name: 'Айроверс', address: 'ул. Стахановцев, 1А', phone: '+7 (978) 555-33-30', site: 'arvs.ru' },
  
  // Шиномонтаж
  { id: 6, category: 'Шиномонтаж', name: 'Доктор шин', address: 'просп. Героев Сталинграда, 29', phone: '+7 (978) 747-17-99', site: '' },
  { id: 7, category: 'Шиномонтаж', name: 'Шина-92', address: 'ул. Шабалина, 11/1', phone: '+7 (978) 449-38-10', site: 'shina92.ru' },
  { id: 8, category: 'Шиномонтаж', name: 'Шинный центр Radial+', address: 'ул. Кожанова, 12', phone: '+7 (978) 844-08-07', site: '' },
  { id: 9, category: 'Шиномонтаж', name: 'Шиномонтаж', address: 'Столетовский просп., 9', phone: '+7 (978) 567-19-15', site: '' },
  { id: 10, category: 'Шиномонтаж', name: 'Еврошина', address: 'Фиолентовское ш., 2Б', phone: '+7 (978) 812-03-99', site: '' },
  
  // Запчасти
  { id: 11, category: 'Запчасти', name: 'Автомагазин Остров', address: 'Фиолентовское ш., 6', phone: '+7 (978) 891-88-84', site: 'ostrov92.ru' },
  { id: 12, category: 'Запчасти', name: 'Zap82', address: 'ул. Николая Музыки, 29', phone: '+7 (978) 292-77-75', site: 'zap82.ru' },
  { id: 13, category: 'Запчасти', name: 'Yulsun', address: 'ул. Генерала Хрюкина, 1А', phone: '+7 (978) 092-74-00', site: 'yulsun.ru' },
  { id: 14, category: 'Запчасти', name: 'Автомаркет АвтоДруг92', address: 'ул. Хрусталёва, 111', phone: '+7 (978) 691-61-55', site: 'avtodrug92.ru' },
  { id: 15, category: 'Запчасти', name: 'Autodoc.ru', address: 'Камышовое ш., 75', phone: '+7 (978) 522-21-34', site: 'autodoc.ru' },

  // Страхование
  { id: 16, category: 'Страхование', name: 'Крымский страховой дом', address: 'ул. Очаковцев, 4', phone: '+7 (978) 058-33-03', site: 'osago-sev.ru' },
  { id: 17, category: 'Страхование', name: 'Госавтополис', address: 'ул. Борисова, 4', phone: '+7 (978) 505-98-98', site: 'gosavtopolis.ru' },
  { id: 18, category: 'Страхование', name: 'Эгида Полис', address: 'просп. Генерала Острякова, 164А/1', phone: '+7 (978) 654-28-60', site: '' },
  { id: 19, category: 'Страхование', name: 'Страхование-92', address: 'ул. Горпищенко, 76', phone: '+7 (978) 501-31-19', site: '' },
  { id: 20, category: 'Страхование', name: 'ОСАГО', address: 'ул. Стахановцев, 9', phone: '+7 (978) 262-03-02', site: '' },

  // Эвакуатор
  { id: 21, category: 'Эвакуатор', name: 'Sev-evo', address: 'ул. Щитовая, 2А', phone: '+7 (978) 720-73-37', site: '' },
  { id: 22, category: 'Эвакуатор', name: 'Эватаж', address: 'наб. Рыбпорта, 19А', phone: '+7 (978) 623-09-90', site: '' },
  { id: 23, category: 'Эвакуатор', name: 'АвтоСкорая 92', address: 'Камышовое ш., 41', phone: '+7 (979) 045-20-30', site: '' },
  { id: 24, category: 'Эвакуатор', name: 'АвтоЭвакуатор92', address: 'Курганная ул., 6', phone: '+7 (978) 556-68-98', site: 'avtoevakuator92.clients.site' },
  { id: 25, category: 'Эвакуатор', name: 'Спас-Авто', address: 'ул. Хрусталёва, 76А', phone: '+7 (978) 145-05-83', site: 'sevastopol.eva-kyator.ru' },

  // Топливо
  { id: 26, category: 'Топливо', name: 'АЗС Мустанг', address: 'Севастополь', phone: '', site: '' },
  { id: 27, category: 'Топливо', name: 'АЗС ТЭС', address: 'Севастополь', phone: '', site: '' },
  { id: 28, category: 'Топливо', name: 'АЗС АТАН', address: 'Севастополь', phone: '', site: '' },
  { id: 29, category: 'Топливо', name: 'Баррель', address: 'Севастополь', phone: '', site: '' },
  { id: 30, category: 'Топливо', name: 'АЗС Севастопольская', address: 'Севастополь', phone: '', site: '' },
  
  // Детейлинг
  { id: 31, category: 'Детейлинг', name: 'DACAR Detailing', address: 'ул. Шелкунова, 12', phone: '+7 (978) 117-68-69', site: 'vk.link/dacar_92' },
  { id: 32, category: 'Детейлинг', name: 'Sattva Detailing', address: 'Столетовский просп., 71', phone: '+7 (978) 785-29-05', site: 'технотим.рф' },
  { id: 33, category: 'Детейлинг', name: 'Edelvice', address: 'ул. Хрусталёва, 74Д', phone: '+7 (978) 519-23-39', site: 'edelvice.ru' },
  { id: 34, category: 'Детейлинг', name: 'SevDetailing', address: 'Балаклавское ш., 35', phone: '+7 (978) 713-71-39', site: 'sevdetailing.ru' },
  { id: 35, category: 'Детейлинг', name: 'АвтоСтудия_67', address: 'ул. Хрусталёва, 146А', phone: '+7 (978) 011-74-67', site: 'vk.com/avtostudio_67' },
  
  // Автомойки
  { id: 36, category: 'Автомойки', name: 'Атом', address: 'ул. Александра Маринеско, 20, корп. 1', phone: '', site: '' },
  { id: 37, category: 'Автомойки', name: 'Керхер', address: 'пл. Восставших, 4', phone: '+7 (978) 776-93-56', site: 'karchersev.ru' },
  { id: 38, category: 'Автомойки', name: 'МойСам', address: 'Камышовое ш., 12В', phone: '+7 (978) 038-27-28', site: 'mojsam-kamyshovoe-shosse.clients.site' },
  { id: 39, category: 'Автомойки', name: 'Автомойка', address: 'ул. Ковпака, 3А', phone: '+7 (978) 788-44-64', site: '' },
  { id: 40, category: 'Автомойки', name: 'Омега', address: 'просп. Героев Сталинграда, 70', phone: '+7 (978) 724-20-92', site: '' },
  
  // Частные мастера
  { id: 41, category: 'Частные мастера', name: 'КарМастер (ИП Самойленко)', address: 'ул. Промышленная, 8', phone: '+7 (978) 266-26-07', site: 'stokarmaster92.ru' },
  { id: 42, category: 'Частные мастера', name: 'Автосервис Крафт2', address: 'ул. Хрусталева, 84В', phone: '+7 (978) 007-81-15', site: '' },
  { id: 43, category: 'Частные мастера', name: 'Глобал Авто', address: 'Фиолентовское шоссе 9Г/2', phone: '+7 (978) 263-18-39', site: '' },
  { id: 44, category: 'Частные мастера', name: 'Автосервис GARAGE 13', address: 'Казачинское шоссе, 1', phone: '+7 (978) 054-87-76', site: '' },
  { id: 45, category: 'Частные мастера', name: 'АвтоМастер СТО', address: 'ул. Отрадная, 11б', phone: '+7 (978) 135-10-10', site: '' },
]

// Список фильтров 
const FILTERS = ['Все', 'СТО', 'Шиномонтаж', 'Запчасти', 'Страхование', 'Эвакуатор', 'Топливо', 'Детейлинг', 'Автомойки', 'Частные мастера']

export default function CatalogClient() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('Все')
  const [searchQuery, setSearchQuery] = useState('')

  // Индивидуальные иконки под каждую категорию
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'СТО': return <Wrench size={16} color="#00c853" />
      case 'Детейлинг': return <Sparkles size={16} color="#b388ff" />
      case 'Топливо': return <Fuel size={16} color="var(--primary)" />
      case 'Эвакуатор': return <LifeBuoy size={16} color="var(--red)" />
      case 'Шиномонтаж': return <Disc size={16} color="#2979ff" />
      case 'Автомойки': return <Droplets size={16} color="#00b0ff" />
      case 'Запчасти': return <ShoppingBag size={16} color="#ff9100" />
      case 'Страхование': return <ShieldCheck size={16} color="#00e676" />
      case 'Частные мастера': return <UserCog size={16} color="#ff3d00" />
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