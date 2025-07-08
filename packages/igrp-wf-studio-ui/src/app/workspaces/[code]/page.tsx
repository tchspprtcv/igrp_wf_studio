import { Metadata, ResolvingMetadata } from 'next';
import { ProjectConfig } from '@igrp/wf-engine';
import { ExtendedProjectConfig } from '@/types';
import WorkspaceDetailsClientContent from "./WorkspaceDetailsClientContent";
import { unstable_cache as nextCache } from 'next/cache';
import * as studioMgr from '@/igrpwfstudio/utils/workspaceManager';
// SidebarProvider e SidebarInset removidos
import Breadcrumb from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, PackageX } from 'lucide-react';

// Using ExtendedProjectConfig imported from shared types file

type Props = {
  params: { code: string };
};

const getProjectConfigCached = nextCache(
  async (appCode: string): Promise<ExtendedProjectConfig | null> => {
    console.log(`[app/workspaces/[code]/page.tsx] Cache Miss: getProjectConfigCached para ${appCode}`);
    try {
      const config = await studioMgr.loadStudioWorkspaceConfig(appCode);
      if (config) {
        // Adicionar appCode ao config para fácil acesso no cliente, se necessário.
        (config as ExtendedProjectConfig).appCode = appCode;
      }
      return config as ExtendedProjectConfig | null;
    } catch (err) {
      console.error(`[app/workspaces/[code]/page.tsx] Erro em loadStudioWorkspaceConfig para ${appCode}:`, err);
      // Não relançar o erro aqui, retornar null para que a página possa tratar como "não encontrado"
      return null;
    }
  },
  ['project-config-details-v4'], // Chave de cache atualizada
  { tags: ['projects', 'project-details'] } // Tags para revalidação
);

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const workspaceCode = params.code;
  let config: ExtendedProjectConfig | null = null;
  try {
    config = await getProjectConfigCached(workspaceCode);
  } catch (error) {
    // Erro já logado em getProjectConfigCached
  }
  const previousImages = (await parent).openGraph?.images || [];

  const title = config ? `${config.project || workspaceCode} - Details` : `Workspace ${workspaceCode} Not Found`;
  const description = config ? (config.description || `Details for workspace ${config.project || workspaceCode}`) : `The workspace with code '${workspaceCode}' could not be found or accessed.`;

  return {
    title,
    description,
    openGraph: {
      images: [...previousImages],
    },
  };
}

export default async function WorkspaceDetailPage({ params }: Props) {
  const { code } = params;
  let config: ExtendedProjectConfig | null = null;
  let fetchError: string | null = null;

  try {
    config = await getProjectConfigCached(code);
    if (!config) {
      // Não é um erro de fetch, mas o recurso não foi encontrado.
      // Metadata já lida com isso para o título da página.
      // O Client Content também precisará saber disso.
    }
  } catch (err) { // Este catch pode não ser atingido se getProjectConfigCached não relançar erros
    console.error(`[app/workspaces/[code]/page.tsx] Erro crítico ao buscar detalhes para ${code}:`, err);
    fetchError = err instanceof Error ? err.message : "An unexpected error occurred while fetching workspace details.";
  }

  const sidebarWidth = "calc(var(--spacing) * 72)";

  // Se config é null após a tentativa de busca (seja por não encontrar ou por erro dentro de getProjectConfigCached),
  // renderizamos um estado de erro/não encontrado dentro do layout padrão.
  if (!config && !fetchError) { // Explicitamente não encontrado
    fetchError = `Workspace with code '${code}' not found or has no configuration.`;
  }

  // O título da página será dinâmico com base no config ou código
  const pageTitle = config?.project || code;
  const pageSubtitle = config ? (config.description || `Details for workspace ${pageTitle}`) : (fetchError || `Manage workspace areas, sub-areas, and processes`);

  // Layout simplificado, dependendo do layout.tsx global
  return (
    <div className="flex flex-col gap-6"> {/* Container principal com espaçamento */}
      {/* Bloco de Cabeçalho da Página: Título, Subtítulo, Breadcrumb */}
      <div className="flex flex-col gap-1"> {/* Espaçamento interno menor */}
        {/* Título e Subtítulo */}
        {/* A div para justify-between foi removida pois os botões de ação agora estão no WorkspaceDetailsClientContent */}
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl break-all"> {/* Consistência de título */}
            {pageTitle}
          </h1>
          <p className="text-sm text-muted-foreground break-all mt-0.5"> {/* Leve ajuste de margem e tamanho */}
            {pageSubtitle}
          </p>
        </div>
        {/* Breadcrumb logo abaixo do título/subtítulo */}
        <div className="mt-2"> {/* Espaçamento entre título/subtítulo e breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Workspaces', href: '/workspaces' },
              { label: pageTitle }
            ]}
          />
        </div>
      </div>

      {/* Alerta de Erro de Carregamento */}
      {fetchError && !config && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Workspace</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      {/* Conteúdo Principal do Cliente */}
      {/* A lógica de "não encontrado" ou "erro" é tratada tanto aqui (para erro de fetch geral)
          quanto dentro de WorkspaceDetailsClientContent (para estado de carregamento ou not found mais específico) */}
      <div>
        <WorkspaceDetailsClientContent
          initialConfig={config}
          workspaceCode={code}
          initialError={fetchError}
        />
      </div>
    </div>
  );
}
