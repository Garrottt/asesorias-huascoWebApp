import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// El Middleware intercepta todas las peticiones a la aplicación.
// Si alguien intenta ir a una ruta de la aplicación y su token expiró, esta
// función forzará a Supabase a refrescarlo o de lo contrario echará al usuario al login.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Ejecutamos una petición a auth para validar agresivamente la sesión
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 🛡️ REGLA ARQUITECTÓNICA DE PROTECCIÓN: 
  // Protegemos todas las rutas visuales de la aplicación.
  // Si el usuario NO existe y está tratando de entrar a cualquier pantalla que no sea /login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si ESTÁ conectado y trata de ir al login o registrarse, lo devolvemos forzosamente al sistema
  if (user && request.nextUrl.pathname.startsWith('/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
  }

  return supabaseResponse
}
