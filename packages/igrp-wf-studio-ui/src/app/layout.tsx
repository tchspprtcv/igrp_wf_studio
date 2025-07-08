"use client"; // Marcar como Client Component devido aos hooks e interatividade

import type { Metadata } from 'next'; // Metadata pode não ser exportável de Client Components no RootLayout diretamente. Veremos.
import './globals.css';
// import { Outlet } from "react-router-dom"; // Não é mais usado, substituído por children
import React, { useState, useEffect } from "react";
import { usePathname } from 'next/navigation'; // Import usePathname
import Sidebar from "@/components/layout/Sidebar"; // Assumindo que Sidebar será migrado/adaptado
// import Header from "./Header"; // Header continua comentado
import { Toaster } from 'react-hot-toast';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { cn } from "@/lib/utils";

// Metadata estática pode ser definida aqui, mas para dinâmica, precisaria de generateMetadata em um Server Component pai se possível.
// Para o RootLayout cliente, a configuração de metadados pode precisar de ajustes (ex: no <head> diretamente ou via useEffect).
// export const metadata: Metadata = { // Esta exportação pode não funcionar como esperado em um client component raiz.
//   title: 'IGRP Workflow Studio',
//   description: 'Modern Workflow Studio built with Next.js',
// };

const COLLAPSED_SIZE_PERCENT = 4;
const DEFAULT_EXPANDED_SIZE_PERCENT = 16;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Pathname é usado para lógica de menu ativo na Sidebar, etc.

  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarPanelSize, setSidebarPanelSize] = useState(DEFAULT_EXPANDED_SIZE_PERCENT);

  const toggleMobileMenu = () => {
    setIsOffCanvasOpen(!isOffCanvasOpen);
  };

  const closeMobileMenu = () => {
    setIsOffCanvasOpen(false);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLayout = (sizes: number[]) => {
    // sizes[0] será o tamanho do painel da sidebar
    if (sizes.length > 0) {
      setSidebarPanelSize(sizes[0]);
      // Determinar se está colapsado com base no tamanho vs COLLAPSED_SIZE_PERCENT
      // Isso pode precisar de ajuste fino dependendo de como react-resizable-panels reporta o tamanho durante o colapso
      setIsSidebarCollapsed(sizes[0] <= COLLAPSED_SIZE_PERCENT + 1); // Adicionar uma pequena margem para comparação
    }
  };

  // Efeito para adicionar metadados dinamicamente se necessário, já que export const metadata pode não funcionar em client root layout.
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
        <div className="min-h-screen bg-gray-50 flex relative">
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: { background: '#363636', color: '#fff' },
            success: { duration: 3000, style: { background: 'green', color: '#fff' } },
            error: { duration: 4000, style: { background: 'red', color: '#fff' } },
          }} />

          {isOffCanvasOpen && (
            <div
              className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden"
              onClick={closeMobileMenu}
            />
          )}

          {/* Sidebar para telas grandes (Desktop) - Agora é sempre renderizado */}
          <div className="hidden lg:flex h-screen">
            <PanelGroup direction="horizontal" onLayout={handleLayout}>
              <Panel
                defaultSize={DEFAULT_EXPANDED_SIZE_PERCENT}
                minSize={COLLAPSED_SIZE_PERCENT}
                maxSize={30} // Ajustado para um máximo mais razoável
                collapsible={true}
                collapsedSize={COLLAPSED_SIZE_PERCENT}
                onCollapse={() => setIsSidebarCollapsed(true)}
                onExpand={() => setIsSidebarCollapsed(false)}
                order={1}
                className={cn(
                  "bg-background transition-all duration-300 ease-in-out", // Adicionado bg-background
                  // Adicionar overflow hidden se o conteúdo da sidebar puder exceder
                )}
                // O estado isSidebarCollapsed é agora atualizado via onLayout e onCollapse/onExpand
              >
                <Sidebar
                  isMobileOpen={false} // Nunca é mobile aqui
                  onCloseMobile={closeMobileMenu} // Passar, embora não usado diretamente
                  isCollapsed={isSidebarCollapsed}
                  onToggleCollapse={toggleSidebarCollapse}
                />
              </Panel>
              <PanelResizeHandle className={cn(
                "w-1 bg-border hover:bg-primary transition-colors duration-200",
                // O handle deve permanecer visível para permitir a expansão
              )} />
              <Panel order={2} className="flex-1 flex flex-col overflow-hidden"> {/* Painel de Conteúdo Principal */}
                {/* Header para Mobile (dentro do conteúdo principal para telas pequenas, mas aqui é desktop) */}
                {/* Se houver um header de desktop fixo, ele iria aqui ou acima do PanelGroup */}

                <main className="flex-1 overflow-y-auto">
                  {/* Padding padrão para o conteúdo, pode ser ajustado por página se necessário */}
                  {/* Adicionado max-w-7xl para centralizar o conteúdo com largura máxima */}
                  <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                  </div>
                </main>
              </Panel>
            </PanelGroup>
          </div>

          {/* Sidebar Off-canvas para telas pequenas (Mobile) */}
          <div className={cn(
            "fixed top-0 left-0 z-40 h-screen transition-transform lg:hidden",
            isOffCanvasOpen ? "translate-x-0" : "-translate-x-full",
            "bg-background w-64 shadow-lg border-r border-border" // Usar variáveis de tema
          )}>
            <Sidebar
              isMobileOpen={isOffCanvasOpen}
              onCloseMobile={closeMobileMenu}
              isCollapsed={false} // Off-canvas nunca está 'collapsed' no sentido de ícones apenas
              onToggleCollapse={() => {}} // Não aplicável aqui
            />
          </div>

          {/* Conteúdo Principal para telas pequenas (Mobile) */}
          {/* Este wrapper é para quando a sidebar desktop NÃO está visível (lg:hidden) */}
          <div className="flex flex-col flex-1 min-h-screen lg:hidden">
            {/* Header Mobile */}
            <div className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 bg-background border-b border-border">
              <button onClick={toggleMobileMenu} className="text-muted-foreground hover:text-foreground">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              </button>
              <span className="text-lg font-semibold text-foreground">IGRP WF Studio</span>
              {/* Placeholder para outras ações do header mobile, se houver */}
            </div>
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto px-4 py-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
