import { Metadata, ResolvingMetadata } from 'next';
import { ProjectConfig } from '@igrp/wf-engine';
import ProcessEditorClient from "./ProcessEditorClient";
import { unstable_cache as nextCache } from 'next/cache';
import * as studioMgr from '@/igrpwfstudio/utils/workspaceManager';
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import Breadcrumb from "@/components/ui/breadcrumb"; // Importar Breadcrumb
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, FileX2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';


// Define a local Process interface
interface Process {
  id?: string;
  code: string;
  title: string;
  description?: string;
  status?: string;
}

type Props = {
  params: { code: string; processId: string }; // 'code' é workspaceCode
};

interface ProcessDetailsForEditor extends Process {
  bpmnXml?: string | null;
  appCode: string;
  areaCode: string;
  subAreaCode?: string;
}

// Funções de cache como antes, mas com nomes únicos para esta página se necessário
const getProjectConfigForEditor = nextCache(
  async (appCode: string): Promise<ProjectConfig | null> => {
    return await studioMgr.loadStudioWorkspaceConfig(appCode);
  },
  ['project-config-for-process-editor-page-v2'],
  { tags: ['projects', `project-${"{appCode}"}`] } // Usar template string para tag dinâmica se suportado, senão simplificar
);

const getProcessDefinitionForEditor = nextCache(
  async (params: {appCode: string, areaCode: string, processCode: string, subAreaCode?: string}) => {
    return await studioMgr.readStudioProcessDefinition(params.appCode, params.areaCode, params.processCode, params.subAreaCode);
  },
  ['process-definition-editor-page-v2'],
  { tags: ['processes', `process-${"{params.appCode}"}-${"{params.processCode}"}`] }
);

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { code: workspaceCode, processId } = params;
  // Tentar buscar o título do processo de forma similar ao original
  // Esta lógica pode ser simplificada se getProcessData for chamada aqui também
  // Por ora, mantemos a lógica original de busca de título para metadata
  const config = await getProjectConfigForEditor(workspaceCode);
  let processTitle = processId;
  if (config) {
    for (const area of config.areas || []) {
      const pInArea = area.processes.find(p => p.code === processId);
      if (pInArea) { processTitle = pInArea.title; break; }
      for (const subArea of area.subareas || []) {
        const pInSubArea = subArea.processes.find(p => p.code === processId);
        if (pInSubArea) { processTitle = pInSubArea.title; break; }
      }
      if (processTitle !== processId) break;
    }
  }
  return {
    title: `${processTitle} - Process Editor`,
    description: `Edit workflow process ${processTitle} in workspace ${workspaceCode}.`,
  };
}

async function getProcessData(workspaceCode: string, processId: string): Promise<ProcessDetailsForEditor | null> {
  try {
    const config = await getProjectConfigForEditor(workspaceCode);
    if (!config) return null;

    let processMeta: Process | undefined;
    let areaCodeFound: string | undefined;
    let subAreaCodeFound: string | undefined;

    for (const area of config.areas || []) {
      processMeta = area.processes.find(p => p.code === processId);
      if (processMeta) { areaCodeFound = area.code; break; }
      for (const subArea of area.subareas || []) {
        processMeta = subArea.processes.find(p => p.code === processId);
        if (processMeta) { areaCodeFound = area.code; subAreaCodeFound = subArea.code; break; }
      }
      if (processMeta) break;
    }

    if (!processMeta || !areaCodeFound) return null;

    const processDefinition = await getProcessDefinitionForEditor({
        appCode: workspaceCode,
        areaCode: areaCodeFound,
        processCode: processId,
        subAreaCode: subAreaCodeFound
    });

    return {
      ...processMeta,
      bpmnXml: processDefinition?.bpmnXml || null,
      appCode: workspaceCode,
      areaCode: areaCodeFound,
      subAreaCode: subAreaCodeFound,
    };
  } catch (err) {
    console.error(`[ProcessEditorPage] Error fetching process data for ${processId} in ${workspaceCode}:`, err);
    return null;
  }
}

export default async function ProcessEditorPage({ params }: Props) {
  const { code: workspaceCode, processId } = params;
  const processDetails = await getProcessData(workspaceCode, processId);

  const sidebarWidth = "calc(var(--spacing) * 72)";

  // Determinar o título do workspace para o breadcrumb
  // Idealmente, getProcessData retornaria isso, ou faríamos outra chamada cacheada para config do workspace
  // Por simplicidade, se config não estiver em processDetails, usamos o workspaceCode
  let workspaceLabel = workspaceCode;
  if (processDetails?.appCode) { // appCode é o workspaceCode
      const wsConfig = await getProjectConfigForEditor(processDetails.appCode);
      if (wsConfig?.project) {
        workspaceLabel = wsConfig.project;
      }
  }


  if (!processDetails) {
    return (
      <SidebarProvider style={{ "--sidebar-width": sidebarWidth, "--header-height": "calc(var(--spacing) * 14)" } as React.CSSProperties}>
        <div className="w-full lg:pl-[var(--sidebar-width)]">
          <SidebarInset className="w-full">
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Button variant="outline" size="icon" asChild>
                  <Link href={`/workspaces/${workspaceCode}`}>
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                    <h1 className="text-lg font-semibold md:text-2xl text-destructive">Error Loading Process</h1>
                    <Breadcrumb
                        items={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Workspaces', href: '/workspaces' },
                            { label: workspaceLabel, href: `/workspaces/${workspaceCode}` },
                            { label: 'Error' }
                        ]}
                    />
                </div>
              </div>
              <Alert variant="destructive">
                <FileX2 className="h-4 w-4" />
                <AlertTitle>Process Not Found</AlertTitle>
                <AlertDescription>
                  Could not load details for process <code className="font-semibold">{processId}</code> in workspace <code className="font-semibold">{workspaceCode}</code>.
                </AlertDescription>
              </Alert>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  const processPageTitle = processDetails.title || processId;

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Workspaces', href: '/workspaces' },
    { label: workspaceLabel, href: `/workspaces/${workspaceCode}` },
    // Poderíamos adicionar Área/Subárea aqui se tivéssemos essa informação facilmente
    { label: processPageTitle }
  ];

  return (
    <SidebarProvider style={{ "--sidebar-width": sidebarWidth, "--header-height": "calc(var(--spacing) * 14)" } as React.CSSProperties}>
      <div className="w-full lg:pl-[var(--sidebar-width)]">
        <SidebarInset className="w-full">
          <main className="flex flex-1 flex-col @container/main h-[calc(100vh-var(--header-height))]">
            <div className="flex items-center gap-4 p-4 lg:p-6 border-b">
              <Button variant="outline" size="icon" asChild className="flex-shrink-0">
                  <Link href={`/workspaces/${workspaceCode}`}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Workspace</span>
                  </Link>
              </Button>
              <div className="flex-1 min-w-0"> {/* Para permitir que o título e breadcrumb quebrem/trunquem */}
                <h1 className="text-lg font-semibold md:text-2xl truncate" title={processPageTitle}>{processPageTitle}</h1>
                <Breadcrumb items={breadcrumbItems} className="mt-1" />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <ProcessEditorClient initialProcessDetails={processDetails} />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
