'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Interfaz de mutación de Base de Datos para el Módulo 5 (Clientes)
export async function crearNuevoCliente(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Debes iniciar sesión para crear clientes')
  }

  // Validación básica del lado del servidor
  const nombreRaw = formData.get('nombreCompleto')?.toString()
  const rutRaw = formData.get('rut')?.toString()
  if (!nombreRaw || nombreRaw.trim().length < 3) {
    return { error: 'El nombre ingresado es muy corto' }
  }

  if (rutRaw && !rutRaw.trim().includes('-')) {
    return { error: 'Formato Invalido: El RUT debe contener obligatoriamente su guión (-)' }
  }

  try {
    // Inyección oficial en PostgreSQL a través del Runtime Node en servidor
    const nuevoCli = await prisma.cliente.create({
      data: {
        nombreCompleto: nombreRaw.trim(),
        rut: rutRaw?.trim() || null,
        asesorId: user.id
      }
    })

    // Limpiamos agresivamente el caché de React Server Components para forzar 
    // a Next a refrescar todos los Selectors de forma instantánea.
    revalidatePath('/')
    revalidatePath('/historial')

    return { success: true, clienteId: nuevoCli.id }
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return { error: 'Ya existe un cliente con este RUT en el sistema' }
    }
    console.error('[DATABASE_ERROR_CLIENTE]', error)
    return { error: 'Ocurrió un error inesperado guardando el cliente' }
  }
}

export async function eliminarCliente(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado');

  try {
    // Usamos deleteMany al igual que updateMany para evadir la restricción @id obligatoria de Prisma con 'where' compuestos.
    const delResult = await prisma.cliente.deleteMany({
      where: { id, asesorId: user.id }
    })

    if (delResult.count === 0) {
      return { error: 'Cliente no existe o no te pertenece' }
    }

    revalidatePath('/')
    revalidatePath('/historial')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'No se pudo eliminar el cliente' }
  }
}

export async function editarCliente(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado');

  const nombreRaw = formData.get('nombreCompleto')?.toString()
  const rutRaw = formData.get('rut')?.toString()

  if (!nombreRaw || nombreRaw.trim().length < 3) {
    return { error: 'El nombre ingresado es muy corto' }
  }

  try {
    // IMPORTANTE: En Prisma 7 .update() exige que 'where' sea sólo la llave primaria.
    // Usamos updateMany() para poder pasar filtros atómicos (id + asesorId) como extra seguridad.
    const result = await prisma.cliente.updateMany({
      where: { id, asesorId: user.id },
      data: {
        nombreCompleto: nombreRaw.trim()
      }
    })

    if (result.count === 0) {
      return { error: 'Cliente no existe o no te pertenece' }
    }

    revalidatePath('/')
    revalidatePath('/historial')
    return { success: true }
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2002') {
      return { error: 'Ya existe un cliente con este RUT en el sistema' }
    }
    return { error: 'No se pudo actualizar el cliente' }
  }
}
