'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, Fuel, Wrench, AlertCircle, ShoppingBag, 
  BarChart3, CalendarDays, ChevronRight 
} from 'lucide-react'
import AddExpenseDrawer from './AddExpenseDrawer'

export default function ExpensesClient() {
  const supabase = createClient()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Все')

  // Загрузка реальных данных
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

  // МГНОВЕННОЕ ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
  const handleOptimisticAdd = (newExpense: any) => {
    setHistory(prev => [{
      ...newExpense,
      id: 'temp-' + Date.now(),
      isOptimistic: true 
    }, ...prev])
    
    setTimeout(fetchExpenses, 2500)
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

  // Пока идет загрузка, возвращаем null, чтобы работал глобальный PageLoader
  if (loading && history.length === 0) return null

  return (
    <main className="page active">
      <div className="pg-head">
        <h1 className="pg-title">Расходы</h1>
        <p className="pg-sub">Общие затраты: <strong>{totalAmount.toLocaleString()} ₽</strong></p>
      </div>

      <div className="chips" style={{ marginBottom: 'var(--s4)', overflowX: 'auto', paddingBottom: '4px' }}>
        {['Все', 'Топливо', 'Сервис', 'Запчасти', 'Штрафы'].map(f => (
          <div key={f} className={`chip ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</div>
        ))}
      </div>

      <div className="card" style={{ textAlign: 'center', padding: 'var(--s6) var(--s4)', border: '1px dashed var(--divider)', marginBottom: 'var(--s4)' }}>
        <button className="btn btn-primary btn-full" style={{ height: '52px' }} onClick={() => setIsDrawerOpen(true)}>
          <Plus size={18} /> Добавить расход
        </button>
      </div>

      <p className="section-label">История операций</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)', paddingBottom: '100px' }}>
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <div key={item.id} className="rcard" style={{ 
              alignItems: 'flex-start', 
              padding: '16px',
              opacity: item.isOptimistic ? 0.5 : 1,
              transition: '0.4s opacity ease'
            }}>
              <div className="rcard-ava" style={{ background: 'var(--surface2)', marginTop: '4px' }}>{getIcon(item.category)}</div>
              <div className="rcard-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase' }}>{catNames[item.category] || 'Расход'}</h3>
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
        onOptimisticAdd={handleOptimisticAdd} 
      />
    </main>
  )
}