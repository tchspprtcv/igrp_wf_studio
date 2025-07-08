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
            style: { background: '#363636', color: '#fff' },
            success: { duration: 3000, style: { background: 'green', color: '#fff' } },
            error: { duration: 4000, style: { background: 'red', color: '#fff' } },
          }} />

          <main className="flex-1 overflow-y-auto flex flex-col"> {/* Adicionado flex flex-col */}
            <div className={cn(
              "mx-auto w-full", // w-full para consistência, mx-auto ainda centraliza se max-w for aplicado
              {
                // Estilo para páginas normais (não editor BPMN)
                "max-w-7xl px-4 py-6 sm:px-6 lg:px-8": !isBpmnEditorPage,
                // Estilo para editor BPMN: altura total, sem padding do layout para que o editor controle 100%
                "flex-1 flex flex-col px-0 py-0 sm:px-0 lg:px-0": isBpmnEditorPage,
              }
            )}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
