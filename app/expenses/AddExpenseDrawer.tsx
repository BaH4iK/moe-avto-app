'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Fuel, Wrench, AlertCircle, ShoppingBag, Mic, MicOff } from 'lucide-react'

export default function AddExpenseDrawer({ isOpen, onClose, onOptimisticAdd }: any) {
  const supabase = createClient()
  const [isListening, setIsListening] = useState(false)
  const [form, setForm] = useState({
    amount: '',
    category: 'fuel',
    description: '',
    mileage: ''
  })

  const categories = [
    { id: 'fuel', label: 'Топливо', icon: <Fuel size={18} />, color: 'var(--primary)', keywords: ['заправ', 'бензин', 'топливо', 'газ', 'солярка', 'литр'] },
    { id: 'service', label: 'Сервис', icon: <Wrench size={18} />, color: '#00c853', keywords: ['ремонт', 'сервис', 'мастер', 'сто', 'починил', 'замена', 'масл'] },
    { id: 'fine', label: 'Штраф', icon: <AlertCircle size={18} />, color: 'var(--red)', keywords: ['штраф', 'гаи', 'гибдд', 'камера', 'нарушен'] },
    { id: 'spare_parts', label: 'Запчасти', icon: <ShoppingBag size={18} />, color: '#2979ff', keywords: ['запчаст', 'деталь', 'фильтр', 'колодк', 'купил', 'магазин'] },
  ]

  // ИСПРАВЛЕНО: Умный парсинг для сленга и любых чисел
  const processVoiceText = (text: string) => {
    let processed = text.toLowerCase();
    
    // 1. Сленг
    processed = processed.replace(/полторы\s*(тысяч|тысячи|тыщи|тыщ|к|k)?/g, '1500');
    processed = processed.replace(/полторушк[ауи]/g, '1500');
    processed = processed.replace(/двушк[ауи]/g, '2000');
    processed = processed.replace(/трешк[ауи]/g, '3000');
    processed = processed.replace(/косар[ьяю]?/g, '1000');
    processed = processed.replace(/пятер[ау]/g, '5000');
    processed = processed.replace(/пятихатк[ау]/g, '500');
    processed = processed.replace(/сотк[ау]/g, '100');

    // 2. Текстовые числа в цифры
    const numMap: { [key: string]: string } = {
      'ноль': '0', 'одна': '1', 'один': '1', 'две': '2', 'два': '2', 
      'три': '3', 'четыре': '4', 'пять': '5', 'шесть': '6', 'семь': '7', 
      'восемь': '8', 'девять': '9', 'десять': '10'
    };
    Object.keys(numMap).forEach(key => {
      processed = processed.replace(new RegExp(`\\b${key}\\b`, 'g'), numMap[key]);
    });

    // 3. Обработка множителей тысяч (например, "5 тысяч", "4 к", "3 тыщи")
    processed = processed.replace(/(\d+)\s*(к|k|тысяч|тысячи|тысячу|тыщ|тыща|тыщу|тыщи)\b/g, '$1000');
    
    // 4. Одиночная тысяча (например, "заправил тысячу")
    processed = processed.replace(/\b(тысяча|тысячу|тыщу|тыща)\b/g, '1000');

    // 5. Убираем пробелы между цифрами ("5 000" -> "5000")
    processed = processed.replace(/(\d)\s+(?=\d)/g, '$1');

    return processed;
  }

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return alert('Ваш браузер не поддерживает голосовой ввод')

    const recognition = new SpeechRecognition()
    recognition.lang = 'ru-RU'
    recognition.continuous = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      let text = event.results[0][0].transcript.toLowerCase()
      
      const processedText = processVoiceText(text);
      const numbers = processedText.match(/\d+/g);
      
      if (numbers) {
        setForm(prev => ({ ...prev, amount: numbers[0] }))
      }

      const foundCategory = categories.find(cat => 
        cat.keywords.some(word => text.includes(word))
      )
      if (foundCategory) {
        setForm(prev => ({ ...prev, category: foundCategory.id }))
      }

      // Записываем оригинальный текст в описание (с большой буквы)
      setForm(prev => ({ ...prev, description: text.charAt(0).toUpperCase() + text.slice(1) }))
    }

    recognition.start()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount) return
    
    const amountVal = parseFloat(form.amount)
    const descriptionVal = form.description.trim() || null
    const mileageVal = form.mileage ? parseInt(form.mileage) : null
    const now = new Date().toISOString()

    onOptimisticAdd({
      amount: amountVal,
      category: form.category,
      description: descriptionVal,
      mileage: mileageVal,
      date: now
    })

    onClose()
    setForm({ amount: '', category: 'fuel', description: '', mileage: '' })

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('expenses').insert({
        user_id: user.id,
        amount: amountVal,
        category: form.category,
        description: descriptionVal,
        mileage: mileageVal,
        date: now
      })
    }
  }

  if (!isOpen) return null

  return (
    <div 
      style={{ 
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', 
        zIndex: 1000, display: 'flex', 
        alignItems: 'flex-end', // ИСПРАВЛЕНО: Прижимаем к низу
        justifyContent: 'center', backdropFilter: 'blur(4px)'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* ИСПРАВЛЕНО: Мобильная шторка на 100% ширины */}
      <div className="card" style={{ 
        width: '100%', maxWidth: '520px', maxHeight: '90vh', 
        overflowY: 'auto', borderRadius: '24px 24px 0 0', 
        padding: 'var(--s6) var(--s6) calc(40px + env(safe-area-inset-bottom))', 
        background: 'var(--bg)', borderTop: '1px solid var(--divider)',
        boxShadow: '0 -10px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s6)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Новый расход</h2>
          <button onClick={onClose} className="icon-btn" style={{ background: 'var(--surface)', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        <button 
          type="button"
          onClick={startVoiceInput}
          style={{
            width: '100%',
            height: '80px',
            borderRadius: '24px',
            background: isListening ? 'var(--red)' : 'var(--surface2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: isListening ? '2px solid white' : '1px solid var(--divider)',
            marginBottom: 'var(--s4)',
            transition: '0.3s all ease',
            animation: isListening ? 'pulse 1.5s infinite' : 'none'
          }}
        >
          {isListening ? <MicOff size={24} color="white" /> : <Mic size={24} className="c-primary" />}
          <span style={{ fontSize: '12px', fontWeight: 800, color: isListening ? 'white' : 'var(--text)' }}>
            {isListening ? 'Слушаю... говорите сумму и категорию' : 'Нажать и продиктовать расход'}
          </span>
        </button>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }}>
          <div className="ffield">
            <label className="inp-label">Сумма (₽) *</label>
            <input 
              className="inp" style={{ fontSize: '30px', fontWeight: 900, textAlign: 'center', color: 'var(--primary)', height: '64px' }}
              type="number" inputMode="decimal" placeholder="0.00" required
              value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s2)' }}>
            {categories.map(cat => (
              <div key={cat.id} onClick={() => setForm({...form, category: cat.id})}
                style={{
                  padding: '12px 4px', borderRadius: '16px',
                  background: form.category === cat.id ? 'var(--surface2)' : 'var(--surface)',
                  border: `2px solid ${form.category === cat.id ? cat.color : 'transparent'}`,
                  textAlign: 'center', cursor: 'pointer'
                }}>
                <div style={{ color: cat.color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{cat.icon}</div>
                <span style={{ fontSize: '9px', fontWeight: 700 }}>{cat.label}</span>
              </div>
            ))}
          </div>

          <div className="ffield">
            <label className="inp-label">Описание</label>
            <input className="inp" placeholder="Напр. Лукойл АИ-95" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <button className="btn btn-primary btn-full" type="submit" style={{ height: '56px', fontSize: '15px', fontWeight: 800, borderRadius: '16px' }}>
            Сохранить запись
          </button>
        </form>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); opacity: 0.8; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}