import { Metadata, ResolvingMetadata } from 'next';
import { ProjectConfig, Process } from '@igrp/wf-engine'; // Tipos
import ProcessEditorClient from "./ProcessEditorClient";
import { notFound } from 'next/navigation';
import { unstable_cache as nextCache } from 'next/cache';
// import PageHeader from '@/components/layout/PageHeader'; // Não usado diretamente aqui
import * as studioMgr from '@/igrpwfstudio/utils/workspaceManager'; // Nosso gerenciador

// const sdk = new WorkflowEngineSDK(); // REMOVIDO

type Props = {
  params: { code: string; processId: string }; // 'code' aqui é o workspaceCode
};

interface ProcessDetailsForEditor extends Process {
  bpmnXml?: string | null;
  appCode: string; // workspaceCode
  areaCode: string;
  subAreaCode?: string;
}

const getProjectConfigCachedForProcessPage = nextCache( // Renomeado para evitar conflitos de chave se importado
  async (appCode: string): Promise<ProjectConfig | null> => {
    console.log(`[ProcessEditorPage] Cache Miss: getProjectConfigCachedForProcessPage para ${appCode}`);
    // return sdk.workspaces.loadProjectConfig(appCode); // Lógica Antiga
    return await studioMgr.loadStudioWorkspaceConfig(appCode); // Nova Lógica
  },
  ['project-config-for-process-editor'], // Chave de cache única
  { tags: ['projects', (appCode: string) => `project-${appCode}`] } // Tags para revalidação
);

const getProcessDefinitionCachedForEditorPage = nextCache( // Renomeado para evitar conflitos
  async (params: {appCode: string, areaCode: string, processCode: string, subAreaCode?: string}) => {
    console.log(`[ProcessEditorPage] Cache Miss: getProcessDefinitionCachedForEditorPage para ${params.processCode} em ${params.appCode}`);
    // return sdk.processes.readProcessDefinition(params.appCode, params.areaCode, params.processCode, params.subAreaCode); // Lógica Antiga
    return await studioMgr.readStudioProcessDefinition(params.appCode, params.areaCode, params.processCode, params.subAreaCode); // Nova Lógica
  },
  ['process-definition-editor'], // Chave de cache única
  { tags: ['processes', (params: {appCode: string, processCode: string}) => `process-${params.appCode}-${params.processCode}`] }
);


export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { code: workspaceCode, processId } = params;
  const config = await getProjectConfigCachedForProcessPage(workspaceCode);
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
  console.log(`[ProcessEditorPage] getProcessData para workspace: ${workspaceCode}, processo: ${processId}`);
  try {
    const config = await getProjectConfigCachedForProcessPage(workspaceCode);
    if (!config) {
      console.error(`[ProcessEditorPage] Configuração do Workspace não encontrada para ${workspaceCode}`);
      return null;
    }

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

    if (!processMeta || !areaCodeFound) {
      console.error(`[ProcessEditorPage] Metadados do processo não encontrados para ${processId} no workspace ${workspaceCode}`);
      return null;
    }
    console.log(`[ProcessEditorPage] Metadados encontrados: Area ${areaCodeFound}, SubArea ${subAreaCodeFound}, Processo ${processMeta.title}`);

    const processDefinition = await getProcessDefinitionCachedForEditorPage({
        appCode: workspaceCode,
        areaCode: areaCodeFound,
        processCode: processId,
        subAreaCode: subAreaCodeFound
    });

    if (!processDefinition) {
        console.warn(`[ProcessEditorPage] Definição BPMN não encontrada para o processo ${processId}. Um novo diagrama pode ser criado.`);
    }

    return {
      ...processMeta,
      bpmnXml: processDefinition?.bpmnXml || null, // Permite XML nulo se não encontrado (editor pode criar novo)
      appCode: workspaceCode,
      areaCode: areaCodeFound,
      subAreaCode: subAreaCodeFound,
    };
  } catch (err) {
    console.error(`[ProcessEditorPage] Erro ao buscar dados para processo ${processId} no workspace ${workspaceCode}:`, err);
    return null;
  }
}

export default async function ProcessEditorPage({ params }: Props) {
  const { code: workspaceCode, processId } = params;
  console.log(`[ProcessEditorPage] Renderizando editor para workspace: ${workspaceCode}, processo: ${processId}`);
  const processDetails = await getProcessData(workspaceCode, processId);

  if (!processDetails) {
    // Adicionar uma mensagem mais informativa aqui em vez de apenas notFound()
    // para que o usuário saiba o que aconteceu.
    // notFound() pode ser chamado se quisermos uma página 404 genérica.
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold text-red-600">Error Loading Process</h1>
        <p>Could not load details for process '{processId}' in workspace '{workspaceCode}'.</p>
        <p>The process may not exist or the workspace configuration is missing.</p>
      </div>
    );
  }

  console.log(`[ProcessEditorPage] Passando initialProcessDetails para o cliente:`, { title: processDetails.title, hasBpmn: !!processDetails.bpmnXml });

  return (
    <ProcessEditorClient initialProcessDetails={processDetails} />
  );
}
