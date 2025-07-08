import { Metadata } from 'next';
import { AppOptions, ProjectConfig } from '@igrp/wf-engine'; // Types for original data
// import PageHeader from "@/components/layout/PageHeader"; // Original PageHeader
// import { Folder, Layers, Workflow, Clock } from "lucide-react"; // Original Icons
import DashboardClientContent from "../DashboardClientContent"; // Client content for workspace list (now refactored with Table)
import type { DashboardStats } from '@/types';
import { unstable_cache as nextCache } from 'next/cache';
import * as studioMgr from '@/igrpwfstudio/utils/workspaceManager';

// Component imports
import { SectionCards } from "@/components/dashboard/section-cards";
import Breadcrumb from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
// import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive"; // Chart não está sendo usado no momento


// Dummy data for DataTable (workspaces) - replace with actual data later
// const dummyWorkspaceData = [
//   { code: "WS001", title: "My First Workspace", status: "active", processCount: 5 },
//   { code: "WS002", title: "Client Project X", status: "inactive", processCount: 12 },
// ];
// const dummyWorkspaceColumns = [
//     { accessorKey: "title", header: "Workspace Title" },
//     { accessorKey: "status", header: "Status" },
//     { accessorKey: "processCount", header: "Processes" },
// ];


export const metadata: Metadata = {
  title: 'Dashboard - IGRP Workflow Studio',
  description: 'Overview of your workflow workspaces and activities.',
};

// Original data fetching logic - now re-enabled
const getDashboardDataCached = nextCache(
  async (): Promise<{ workspaces: AppOptions[]; stats: DashboardStats; error: string | null }> => {
    console.log("[app/dashboard/page.tsx] Cache Miss: Recalculando getDashboardDataCached com studioMgr");
    try {
      const appOptionsList: AppOptions[] = await studioMgr.listStudioWorkspaces();
      const statsData: DashboardStats = {
        workspaces: appOptionsList.length,
        areas: 0,
        processes: 0,
        active: appOptionsList.filter(app => app.status === 'active').length
      };

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
      return { workspaces: appOptionsList, stats: statsData, error: null };
    } catch (err) {
      console.error("[app/dashboard/page.tsx] Error fetching dashboard data (cached):", err);
      return {
        workspaces: [],
        stats: { workspaces: 0, areas: 0, processes: 0, active: 0 },
        error: (err instanceof Error ? err.message : String(err)) // Ensure error is a string
      };
    }
  },
  ['dashboard-data-v5'], // Incremented cache key
  { tags: ['workspaces', 'projects'] }
);


export default async function DashboardPage() {
  const { workspaces, stats, error } = await getDashboardDataCached();

  // O padding do layout global já é `mx-auto px-4 py-6 sm:px-6 lg:px-8`.
  // Não precisamos de padding adicional aqui no `main` ou wrappers internos,
  // a menos que seja para espaçamento específico entre os elementos da página.
  return (
    // O <SidebarProvider>, <AppSidebar>, <SidebarInset> e o div com paddingLeft foram removidos
    // pois o layout.tsx agora gerencia a sidebar global e o padding do conteúdo.
    // O <main> do layout.tsx já tem overflow-y-auto.
    // O padding da página é fornecido pelo container no layout.tsx.
    // Os gaps entre elementos podem ser gerenciados por um container flex col aqui.
    <div className="flex flex-col gap-6"> {/* Aumentado o gap para melhor espaçamento geral */}
      {/* Container para Título e Breadcrumb */}
      <div className="flex flex-col gap-1"> {/* Reduzido o mb-4 e o gap interno */}
        <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1> {/* Aumentado o tamanho da fonte */}
        <Breadcrumb items={[{ label: 'Dashboard' }]} />
      </div>

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* SectionCards agora usa o DashboardStats diretamente */}
      <SectionCards stats={stats} />

      {/*
        A seção do ChartAreaInteractive está comentada no código original e não foi solicitada para ser restaurada.
        Se fosse usada, o layout grid abaixo poderia ser ajustado.
        Por agora, DashboardClientContent (a lista de workspaces) ocupará a largura total disponível.
      */}
      {/*
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartAreaInteractive />
        </div>
        <div className="lg:col-span-1">
          <DashboardClientContent initialWorkspaces={workspaces || []} initialError={error} />
        </div>
      </div>
      */}

      {/* Renderiza DashboardClientContent diretamente */}
      <div>
        <DashboardClientContent initialWorkspaces={workspaces || []} initialError={error} />
      </div>
    </div>
  );
}
