import { WorkflowEngineSDK, ProjectConfig, FileOperationResult, AppOptions } from '@igrp/wf-engine';
import { getBaseWorkspacePath } from '../config/workspace'; // Função do Passo 2
import nodePath from 'node:path'; // Movido para o topo
import fs from 'node:fs/promises';   // Movido para o topo

/**
 * Obtém uma instância do WorkflowEngineSDK configurada com o basePath
 * lido do arquivo de configuração ou o padrão.
 * Esta função deve ser chamada no servidor (Server Actions, Route Handlers)
 * sempre que uma operação do SDK for necessária.
 */
export async function getSdkWithBaseConfigured(): Promise<WorkflowEngineSDK> {
  const basePath = await getBaseWorkspacePath();
  // Importante: Criar uma nova instância do SDK cada vez que esta função for chamada
  // ou gerenciar uma instância singleton de forma cuidadosa se o basePath puder mudar
  // em tempo de execução (o que não é o caso aqui, pois a configuração é lida do arquivo).
  // Para Server Actions, uma nova instância por chamada é mais seguro e simples.
  const sdk = new WorkflowEngineSDK(basePath);
  // console.log(`[WorkspaceManager] SDK instanciado com basePath: ${basePath}`);
  return sdk;
}

// --- Funções Wrapper para Operações do SDK ---

/**
 * Cria um novo workspace (projeto) usando o SDK configurado.
 * @param code Código único para o workspace.
 * @param title Título do workspace.
 * @param description Descrição opcional.
 * @param status Status inicial ('active', 'inactive', 'draft').
 * @returns Resultado da operação do SDK.
 */
export async function createStudioWorkspace(
  code: string,
  title: string,
  description?: string,
  status: 'active' | 'inactive' | 'draft' = 'active'
): Promise<FileOperationResult> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.workspaces.createWorkspace(code, title, description || '', status);
}

/**
 * Carrega a configuração (metadados) de um workspace específico.
 * @param workspaceCode O código do workspace a ser carregado.
 * @returns A configuração do projeto (ProjectConfig) ou null se não encontrado.
 */
export async function loadStudioWorkspaceConfig(workspaceCode: string): Promise<ProjectConfig | null> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.workspaces.loadProjectConfig(workspaceCode);
}

/**
 * Lista todos os workspaces disponíveis.
 * @returns Uma lista de opções de aplicativo (AppOptions) para cada workspace.
 */
export async function listStudioWorkspaces(): Promise<AppOptions[]> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.workspaces.listWorkspaces();
}

/**
 * Deleta um workspace.
 * @param workspaceCode O código do workspace a ser deletado.
 * @returns Resultado da operação do SDK.
 */
export async function deleteStudioWorkspace(workspaceCode: string): Promise<FileOperationResult> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.workspaces.deleteWorkspace(workspaceCode);
}

/**
 * Atualiza as opções (metadados) de um workspace.
 * @param workspaceCode Código do workspace a ser atualizado.
 * @param updates Objeto com as propriedades a serem atualizadas (ex: title, description).
 * @returns Resultado da operação do SDK.
 */
export async function updateStudioWorkspaceOptions(
  workspaceCode: string,
  updates: Partial<AppOptions>
): Promise<FileOperationResult> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.workspaces.updateWorkspaceOptions(workspaceCode, updates);
}


// Adicionar outras funções wrapper conforme necessário para áreas, processos, etc.
// Exemplo para adicionar uma área:
export async function addStudioArea(
  workspaceCode: string,
  areaCode: string,
  title: string,
  description?: string,
  status: 'active' | 'inactive' | 'draft' = 'active'
): Promise<FileOperationResult> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.workspaces.addArea(workspaceCode, areaCode, title, description || '', status);
}

// Exemplo para salvar uma definição de processo:
export async function saveStudioProcessDefinition(
  workspaceCode: string,
  areaCode: string,
  processCode: string,
  bpmnXml: string,
  subAreaCode?: string
): Promise<FileOperationResult> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.processes.saveProcessDefinition(workspaceCode, areaCode, processCode, bpmnXml, subAreaCode);
}

// Exemplo para ler uma definição de processo
export async function readStudioProcessDefinition(
  workspaceCode: string,
  areaCode: string,
  processCode: string,
  subAreaCode?: string,
): Promise<{ bpmnXml: string; fileName: string } | null> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.processes.readProcessDefinition(workspaceCode, areaCode, processCode, subAreaCode);
}


// Outras funções wrapper que podem ser necessárias pelas Server Actions existentes:
// (Mapeando as funções usadas em `packages/igrp-wf-studio-ui/src/app/actions.ts`)

export async function addStudioSubArea(
  appCode: string,
  areaCode: string,
  subAreaCode: string,
  title: string,
  description: string,
  status: 'active' | 'inactive' | 'draft' = 'active'
): Promise<FileOperationResult> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.workspaces.addSubArea(appCode, areaCode, subAreaCode, title, description, status);
}

export async function addStudioProcessDefinition(
  appCode: string,
  areaCode: string,
  processCode: string,
  title: string,
  description: string,
  subAreaCode?: string,
  status: 'active' | 'inactive' | 'draft' = 'active'
): Promise<FileOperationResult> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.workspaces.addProcessDefinition(appCode, areaCode, processCode, title, description, subAreaCode, status);
}

export async function deleteStudioArea(appCode: string, areaCode: string): Promise<FileOperationResult> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.workspaces.deleteArea(appCode, areaCode);
}

export async function deleteStudioSubArea(appCode: string, areaCode: string, subAreaCode: string): Promise<FileOperationResult> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.workspaces.deleteSubArea(appCode, areaCode, subAreaCode);
}

export async function deleteStudioProcess(
  appCode: string,
  areaCode: string,
  processCode: string,
  subAreaCode?: string
): Promise<FileOperationResult> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.workspaces.deleteProcess(appCode, areaCode, processCode, subAreaCode);
}

export async function updateStudioArea(
  appCode: string,
  areaCode: string,
  title: string,
  description: string,
  status: 'active' | 'inactive' | 'draft'
): Promise<FileOperationResult> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.workspaces.updateArea(appCode, areaCode, title, description, status);
}

export async function updateStudioSubArea(
  appCode: string,
  areaCode: string,
  subAreaCode: string,
  title: string,
  description: string,
  status: 'active' | 'inactive' | 'draft'
): Promise<FileOperationResult> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.workspaces.updateSubArea(appCode, areaCode, subAreaCode, title, description, status);
}

export async function updateStudioProcess(
  appCode: string,
  areaCode: string,
  processCode: string,
  title: string,
  description: string,
  status: 'active' | 'inactive' | 'draft',
  subAreaCode?: string
): Promise<FileOperationResult> {
  const sdk = await getSdkWithBaseConfigured();
  return sdk.workspaces.updateProcess(appCode, areaCode, processCode, title, description, status, subAreaCode);
}

// Funções de manipulação de arquivos genéricas do SDK (readFile, writeFile, etc.)
// geralmente não precisam de wrapper aqui, a menos que queiramos adicionar
// lógica específica antes ou depois de chamá-las no contexto do Studio.
// Por exemplo, a `loadFormAction` e `saveFormAction` em `actions.ts` usam `readFile` e `writeFile` do SDK.
// Elas constroem paths relativos ao workspace (ex: `appCode/_forms/elementId.form.json`).
// O SDK, quando instanciado com o `basePath` correto (ex: `/path/to/user/workspaces`),
// interpretará `readFile('myWorkspaceCode/_forms/form.json')` como
// `/path/to/user/workspaces/myWorkspaceCode/_forms/form.json`.
// Portanto, as actions que usam `readFile` e `writeFile` do SDK diretamente
// também precisarão obter a instância do SDK configurada via `getSdkWithBaseConfigured()`.
// Exemplo:
// async function someActionUsingReadFile(appCode: string, relativeFilePath: string) {
//   const sdk = await getSdkWithBaseConfigured();
//   return sdk.fileSystem.readFile(path.join(appCode, relativeFilePath)); // sdk.fileSystem.readFile(path)
// }
// No entanto, o SDK exporta `readFile` e `writeFile` no nível raiz, que já são configurados pelo basePath.
// O `workflowWorkspace.ts` do SDK usa `import { writeFile, readFile } from '../utils/fileSystem';`
// e o `fileSystem.ts` não usa o `basePath` da instância do SDK para essas funções, elas são estáticas.
// Isso é um problema. As funções `readFile`, `writeFile` em `fileSystem.ts` do SDK
// NÃO são cientes do `basePath` da instância do `WorkflowEngineSDK`. Elas operam relativas ao CWD do processo
// ou ao que `getWorkspaceDir()` retorna por padrão (`./`).

// CORREÇÃO NECESSÁRIA NO SDK ou WORKAROUND:
// Para que `readFile` e `writeFile` (e outros de `fileSystem.ts`) respeitem o `basePath` configurado,
// eles precisariam ser métodos de uma classe `FileSystemManager` que é instanciada com `basePath`,
// ou as funções estáticas precisariam de um parâmetro `basePath`.
// O `WorkflowEngineSDK` já tem uma propriedade `this.basePath`.
// Vamos assumir que o SDK deveria ter métodos como `sdk.readFile(relativePath)` que internamente fazem `path.join(this.basePath, relativePath)`.

// Verificando o `index.ts` do `@igrp/wf-engine`:
// `export { WorkflowEngineSDK } from './core/workflowWorkspace';` (WorkflowWorkspaceManager é exportado como WorkflowEngineSDK)
// `export * from './utils/fileSystem';` (exporta readFile, writeFile diretamente)
// `export * from './types';`

// As funções `readFile`, `writeFile` exportadas pelo SDK são as de `utils/fileSystem.ts`
// e elas NÃO usam o `this.basePath` da instância do SDK.
// Isso significa que as Server Actions que usam `readFile` e `writeFile` diretamente do SDK
// não funcionarão corretamente com o `basePath` dinâmico.

// SOLUÇÃO:
// 1. Ideal: Modificar o SDK `@igrp/wf-engine` para que `readFile`, `writeFile` etc., sejam métodos da instância do SDK
//    ou aceitem um `basePath` como argumento.
// 2. Workaround no `workspaceManager.ts`: Criar nossos próprios wrappers para `readFile`, `writeFile`
//    que usem o `basePath` obtido de `getBaseWorkspacePath()` e `path.join`.

// Vou implementar o workaround (2) por agora.

// Comentários sobre importações removidos pois elas estão no topo agora.

export async function readStudioFile(relativePathInWorkspace: string): Promise<string | null> {
  // const sdk = await getSdkWithBaseConfigured(); // Não precisamos mais do SDK aqui para basePath
  const basePath = await getBaseWorkspacePath();
  const absolutePath = nodePath.join(basePath, relativePathInWorkspace);

  try {
    const content = await fs.readFile(absolutePath, 'utf-8');
    return content;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null; // Arquivo não encontrado
    }
    console.error(`[WorkspaceManager] Erro ao ler arquivo ${absolutePath}:`, error.message);
    throw error; // Re-lança outros erros
  }
}

export async function writeStudioFile(relativePathInWorkspace: string, content: string): Promise<FileOperationResult> {
  const basePath = await getBaseWorkspacePath();
  const absolutePath = nodePath.join(basePath, relativePathInWorkspace);
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

export async function ensureStudioDir(relativePathInWorkspace: string): Promise<FileOperationResult> {
  const basePath = await getBaseWorkspacePath();
  const absolutePath = nodePath.join(basePath, relativePathInWorkspace);
   try {
    await fs.mkdir(absolutePath, { recursive: true });
    return { success: true, message: 'Diretório assegurado com sucesso.', path: absolutePath };
  } catch (error: any) {
    if (error.code === 'EEXIST') { // Diretório já existe
        return { success: true, message: 'Diretório já existe.', path: absolutePath };
    }
    console.error(`[WorkspaceManager] Erro ao assegurar diretório ${absolutePath}:`, error.message);
    return { success: false, message: `Erro ao assegurar diretório: ${error.message}` };
  }
}

// Comentários sobre importações e ajustes removidos.
