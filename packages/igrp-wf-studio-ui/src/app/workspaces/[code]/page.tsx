import { Metadata, ResolvingMetadata } from 'next';
import { WorkflowEngineSDK, ProjectConfig } from '@igrp/wf-engine';
import PageHeader from "@/components/layout/PageHeader"; // Reutilizável
import WorkspaceDetailsClientContent from "./WorkspaceDetailsClientContent"; // Novo Client Component
import { notFound } from 'next/navigation';
import { unstable_cache as nextCache } from 'next/cache';
import Button from '@/components/ui/Button';
import { Archive } from 'lucide-react';

const sdk = new WorkflowEngineSDK();

type Props = {
  params: { code: string };
};

// Função cacheada para carregar configuração de projeto individualmente
// Esta função é semelhante à getProjectConfigCached em app/page.tsx,
// Idealmente, deveria ser uma função utilitária compartilhada ou definida uma vez e importada.
// Por agora, vou redefini-la aqui para manter o exemplo contido.
const getProjectConfigCached = nextCache(
  async (appCode: string) => {
    console.log(`Cache Miss: WorkspaceDetails - getProjectConfigCached para ${appCode}`);
    const config = await sdk.workspaces.loadProjectConfig(appCode);
    if (config) {
      // Adicionar o appCode ao config para fácil acesso no cliente se necessário
      (config as any).appCode = appCode;
    }
    return config;
  },
  ['project-config-details'], // Chave de cache diferente da usada no dashboard para evitar colisões se a lógica for sutilmente diferente
  { tags: ['projects'] } // Pode usar tags mais específicas como [`project-${appCode}`]
);


export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const workspaceCode = params.code;
  const config = await getProjectConfigCached(workspaceCode); // Usar versão cacheada
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: config ? `${config.project || config.code} - Workspace Details` : 'Workspace Not Found',
    description: config ? config.description || `Details for workspace ${config.code}` : 'The requested workspace could not be found.',
    openGraph: {
      images: [...previousImages],
    },
  };
}

// export async function generateStaticParams() { ... } // Mantido comentado

async function getWorkspaceDetails(workspaceCode: string) {
  try {
    const config = await getProjectConfigCached(workspaceCode); // Usar versão cacheada
    if (!config) {
      return { config: null, error: "Workspace configuration not found." };
    }
    return { config, error: null };
  } catch (err) {
    console.error(`Error fetching details for workspace ${workspaceCode} (cached wrapper):`, err);
    return { config: null, error: (err as Error).message };
  }
}

export default async function WorkspaceDetailPage({ params }: Props) {
  const { code } = params;
  const { config, error } = await getWorkspaceDetails(code);

  if (!config) {
    // ou exibir uma mensagem de erro mais elaborada.
    // notFound(); // Isso renderizaria a página not-found.tsx mais próxima
    return (
        <div className="space-y-6 p-4 md:p-6">
            <PageHeader title="Error" description="Workspace not found" />
            <div className="text-red-600 p-4 bg-red-50 rounded-md">
                <p>Could not load details for workspace: {code}.</p>
                {error && <p>Reason: {error}</p>}
            </div>
        </div>
    );
  }

  // O botão de exportação é uma ação global para o workspace,
  // pode ficar no PageHeader gerenciado pelo Client Component.
  // A lógica de `exportingZip` será do Client Component.

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={config.project || config.code}
        description={config.description || 'Manage workspace areas, sub-areas, and processes'}
        // Ações como o botão de exportar ZIP serão parte do WorkspaceDetailsClientContent
        // para que possam controlar o estado 'exportingZip'
      />

      {/* Erro específico da busca de dados, se houver, já tratado acima */}

      <WorkspaceDetailsClientContent initialConfig={config} workspaceCode={code} />
    </div>
  );
}
