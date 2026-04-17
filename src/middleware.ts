import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Este archivo es OBLIGATORIO en Next.js App Router para interceptar tráfico global
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Intercepta TODAS las rutas de la app, EXCEPTO:
     * - Las compiladas nativas de next (_next/static, _next/image, favicon)
     * - Todos los recursos que sean imágenes o SVGs
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
