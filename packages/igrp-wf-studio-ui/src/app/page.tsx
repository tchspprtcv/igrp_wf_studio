import { Metadata } from 'next';
import { AppOptions, ProjectConfig } from '@igrp/wf-engine'; // Apenas tipos são ok
import PageHeader from "@/components/layout/PageHeader";
import { Folder, Layers, Workflow, Clock } from "lucide-react";
// Removido: import CreateWorkspaceModal from "@/pages/workspaces/CreateWorkspace"; // Parece ser um caminho antigo/incorreto do Pages Router
import DashboardClientContent from "./DashboardClientContent";
import type { DashboardStats } from '@/types';
import { unstable_cache as nextCache } from 'next/cache';
import * as studioMgr from '@/igrpwfstudio/utils/workspaceManager'; // Nosso gerenciador

export const metadata: Metadata = {
  title: 'Dashboard - IGRP Workflow Studio',
  description: 'Overview of your workflow workspaces.',
};

const getDashboardDataCached = nextCache(
  async () => {
    console.log("[app/page.tsx] Cache Miss: Recalculando getDashboardDataCached com studioMgr");
    try {
      const appOptionsList: AppOptions[] = await studioMgr.listStudioWorkspaces();
      const statsData: DashboardStats = {
        workspaces: appOptionsList.length,
        areas: 0,
        processes: 0,
        active: appOptionsList.filter(app => app.status === 'active').length
      };

      // workspacesDataForClient será a lista de AppOptions para o cliente
      // Não precisamos transformá-la mais, pois DashboardClientContent espera AppOptions[]
      // const workspacesDataForClient: AppOptions[] = [...appOptionsList];

      for (const appOpt of appOptionsList) {
        const config: ProjectConfig | null = await studioMgr.loadStudioWorkspaceConfig(appOpt.code);
        if (config) {
          statsData.areas += config.areas?.length || 0;
          for (const area of config.areas || []) {
            statsData.processes += area.processes?.length || 0;
            for (const subarea of area.subareas || []) {
              statsData.processes += subarea.processes?.length || 0;
            }
          }
        }
      }
      // Passa a lista de AppOptions diretamente para o cliente
      return { workspaces: appOptionsList, stats: statsData, error: null };
    } catch (err) {
      console.error("[app/page.tsx] Error fetching dashboard data (cached):", err);
      return {
        workspaces: [],
        stats: { workspaces: 0, areas: 0, processes: 0, active: 0 },
        error: (err as Error).message
      };
    }
  },
  ['dashboard-data-v4'], // Nova chave de cache para forçar atualização
  { tags: ['workspaces', 'projects'] }
);

// A função getProjectConfigCached individual não é mais necessária aqui,
// pois getDashboardDataCached agora lida com o carregamento de configs para estatísticas.
// Se for usada em outros componentes, deverá ser refatorada lá para usar studioMgr.loadStudioWorkspaceConfig.
/*
const getProjectConfigCached = nextCache(
  async (appCode: string) => {
    console.log(`[app/page.tsx] Cache Miss: Recalculando getProjectConfigCached para ${appCode} com studioMgr`);
    return await studioMgr.loadStudioWorkspaceConfig(appCode);
  },
  ['project-config-v4'],
  { tags: ['projects'] }
);
*/

export default async function HomePage() {
  const { workspaces, stats, error } = await getDashboardDataCached();
  console.log('[HomePage] Dados recebidos de getDashboardDataCached:', { workspacesCount: workspaces.length, stats, error });

  return (
    <div className="space-y-6 animate-fade-in"> {/* Adicionado animate-fade-in que estava no exemplo original */}
      <PageHeader
        title="Dashboard"
        description="Overview of your workflow workspaces"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Workspaces", count: stats.workspaces, iconName: "Folder", color: "bg-blue-100 text-blue-600" },
          { name: "Areas", count: stats.areas, iconName: "Layers", color: "bg-violet-100 text-violet-600" },
          { name: "Processes", count: stats.processes, iconName: "Workflow", color: "bg-emerald-100 text-emerald-600" },
          { name: "Active", count: stats.active, iconName: "Clock", color: "bg-amber-100 text-amber-600" },
        ].map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-md"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  {stat.iconName === "Folder" && <Folder className="h-6 w-6" />}
                  {stat.iconName === "Layers" && <Layers className="h-6 w-6" />}
                  {stat.iconName === "Workflow" && <Workflow className="h-6 w-6" />}
                  {stat.iconName === "Clock" && <Clock className="h-6 w-6" />}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-bold text-gray-900">
                        {stat.count}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <DashboardClientContent initialWorkspaces={workspaces} initialError={error} />
    </div>
  );
}
