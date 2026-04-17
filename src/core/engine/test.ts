import { calcularRetiroProgramado } from './calculadora';
import { EntradaSimulacion, esquemaEntradaSimulacion } from '../models/simulacion';

// 1. Definimos los datos de prueba simulando la entrada de un usuario en producción
const dataPrueba = {
  edadActual: 65,
  genero: "masculino", // Cambia esto a "alien" o "hombre" y verás cómo el script falla en la Fase 1
  saldoAcumulado: 5000, // UF ahorradas
  rentabilidadEsperada: 0.04 // 4% de rentabilidad anual
};

console.log("==================================================");
console.log("🛠️  INICIANDO TEST: MOTOR MATEMÁTICO PREVISIONAL");
console.log("==================================================\n");

// FASE 1: Zod en Acción. Validamos la data estructurada
console.log("[1/2] Verificando datos de entrada con Zod...");
const validacion = esquemaEntradaSimulacion.safeParse(dataPrueba);

if (!validacion.success) {
  console.log("❌ FALLA DE VALIDACIÓN:");
  console.log(validacion.error.format());
} else {
  console.log("✅ Datos Verificados. Listos para inyectarlos en nuestra función pura.\n");
  
  // Extraemos la información que ahora sí sabemos al 100% que cumple la forma correcta
  const entrada: EntradaSimulacion = validacion.data;
  
  // FASE 2: Función Pura en Acción
  console.log("[2/2] Calculando Pensión de Retiro Programado...");
  const resultado = calcularRetiroProgramado(entrada);
  
  console.log("\n📊 RESULTADOS OBTENIDOS:");
  console.log(`- Pensión Estimada Mínima: ${resultado.pensionMensualEstimada.toFixed(2)} UF / mes`);
  console.log(`- Edad de agotamiento del fondo asegurado: ${resultado.edadAgotamientoFondo} años\n`);
  
  console.log("📉 HISTORIAL DEL SALDO (Hitos cada 5 años):");
  resultado.saldoRestantePorAnio.forEach((saldo, index) => {
    const edadAtAño = entrada.edadActual + index;
    // Imprimimos la situación solo cada 5 años o cuando el saldo toca 0 para no llenar la consola
    if (index % 5 === 0 || saldo <= 0) {
      console.log(`   -> A los ${edadAtAño} años: Quedan ${Math.max(0, saldo).toFixed(2)} UF`);
    }
  });

  console.log("\n🚀 TEST FINALIZADO CON ÉXITO.\n");
}
