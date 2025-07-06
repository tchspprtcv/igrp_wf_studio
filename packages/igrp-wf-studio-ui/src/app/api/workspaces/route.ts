import { NextResponse } from 'next/server';
// import { WorkflowEngineSDK } from '@igrp/wf-engine'; // Não mais necessário aqui
import * as studioMgr from '@/igrpwfstudio/utils/workspaceManager'; // Nosso gerenciador
import { AppOptions, ProjectConfig } from '@igrp/wf-engine'; // Apenas os tipos

// const sdk = new WorkflowEngineSDK(); // REMOVIDO

export async function GET() {
  try {
    // Fetch AppOptions dos workspaces a partir do catálogo
    const appOptionsList: AppOptions[] = await studioMgr.listStudioWorkspaces();
    
    // Fetch project config completo para cada workspace
    // A UI do dashboard parece precisar da estrutura completa com áreas e processos.
    const workspacesWithFullConfig = await Promise.all(
      appOptionsList.map(async (appOpt) => {
        const projectConfig: ProjectConfig | null = await studioMgr.loadStudioWorkspaceConfig(appOpt.code);
        return {
          code: appOpt.code,
          title: appOpt.title || appOpt.description || appOpt.code,
          // Usar áreas do projectConfig se disponível, senão array vazio
          areas: (projectConfig?.areas || []).map((area: any) => ({
            ...area,
            description: area.description || '',
            status: area.status || 'active',
            processes: area.processes || [],
            subareas: (area.subareas || []).map((subarea: any) => ({
              ...subarea,
              description: subarea.description || '',
              status: subarea.status || 'active',
              processes: subarea.processes || []
            }))
          }))
          // Poderia adicionar outros campos do appOpt aqui se necessário, como description, status global, etc.
        };
      })
    );
    
    return NextResponse.json({ workspaces: workspacesWithFullConfig });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces', message: (error as Error).message },
      { status: 500 }
    );
  }
}
