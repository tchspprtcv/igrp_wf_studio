import { Metadata, ResolvingMetadata } from 'next';
import { ProjectConfig } from '@igrp/wf-engine'; // Apenas o tipo é necessário

// Extended interface to include additional properties used in the UI
interface ExtendedProjectConfig extends ProjectConfig {
  description?: string;
}
import PageHeader from "@/components/layout/PageHeader";
import WorkspaceDetailsClientContent from "./WorkspaceDetailsClientContent";
import { unstable_cache as nextCache } from 'next/cache';
import * as studioMgr from '@/igrpwfstudio/utils/workspaceManager'; // Nosso gerenciador

// const sdk = new WorkflowEngineSDK(); // REMOVIDO

type Props = {
  params: { code: string };
};

// Função cacheada para carregar configuração de projeto individualmente, usando studioMgr
const getProjectConfigCached = nextCache(
  async (appCode: string): Promise<ExtendedProjectConfig | null> => { // Usando o tipo estendido
    console.log(`[WorkspaceDetailsPage] Cache Miss: getProjectConfigCached para ${appCode} usando studioMgr`);
    const config = await studioMgr.loadStudioWorkspaceConfig(appCode); // Nova lógica
    if (config) {
      // Adicionar o appCode ao config para fácil acesso no cliente se necessário.
      // É melhor tipar isso adequadamente se for uma prática comum.
      (config as ProjectConfig & { appCode?: string }).appCode = appCode;
    }
    return config;
  },
  ['project-config-details-v3'], // Chave de cache (pode ser versionada ou mais específica)
  // Tags para revalidação. Usando apenas strings estáticas para compatibilidade.
  { tags: ['projects'] } // Removida a tag dinâmica que causava erro de tipo
);

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const workspaceCode = params.code;
  const config = await getProjectConfigCached(workspaceCode); // Usa a versão refatorada
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: config ? `${config.project || workspaceCode} - Workspace Details` : 'Workspace Not Found',
    description: config ? config.description || `Details for workspace ${workspaceCode}` : 'The requested workspace could not be found.',
    openGraph: {
      images: [...previousImages], // Preserva imagens de layouts pai
    },
  };
}

// A função getWorkspaceDetails pode ser simplificada ou até mesmo eliminada,
// pois a lógica principal de busca e tratamento de erro pode estar em getProjectConfigCached
// ou diretamente no componente da página.
async function getWorkspaceDetails(workspaceCode: string): Promise<{ config: ExtendedProjectConfig | null; error: string | null }> {
  try {
    const config = await getProjectConfigCached(workspaceCode);
    if (!config) {
      // Este log pode ser redundante se loadStudioWorkspaceConfig já loga quando não encontra.
      // console.warn(`[WorkspaceDetailsPage] Config não encontrada por getProjectConfigCached para ${workspaceCode}`);
      return { config: null, error: "Workspace configuration not found." };
    }
    return { config, error: null };
  } catch (err: any) { // Especificar tipo para err
    console.error(`[WorkspaceDetailsPage] Erro ao buscar detalhes para ${workspaceCode} via getProjectConfigCached:`, err);
    return { config: null, error: err.message || "An unexpected error occurred." };
  }
}

export default async function WorkspaceDetailPage({ params }: Props) {
  const { code } = params;
  // Chamada direta para getProjectConfigCached pode ser suficiente se ele tratar bem os nulos/erros.
  // Ou manter getWorkspaceDetails se ele adicionar mais lógica de tratamento.
  const { config, error: fetchError } = await getWorkspaceDetails(code);

  console.log(`[WorkspaceDetailPage] Dados para ${code}:`, { config, fetchError });

  // Se config for null (mesmo sem erro explícito de fetch), consideramos como não encontrado.
  if (!config) {
    return (
        <div className="space-y-6 p-4 md:p-6">
            <PageHeader title="Error" description="Workspace details could not be loaded." />
            <div className="text-red-600 p-4 bg-red-50 rounded-md">
                <p>Could not load details for workspace: {code}.</p>
                {fetchError && <p>Reason: {fetchError}</p>}
                {!fetchError && <p>Reason: Workspace configuration not found or not accessible.</p>}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={config.project || code}
        description={config.description || `Manage workspace areas, sub-areas, and processes for ${code}`}
      />
      <WorkspaceDetailsClientContent initialConfig={config} workspaceCode={code} />
    </div>
  );
}
