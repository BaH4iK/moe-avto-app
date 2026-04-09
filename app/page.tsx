import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createClient()
  
  // 1. Проверяем, авторизован ли пользователь
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Если не авторизован — кидаем на страницу входа
    redirect('/auth')
  }

  // 2. Если авторизован, проверяем его профиль в базе
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarded) {
    // Если профиля нет или анкета не пройдена — кидаем на регистрацию
    redirect('/onboarding')
  }

  // 3. Если всё отлично (авторизован и анкета заполнена) — пускаем на главную
  redirect('/dashboard')
}