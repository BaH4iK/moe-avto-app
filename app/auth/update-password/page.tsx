'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const router = useRouter()
  const supabase = createClient()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Пароль должен быть не менее 6 символов' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    // Функция обновления пароля
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setMessage({ type: 'error', text: 'Ошибка при сохранении. Возможно, ссылка устарела.' })
    } else {
      setMessage({ type: 'success', text: 'Пароль успешно изменен!' })
      // Ждем 2 секунды и кидаем на главную (юзер уже будет авторизован после смены)
      setTimeout(() => {
        window.location.replace('/dashboard')
      }, 2000)
    }
    setLoading(false)
  }

  return (
    <main className="page active" style={{ justifyContent: 'center', minHeight: '100vh', padding: 'var(--s6)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--s8)' }}>
        <div className="rem-ico o" style={{ width: 64, height: 64, margin: '0 auto var(--s4)' }}>
          <KeyRound size={32} />
        </div>
        <h1 className="pg-title">Новый пароль</h1>
        <p className="pg-sub">Придумайте надежный пароль</p>
      </div>

      <form onSubmit={handleUpdate} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
        
        {message.text && (
          <div className={`badge ${message.type === 'error' ? 'br' : 'bg'}`} style={{ padding: 'var(--s3)', width: '100%', justifyContent: 'center', display: 'flex', gap: '8px', fontSize: '12px', textAlign: 'center' }}>
            {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {message.text}
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <input 
            type={showPassword ? 'text' : 'password'} 
            className="inp" 
            placeholder="Введите новый пароль" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', padding: '4px' }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button 
          className="btn btn-primary btn-full" 
          type="submit" 
          disabled={loading || message.type === 'success'}
          style={{ height: '52px', marginTop: '8px' }}
        >
          {loading ? 'Сохранение...' : 'Сохранить и войти'}
        </button>

      </form>
    </main>
  )
}