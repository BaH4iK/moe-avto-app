import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // ИСПРАВЛЕНИЕ 1: Не пересоздаем объект response, чтобы не стереть токены
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // ИСПРАВЛЕНИЕ 1: Аккуратно удаляем, не затирая другие куки
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Получаем данные пользователя. Это действие обновляет токены сессии, если они устарели.
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  // 1. Если пользователь НЕ авторизован и пытается зайти в приложение
  if (!user && !isAuthRoute) {
    const redirectResponse = NextResponse.redirect(new URL('/auth', request.url))
    // ИСПРАВЛЕНИЕ 2: Обязательно переносим куки в редирект, чтобы они сохранились в браузере
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // 2. Если пользователь УЖЕ залогинен и заходит на /auth
  if (user && isAuthRoute) {
    const redirectResponse = NextResponse.redirect(new URL('/', request.url))
    // ИСПРАВЛЕНИЕ 2: Обязательно переносим куки в редирект
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Обрабатываем все пути, кроме:
     * - _next/static (статические файлы)
     * - _next/image (оптимизация изображений)
     * - favicon.ico (иконка сайта)
     * - изображения (svg, png, jpg и т.д.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}