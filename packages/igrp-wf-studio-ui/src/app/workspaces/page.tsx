import { Metadata } from 'next';
// import { WorkflowEngineSDK, AppOptions } from '@igrp/wf-engine'; // SDK direto não mais usado para listar
import { AppOptions } from '@igrp/wf-engine'; // AppOptions ainda é útil como tipo
import { unstable_cache as nextCache } from 'next/cache';
import PageHeader from "@/components/layout/PageHeader";
import WorkspaceListClientContent from "./WorkspaceListClientContent"; // Assumindo que este é o caminho correto
import * as studioMgr from '@/igrpwfstudio/utils/workspaceManager'; // Nosso gerenciador

// const sdk = new WorkflowEngineSDK(); // REMOVIDO

export const metadata: Metadata = {
  title: 'Workflow Workspaces - IGRP Workflow Studio',
  description: 'Manage your workflow workspaces.',
};

const getWorkspacesDataCached = nextCache(
  async () => {
    console.log("Cache Miss: Recalculando getWorkspacesDataCached com studioMgr");
    try {
      // const workspaces = await sdk.workspaces.listWorkspaces(); // Lógica antiga
      const workspaces = await studioMgr.listStudioWorkspaces(); // Nova lógica baseada no catálogo
      return { workspaces, error: null };
    } catch (err) {
      console.error("Error fetching workspaces list via studioMgr (cached):", err);
      return { workspaces: [], error: (err as Error).message };
    }
  },
  ['workspaces-list-data'],
  { tags: ['workspaces'] }
);

export default async function WorkspacesPage() {
  const { workspaces, error } = await getWorkspacesDataCached();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Workflow Workspaces"
        description="Manage your workflow workspaces"
        // onCreateNew e createNewLabel serão gerenciados pelo Client Component
      />

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <WorkspaceListClientContent initialWorkspaces={workspaces} />
    </div>
  );
}
