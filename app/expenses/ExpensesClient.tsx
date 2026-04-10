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

  // Функция жесткой загрузки данных ИЗ БАЗЫ
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

      if (diff > 50) { // Свайп влево
        setSwipedItemId(id)
      } else if (diff < -50) { // Свайп вправо
        if (swipedItemId === id) setSwipedItemId(null)
      }
    }
    setTouchStartX(null)
  }

  // ЖЕЛЕЗОБЕТОННОЕ УДАЛЕНИЕ ИЗ БАЗЫ
  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Точно удалить этот расход?')) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Удаляем напрямую из Supabase
        const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', user.id)
        
        if (error) {
          alert('Ошибка при удалении в базе: ' + error.message)
        } else {
          setSwipedItemId(null)
          fetchExpenses() // Скачиваем обновленный список без этой записи
        }
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

  const totalAmount = history.reduce((acc, curr) => acc + Number(curr.amount), 0)

  if (loading && history.length === 0) return null

  return (
    <main className="page active">
      <div className="pg-head">
        <h1 className="pg-title">Расходы</h1>
        <p className="pg-sub">Общие затраты: <strong>{totalAmount.toLocaleString()} ₽</strong></p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--s4)', flexWrap: 'wrap' }}>
        {['Все', 'Топливо', 'Сервис', 'Запчасти', 'Штрафы'].map(f => (
          <div key={f} className={`chip ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</div>
        ))}
      </div>

      <div className="card" style={{ textAlign: 'center', padding: 'var(--s6) var(--s4)', border: '1px dashed var(--divider)', marginBottom: 'var(--s4)' }}>
        <button className="btn btn-primary btn-full" style={{ height: '52px' }} onClick={() => { setEditingExpense(null); setIsDrawerOpen(true); }}>
          <Plus size={18} /> Добавить расход
        </button>
      </div>

      <p className="section-label">История операций</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '100px' }}>
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <div key={item.id} style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', background: 'var(--surface2)' }}>
              
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', display: 'flex' }}>
                <button onClick={() => handleEditClick(item)} style={{ flex: 1, background: '#ffa726', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Pencil size={20} />
                </button>
                <button onClick={() => handleDeleteClick(item.id)} style={{ flex: 1, background: '#ff4b4b', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Trash2 size={20} />
                </button>
              </div>

              <div 
                className="rcard" 
                onTouchStart={e => handleTouchStart(e, item.id)}
                onTouchEnd={e => handleTouchEnd(e, item.id)}
                style={{ 
                  transform: swipedItemId === item.id ? 'translateX(-120px)' : 'translateX(0)', 
                  transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  margin: 0, 
                  position: 'relative',
                  zIndex: 2,
                  background: 'var(--bg)',
                  border: '1px solid var(--divider)',
                  alignItems: 'flex-start', 
                  padding: '16px'
                }}
              >
                <div className="rcard-ava" style={{ background: 'var(--surface2)', marginTop: '4px' }}>{getIcon(item.category)}</div>
                <div className="rcard-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase' }}>{catNames[item.category] || item.category}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {new Date(item.date).toLocaleDateString('ru-RU')}
                    {item.mileage ? ` · ${Number(item.mileage).toLocaleString()} км` : ''}
                  </p>
                  {item.description && <p style={{ fontSize: '13px', color: 'var(--text)', fontStyle: 'italic' }}>«{item.description}»</p>}
                </div>
                <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
                  <div style={{ fontWeight: 900, fontSize: '17px' }}>{Number(item.amount).toLocaleString()} ₽</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', opacity: 0.5, padding: 'var(--s8) 0' }}>
            <CalendarDays size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p>Пока записей нет</p>
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