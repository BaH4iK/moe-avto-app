import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createClient()
  
  let currentUser = null
  let isOnboarded = false

  try {
    // 1. Безопасно получаем пользователя
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (!authError && authData?.user) {
      currentUser = authData.user
      
      // 2. Если пользователь найден, проверяем его профиль в БД
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', currentUser.id)
        .single()
        
      if (!profileError && profile) {
        // Убеждаемся, что значение именно true (как в твоей базе)
        isOnboarded = profile.onboarded === true
      }
    }
  } catch (error) {
    // Тихо ловим любые сетевые или серверные ошибки БД
    console.error("Ошибка при проверке сессии:", error)
  }

  // 3. Выполняем редиректы. 
  // ВАЖНО: В Next.js redirect() обязан быть за пределами блока try/catch!
  if (!currentUser) {
    // Нет пользователя -> на вход
    redirect('/auth')
  } else if (!isOnboarded) {
    // Есть пользователь, но не прошел онбординг -> заполнять анкету
    redirect('/onboarding')
  } else {
    // Всё супер -> на главную
    redirect('/dashboard')
  }
}