import { Metadata } from 'next';
import { AppOptions } from '@igrp/wf-engine';
import { unstable_cache as nextCache } from 'next/cache';
import WorkspaceListClientContent from "./WorkspaceListClientContent";
import * as studioMgr from '@/igrpwfstudio/utils/workspaceManager';
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import Breadcrumb from "@/components/ui/breadcrumb"; // Importar Breadcrumb
// AppSidebar e SiteHeader não são importados aqui, pois devem ser parte do layout.tsx global ou Dashboard layout wrapper
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Workspaces - IGRP Workflow Studio', // Título atualizado
  description: 'Manage your workflow workspaces.',
};

const getWorkspacesDataCached = nextCache(
  async (): Promise<{ workspaces: AppOptions[]; error: string | null }> => { // Tipo de retorno mais específico
    console.log("[app/workspaces/page.tsx] Cache Miss: Recalculando getWorkspacesDataCached com studioMgr");
    try {
      const appOptionsList: AppOptions[] = await studioMgr.listStudioWorkspaces();
      return { workspaces: appOptionsList, error: null };
    } catch (err) {
      console.error("[app/workspaces/page.tsx] Error fetching workspaces list (cached):", err);
      return {
        workspaces: [],
        error: (err instanceof Error ? err.message : String(err)) // Garante que error é string
      };
    }
  },
  ['workspaces-list-data-v2'], // Chave de cache atualizada para evitar conflitos
  { tags: ['workspaces'] }
);

export default async function WorkspacesPage() {
  const { workspaces, error } = await getWorkspacesDataCached();

  // Largura da sidebar como no Dashboard, para consistência de layout
  // Esta variável pode vir de um contexto ou config global no futuro
  const sidebarWidth = "calc(var(--spacing) * 72)";

  return (
    // Envolver com SidebarProvider se esta página for renderizada SEM um layout que já o tenha.
    // Se layout.tsx já tem SidebarProvider, este pode ser redundante ou causar aninhamento.
    // Por ora, vamos assumir que é necessário aqui para replicar o Dashboard.
    <SidebarProvider
      style={
        {
          "--sidebar-width": sidebarWidth, // Usado pelo SidebarInset e AppSidebar
          "--header-height": "calc(var(--spacing) * 14)", // Consistente com Dashboard
        } as React.CSSProperties
      }
    >
      {/*
        Assumindo que AppSidebar é renderizado pelo layout.tsx global ou um componente de layout pai.
        Se não, precisaria ser incluído aqui como no DashboardPage:
        <AppSidebar variant="inset" className="hidden lg:block fixed h-full z-30" />
      */}

      {/* Container de conteúdo principal com padding-left para a sidebar */}
      {/* Se AppSidebar não for fixo/global, o padding pode não ser necessário ou ser tratado de outra forma */}
      <div className="w-full lg:pl-[var(--sidebar-width)]"> {/* Aplicar padding apenas em telas grandes onde a sidebar é fixa */}
        <SidebarInset
          className="w-full transition-all duration-200 z-0 overflow-auto"
        >
          {/*
            Assumindo que SiteHeader é renderizado pelo layout.tsx ou um componente de layout pai.
            Se não, precisaria ser incluído aqui:
            <SiteHeader />
          */}
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 @container/main">
            <div className="flex flex-col gap-2 mb-4"> {/* Container para Título e Breadcrumb */}
              <h1 className="text-lg font-semibold md:text-2xl">Workspaces</h1>
              <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Workspaces' }]} />
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Fetching Workspaces</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <WorkspaceListClientContent initialWorkspaces={workspaces || []} initialError={error} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
