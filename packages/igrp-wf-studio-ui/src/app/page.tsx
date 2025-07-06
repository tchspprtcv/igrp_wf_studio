import { Metadata } from 'next';
import { WorkflowEngineSDK, ProjectConfig, AppOptions } from '@igrp/wf-engine';
import PageHeader from "@/components/layout/PageHeader";
import { Folder, Layers, Workflow, Clock } from "lucide-react"; // Importar ícones
import CreateWorkspaceModal from "@/pages/workspaces/CreateWorkspace";
import DashboardClientContent from "./DashboardClientContent";
import type { DashboardStats } from '@/types'; // Importar tipo centralizado

// Instanciar o SDK. O basePath pode precisar de configuração dependendo de onde os dados estão.
import { unstable_cache as nextCache } from 'next/cache'; // Importar unstable_cache
import * as studioMgr from '@/igrpwfstudio/utils/workspaceManager'; // Nosso gerenciador

// Por enquanto, o padrão do SDK é './', relativo ao diretório de execução do servidor Next.js.
// const sdk = new WorkflowEngineSDK(); // REMOVIDO - Não usar SDK globalmente aqui

export const metadata: Metadata = {
  title: 'Dashboard - IGRP Workflow Studio',
  description: 'Overview of your workflow workspaces.',
};

// Função para buscar e calcular os dados do dashboard, agora com cache
const getDashboardDataCached = nextCache(
  async () => {
    console.log("[app/page.tsx] Cache Miss: Recalculando getDashboardDataCached com studioMgr");
    try {
      const appOptionsList = await studioMgr.listStudioWorkspaces(); // (1) Lista do catálogo
      const statsData: DashboardStats = {
        workspaces: appOptionsList.length,
        areas: 0,
        processes: 0,
        active: appOptionsList.filter(app => app.status === 'active').length
      };

      const workspacesDataForClient: AppOptions[] = []; // Para passar para DashboardClientContent

      for (const appOpt of appOptionsList) {
        workspacesDataForClient.push(appOpt);

        // Carrega ProjectConfig para as estatísticas
        // const config = await getProjectConfigCached(appOpt.code); // (2) Config do catálogo - getProjectConfigCached também precisa ser refatorado
        const config = await studioMgr.loadStudioWorkspaceConfig(appOpt.code); // Usar studioMgr diretamente
        if (config) {
          statsData.areas += config.areas.length;
          for (const area of config.areas) {
            statsData.processes += area.processes.length;
            for (const subarea of area.subareas) {
              statsData.processes += subarea.processes.length;
            }
          }
        }
      }
      return { workspaces: workspacesDataForClient, stats: statsData, error: null };
    } catch (err) {
      console.error("[app/page.tsx] Error fetching dashboard data (cached):", err);
      return {
        workspaces: [],
        stats: { workspaces: 0, areas: 0, processes: 0, active: 0 },
        error: (err as Error).message
      };
    }
  },
  // ['dashboard-data'], // Chave antiga
  ['dashboard-data-v3'], // Nova chave para tentar forçar refresh
  { tags: ['workspaces', 'projects'] }
);

// getProjectConfigCached não é mais diretamente necessário por HomePage se getDashboardDataCached já faz tudo
// e usa studioMgr.loadStudioWorkspaceConfig diretamente.
// Se for usado em outros lugares, precisará ser refatorado também.
/*
const getProjectConfigCached = nextCache(
  async (appCode: string) => {
    console.log(`[app/page.tsx] Cache Miss: Recalculando getProjectConfigCached para ${appCode} com studioMgr`);
    return await studioMgr.loadStudioWorkspaceConfig(appCode);
  },
  ['project-config-v3'], // Nova chave
  { tags: ['projects'] }
);
*/

export default async function HomePage() {
  const { workspaces, stats, error } = await getDashboardDataCached();
  // Adicionar o log que sugeri anteriormente para verificar os dados aqui
  console.log('[HomePage] Dados recebidos de getDashboardDataCached:', { workspaces: workspaces, stats, error });


  // O PageHeader precisa saber se o modal de criação deve ser aberto.
  // Essa lógica de estado (showCreateModal) será movida para DashboardClientContent.
  // O PageHeader aqui só renderizará o título e descrição. A ação de "onCreateNew"
  // será gerenciada pelo DashboardClientContent.

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your workflow workspaces"
        // A prop onCreateNew e createNewLabel será gerenciada por um Client Component wrapper se necessário
        // ou o botão "New Workspace" será parte do DashboardClientContent.
      />

      {/* Os StatCards podem ser renderizados aqui no Server Component */}
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

      {/* Conteúdo interativo movido para DashboardClientContent */}
      <DashboardClientContent initialWorkspaces={workspaces} initialError={error} />

    </div>
  );
}
