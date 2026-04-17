import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import SimuladorUI from '@/components/SimuladorUI'

// Este es el Dashboard principal (Ruta Protegida).
// Aquí Next.js ejecuta todo el código antes de darle el HTML al cliente.

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null // Redirigido por middleware de todas formas

  // 1. SINCRONIZACIÓN DE PERFIL (Lazy Profile Initialization)
  let asesor = await prisma.asesor.findUnique({
    where: { id: user.id }
  })

  // Si no está registrado en Prisma, lo clonamos desde Supabase Auth silenciosamente.
  if (!asesor) {
    asesor = await prisma.asesor.create({
      data: {
        id: user.id,
        email: user.email!,
        nombreCompleto: user.user_metadata?.full_name || 'Nuevo Asesor'
      }
    })
  }

  // 2. RECUPERACIÓN DE CARTERA REAL (CRM)
  const misClientes = await prisma.cliente.findMany({
    where: { asesorId: asesor.id },
    select: { id: true, nombreCompleto: true, rut: true },
    orderBy: { createdAt: 'desc' }
  })

  // Le inyectamos la lista de clientes al SimuladorUI para que el usuario elija
  return (
    <main className="min-h-full w-full font-sans text-slate-100 relative">
      <SimuladorUI clientes={misClientes} />
    </main>
  )
}
