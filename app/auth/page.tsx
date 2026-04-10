'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  LogIn, MailCheck, AlertCircle, Eye, EyeOff, 
  CheckSquare, Square, KeyRound 
} from 'lucide-react'

export default function AuthPage() {
  // Состояния формы
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  
  // Состояния загрузки и ошибок
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const router = useRouter()
  const supabase = createClient()

  // Перевод ошибок Supabase на нормальный русский
  const translateError = (msg: string) => {
    if (msg.includes('Email rate limit exceeded')) return 'Слишком много попыток. Подождите 15 минут.'
    if (msg.includes('Invalid login credentials')) return 'Неверный email или пароль.'
    if (msg.includes('User already registered')) return 'Этот email уже зарегистрирован.'
    if (msg.includes('Password should be at least')) return 'Пароль должен быть не менее 6 символов.'
    return 'Ошибка сервера. Попробуйте позже.'
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    // ─── 1. ВОССТАНОВЛЕНИЕ ПАРОЛЯ ───
    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`, // Если добавишь страницу смены пароля
      })
      if (error) {
        setMessage({ type: 'error', text: translateError(error.message) })
      } else {
        setMessage({ type: 'success', text: 'Ссылка для сброса пароля отправлена на ваш Email!' })
        setTimeout(() => setMode('signin'), 3000) // Возвращаем на логин через 3 сек
      }
      setLoading(false)
      return
    }

    // ─── 2. РЕГИСТРАЦИЯ ───
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'Пароли не совпадают' })
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) {
        setMessage({ type: 'error', text: translateError(error.message) })
      } else {
        // Принудительно выходим, чтобы пользователь сам ввел логин и пароль
        await supabase.auth.signOut()
        
        // Сбрасываем поля и переключаем на Вход
        setPassword('')
        setConfirmPassword('')
        setMode('signin')
        setMessage({ type: 'success', text: 'Регистрация успешна! Теперь войдите, используя свои данные.' })
      }
      setLoading(false)
      return
    }

    // ─── 3. ВХОД (ЛОГИН) ───
    if (mode === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setMessage({ type: 'error', text: translateError(error.message) })
      } else if (data.user) {
        
        // Проверяем, заполнил ли он анкету (онбординг)
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', data.user.id)
          .single()

        // Используем window.location.replace для жесткой перезагрузки и обхода кэша роутера
        if (profile?.onboarded) {
          window.location.replace('/dashboard')
        } else {
          window.location.replace('/onboarding')
        }
      }
      setLoading(false)
    }
  }

  // Вспомогательные функции рендера
  const getTitle = () => {
    if (mode === 'signup') return 'Регистрация'
    if (mode === 'forgot') return 'Сброс пароля'
    return 'Вход'
  }

  const getSubtitle = () => {
    if (mode === 'signup') return 'Создайте бортовой журнал'
    if (mode === 'forgot') return 'Введите email для восстановления'
    return 'Ваш бортовой журнал'
  }

  return (
    <main className="page active" style={{ justifyContent: 'center', minHeight: '100vh', padding: 'var(--s6)' }}>
      
      {/* ШАПКА */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--s8)' }}>
        <div className="rem-ico o" style={{ width: 64, height: 64, margin: '0 auto var(--s4)' }}>
          {mode === 'forgot' ? <KeyRound size={32} /> : <LogIn size={32} />}
        </div>
        <h1 className="pg-title">{getTitle()}</h1>
        <p className="pg-sub">{getSubtitle()}</p>
      </div>

      {/* ФОРМА */}
      <form onSubmit={handleAuth} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
        
        {/* Вывод сообщений (ошибки или успех) */}
        {message.text && (
          <div className={`badge ${message.type === 'error' ? 'br' : 'bg'}`} style={{ padding: 'var(--s3)', width: '100%', justifyContent: 'center', display: 'flex', gap: '8px', fontSize: '12px', textAlign: 'center', whiteSpace: 'normal', lineHeight: 1.4 }}>
            {message.type === 'error' ? <AlertCircle size={16} style={{ flexShrink: 0 }} /> : <MailCheck size={16} style={{ flexShrink: 0 }} />}
            {message.text}
          </div>
        )}

        {/* Поле Email (всегда видимо) */}
        <input 
          type="email" 
          className="inp" 
          placeholder="Email" 
          required 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />

        {/* Поля пароля (скрыты при восстановлении) */}
        {mode !== 'forgot' && (
          <>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="inp" 
                placeholder="Пароль" 
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

            {/* Подтверждение пароля (только регистрация) */}
            {mode === 'signup' && (
              <input 
                type="password" 
                className="inp" 
                placeholder="Повторите пароль" 
                required 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
              />
            )}
            
            {/* Доп. кнопки для Входа (Запомнить меня + Забыл пароль) */}
            {mode === 'signin' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: 'var(--muted)', userSelect: 'none' }}>
                  <div onClick={() => setRememberMe(!rememberMe)} style={{ color: rememberMe ? 'var(--primary)' : 'var(--faint)', display: 'flex', alignItems: 'center' }}>
                    {rememberMe ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
                  <span onClick={() => setRememberMe(!rememberMe)}>Запомнить меня</span>
                </label>

                <button 
                  type="button" 
                  onClick={() => { setMode('forgot'); setMessage({type:'', text:''}); }} 
                  style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', padding: 0 }}
                >
                  Забыли пароль?
                </button>
              </div>
            )}
          </>
        )}

        {/* Главная кнопка действия */}
        <button 
          className="btn btn-primary btn-full" 
          type="submit" 
          disabled={loading}
          style={{ height: '52px', marginTop: '8px' }}
        >
          {loading ? 'Обработка...' : mode === 'signup' ? 'Создать аккаунт' : mode === 'forgot' ? 'Отправить ссылку' : 'Войти'}
        </button>

        {/* Переключатель режимов внизу */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {mode === 'signin' ? (
            <button type="button" className="btn btn-ghost btn-full" onClick={() => { setMode('signup'); setMessage({type:'', text:''}); }}>
              Нет аккаунта? Зарегистрироваться
            </button>
          ) : (
            <button type="button" className="btn btn-ghost btn-full" onClick={() => { setMode('signin'); setMessage({type:'', text:''}); }}>
              {mode === 'forgot' ? 'Вспомнили пароль? Войти' : 'Уже есть аккаунт? Войти'}
            </button>
          )}
        </div>
      </form>
    </main>
  )
}