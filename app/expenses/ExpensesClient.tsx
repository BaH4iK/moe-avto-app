'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, Fuel, Wrench, AlertCircle, ShoppingBag, 
  BarChart3, CalendarDays, Trash2, Pencil 
} from 'lucide-react'
import AddExpenseDrawer from './AddExpenseDrawer'

export default function ExpensesClient() {
  const supabase = createClient()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Все')

  // Стейты для свайпа и редактирования
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [editingExpense, setEditingExpense] = useState<any>(null)

  // Функция загрузки данных напрямую из Supabase
  const fetchExpenses = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      
      if (!error) setHistory(data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Обработчики свайпа
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    if (touchStartX !== null) {
      const touchEndX = e.changedTouches[0].clientX
      const diff = touchStartX - touchEndX
      if (diff > 50) setSwipedItemId(id)
      else if (diff < -50 && swipedItemId === id) setSwipedItemId(null)
    }
    setTouchStartX(null)
  }

  // ЖЕСТКОЕ УДАЛЕНИЕ ИЗ БАЗЫ
  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Удалить этот расход навсегда?')) {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) {
        alert('Ошибка удаления: ' + error.message)
      } else {
        // Сначала обновляем локальный стейт для скорости, потом тянем из базы
        setHistory(prev => prev.filter(i => i.id !== id))
        setSwipedItemId(null)
        fetchExpenses() 
      }
    }
  }

  const handleEditClick = (item: any) => {
    setEditingExpense(item)
    setSwipedItemId(null)
    setIsDrawerOpen(true)
  }

  const catNames: any = { fuel: 'Топливо', service: 'Сервис', fine: 'Штраф', spare_parts: 'Запчасти' }
  
  const getIcon = (cat: string) => {
    switch (cat) {
      case 'fuel': return <Fuel size={18} className="c-primary" />
      case 'service': return <Wrench size={18} style={{ color: '#00c853' }} />
      case 'fine': return <AlertCircle size={18} style={{ color: 'var(--red)' }} />
      case 'spare_parts': return <ShoppingBag size={18} style={{ color: '#2979ff' }} />
      default: return <BarChart3 size={18} />
    }
  }

  const filteredHistory = history.filter(item => {
    if (activeFilter === 'Все') return true
    const filterMap: any = { 'Топливо': 'fuel', 'Сервис': 'service', 'Запчасти': 'spare_parts', 'Штрафы': 'fine' }
    return item.category === filterMap[activeFilter]
  })

  return (
    <main className="page active">
      <div className="pg-head">
        <h1 className="pg-title">Расходы</h1>
        <p className="pg-sub">Общие затраты: <strong>{history.reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString()} ₽</strong></p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--s4)', flexWrap: 'wrap' }}>
        {['Все', 'Топливо', 'Сервис', 'Запчасти', 'Штрафы'].map(f => (
          <div key={f} className={`chip ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</div>
        ))}
      </div>

      <button className="btn btn-primary btn-full" style={{ height: '52px', marginBottom: '20px' }} onClick={() => { setEditingExpense(null); setIsDrawerOpen(true); }}>
        <Plus size={18} /> Добавить расход
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '100px' }}>
        {filteredHistory.map((item) => (
          <div key={item.id} style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', background: '#ff4b4b' }}>
            {/* Кнопки действий под карточкой */}
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', display: 'flex' }}>
              <button onClick={() => handleEditClick(item)} style={{ flex: 1, background: '#ffa726', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={20} /></button>
              <button onClick={() => handleDeleteClick(item.id)} style={{ flex: 1, background: '#ff4b4b', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={20} /></button>
            </div>
            {/* Карточка расхода */}
            <div 
              className="rcard" 
              onTouchStart={e => handleTouchStart(e, item.id)}
              onTouchEnd={e => handleTouchEnd(e, item.id)}
              style={{ 
                transform: swipedItemId === item.id ? 'translateX(-120px)' : 'translateX(0)', 
                transition: 'transform 0.3s ease',
                background: 'var(--bg)', position: 'relative', zIndex: 2, border: '1px solid var(--divider)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px'
              }}
            >
              <div className="rcard-ava" style={{ background: 'var(--surface2)', flexShrink: 0 }}>{getIcon(item.category)}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase' }}>{catNames[item.category] || item.category}</h3>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {new Date(item.date).toLocaleDateString()} {item.mileage ? `· ${Number(item.mileage).toLocaleString()} км` : ''}
                </p>
                {item.description && <p style={{ fontSize: '12px', color: 'var(--text)', marginTop: '2px', fontStyle: 'italic' }}>{item.description}</p>}
              </div>
              <div style={{ fontWeight: 900, fontSize: '16px', flexShrink: 0 }}>{Number(item.amount).toLocaleString()} ₽</div>
            </div>
          </div>
        ))}
        {filteredHistory.length === 0 && !loading && (
          <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '40px' }}>
            <CalendarDays size={48} style={{ margin: '0 auto 12px' }} />
            <p>Записей не найдено</p>
          </div>
        )}
      </div>

      <AddExpenseDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSuccess={fetchExpenses} 
        editingItem={editingExpense}
      />
    </main>
  )
}