import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { User, ChevronRight } from 'lucide-react'
import { ClientAccordion } from '@/components/ClientAccordion'
import { EntradaSimulacion, ResultadoSimulacion } from '@/core/models/simulacion'

// Sever Component Puro - Esta vista se ejecuta en el servidor antes del render,
// dándonos un tiempo de respuesta de cero por leer de Base de Datos.

export default async function HistorialPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // MAGIA RELACIONAL Y RENDIMIENTO:
  // Le pedimos a Prisma que traiga a TODOS los clientes bajo MI responsabilidad (user.id),
  // y que por cada uno de ellos, incluya ("JOIN") todas sus simulaciones ordenadas por la más nueva.
  const clientes = await prisma.cliente.findMany({
    where: { asesorId: user.id },
    include: {
      simulaciones: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  return (
    <div className="min-h-full font-sans p-4 md:p-8 relative">
      {/* Patrón sutil para la pantalla limpia (sin quitar el gradiente maestro modificado en layout) */}
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* CABECERA (HERO HEADER) */}
        <header className="space-y-3 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
            <span>Inicio</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-teal-400">Mis Clientes</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-teal-300 to-indigo-400">
            Cartera de Clientes
          </h1>
          <p className="text-slate-400 text-lg">Consulta en tiempo real el historial completo de análisis proyectivos de tus usuarios.</p>
        </header>

        {clientes.length === 0 ? (
          <div className="p-16 border border-white/5 bg-slate-900/30 rounded-3xl text-center shadow-inner">
            <User className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-slate-300 text-xl font-bold">Un Cuaderno en Blanco</h3>
            <p className="text-slate-500 mt-2">Aún no has guardado cálculos en el simulador. Regresa a la Calculadora e inyecta uno a la base de datos.</p>
          </div>
        ) : (
          <ClientAccordion clientes={clientes} />
        )}

      </div>
    </div>
  )
}
