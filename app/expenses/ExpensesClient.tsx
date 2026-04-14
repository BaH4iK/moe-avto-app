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

  // --- ФУНКЦИИ УДАЛЕНИЯ И РЕДАКТИРОВАНИЯ ---
  const handleDelete = async (id: string) => {
    if (confirm('Удалить эту запись?')) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (!error) {
        setHistory(prev => prev.filter(item => item.id !== id))
        setSwipedItemId(null)
      } else {
        alert('Ошибка при удалении: ' + error.message)
      }
    }
  }

  const handleEdit = (item: any) => {
    setEditingExpense(item)
    setSwipedItemId(null)
    setIsDrawerOpen(true)
  }

  // --- ЛОГИКА СВАЙПА ---
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    if (touchStartX === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX - touchEndX

    if (diff > 70) {
      setSwipedItemId(id)
    } else if (diff < -70) {
      setSwipedItemId(null)
    }
    setTouchStartX(null)
  }

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'fuel': return <Fuel size={20} color="var(--primary)" />
      case 'service': return <Wrench size={20} color="#00c853" />
      case 'fine': return <AlertCircle size={20} color="var(--red)" />
      default: return <ShoppingBag size={20} color="var(--muted)" />
    }
  }

  const catNames: any = {
    fuel: 'Топливо',
    service: 'Сервис',
    fine: 'Штраф',
    spare_parts: 'Запчасти'
  }

  const filteredHistory = activeFilter === 'Все' 
    ? history 
    : history.filter(item => catNames[item.category] === activeFilter)

  return (
    <main className="page active" style={{ paddingBottom: '100px' }}>
      <div className="pg-head">
        <h1 className="pg-title">Расходы</h1>
        <p className="pg-sub">Ваша история трат</p>
      </div>

      <div className="filter-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0 20px', scrollbarWidth: 'none' }}>
        {['Все', 'Топливо', 'Сервис', 'Штраф'].map(f => (
          <button 
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`badge ${activeFilter === f ? 'bg' : ''}`}
            style={{ whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
          >
            {f}
          </button>
        ))}
      </div>

      <button 
        className="btn btn-primary btn-full" 
        style={{ height: '52px', marginBottom: '24px', borderRadius: '16px', fontWeight: 700 }}
        onClick={() => { setEditingExpense(null); setIsDrawerOpen(true); }}
      >
        <Plus size={18} /> Добавить расход
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredHistory.map((item) => (
          <div key={item.id} style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px' }}>
            {/* Кнопки под карточкой (видны при свайпе) */}
            <div style={{ 
              position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', 
              display: 'flex', zIndex: 1 
            }}>
              <button 
                onClick={() => handleEdit(item)}
                style={{ flex: 1, background: '#ffa726', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Pencil size={20} />
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                style={{ flex: 1, background: '#ff4b4b', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Сама карточка */}
            <div 
              className="rcard" 
              onTouchStart={e => handleTouchStart(e, item.id)}
              onTouchEnd={e => handleTouchEnd(e, item.id)}
              style={{ 
                transform: swipedItemId === item.id ? 'translateX(-120px)' : 'translateX(0)', 
                transition: 'transform 0.3s ease',
                background: 'var(--bg)', position: 'relative', zIndex: 2, 
                border: '1px solid var(--divider)', padding: '16px', 
                display: 'flex', alignItems: 'center', gap: '12px'
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