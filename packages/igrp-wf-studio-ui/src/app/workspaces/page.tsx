import { Metadata } from 'next';
import { WorkflowEngineSDK, AppOptions } from '@igrp/wf-engine';
import { unstable_cache as nextCache } from 'next/cache';
import PageHeader from "@/components/layout/PageHeader";
import WorkspaceListClientContent from "./WorkspaceListClientContent";

const sdk = new WorkflowEngineSDK();

export const metadata: Metadata = {
  title: 'Workflow Workspaces - IGRP Workflow Studio',
  description: 'Manage your workflow workspaces.',
};

const getWorkspacesDataCached = nextCache(
  async () => {
    console.log("Cache Miss: Recalculando getWorkspacesDataCached");
    try {
      const workspaces = await sdk.workspaces.listWorkspaces();
      return { workspaces, error: null };
    } catch (err) {
      console.error("Error fetching workspaces list (cached):", err);
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
