"use client"; // Marcar como Client Component devido aos hooks e interatividade

import type { Metadata } from 'next'; // Metadata pode não ser exportável de Client Components no RootLayout diretamente. Veremos.
import './globals.css';
// import { Outlet } from "react-router-dom"; // Não é mais usado, substituído por children
import React, { useState, useEffect } from "react";
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
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // const [sidebarSize, setSidebarSize] = useState(DEFAULT_EXPANDED_SIZE_PERCENT); // Não usado diretamente no <Panel size={...}>

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
    // Lógica de onLayout, se necessária
    // console.log("Panel sizes:", sizes);
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

          <div className="hidden lg:flex h-screen"> {/* PanelGroup para telas grandes */}
            <PanelGroup direction="horizontal" onLayout={handleLayout}>
              <Panel
                defaultSize={DEFAULT_EXPANDED_SIZE_PERCENT}
                minSize={COLLAPSED_SIZE_PERCENT}
                maxSize={50}
                collapsible={true}
                collapsedSize={COLLAPSED_SIZE_PERCENT} // Explicitly set collapsed size percentage
                onCollapse={() => setIsSidebarCollapsed(true)}
                onExpand={() => setIsSidebarCollapsed(false)}
                order={1}
                className={cn("transition-all duration-300 ease-in-out")}
                // isCollapsed prop não existe em <Panel>, o estado é gerenciado internamente ou via onCollapse/onExpand
              >
                <Sidebar
                  isMobileOpen={false}
                  onCloseMobile={closeMobileMenu}
                  isCollapsed={isSidebarCollapsed}
                  onToggleCollapse={toggleSidebarCollapse}
                />
              </Panel>
              <PanelResizeHandle className={cn(
                "w-1 bg-gray-300 hover:bg-primary-500 transition-colors duration-200",
                // Não ocultar o handle quando colapsado se quisermos permitir expansão arrastando de um handle fino.
                // Ou, se o painel colapsa para 0 ou um tamanho muito pequeno, o handle pode ser condicionalmente renderizado/estilizado.
                // A biblioteca react-resizable-panels pode lidar com isso automaticamente.
                // Se isSidebarCollapsed for usado para esconder o handle, certifique-se que haja outra forma de expandir.
                // A propriedade `collapsible` no Panel já deve cuidar da UI de colapso/expansão.
              )} />
            </PanelGroup>
          </div>

          <div className={cn( // Off-canvas para telas pequenas
            "fixed top-0 left-0 z-40 h-screen transition-transform lg:hidden",
            isOffCanvasOpen ? "translate-x-0" : "-translate-x-full",
            "bg-white w-64 shadow-lg border-r border-gray-200"
          )}>
            <Sidebar
              isMobileOpen={isOffCanvasOpen}
              onCloseMobile={closeMobileMenu}
              isCollapsed={false}
              onToggleCollapse={() => {}} // Não relevante para off-canvas
            />
          </div>

          <div className="flex flex-col flex-1 min-h-screen lg:ml-0"> {/* Conteúdo Principal */}
            {/* Idealmente, um componente Header separado e interativo (Client Component) iria aqui */}
            {/* Exemplo: <Header onMobileMenuClick={toggleMobileMenu} /> */}
            {/* Por agora, vamos simular um espaço para o header ou um header simples */}
            <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:hidden">
              <button onClick={toggleMobileMenu} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              </button>
              <span className="text-lg font-semibold">IGRP WF Studio</span>
            </div>
            <main className="flex-1 overflow-y-auto">
              {/* O <Outlet /> do react-router-dom é substituído por {children} */}
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
