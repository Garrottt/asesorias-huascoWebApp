'use client'

import { useState, useTransition } from 'react'
import { User, Activity, Clock, ChevronDown, ChevronRight, Calculator, Edit2, Trash2, X, Loader2 } from 'lucide-react'
import { EntradaSimulacion, ResultadoSimulacion } from '@/core/models/simulacion'
import { GeneradorPDF } from './GeneradorPDF'
import { eliminarCliente, editarCliente } from '@/app/actions/clientes'
import { toast } from 'sonner'

interface ClientAccordionProps {
  clientes: any[];
}

export function ClientAccordion({ clientes }: ClientAccordionProps) {
  // Manejo de estado del acordeón. Null = todos cerrados.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("⚠️ Peligro: Esta acción es irreversible.\nSe eliminará de raíz este cliente y TODAS las simulaciones vinculadas a él.\n\n¿Estás completamente seguro de purgar a esta persona?")) {
      startTransition(async () => {
        try {
           const res = await eliminarCliente(id);
           if (res.error) throw new Error(res.error);
           toast.success("Cliente obliterado con éxito de la base de datos");
        } catch(e: any) {
           toast.error(e.message || "Error al eliminar");
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {clientes.map(cliente => {
        const isExpanded = expandedId === cliente.id;
        const totalSimulaciones = cliente.simulaciones.length;
        
        return (
          <div key={cliente.id} className="border border-white/5 bg-slate-900/30 rounded-2xl overflow-hidden transition-all duration-300 shadow-md">
            
            {/* BARRA HORIZONTAL DEL CLIENTE (SIEMPRE VISIBLE) */}
            <div className="w-full flex items-center justify-between p-5 hover:bg-slate-800/50 transition-colors text-left group border-b border-transparent">
              <div 
                onClick={() => toggle(cliente.id)}
                className="flex items-center gap-4 flex-1 cursor-pointer"
              >
                <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-teal-500/10 rounded-xl ring-1 ring-white/10">
                  <User className="text-indigo-400 w-5 h-5 drop-shadow-md" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100 tracking-tight leading-tight">{cliente.nombreCompleto}</h2>
                  <p className="text-xs text-slate-500 font-mono tracking-wide mt-0.5">
                    EXPEDIENTE: <span className="text-slate-400">{cliente.rut ? cliente.rut.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") : 'Sin RUT'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-5">
                <div className="hidden sm:flex items-center gap-2" onClick={() => toggle(cliente.id)}>
                   <div className="px-3 py-1 rounded-full bg-slate-950 border border-white/5 text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer">
                     <Calculator className="w-3.5 h-3.5 text-teal-500/50" />
                     {totalSimulaciones} {totalSimulaciones === 1 ? 'simulación' : 'sims.'}
                   </div>
                </div>

                {/* BOTONES CRUD (INYECCIÓN FASE 7) - Protegidos contra onClicks parents */}
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 p-1 rounded-lg border border-white/5">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingClient(cliente); }}
                    className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-all"
                    title="Editar Cliente"
                  >
                     <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={isPending}
                    onClick={(e) => { e.stopPropagation(); handleDelete(cliente.id); }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all ml-1 disabled:opacity-50"
                    title="Eliminar Cliente"
                  >
                     {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-slate-500 cursor-pointer pl-2" onClick={() => toggle(cliente.id)}>
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {/* CONTENIDO DESPLEGABLE (TARJETAS DE SIMULACIÓN Y PDF) */}
            {isExpanded && (
              <div className="p-6 border-t border-white/5 bg-slate-950/40">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {totalSimulaciones === 0 ? (
                    <div className="col-span-full py-8 text-center text-slate-600 text-sm italic">
                      Expediente abierto, pero sin simulaciones almacenadas.
                    </div>
                  ) : (
                    cliente.simulaciones.map((sim: any) => {
                      // Casting del JSONB devuelto por la Base de Datos
                      const inputs = sim.inputsJson as EntradaSimulacion;
                      const outputs = sim.resultsJson as ResultadoSimulacion;
                      
                      return (
                        <div key={sim.id} className="group p-5 border border-white/5 bg-slate-900/60 hover:bg-slate-800/90 rounded-3xl transition-all duration-300 hover:border-teal-500/30 flex flex-col justify-between">
                           
                           {/* Tarjeta Sim. Header */}
                           <div className="flex justify-between items-start mb-6">
                              <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5 transition-colors group-hover:text-indigo-300">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(sim.createdAt).toLocaleDateString('es-CL')}
                              </span>
                              
                              {/* BOTrÓN DEL MÓDULO GENERADOR DE PDF */}
                              <GeneradorPDF 
                                clienteNombre={cliente.nombreCompleto} 
                                clienteRut={cliente.rut || 'N/A'} 
                                simulacion={sim} 
                              />

                           </div>

                           {/* Tarjeta Sim. Body */}
                           <div className="space-y-6 flex-1">
                             
                             <div className="flex items-end justify-between group-hover:transform group-hover:-translate-y-1 transition-transform">
                               <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-teal-500" />
                                  Pensión Vital
                               </p>
                               <p className="text-2xl font-extrabold text-white tracking-tighter border-b border-transparent group-hover:border-teal-500/50 transition-colors pb-0.5">
                                 {outputs?.pensionMensualEstimada?.toFixed(2)} <span className="text-sm font-normal text-slate-500">UF</span>
                               </p>
                             </div>

                             <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-white/5 shadow-inner">
                               <div>
                                 <span className="block text-slate-500 mb-1.5 uppercase font-medium tracking-wider text-[10px]">Edad Act.</span>
                                 <span className="text-slate-200 font-mono text-sm">{inputs?.edadActual} años</span>
                               </div>
                               <div>
                                 <span className="block text-slate-500 mb-1.5 uppercase font-medium tracking-wider text-[10px]">Rent. Mercado</span>
                                 <span className="text-teal-300 font-mono text-sm">{(inputs?.rentabilidadEsperada * 100).toFixed(1)}%</span>
                               </div>
                               <div className="col-span-2 mt-2 pt-3 border-t border-slate-800">
                                 <span className="block text-slate-500 mb-1.5 uppercase font-medium tracking-wider text-[10px]">Saldo Usado</span>
                                 <span className="text-indigo-300 font-mono text-sm">{inputs?.saldoAcumulado} UF</span>
                               </div>
                             </div>
                           </div>

                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

          </div>
        )
      })}
      
      {/* MODAL DE EDICIÓN FLOTANTE */}
      {editingClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form 
            action={async (formData) => {
              startTransition(async () => {
                try {
                  const res = await editarCliente(editingClient.id, formData);
                  if (res?.error) throw new Error(res.error);
                  
                  setEditingClient(null);
                  toast.success('Nombre y RUT modificados exitosamente');
                } catch (e: any) {
                  toast.error(e.message || 'Error de escritura');
                }
              })
            }}
            className="w-full max-w-md bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-2xl relative"
          >
            <button type="button" onClick={() => setEditingClient(null)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <Edit2 className="text-indigo-400 w-5 h-5"/>
               Editar Expediente
            </h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-sm font-medium text-slate-400 block mb-1">Nombre Completo <span className="text-rose-500">*</span></label>
                <input type="text" name="nombreCompleto" required defaultValue={editingClient.nombreCompleto} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-teal-500/50" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 block mb-1">RUT (Inmutable)</label>
                <input type="text" name="rut" disabled readOnly defaultValue={editingClient.rut || 'Sin RUT asignado'} className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed italic shadow-inner outline-none" title="Por motivos de seguridad normativa el RUT no puede ser alterado tras la creación de la identidad" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" onClick={() => setEditingClient(null)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white bg-white/5 transition-colors font-medium">Cancelar</button>
              <button type="submit" disabled={isPending} className="px-6 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]">
                {isPending ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Actualizar'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
