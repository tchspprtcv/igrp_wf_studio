"use client";

// import type { Metadata } from 'next'; // Metadata não é mais necessária aqui se estática ou movida
import './globals.css';
import React, { useEffect } from "react"; // useState e usePathname removidos
import { Toaster } from 'react-hot-toast';
// Sidebar, Panel, PanelGroup, PanelResizeHandle, usePathname removidos
// cn pode ser necessário se houver classes condicionais restantes, mas provavelmente não.
// import { cn } from "@/lib/utils";


// Removidas constantes relacionadas à Sidebar
// const COLLAPSED_SIZE_PERCENT = 4;
// const DEFAULT_EXPANDED_SIZE_PERCENT = 16;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Removidos todos os estados e handlers da Sidebar:
  // pathname, isOffCanvasOpen, isSidebarCollapsed, sidebarPanelSize
  // toggleMobileMenu, closeMobileMenu, toggleSidebarCollapse, handleLayout

  // Efeito para metadados pode permanecer se necessário para o título global
  useEffect(() => {
    document.title = 'IGRP Workflow Studio';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Modern Workflow Studio built with Next.js');
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = 'Modern Workflow Studio built with Next.js';
      document.head.appendChild(newMeta);
    }
  }, []);

  return (
    <html lang="en">
      <body>
        {/* O div flex root agora só contém o Toaster e o conteúdo principal */}
        <div className="min-h-screen bg-background flex flex-col"> {/* Removido 'relative', ajustado para flex-col */}
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: { background: '#363636', color: '#fff' }, // Manter estilo do Toaster ou ajustar para tema
            success: { duration: 3000, style: { background: 'green', color: '#fff' } },
            error: { duration: 4000, style: { background: 'red', color: '#fff' } },
          }} />

          {/*
            Removido:
            - Overlay do off-canvas
            - PanelGroup da Sidebar Desktop
            - Div da Sidebar Off-canvas Mobile
            - Div do conteúdo principal mobile (com header mobile)
          */}

          {/* Conteúdo Principal Unificado para todas as telas */}
          {/* O PanelGroup e a lógica de sidebar foram removidos. */}
          {/* O conteúdo agora ocupa o espaço total disponível, centralizado por mx-auto e limitado por max-w-7xl */}
          <main className="flex-1 overflow-y-auto"> {/* Adicionado overflow-y-auto aqui se necessário */}
            {/* mx-auto para centralizar, max-w-7xl para limitar largura, paddings para espaçamento interno */}
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
