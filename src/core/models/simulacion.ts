import { z } from 'zod';

/**
 * Zod es una librería de validación. 
 * TypeScript solo funciona mientras el programador escribe el código. 
 * Una vez que esto se compila a JavaScript para el navegador, TypeScript "desaparece".
 * 
 * Por ende, si un usuario astuto manda texto en lugar de números desde el formulario,
 * JavaScript intentará sumarlo fallando y provocando errores ("NaN").
 * 
 * ¿Por qué usamos Zod? 
 * Porque Zod valida los datos *mientras corre la app*. Si el dato es incorrecto, falla
 * de inmediato evitando que nuestro motor explote.
 */

export const esquemaEntradaSimulacion = z.object({
  edadActual: z.number().min(18, "La edad mínima es 18 años").max(100, "La edad máxima es 100 años"),
  // Note: z.enum obliga a que sea exactamente un string de la lista permitida.
  genero: z.enum(["masculino", "femenino"] as const, {
    message: "El género es requerido",
  }),
  saldoAcumulado: z.number().min(0, "El saldo no puede ser negativo"),
  rentabilidadEsperada: z.number().min(0).max(0.15), // Ejemplo: 0.05 para representar un 5%
});

// 📌 ¡Magia!: No escribimos la "Interface" a mano. 
// Zod infiere automáticamente el tipo TypeScript a partir del esquema anterior.
export type EntradaSimulacion = z.infer<typeof esquemaEntradaSimulacion>;

// La interfaz de salida sí la definimos con TypeScript puro, ya que la generamos internamente.
export interface ResultadoSimulacion {
  pensionMensualEstimada: number;
  saldoRestantePorAnio: number[]; // Arreglo que guardará cómo va disminuyendo el saldo año a año
  edadAgotamientoFondo: number;
}
