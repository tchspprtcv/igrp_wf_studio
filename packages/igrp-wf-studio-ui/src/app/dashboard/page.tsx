import { Metadata } from 'next';
import { AppOptions, ProjectConfig } from '@igrp/wf-engine'; // Types for original data
// import PageHeader from "@/components/layout/PageHeader"; // Original PageHeader
// import { Folder, Layers, Workflow, Clock } from "lucide-react"; // Original Icons
import DashboardClientContent from "../DashboardClientContent"; // Client content for workspace list (now refactored with Table)
import type { DashboardStats } from '@/types';
import { unstable_cache as nextCache } from 'next/cache';
import * as studioMgr from '@/igrpwfstudio/utils/workspaceManager';

// New imports from ShadCN block structure
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
// import { DataTable } from "@/components/dashboard/data-table"; // DataTable is not directly used here anymore, DashboardClientContent handles its own table
import { SectionCards } from "@/components/dashboard/section-cards";
import { SiteHeader } from "@/components/dashboard/site-header";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For displaying errors
import { Terminal } from 'lucide-react'; // Icon for error alert


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
  
  // Definindo a largura do sidebar como constante para uso consistente
  const sidebarWidth = "calc(var(--spacing) * 72)";
  const collapsedSidebarWidth = "4rem";
  // console.log('[DashboardPage] Data from getDashboardDataCached:', { workspacesCount: workspaces?.length, stats, error }); // Optional: keep for debugging if needed

  // The workspaceColumns definition is no longer needed here as DashboardClientContent handles its own table structure.
  // const workspaceColumns = [
  //   { accessorKey: "title", header: "Title" },
  //   { accessorKey: "code", header: "Code" },
  //   { accessorKey: "status", header: "Status" },
  //   // TODO: Add a column for number of processes, requires processing 'workspaces' data (this TODO can move to DashboardClientContent if still relevant)
  // ];

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      {/* Fixed position sidebar com z-index maior para ficar acima de todos os conteúdos */}
      {/*<AppSidebar 
        variant="inset" 
        className="hidden lg:block fixed h-full z-30" 
      />*/}
      
      {/* Container de conteúdo principal com padding-left fixo e garantido */}
      <div className="w-full" style={{ paddingLeft: sidebarWidth }}>
        <SidebarInset
          className="w-full transition-all duration-200 z-0 overflow-auto"
      >
        {/*<SiteHeader />*/}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 @container/main">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
          </div>

          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Fetching Data</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <SectionCards stats={stats} /> {/* This is the single, correct rendering of SectionCards */}

          {/* Section for Chart and Workspaces List */}
          {/* This div will manage the layout of the chart and the workspace list.
              On smaller screens, they will stack due to grid-cols-1 (implied by default).
              On larger screens (lg and up), they will be side-by-side using lg:grid-cols-3.
              The gap utilities are applied here for spacing between chart and list, and if they stack.
          */}
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8">
            {/* Chart takes up 2/3 on larger screens */}
            {/*<div className="lg:col-span-2"> 
              <ChartAreaInteractive />
            </div>*/}
            {/* Workspaces list takes 1/3 on larger screens */}
            <div> 
              <DashboardClientContent initialWorkspaces={workspaces || []} initialError={error} />
            </div>
          </div>
        </main>
      </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
