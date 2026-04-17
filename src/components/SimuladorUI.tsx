'use client'; // 👈 ¡CRÍTICO! Esto le dice a Next.js que este componente usa estado interactivo (React)

import { useState, useTransition } from 'react';
import { EntradaSimulacion } from '@/core/models/simulacion';
import { calcularRetiroProgramado } from '@/core/engine/calculadora';
import { Calculator, DollarSign, User, Activity, TrendingUp, AlertCircle, Save, Plus, X, Loader2 } from 'lucide-react';
import { guardarSimulacion } from '@/app/actions/simulacion';
import { crearNuevoCliente } from '@/app/actions/clientes';
import { toast } from 'sonner';

interface ClienteBasico {
  id: string;
  nombreCompleto: string;
  rut: string | null;
}

interface SimuladorUIProps {
  clientes: ClienteBasico[];
}

export default function SimuladorUI({ clientes }: SimuladorUIProps) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<string>(clientes.length > 0 ? clientes[0].id : '');
  const [isSavingCliente, setIsSavingCliente] = useState(false);

  // 1. EL ESTADO INTERNO: Guardamos lo que el usuario digita como TEXTO
  // Esto previene errores de "ceros iniciales que no se borran" o que React no nos deje
  // presionar Backspace cuando el valor es 0.
  const [formData, setFormData] = useState({
    edadActual: "65",
    genero: "masculino" as "masculino" | "femenino",
    saldoAcumulado: "5000",
    rentabilidadEsperada: 0.04 // Este sigue siendo número porque viene del range slider
  });

  // 2. ADAPTADOR: Convertimos el texto temporal a los números estrictos
  // que nuestra función matemática (y Zod en el futuro) requieren.
  const entradaSegura: EntradaSimulacion = {
    edadActual: Number(formData.edadActual) || 0,
    genero: formData.genero,
    saldoAcumulado: Number(formData.saldoAcumulado) || 0,
    rentabilidadEsperada: formData.rentabilidadEsperada
  };

  const resultado = calcularRetiroProgramado(entradaSegura);

  // 3. EL MANEJADOR DE EVENTOS: Añadimos validaciones en vivo para UX perfecto
  const handleCambio = (campo: keyof typeof formData, valor: string | number) => {
    if (typeof valor === 'string') {
      // Bloqueo duro: No puedes escribir un guion (negativo)
      if (valor.includes('-')) return;

      // Bloquear ceros extra de formato (e.g. si escribes "030", lo transformamos a "30")
      if (valor.length > 1 && valor.startsWith('0') && !valor.startsWith('0.')) {
        valor = valor.replace(/^0+/, '') || '0';
      }
    }
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-100 p-4 md:p-8 font-sans relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

        {/* CABECERA CON CRM */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 ring-1 ring-white/10 rounded-xl backdrop-blur-md">
              <Calculator className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">
                Calculadora Previsional
              </h1>
              <p className="text-slate-400 text-sm mt-1">Motor Reactivo de cálculo simulado</p>
            </div>
          </div>

          {/* Selector de Cliente */}
          <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-2xl border border-white/10 shadow-inner">
            <div className="relative">
              <select
                value={selectedClienteId}
                onChange={e => setSelectedClienteId(e.target.value)}
                className="bg-transparent text-slate-200 outline-none font-medium pl-3 pr-8 py-2 appearance-none cursor-pointer text-sm w-[200px] md:w-[250px] border border-transparent hover:border-white/5 rounded-xl transition-colors"
              >
                {clientes.length === 0 && <option value="" disabled className="bg-slate-900">No hay clientes...</option>}
                {clientes.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.nombreCompleto}</option>)}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center px-1 text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 transition-all hover:bg-teal-500/20 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center shrink-0 border border-teal-500/20 shadow-sm"
              title="Nuevo Cliente"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* =======================
              COLUMNA 1: FORMULARIO
             ======================= */}
          <div className="col-span-1 border border-white/10 bg-slate-900/90 rounded-3xl p-6 shadow-2xl flex flex-col space-y-6 relative overflow-hidden z-10">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <User className="text-indigo-400 w-5 h-5" />
              <span>Parámetros del Cliente</span>
            </h2>

            <div className="space-y-5">

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Edad Actual</label>
                <div className="flex bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-teal-500/50 transition-all">
                  <input
                    type="number"
                    min="0"
                    value={formData.edadActual}
                    onChange={(e) => handleCambio('edadActual', e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-slate-100 placeholder:text-slate-600"
                  />
                  <span className="text-slate-500 font-medium">años</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Género Registrado</label>
                <div className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-teal-500/50 transition-all relative">
                  <select
                    value={formData.genero}
                    onChange={(e) => handleCambio('genero', e.target.value)}
                    className="w-full bg-transparent text-slate-100 outline-none appearance-none cursor-pointer"
                  >
                    <option value="masculino" className="bg-slate-900">Masculino</option>
                    <option value="femenino" className="bg-slate-900">Femenino</option>
                  </select>
                  {/* Flechita costumizada para el select porque la ocultamos con appearance-none */}
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center px-1 text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Saldo en la Cuenta AFP</label>
                <div className="flex bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-teal-500/50 transition-all group">
                  <DollarSign className="text-slate-500 group-focus-within:text-teal-400 transition-colors w-5 h-5 mr-2" />
                  <input
                    type="number"
                    min="0"
                    value={formData.saldoAcumulado}
                    onChange={(e) => handleCambio('saldoAcumulado', e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-slate-100 text-lg font-medium"
                  />
                  <span className="text-slate-500 font-bold ml-2">UF</span>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-white/5">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-slate-300 ml-1">Rentabilidad Proyectada</label>
                  <span className="bg-teal-950 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded text-xs font-mono font-bold">
                    {(formData.rentabilidadEsperada * 100).toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0" max="0.15" step="0.005"
                  value={formData.rentabilidadEsperada}
                  onChange={(e) => handleCambio('rentabilidadEsperada', Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>

            </div>
          </div>

          {/* ====================================
              COLUMNA 2 Y 3: RESULTADOS EN VIVO
             ==================================== */}
          <div className="col-span-1 lg:col-span-2 space-y-6">

            {/* WIDGET HERO: La pensión mensual calculada */}
            <div className="bg-gradient-to-br from-teal-500/10 via-slate-900/80 to-slate-950 border border-teal-500/20 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-teal-400/40 transition-all duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left z-10">
                  <p className="text-teal-400 font-bold tracking-widest text-sm flex justify-center md:justify-start items-center gap-2 uppercase">
                    <TrendingUp className="w-5 h-5" /> Pensión Mensual Garantizada
                  </p>
                  <h3 className="text-6xl md:text-7xl font-extrabold text-white tracking-tighter drop-shadow-sm">
                    {resultado.pensionMensualEstimada.toFixed(2)}
                    <span className="text-2xl text-slate-500 font-medium tracking-normal ml-3">UF</span>
                  </h3>
                </div>

                {/* Tarjeta interna indicadora de agotamiento */}
                <div className="flex flex-col items-center justify-center bg-slate-950/80 rounded-2xl p-6 border border-white/5 ring-1 ring-inset ring-white/5 w-full md:w-auto h-full z-10 shadow-inner">
                  <Activity className="w-8 h-8 text-indigo-400 mb-3 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                  <span className="text-xs text-slate-400 text-center uppercase tracking-wider mb-1">Agotamiento de Fondo</span>
                  <span className="text-4xl font-black text-slate-100">{resultado.edadAgotamientoFondo} <span className="text-lg font-medium text-slate-500 ml-1">años</span></span>
                </div>
              </div>
            </div>

            {/* TABLAS SECUNDARIAS DE CONTEXTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Tarjeta Explicativa Pedagógica */}
              <div className="border border-white/5 bg-gradient-to-b from-white/5 to-transparent rounded-3xl p-6 relative">
                <h4 className="text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  Análisis en Tiempo Real
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed text-balance">
                  Modifica la <strong className="text-slate-200">rentabilidad esperada</strong> a la izquierda. Verás cómo la cuota mensual sube de inmediato. Sin embargo, un retiro muy agresivo ocasionará que el fondo se agote mucho más joven (fíjate en los años de agotamiento).
                </p>
              </div>

              {/* Minigráfico de amortización histórico */}
              <div className="border border-white/5 bg-slate-900/60 rounded-3xl relative max-h-[220px] overflow-y-auto custom-scrollbar shadow-inner z-10">
                <h4 className="text-slate-300 text-sm font-semibold sticky top-0 bg-slate-900/95 px-6 py-4 z-20 border-b border-zinc-800/80">
                  Línea de Vida (Amortización)
                </h4>
                <div className="space-y-3 mt-2 px-6 pb-6">
                  {resultado.saldoRestantePorAnio.map((saldo, i) => {
                    const edad = entradaSegura.edadActual + i;
                    // Mostramos de a 2 años o si toca el fondo 0 para no saturar la vista
                    if (i % 2 === 0 || saldo <= 0) {
                      return (
                        <div key={edad} className="flex justify-between items-center text-sm group hover:bg-white/5 transition-colors p-1 -mx-1 rounded">
                          <span className="text-slate-400 font-mono">A los {edad} años</span>
                          <div className="flex-1 border-b border-dashed border-white/10 mx-4" />
                          <span className={`font-semibold ${saldo > 0 ? 'text-teal-400' : 'text-rose-500/80 line-through decoration-rose-500/50'}`}>
                            {saldo > 0 ? (
                              <>
                                <span className="text-slate-500 text-xs font-normal mr-1.5 uppercase tracking-wider">Saldo:</span>
                                {saldo.toFixed(0)} <span className="text-xs">UF</span>
                              </>
                            ) : '0 UF'}
                          </span>
                        </div>
                      )
                    }
                    return null;
                  })}
                </div>
              </div>

            </div>

            {/* Server Action Binding: Guardar en Base de Datos */}
            {selectedClienteId && (
              <div className="mt-4 pt-6 border-t border-white/10 flex justify-end w-full">
                <button
                  onClick={() => {
                    startTransition(async () => {
                      try {
                        await guardarSimulacion(selectedClienteId, entradaSegura, resultado);
                        toast.success('Simulación registrada con éxito');
                      } catch (e) {
                        toast.error('Ocurrió un error sincronizando a la nube');
                      }
                    });
                  }}
                  disabled={isPending}
                  className={`w-full md:w-auto uppercase tracking-widest text-xs px-10 py-4 font-bold rounded-xl border transition-all duration-300 flex justify-center items-center gap-3 ${isPending
                    ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed shadow-inner'
                    : 'bg-teal-500 hover:bg-teal-400 text-slate-950 border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_35px_rgba(20,184,166,0.5)] active:scale-95'
                    }`}
                >
                  {isPending ? (
                    <span className="w-5 h-5 border-2 border-slate-600/50 border-t-slate-500 rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Save className="w-5 h-5" /> Guardar Simulación
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* MODAL: Nuevo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            action={async (formData) => {
              setIsSavingCliente(true);
              try {
                const res = await crearNuevoCliente(formData);
                if (res?.error || !res?.clienteId) {
                  throw new Error(res?.error || 'Respuesta inválida del servidor');
                }

                setSelectedClienteId(res.clienteId);
                setIsModalOpen(false);
                toast.success('Cliente creado existosamente');
              } catch (e: any) {
                toast.error(e.message || 'Error guardando');
              } finally {
                setIsSavingCliente(false);
              }
            }}
            className="w-full max-w-md bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-2xl relative"
          >
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Nuevo Cliente</h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-sm font-medium text-slate-400 block mb-1">Nombre Completo <span className="text-rose-500">*</span></label>
                <input type="text" name="nombreCompleto" required className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-teal-500/50" placeholder="Ej: Juan Pérez" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400 block mb-1 flex justify-between items-center">
                  RUT (Obligatorio)
                  <span className="text-xs text-teal-500/70 italic">Debe incluir guión</span>
                </label>
                <input type="text" name="rut" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-teal-500/50" placeholder="Ej: 12345678-9" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white bg-white/5 transition-colors font-medium">Cancelar</button>
              <button type="submit" disabled={isSavingCliente} className="px-6 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]">
                {isSavingCliente ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Estilos locales inyectados de Tailwind para nuestra scrollbar premium */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}
