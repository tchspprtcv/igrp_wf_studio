import { WorkflowEngineSDK, ProjectConfig, FileOperationResult, AppOptions } from '@igrp/wf-engine';
// Mark this file as server-only to prevent it from being imported in client components
import 'server-only';

// Use dynamic imports for Node.js modules
let nodePath: typeof import('path');
let fs: typeof import('fs/promises');

// Import catalog normally since it will also be marked as server-only
import * as catalog from '../catalog/workspaceCatalog';

// Initialize Node.js modules
if (typeof window === 'undefined') {
  // We're on the server
  nodePath = require('path');
  fs = require('fs/promises');
}

export function getSdkWithSpecificBasePath(specificBasePath: string): WorkflowEngineSDK {
  if (!specificBasePath || typeof specificBasePath !== 'string' || specificBasePath.trim() === '') {
    throw new Error('[WorkspaceManager] specificBasePath inválido fornecido para getSdkWithSpecificBasePath.');
  }
  const sdk = new WorkflowEngineSDK(nodePath.resolve(specificBasePath));
  return sdk;
}

export async function createStudioWorkspace(
  code: string,
  title: string,
  description?: string,
  status: 'active' | 'inactive' | 'draft' = 'active',
  explicitBasePath: string | '' = ''
): Promise<FileOperationResult> {
  const resolvedBasePath = nodePath.resolve(explicitBasePath);
  const sdk = getSdkWithSpecificBasePath(resolvedBasePath);
  const result = await sdk.workspaces.createWorkspace(code, title, description || '', status);

  if (result.success) {
    await catalog.addWorkspaceToCatalog({
      code,
      basePath: resolvedBasePath,
      title,
      description: description || '',
      createdAt: new Date().toISOString(),
    });
  }
  return result;
}

export async function loadStudioWorkspaceConfig(workspaceCode: string): Promise<ProjectConfig | null> {
  const basePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!basePath) {
    console.warn(`[WorkspaceManager] basePath não encontrado no catálogo para workspace: ${workspaceCode}`);
    return null;
  }
  const sdk = getSdkWithSpecificBasePath(basePath);
  return sdk.workspaces.loadProjectConfig(workspaceCode);
}

export async function listStudioWorkspaces(): Promise<AppOptions[]> {
  const catalogEntries = await catalog.readCatalog();
  const appOptionsList: AppOptions[] = [];

  for (const entry of catalogEntries) {
    const appOptionsPath = nodePath.join(entry.basePath, entry.code, 'app-options.json');
    try {
      console.log(`[listStudioWorkspaces] Tentando ler: ${appOptionsPath}`); // Log Adicionado
      const appOptionsContent = await fs.readFile(appOptionsPath, 'utf-8');
      if (appOptionsContent) {
        const appOpt = JSON.parse(appOptionsContent) as AppOptions;
        appOptionsList.push(appOpt);
      } else {
        // Este bloco é menos provável de ser atingido se readFile lançar ENOENT
        console.warn(`[listStudioWorkspaces] app-options.json encontrado mas conteúdo vazio para ${entry.code} em ${entry.basePath}`);
      }
    } catch (error: any) {
       if (error.code === 'ENOENT') {
        // Log específico para ENOENT, mostrando o caminho que falhou
        console.warn(`[listStudioWorkspaces] ERRO ENOENT ao ler ${appOptionsPath}`);
      } else {
        console.error(`[listStudioWorkspaces] Falha ao carregar app-options para workspace ${entry.code} (path: ${appOptionsPath}):`, error);
      }
    }
  }
  return appOptionsList;
}

export async function deleteStudioWorkspace(workspaceCode: string): Promise<FileOperationResult> {
  const basePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!basePath) {
    return { success: false, message: `Workspace ${workspaceCode} não encontrado no catálogo.` };
  }
  const sdk = getSdkWithSpecificBasePath(basePath);
  const result = await sdk.workspaces.deleteWorkspace(workspaceCode);

  if (result.success) {
    await catalog.removeWorkspaceFromCatalog(workspaceCode);
  }
  return result;
}

export async function updateStudioWorkspaceOptions(
  workspaceCode: string,
  updates: Partial<AppOptions>
): Promise<FileOperationResult> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) {
    return { success: false, message: `Workspace ${workspaceCode} não encontrado no catálogo para atualização.` };
  }
  const sdk = getSdkWithSpecificBasePath(parentBasePath);
  const result = await sdk.workspaces.updateWorkspaceOptions(workspaceCode, updates);
  if (result.success) {
    const entry = (await catalog.readCatalog()).find(e => e.code === workspaceCode);
    if (entry) {
      let catalogNeedsUpdate = false;
      if (updates.title && entry.title !== updates.title) {
        entry.title = updates.title;
        catalogNeedsUpdate = true;
      }
      if (updates.description && entry.description !== updates.description) {
        entry.description = updates.description;
        catalogNeedsUpdate = true;
      }
      if (catalogNeedsUpdate) {
        await catalog.addWorkspaceToCatalog(entry);
      }
    }
  }
  return result;
}

export async function addStudioArea(
  workspaceCode: string,
  areaCode: string,
  title: string,
  description?: string,
  status: 'active' | 'inactive' | 'draft' = 'active'
): Promise<FileOperationResult> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) return { success: false, message: `Workspace ${workspaceCode} não encontrado no catálogo.` };
  const sdk = getSdkWithSpecificBasePath(parentBasePath);
  return sdk.workspaces.addArea(workspaceCode, areaCode, title, description || '', status);
}

export async function saveStudioProcessDefinition(
  workspaceCode: string,
  areaCode: string,
  processCode: string,
  bpmnXml: string,
  subAreaCode?: string
): Promise<FileOperationResult> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) return { success: false, message: `Workspace ${workspaceCode} não encontrado no catálogo.` };
  const sdk = getSdkWithSpecificBasePath(parentBasePath);
  return sdk.processes.saveProcessDefinition(workspaceCode, areaCode, processCode, bpmnXml, subAreaCode);
}

export async function readStudioProcessDefinition(
  workspaceCode: string,
  areaCode: string,
  processCode: string,
  subAreaCode?: string,
): Promise<{ bpmnXml: string; fileName: string } | null> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) {
    console.warn(`[WorkspaceManager] basePath não encontrado no catálogo para workspace: ${workspaceCode} ao ler definição de processo.`);
    return null;
  }
  const sdk = getSdkWithSpecificBasePath(parentBasePath);
  const processDefinition = await sdk.processes.readProcessDefinition(workspaceCode, areaCode, processCode, subAreaCode);
  if (!processDefinition) return null;
  return {
    bpmnXml: processDefinition.bpmnXml,
    fileName: `${processCode}.bpmn` // Constructing fileName from processCode
  };
}

export async function addStudioSubArea(
  workspaceCode: string,
  areaCode: string,
  subAreaCode: string,
  title: string,
  description: string,
  status: 'active' | 'inactive' | 'draft' = 'active'
): Promise<FileOperationResult> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) return { success: false, message: `Workspace ${workspaceCode} não encontrado no catálogo.` };
  const sdk = getSdkWithSpecificBasePath(parentBasePath);
  return sdk.workspaces.addSubArea(workspaceCode, areaCode, subAreaCode, title, description, status);
}

export async function addStudioProcessDefinition(
  workspaceCode: string,
  areaCode: string,
  processCode: string,
  title: string,
  description: string,
  subAreaCode?: string,
  status: 'active' | 'inactive' | 'draft' = 'active'
): Promise<FileOperationResult> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) return { success: false, message: `Workspace ${workspaceCode} não encontrado no catálogo.` };
  const sdk = getSdkWithSpecificBasePath(parentBasePath);
  return sdk.workspaces.addProcessDefinition(workspaceCode, areaCode, processCode, title, description, subAreaCode, status);
}

export async function deleteStudioArea(workspaceCode: string, areaCode: string): Promise<FileOperationResult> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) return { success: false, message: `Workspace ${workspaceCode} não encontrado no catálogo.` };
  const sdk = getSdkWithSpecificBasePath(parentBasePath);
  return sdk.workspaces.deleteArea(workspaceCode, areaCode);
}

export async function deleteStudioSubArea(workspaceCode: string, areaCode: string, subAreaCode: string): Promise<FileOperationResult> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) return { success: false, message: `Workspace ${workspaceCode} não encontrado no catálogo.` };
  const sdk = getSdkWithSpecificBasePath(parentBasePath);
  return sdk.workspaces.deleteSubArea(workspaceCode, areaCode, subAreaCode);
}

export async function deleteStudioProcess(
  workspaceCode: string,
  areaCode: string,
  processCode: string,
  subAreaCode?: string
): Promise<FileOperationResult> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) return { success: false, message: `Workspace ${workspaceCode} não encontrado no catálogo.` };
  const sdk = getSdkWithSpecificBasePath(parentBasePath);
  return sdk.workspaces.deleteProcess(workspaceCode, areaCode, processCode, subAreaCode);
}

export async function updateStudioArea(
  workspaceCode: string,
  areaCode: string,
  title: string,
  description: string,
  status: 'active' | 'inactive' | 'draft'
): Promise<FileOperationResult> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) return { success: false, message: `Workspace ${workspaceCode} não encontrado no catálogo.` };
  const sdk = getSdkWithSpecificBasePath(parentBasePath);
  return sdk.workspaces.updateArea(workspaceCode, areaCode, title, description, status);
}

export async function updateStudioSubArea(
  workspaceCode: string,
  areaCode: string,
  subAreaCode: string,
  title: string,
  description: string,
  status: 'active' | 'inactive' | 'draft'
): Promise<FileOperationResult> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) return { success: false, message: `Workspace ${workspaceCode} não encontrado no catálogo.` };
  const sdk = getSdkWithSpecificBasePath(parentBasePath);
  return sdk.workspaces.updateSubArea(workspaceCode, areaCode, subAreaCode, title, description, status);
}

export async function updateStudioProcess(
  workspaceCode: string,
  areaCode: string,
  processCode: string,
  title: string,
  description: string,
  status: 'active' | 'inactive' | 'draft',
  subAreaCode?: string
): Promise<FileOperationResult> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) return { success: false, message: `Workspace ${workspaceCode} não encontrado no catálogo.` };
  const sdk = getSdkWithSpecificBasePath(parentBasePath);
  return sdk.workspaces.updateProcess(workspaceCode, areaCode, processCode, title, description, status, subAreaCode);
}

export async function readStudioFile(workspaceCode: string, relativePathInWorkspace: string): Promise<string | null> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) {
    console.error(`[WorkspaceManager] Impossível ler arquivo: basePath não encontrado para workspace ${workspaceCode}.`);
    return null;
  }
  const absolutePath = nodePath.join(parentBasePath, workspaceCode, relativePathInWorkspace);

  try {
    const content = await fs.readFile(absolutePath, 'utf-8');
    return content;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null;
    }
    console.error(`[WorkspaceManager] Erro ao ler arquivo ${absolutePath}:`, error.message);
    throw error;
  }
}

export async function writeStudioFile(workspaceCode: string, relativePathInWorkspace: string, content: string): Promise<FileOperationResult> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) {
    return { success: false, message: `[WorkspaceManager] Impossível salvar arquivo: basePath não encontrado para workspace ${workspaceCode}.`};
  }
  const absolutePath = nodePath.join(parentBasePath, workspaceCode, relativePathInWorkspace);
  const directory = nodePath.dirname(absolutePath);

  try {
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(absolutePath, content, 'utf-8');
    return { success: true, message: 'Arquivo salvo com sucesso.', path: absolutePath };
  } catch (error: any) {
    console.error(`[WorkspaceManager] Erro ao salvar arquivo ${absolutePath}:`, error.message);
    return { success: false, message: `Erro ao salvar arquivo: ${error.message}` };
  }
}

export async function ensureStudioDir(workspaceCode: string, relativePathInWorkspace: string): Promise<FileOperationResult> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
   if (!parentBasePath) {
    return { success: false, message: `[WorkspaceManager] Impossível assegurar diretório: basePath não encontrado para workspace ${workspaceCode}.`};
  }
  const absolutePath = nodePath.join(parentBasePath, workspaceCode, relativePathInWorkspace);
   try {
    await fs.mkdir(absolutePath, { recursive: true });
    return { success: true, message: 'Diretório assegurado com sucesso.', path: absolutePath };
  } catch (error: any) {
    if (error.code === 'EEXIST') {
        return { success: true, message: 'Diretório já existe.', path: absolutePath };
    }
    console.error(`[WorkspaceManager] Erro ao assegurar diretório ${absolutePath}:`, error.message);
    return { success: false, message: `Erro ao assegurar diretório: ${error.message}` };
  }
}
