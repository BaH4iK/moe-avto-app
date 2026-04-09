'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogIn, MailCheck, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const router = useRouter()
  const supabase = createClient()

  const translateError = (msg: string) => {
    if (msg.includes('Email rate limit exceeded')) return 'Слишком много попыток. Подождите 15 минут.'
    if (msg.includes('Invalid login credentials')) return 'Неверный email или пароль.'
    if (msg.includes('User already registered')) return 'Этот email уже занят.'
    return 'Ошибка авторизации. Попробуйте позже.'
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (isSignUp && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Пароли не совпадают' });
      setLoading(false); return;
    }

    const { data, error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage({ type: 'error', text: translateError(error.message) })
    } else if (data.user) {
      // ПРОВЕРКА ПРОФИЛЯ
      const { data: profile } = await supabase
        .from('profiles')
        .select('car_brand')
        .eq('id', data.user.id)
        .single()

      if (profile?.car_brand) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    }
    setLoading(false)
  }

  return (
    <main className="page active" style={{ justifyContent: 'center', minHeight: '100vh', padding: 'var(--s6)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--s8)' }}>
        <div className="rem-ico o" style={{ width: 64, height: 64, margin: '0 auto var(--s4)' }}><LogIn size={32} /></div>
        <h1 className="pg-title">{isSignUp ? 'Регистрация' : 'Вход'}</h1>
        <p className="pg-sub">Ваш бортовой журнал</p>
      </div>

      <form onSubmit={handleAuth} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
        {message.text && (
          <div className={`badge ${message.type === 'error' ? 'br' : 'bg'}`} style={{ padding: 'var(--s3)', width: '100%', justifyContent: 'center', display: 'flex', gap: '8px' }}>
            {message.type === 'error' ? <AlertCircle size={14} /> : <MailCheck size={14} />}
            {message.text}
          </div>
        )}
        <input type="email" className="inp" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
        <div style={{ position: 'relative' }}>
          <input type={showPassword ? 'text' : 'password'} className="inp" placeholder="Пароль" required value={password} onChange={e => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)' }}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {isSignUp && <input type="password" className="inp" placeholder="Повторите пароль" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />}
        <button className="btn btn-primary btn-full" type="submit" disabled={loading}>{loading ? 'Загрузка...' : isSignUp ? 'Создать аккаунт' : 'Войти'}</button>
        <button type="button" className="btn btn-ghost btn-full" onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}</button>
      </form>
    </main>
  )
}