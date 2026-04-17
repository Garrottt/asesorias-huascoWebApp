'use client'

import React, { useState, useEffect } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'
import { EntradaSimulacion, ResultadoSimulacion } from '@/core/models/simulacion'

// ============================================================================
// 1. ESTILOS NATIVOS DE PDF (Arquitectura libre de DOM/Tailwind)
// Usamos directivas exactas para evitar fallos de CSS Moderno (como 'oklab')
// ============================================================================
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff'
  },
  header: {
    borderBottom: '2px solid #000000',
    paddingBottom: 20,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  title: {
    fontSize: 24,
    fontWeight: 'black',
    textTransform: 'uppercase'
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
    textTransform: 'uppercase'
  },
  headerRight: {
    textAlign: 'right'
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  date: {
    fontSize: 10,
    color: '#6b7280'
  },
  version: {
    fontSize: 8,
    color: '#9ca3af',
    marginTop: 2
  },
  section: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 5,
    marginBottom: 15,
    textTransform: 'uppercase'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  col: {
    flex: 1
  },
  label: {
    fontSize: 8,
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  resultBox: {
    marginTop: 40,
    backgroundColor: '#f9fafb',
    borderLeft: '4px solid #000000',
    padding: 30
  },
  resultLabel: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 10
  },
  resultValue: {
    fontSize: 48,
    fontWeight: 'bold'
  },
  resultUnit: {
    fontSize: 20,
    color: '#9ca3af',
    fontWeight: 'normal'
  },
  disclaimer: {
    fontSize: 8,
    color: '#9ca3af',
    marginTop: 30,
    fontStyle: 'italic'
  }
});

// ============================================================================
// 2. ESTRUCTURA DEL DOCUMENTO (JSX Nativo para PDF)
// ============================================================================
const ReportePDF = ({ clienteNombre, clienteRut, simulacion, fecha, inputs, outputs }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Informe Previsional</Text>
          <Text style={styles.subtitle}>Evaluación Confidencial</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.companyName}>AH SaaS</Text>
          <Text style={styles.date}>{fecha}</Text>
          <Text style={styles.version}>v{simulacion.formulaVersion} - {simulacion.id.split('-')[0]}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Identidad del Titular</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Nombre Completo</Text>
            <Text style={styles.value}>{clienteNombre}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Expediente (RUT)</Text>
            <Text style={styles.value}>{clienteRut}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Vectores de Cálculo</Text>
        <View style={styles.row}>
           <View style={styles.col}>
             <Text style={styles.label}>Edad Actual Evaluada</Text>
             <Text style={styles.value}>{inputs?.edadActual} años</Text>
           </View>
           <View style={styles.col}>
             <Text style={styles.label}>Tasa de Rentabilidad Proyectada</Text>
             <Text style={styles.value}>{(inputs?.rentabilidadEsperada * 100).toFixed(1)}% anual</Text>
           </View>
        </View>
        <View style={{...styles.row, marginTop: 15}}>
           <View style={styles.col}>
             <Text style={styles.label}>Saldo Acumulado Destinado</Text>
             <Text style={styles.value}>{inputs?.saldoAcumulado} UF</Text>
           </View>
           <View style={styles.col}>
           </View>
        </View>
      </View>

      <View style={styles.resultBox}>
        <Text style={styles.sectionTitle}>3. Análisis Proyectivo Oficial</Text>
        <Text style={styles.resultLabel}>Pensión Mensual Estimada (Retiro Programado):</Text>
        <Text style={styles.resultValue}>
          {outputs?.pensionMensualEstimada?.toFixed(2)} <Text style={styles.resultUnit}>UF</Text>
        </Text>
        <Text style={styles.disclaimer}>
          Este documento representa una estimación matemática simulada y no constituye una obligación ni garantía legal por parte de la Institución Previsional correspondiente ni del analista a cargo.
        </Text>
      </View>

    </Page>
  </Document>
);


// ============================================================================
// 3. COMPONENTE REACT DE MONTAJE E INTERFAZ (BOTÓN)
// ============================================================================
interface GeneradorPDFProps {
  clienteNombre: string;
  clienteRut: string;
  simulacion: any;
}

export function GeneradorPDF({ clienteNombre, clienteRut, simulacion }: GeneradorPDFProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Truco para evitar problemas de Hydration SSR vs Client con el motor React-PDF
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const inputs = simulacion.inputsJson as EntradaSimulacion;
  const outputs = simulacion.resultsJson as ResultadoSimulacion;
  const fecha = new Date(simulacion.createdAt).toLocaleDateString('es-CL');
  const filename = `Expediente_${clienteRut.replace(/[^a-zA-Z0-9]/g, '')}_${fecha}.pdf`;

  if(!isMounted) {
     return (
        <button disabled className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-300/50 rounded-lg text-xs font-bold uppercase tracking-wider border border-indigo-500/10 shadow-sm">
           <Loader2 className="w-3.5 h-3.5 animate-spin"/> INIT
        </button>
     )
  }

  return (
    <PDFDownloadLink
      document={<ReportePDF clienteNombre={clienteNombre} clienteRut={clienteRut} simulacion={simulacion} fecha={fecha} inputs={inputs} outputs={outputs} />}
      fileName={filename}
      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-indigo-500/20 shadow-sm"
    >
      {({ blob, url, loading, error }) => (
        loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> PROCESANDO
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" /> PDF
          </>
        )
      )}
    </PDFDownloadLink>
  )
}
