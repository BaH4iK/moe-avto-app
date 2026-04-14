'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  LogIn, MailCheck, AlertCircle, Eye, EyeOff, 
  CheckSquare, Square, KeyRound, UserPlus, ArrowLeft, Loader2
} from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const router = useRouter()
  const supabase = createClient()

  // Проверка сессии при загрузке
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) router.push('/')
    }
    checkUser()
    
    const savedEmail = localStorage.getItem('moe_avto_remembered_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [router, supabase.auth])

  const translateError = (msg: string) => {
    const errors: Record<string, string> = {
      'Email rate limit exceeded': 'Слишком много попыток. Подождите немного.',
      'Invalid login credentials': 'Неверный email или пароль. Проверьте данные.',
      'User already registered': 'Пользователь с таким email уже существует.',
      'Password should be at least 6 characters': 'Пароль должен содержать минимум 6 символов.',
      'Email not confirmed': 'Почта не подтверждена. Проверьте ваш ящик.',
      'Signup requires a valid email': 'Введите корректный адрес электронной почты.',
      'Network HTTP error': ' Ошибка сети. Проверьте подключение к интернету.'
    }
    
    for (const [key, value] of Object.entries(errors)) {
      if (msg.includes(key)) return value
    }
    return 'Произошла непредвиденная ошибка. Попробуйте ещё раз.'
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Пароли не совпадают')
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Успешно! Мы отправили письмо для подтверждения на вашу почту.' })
      } 
      
      else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        
        if (rememberMe) {
          localStorage.setItem('moe_avto_remembered_email', email)
        } else {
          localStorage.removeItem('moe_avto_remembered_email')
        }
        
        router.push('/')
        router.refresh()
      }

      else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Инструкции по сбросу пароля отправлены на почту.' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: translateError(err.message || err.toString()) })
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMessage({ type: '', text: '' })
    setPassword('')
    setConfirmPassword('')
    setMode(newMode)
  }

  return (
    <main className="page active" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 'var(--s6)',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, var(--bg) 0%, var(--surface) 100%)'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '420px', 
        padding: 'var(--s8) var(--s6)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '1px solid var(--divider)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Декоративный элемент сверху */}
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px', 
          background: 'linear-gradient(90deg, var(--primary) 0%, #ff9e00 100%)' 
        }} />

        <div style={{ textAlign: 'center', marginBottom: 'var(--s8)' }}>
          <div style={{ 
            width: '72px', height: '72px', background: 'var(--primary)', 
            borderRadius: '22px', margin: '0 auto 16px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: 'white', boxShadow: '0 8px 16px var(--primary-hl)'
          }}>
            {mode === 'signin' ? <LogIn size={36} /> : mode === 'signup' ? <UserPlus size={36} /> : <KeyRound size={36} />}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px' }}>МоёАвто</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '6px', fontWeight: 500 }}>
            {mode === 'signin' ? 'Твой личный гараж в кармане' : mode === 'signup' ? 'Присоединяйся к сообществу' : 'Восстановим доступ к данным'}
          </p>
        </div>

        {message.text && (
          <div className="animate-in" style={{ 
            padding: '14px', borderRadius: '14px', marginBottom: '24px', fontSize: '14px', fontWeight: 600,
            background: message.type === 'error' ? 'rgba(255,75,75,0.08)' : 'rgba(0,200,83,0.08)',
            color: message.type === 'error' ? 'var(--red)' : '#00c853',
            display: 'flex', gap: '10px', alignItems: 'center',
            border: `1px solid ${message.type === 'error' ? 'rgba(255,75,75,0.2)' : 'rgba(0,200,83,0.2)'}`
          }}>
            {message.type === 'error' ? <AlertCircle size={18} /> : <MailCheck size={18} />}
            <span style={{ lineHeight: 1.4 }}>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="ffield">
            <label className="inp-label">Электронная почта</label>
            <input 
              className="inp" type="email" placeholder="example@mail.ru" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {mode !== 'forgot' && (
            <div className="ffield">
              <label className="inp-label">Пароль</label>
              <div style={{ position: 'relative' }}>
                <input 
                  className="inp" type={showPassword ? 'text' : 'password'} 
                  placeholder="Минимум 6 символов" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  style={{ paddingRight: '48px' }}
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', padding: '8px' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="ffield animate-in">
              <label className="inp-label">Повторите пароль</label>
              <input 
                className="inp" type="password" placeholder="••••••" required
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {mode === 'signin' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                <div onClick={() => setRememberMe(!rememberMe)} style={{ color: rememberMe ? 'var(--primary)' : 'var(--muted)', transition: '0.2s' }}>
                  {rememberMe ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600 }} onClick={() => setRememberMe(!rememberMe)}>Запомнить меня</span>
              </label>

              <button 
                type="button" onClick={() => toggleMode('forgot')}
                style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', padding: '4px' }}
              >
                Забыли пароль?
              </button>
            </div>
          )}

          <button 
            className="btn btn-primary btn-full" type="submit" disabled={loading}
            style={{ height: '56px', marginTop: '10px', fontSize: '16px', fontWeight: 800, borderRadius: '18px' }}
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 
             mode === 'signup' ? 'Создать аккаунт' : mode === 'forgot' ? 'Отправить ссылку' : 'Войти в профиль'}
          </button>

          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            {mode === 'signin' ? (
              <button type="button" className="btn btn-ghost btn-full" onClick={() => toggleMode('signup')}>
                У меня ещё нет аккаунта
              </button>
            ) : (
              <button type="button" className="btn btn-ghost btn-full" onClick={() => toggleMode('signin')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {mode === 'forgot' && <ArrowLeft size={16} />} Вернуться ко входу
              </button>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        .animate-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}