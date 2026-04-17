import { login, signup } from './actions'
import { Calculator, AlertCircle } from 'lucide-react'

// Layout de Seguridad Premium. Esta pantalla intercepta a cualquiera que intente
// usar la Calculadora si es que no tiene un token web válido (Sesión de Supabase).

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  // En Next.js 15+ los params se leen asincrónicamente
  const params = await searchParams
  const hasError = params?.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-100 p-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-8 relative z-10 p-8 border border-white/10 bg-white/5 rounded-3xl backdrop-blur-xl shadow-2xl">

        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-slate-900/50 ring-1 ring-white/10 rounded-2xl mb-2 backdrop-blur-md shadow-inner">
            <Calculator className="w-8 h-8 text-teal-400" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">
            Inteligencia Previsional
          </h2>
          <p className="text-slate-400 text-sm font-medium">Plataforma Exclusiva para Asesorias del Huasco</p>
        </div>

        {hasError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Tus credenciales no coinciden o hubo un error al procesar la solicitud en Supabase. Revisa tu email.</span>
          </div>
        )}

        <form className="space-y-6 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Correo Electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-mono text-sm"
              placeholder="asesor@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-mono tracking-widest text-lg"
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              formAction={login}
              className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] active:scale-95"
            >
              Entrar
            </button>
            <button
              formAction={signup}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-3 rounded-xl transition-all border border-slate-600 active:scale-95"
            >
              Crear Cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
