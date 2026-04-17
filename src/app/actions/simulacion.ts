'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { EntradaSimulacion, ResultadoSimulacion } from '@/core/models/simulacion'

// Esta es una acción de Servidor estricta. Todo este código corre exclusivamente 
// del lado del backend. TypeScript de Prisma asegura que grabaremos lo correcto.

export async function guardarSimulacion(
  clienteId: string, 
  entradas: EntradaSimulacion, 
  resultados: ResultadoSimulacion
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("No estás autorizado.")

  // Grabar directamente en Postgres usando capacidad Jsonb documental
  await prisma.simulacion.create({
    data: {
      clienteId: clienteId,
      formulaVersion: 'v1.0',
      inputsJson: JSON.parse(JSON.stringify(entradas)),
      resultsJson: JSON.parse(JSON.stringify(resultados))
    }
  })

  // Retardo táctico UX: Dormimos el servidor 800 milisegundos para que 
  // el usuario alcance a ver el Spinner dando vueltas. Esto da una sensación
  // de "El sistema está trabajando muy duro" dándole valor percibido al SaaS.
  await new Promise(res => setTimeout(res, 800))

  return { success: true }
}
