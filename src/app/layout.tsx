import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simulador de Pensiones | SaaS",
  description: "Plataforma Premium de Análisis Previsional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1">
            {children}
        </div>
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
