import { Metadata } from 'next';
import { WorkflowEngineSDK, ProjectConfig, AppOptions } from '@igrp/wf-engine';
import { Metadata } from 'next';
import { WorkflowEngineSDK, ProjectConfig, AppOptions } from '@igrp/wf-engine';
import PageHeader from "@/components/layout/PageHeader";
import { Folder, Layers, Workflow, Clock } from "lucide-react"; // Importar ícones
import CreateWorkspaceModal from "@/pages/workspaces/CreateWorkspace";
import DashboardClientContent from "./DashboardClientContent";
import type { DashboardStats } from '@/types'; // Importar tipo centralizado

// Instanciar o SDK. O basePath pode precisar de configuração dependendo de onde os dados estão.
import { unstable_cache as nextCache } from 'next/cache'; // Importar unstable_cache

// Por enquanto, o padrão do SDK é './', relativo ao diretório de execução do servidor Next.js.
const sdk = new WorkflowEngineSDK();

export const metadata: Metadata = {
  title: 'Dashboard - IGRP Workflow Studio',
  description: 'Overview of your workflow workspaces.',
};

// Função para buscar e calcular os dados do dashboard, agora com cache
const getDashboardDataCached = nextCache(
  async () => {
    console.log("Cache Miss: Recalculando getDashboardDataCached");
    try {
      const apps = await sdk.workspaces.listWorkspaces();
      const statsData: DashboardStats = {
        workspaces: apps.length,
        areas: 0,
        processes: 0,
        active: apps.filter(app => app.status === 'active').length
      };

      for (const app of apps) {
        // Usar uma função cacheada para loadProjectConfig também, se for chamado em múltiplos lugares
        const config = await getProjectConfigCached(app.code);
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
      return { workspaces: apps, stats: statsData, error: null };
    } catch (err) {
      console.error("Error fetching dashboard data (cached):", err);
      // É importante que a função cacheada não retorne undefined em caso de erro se o tipo não permitir.
      // Retornar uma estrutura de erro consistente.
      return {
        workspaces: [],
        stats: { workspaces: 0, areas: 0, processes: 0, active: 0 },
        error: (err as Error).message
      };
    }
  },
  ['dashboard-data'], // Chave base para o cache
  { tags: ['workspaces', 'projects'] } // Tags para revalidação
);

// Função cacheada para carregar configuração de projeto individualmente
const getProjectConfigCached = nextCache(
  async (appCode: string) => {
    console.log(`Cache Miss: Recalculando getProjectConfigCached para ${appCode}`);
    return sdk.workspaces.loadProjectConfig(appCode);
  },
  ['project-config'], // Chave base, será sufixada com appCode pela keyParts
  // A tag pode ser mais específica se necessário, ex: [`project-${appCode}`]
  // ou uma tag genérica se muitas coisas invalidam configs de projeto.
  { tags: ['projects'] }
);


export default async function HomePage() {
  const { workspaces, stats, error } = await getDashboardDataCached();

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
