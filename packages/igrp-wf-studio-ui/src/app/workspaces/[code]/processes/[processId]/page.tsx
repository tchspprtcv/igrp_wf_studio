import { Metadata, ResolvingMetadata } from 'next';
import { WorkflowEngineSDK, ProjectConfig, Process } from '@igrp/wf-engine'; // Supondo que Process é um tipo exportado
import ProcessEditorClient from "./ProcessEditorClient"; // Novo Client Component
import { notFound } from 'next/navigation';
import { unstable_cache as nextCache } from 'next/cache';
import PageHeader from '@/components/layout/PageHeader';

const sdk = new WorkflowEngineSDK();

type Props = {
  params: { code: string; processId: string };
};

interface ProcessDetailsForEditor extends Process {
  bpmnXml?: string | null;
  appCode: string;
  areaCode: string;
  subAreaCode?: string;
}

// Reutilizar getProjectConfigCached de /app/workspaces/[code]/page.tsx ou definir uma versão aqui.
// Para evitar duplicação, idealmente seria importada de um utilitário.
// Vou assumir que uma versão similar está disponível ou redefinir aqui.
const getProjectConfigCachedForProcess = nextCache(
  async (appCode: string) => {
    console.log(`Cache Miss: ProcessEditor - getProjectConfigCachedForProcess para ${appCode}`);
    return sdk.workspaces.loadProjectConfig(appCode);
  },
  ['project-config-process'],
  { tags: ['projects'] }
);

const getProcessDefinitionCached = nextCache(
  async (params: {appCode: string, areaCode: string, processCode: string, subAreaCode?: string}) => {
    console.log(`Cache Miss: ProcessEditor - getProcessDefinitionCached para ${params.processCode}`);
    return sdk.processes.readProcessDefinition(params.appCode, params.areaCode, params.processCode, params.subAreaCode);
  },
  ['process-definition'],
  // Tags podem ser mais específicas: [`process-${appCode}-${processCode}`]
  { tags: ['processes', 'projects'] } // 'projects' porque a estrutura do processo está no config
);


export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { code: workspaceCode, processId } = params;
  const config = await getProjectConfigCachedForProcess(workspaceCode); // Cache
  let processTitle = processId;
  if (config) {
    // Lógica para encontrar o título (mantida)
    for (const area of config.areas) {
      const pInArea = area.processes.find(p => p.code === processId);
      if (pInArea) { processTitle = pInArea.title; break; }
      for (const subArea of area.subareas) {
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
    const config = await getProjectConfigCachedForProcess(workspaceCode); // Cache
    if (!config) {
      console.error(`Workspace config not found for ${workspaceCode}`);
      return null;
    }

    let processMeta: Process | undefined;
    let areaCodeFound: string | undefined;
    let subAreaCodeFound: string | undefined;

    // Lógica para encontrar metadados (mantida)
    for (const area of config.areas) {
      processMeta = area.processes.find(p => p.code === processId);
      if (processMeta) { areaCodeFound = area.code; break; }
      for (const subArea of area.subareas) {
        processMeta = subArea.processes.find(p => p.code === processId);
        if (processMeta) { areaCodeFound = area.code; subAreaCodeFound = subArea.code; break; }
      }
      if (processMeta) break;
    }

    if (!processMeta || !areaCodeFound) {
      console.error(`Process metadata not found for ${processId} in workspace ${workspaceCode}`);
      return null;
    }

    const processDefinition = await getProcessDefinitionCached({ // Cache
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
    console.error(`Error fetching data for process ${processId} in workspace ${workspaceCode}:`, err);
    return null;
  }
}

export default async function ProcessEditorPage({ params }: Props) {
  const { code: workspaceCode, processId } = params;
  const processDetails = await getProcessData(workspaceCode, processId);

  if (!processDetails) {
    notFound();
  }

  return (
    // O layout do editor é bem específico (altura total, etc.),
    // então o ProcessEditorClient provavelmente controlará a maior parte da estrutura.
    <ProcessEditorClient initialProcessDetails={processDetails} />
  );
}
