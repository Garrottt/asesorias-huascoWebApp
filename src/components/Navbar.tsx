'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, Users, LogOut } from 'lucide-react'
import { logout } from '@/app/login/actions'

// Componente Cliente porque necesita saber dinámicamente en qué ruta 
// estás parado para "encender" o "apagar" el color del botón pertinente.

export function Navbar() {
  const pathname = usePathname()

  // No queremos distracciones en la pantalla de Login
  if (pathname === '/login') return null

  return (
    <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400 drop-shadow-sm">
              AH WebApp
            </h1>

            <div className="flex gap-2">
              <Link
                href="/"
                className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all duration-300 ${pathname === '/'
                  ? 'bg-white/10 text-teal-300 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
              >
                <Calculator className="w-4 h-4" />
                Simulador
              </Link>

              <Link
                href="/historial"
                className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all duration-300 ${pathname?.startsWith('/historial')
                  ? 'bg-white/10 text-indigo-300 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
              >
                <Users className="w-4 h-4" />
                Mis Clientes
              </Link>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-rose-400 transition-all px-4 py-2 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 active:scale-95"
              title="Deconectar y volver a Login"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </form>

        </div>
      </div>
    </nav>
  )
}
