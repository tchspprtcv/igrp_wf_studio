"use client";

// import type { Metadata } from 'next';
import './globals.css';
import React, { useEffect } from "react";
import { usePathname } from 'next/navigation'; // Reintroduzido
import { Toaster } from 'react-hot-toast';
import { cn } from "@/lib/utils"; // Reintroduzido


// Removidas constantes relacionadas à Sidebar
// const COLLAPSED_SIZE_PERCENT = 4;
// const DEFAULT_EXPANDED_SIZE_PERCENT = 16;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Expressão regular para identificar a rota do editor BPMN: /workspaces/qualquerCoisa/processes/qualquerCoisa
  const bpmnEditorRegex = /^\/workspaces\/[^/]+\/processes\/[^/]+$/;
  const isBpmnEditorPage = bpmnEditorRegex.test(pathname);

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
          <main className="flex-1 overflow-y-auto">
            <div className={cn(
              "mx-auto px-4 py-6 sm:px-6 lg:px-8", // Classes base de padding e centralização
              !isBpmnEditorPage && "max-w-7xl"   // Aplica max-w-7xl apenas se NÃO for a página do editor BPMN
            )}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
