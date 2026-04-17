import { EntradaSimulacion, ResultadoSimulacion } from '../models/simulacion';
import { PARAMETROS_PREVISIONALES } from '../constants/parametros';

/**
 * 🎓 FUNCIÓN PURA: "calcularRetiroProgramado"
 * 
 * Reglas de una Función Pura (Arquitectura de Software):
 * 1. Mismos inputs SIEMPRE dan exactamente el mismo output.
 * 2. NO modifica variables externas ni llama a bases de datos ni APIs.
 * 
 * ¿Por qué es tan importante esto?
 * Porque te permite crear Pruebas Unitarias ultrarrápidas y asegurar que la 
 * matemática nunca falla sin importar si la interfaz es react o vue o una app móvil.
 */
export function calcularRetiroProgramado(entrada: EntradaSimulacion): ResultadoSimulacion {
  // 1. Destructurar input para uso más limpio de variables
  const { edadActual, genero, saldoAcumulado, rentabilidadEsperada } = entrada;

  // 2. Lógica de negocio (Años esperados de pensión según nuestro archivo de constantes)
  const expectativaVida = genero === 'masculino' 
    ? PARAMETROS_PREVISIONALES.EXPECTATIVA_VIDA_HOMBRE 
    : PARAMETROS_PREVISIONALES.EXPECTATIVA_VIDA_MUJER;

  const aniosSobrevivencia = expectativaVida - edadActual;
  
  // Condición extrema de negocio: Si la persona ya superó la esperanza de vida, 
  // le calcularemos su fondo proyectando al menos 5 años hacia adelante para sobrevivir.
  const aniosCalculo = aniosSobrevivencia > 0 ? aniosSobrevivencia : 5;

  // 3. Matemática Financiera Oficial
  // La PENSIÓN INICIAL por ley usa la Tasa de Interés Técnica (TITRP), no lo que pase en el mercado.
  const tasaTecnicaLegal = PARAMETROS_PREVISIONALES.TASA_INTERES_TECNICA;
  let pensionMensualEstimada = 0;

  if (tasaTecnicaLegal === 0) {
    pensionMensualEstimada = (saldoAcumulado / aniosCalculo) / 12;
  } else {
    const pagoAnual = (saldoAcumulado * tasaTecnicaLegal) / (1 - Math.pow(1 + tasaTecnicaLegal, -aniosCalculo));
    pensionMensualEstimada = pagoAnual / 12;
  }

  // 4. Simulamos el mundo real año a año (Aquí SÍ aplica la rentabilidad que movemos en la UI)
  let saldoActualIteracion = saldoAcumulado;
  const saldoRestantePorAnio: number[] = [];
  let edadAgotamientoFondo = 0; 
  const maxEdadSimulacion = 110; // Proyectamos hasta los 110 años

  for (let edad = edadActual; edad <= maxEdadSimulacion; edad++) {
    saldoRestantePorAnio.push(Math.max(0, saldoActualIteracion));
    
    // Rentabilidad real de este año según el fondo del mercado (nuestro slider)
    saldoActualIteracion = saldoActualIteracion * (1 + rentabilidadEsperada);
    // Le restamos la pensión fija que calculó la AFP en el paso 3
    saldoActualIteracion = saldoActualIteracion - (pensionMensualEstimada * 12);

    // Guardamos a qué edad se agotó la plata (solo el primer año que cruza a 0 o negativo)
    if (saldoActualIteracion <= 0 && edadAgotamientoFondo === 0) {
        edadAgotamientoFondo = edad;
    }
  }

  // Si llega a 110 y aún tiene plata, topamos el indicador
  if (edadAgotamientoFondo === 0) edadAgotamientoFondo = maxEdadSimulacion;

  // 5. Devolvemos el objeto modelado bajo la Interface ResultadoSimulacion
  return {
    pensionMensualEstimada,
    saldoRestantePorAnio,
    edadAgotamientoFondo
  };
}
