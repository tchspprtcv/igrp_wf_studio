// Tipos específicos da UI que não vêm diretamente do SDK @igrp/wf-engine

/**
 * Estatísticas para o Dashboard.
 */
export interface DashboardStats {
  workspaces: number;
  areas: number;
  processes: number;
  active: number;
}

/**
 * Informações para o modal de edição de item (Área, Subárea, Processo).
 */
export interface EditItemFormData {
  type: 'area' | 'subarea' | 'process';
  // Identificadores do item
  workspaceCode: string;
  itemCode: string;        // Código atual do item
  parentCode?: string;     // Código da Área pai (para Subárea ou Processo em Área)
  grandParentCode?: string; // Código da Área pai (para Processo em Subárea, onde parentCode é Subárea)

  // Campos editáveis
  // newCode?: string; // Código novo, se a renomeação for permitida (complexo)
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
}

/**
 * Tipos para a árvore da Sidebar (representação da view).
 * Estes podem ser diferentes dos tipos do SDK se a sidebar precisar de uma estrutura específica.
 */
export interface SidebarProcess {
  code: string;
  title: string;
  // Outros campos específicos da UI, se necessário
}

export interface SidebarSubArea {
  code: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  processes: SidebarProcess[];
}

export interface SidebarArea {
  code: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  processes: SidebarProcess[];
  subareas: SidebarSubArea[];
}

export interface SidebarWorkspace {
  code: string;
  title: string;
  areas: SidebarArea[];
}

// Tipo para os dados de exportação do workspace (usado na action e no client)
export interface ProcessExportData {
  path: string; // ex: areaCode/subAreaCode/processCode.bpmn
  content: string;
}
export interface WorkspaceExportData {
  projectConfig: import('@igrp/wf-engine').ProjectConfig | null; // Importando tipo do SDK
  processes: ProcessExportData[];
}


// Outros tipos podem ser adicionados aqui conforme necessário.
// Ex: tipos para formulários, props de componentes reutilizáveis, etc.
// Se os tipos do SDK @igrp/wf-engine forem suficientes, preferir usá-los.
// Ex: import { AppOptions, ProjectConfig, Process as SDKProcess } from '@igrp/wf-engine';
// export type WorkspaceForList = AppOptions;
// export type ProcessForEditor = SDKProcess & { bpmnXml?: string | null; appCode: string; areaCode: string; subAreaCode?: string; };
