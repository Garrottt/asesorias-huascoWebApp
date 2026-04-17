import { createBrowserClient } from '@supabase/ssr'

// Función para interactuar con la Base de datos y Sesiones DIRECTO desde el Frontend Seguro
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
