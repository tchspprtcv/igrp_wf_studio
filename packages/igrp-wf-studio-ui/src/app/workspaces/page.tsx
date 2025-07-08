import { Metadata } from 'next';
import { AppOptions } from '@igrp/wf-engine';
import { unstable_cache as nextCache } from 'next/cache';
import WorkspaceListClientContent from "./WorkspaceListClientContent";
import * as studioMgr from '@/igrpwfstudio/utils/workspaceManager';
// SidebarProvider e SidebarInset removidos, pois o layout global cuida disso
import Breadcrumb from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Workspaces - IGRP Workflow Studio',
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

  // Similar ao DashboardPage, esta página agora renderiza diretamente seu conteúdo,
  // confiando no layout.tsx para a sidebar e padding principal.
  return (
    <div className="flex flex-col gap-6"> {/* Container principal com espaçamento */}
      {/* Container para Título e Breadcrumb */}
      <div className="flex flex-col gap-1"> {/* Espaçamento interno menor */}
        <h1 className="text-2xl font-semibold md:text-3xl">Workspaces</h1> {/* Consistência de título com Dashboard */}
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Workspaces' }]} />
      </div>

      {error && (
        // mb-4 removido do Alert, o gap-6 do container pai já cuida do espaçamento
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Workspaces</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* WorkspaceListClientContent renderizado diretamente */}
      <div> {/* Div wrapper para manter o fluxo, caso precise de margens/estilos específicos no futuro */}
        <WorkspaceListClientContent initialWorkspaces={workspaces || []} initialError={error} />
      </div>
    </div>
  );
}
