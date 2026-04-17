import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Esta es la función segura que usaremos desde el Servidor (Server Components o Server Actions)
// A diferencia del cliente, aquí obtenemos las cookies de sesión del request directamente.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // El método 'set' falla si se invoca dentro de un Server Component nativo.
            // Esto es intencional y lo atrapamos silenciosamente. Next.js obliga a manejar 
            // la mutación de cookies mediante Server Actions o Route Handlers.
          }
        },
      },
    }
  )
}
