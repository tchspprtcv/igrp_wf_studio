import { Metadata, ResolvingMetadata } from 'next';
import { ProjectConfig } from '@igrp/wf-engine';
import WorkspaceDetailsClientContent from "./WorkspaceDetailsClientContent";
import { unstable_cache as nextCache } from 'next/cache';
import * as studioMgr from '@/igrpwfstudio/utils/workspaceManager';
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import Breadcrumb from "@/components/ui/breadcrumb"; // Importar Breadcrumb
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, PackageNotFound } from 'lucide-react';

// Interface estendida para incluir description e appCode, como antes.
interface ExtendedProjectConfig extends ProjectConfig {
  description?: string;
  appCode?: string; // Adicionado para consistência, embora params.code seja a fonte primária
}

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


  return (
    <SidebarProvider
      style={{ "--sidebar-width": sidebarWidth, "--header-height": "calc(var(--spacing) * 14)" } as React.CSSProperties}
    >
      <div className="w-full lg:pl-[var(--sidebar-width)]">
        <SidebarInset className="w-full transition-all duration-200 z-0 overflow-auto">
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 @container/main">
            <div className="flex flex-col gap-2 mb-4"> {/* Container para Título e Breadcrumb */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold md:text-2xl break-all">
                    {pageTitle}
                  </h1>
                  <p className="text-sm text-muted-foreground break-all">
                    {pageSubtitle}
                  </p>
                </div>
                {/* Ações como 'Exportar Workspace' estão agora em WorkspaceDetailsClientContent */}
              </div>
              <Breadcrumb
                items={[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Workspaces', href: '/workspaces' },
                  { label: pageTitle } // pageTitle já contém o nome do workspace ou o código
                ]}
              />
            </div>

            {fetchError && !config && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Workspace</AlertTitle>
                <AlertDescription>{fetchError}</AlertDescription>
              </Alert>
            )}

            {/* Renderiza o conteúdo do cliente mesmo se config for null inicialmente,
                para que o cliente possa tentar carregar ou mostrar uma mensagem mais específica.
                Ou, podemos passar um prop 'notFound' explicitamente.
                Por ora, passamos config (que pode ser null) e o Client Content lida com isso.
            */}
            <WorkspaceDetailsClientContent
              initialConfig={config}
              workspaceCode={code}
              initialError={fetchError} // Passar o erro para o cliente também
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
