import { WorkflowEngineSDK, ProjectConfig, FileOperationResult, AppOptions } from '@igrp/wf-engine';
// import { getBaseWorkspacePath } from '../config/workspace'; // REMOVIDO - ARQUIVO NÃO EXISTE MAIS
import nodePath from 'node:path';
import fs from 'node:fs/promises';

import * as catalog from '../catalog/workspaceCatalog'; // Importar o gerenciador de catálogo

/**
 * Obtém uma instância do WorkflowEngineSDK configurada com um basePath específico.
 * @param specificBasePath O caminho base absoluto para instanciar o SDK.
 */
export function getSdkWithSpecificBasePath(specificBasePath: string): WorkflowEngineSDK {
  if (!specificBasePath || typeof specificBasePath !== 'string' || specificBasePath.trim() === '') {
    throw new Error('[WorkspaceManager] specificBasePath inválido fornecido para getSdkWithSpecificBasePath.');
  }
  // path.resolve aqui garante que mesmo que um caminho relativo seja acidentalmente passado, ele se torna absoluto.
  // No entanto, esperamos que specificBasePath já seja absoluto vindo do catálogo ou input do usuário.
  const sdk = new WorkflowEngineSDK(nodePath.resolve(specificBasePath));
  // console.log(`[WorkspaceManager] SDK instanciado com specificBasePath: ${specificBasePath}`);
  return sdk;
}

// --- Funções Wrapper para Operações do SDK ---
// Nota: Muitas funções agora precisarão do workspaceCode para buscar o basePath no catálogo.

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
  status: 'active' | 'inactive' | 'draft' = 'active',
  explicitBasePath: string // Novo parâmetro
): Promise<FileOperationResult> {
  const resolvedBasePath = nodePath.resolve(explicitBasePath); // Garante que é absoluto
  const sdk = getSdkWithSpecificBasePath(resolvedBasePath);
  const result = await sdk.workspaces.createWorkspace(code, title, description || '', status);

  if (result.success) {
    await catalog.addWorkspaceToCatalog({
      code,
      basePath: resolvedBasePath, // Salva o caminho absoluto resolvido
      title,
      description: description || '',
      createdAt: new Date().toISOString(),
    });
  }
  return result;
}

/**
 * Carrega a configuração (metadados) de um workspace específico.
 * @param workspaceCode O código do workspace a ser carregado.
 * @returns A configuração do projeto (ProjectConfig) ou null se não encontrado / basePath não encontrado.
 */
export async function loadStudioWorkspaceConfig(workspaceCode: string): Promise<ProjectConfig | null> {
  const basePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!basePath) {
    console.warn(`[WorkspaceManager] basePath não encontrado no catálogo para workspace: ${workspaceCode}`);
    return null;
  }
  const sdk = getSdkWithSpecificBasePath(basePath);
  return sdk.workspaces.loadProjectConfig(workspaceCode);
}

/**
 * Lista todos os workspaces disponíveis a partir do catálogo.
 * Tenta carregar AppOptions para cada um.
 * @returns Uma lista de AppOptions para cada workspace encontrado e carregável.
 */
export async function listStudioWorkspaces(): Promise<AppOptions[]> {
  const catalogEntries = await catalog.readCatalog();
  const appOptionsList: AppOptions[] = [];

  for (const entry of catalogEntries) {
    try {
      // O SDK do wf-engine lê app-options.json de DENTRO da pasta do workspace (basePath/workspaceCode/app-options.json)
      // Mas nosso `entry.basePath` já é o caminho para a pasta do workspace.
      // Portanto, o `listWorkspaces` do SDK original que lê subdiretórios de um `this.basePath` global
      // não se aplica diretamente aqui. Precisamos carregar `app-options.json` para cada entrada.
      // O `WorkflowWorkspaceManager` do SDK tem `loadProjectConfig` e `listWorkspaces` que leem arquivos de config.
      // A função `listWorkspaces` do SDK original varre subdiretórios.
      // Aqui, como temos um catálogo, vamos carregar o `app-options.json` de cada basePath/code.

      // Se entry.basePath é o diretório que CONTÉM a pasta do workspace (ex: /user/workspaces)
      // e o workspace 'my_app' está em /user/workspaces/my_app,
      // então o SDK precisa ser instanciado com /user/workspaces, e aí chamamos sdk.workspaces.loadAppOptions('my_app')
      // Se entry.basePath JÁ É /user/workspaces/my_app, então precisamos ler o app-options.json diretamente.

      // Assumindo que `entry.basePath` é o diretório onde a pasta do workspace (com nome `entry.code`) está.
      // E que `app-options.json` está em `entry.basePath/entry.code/app-options.json`.
      // Esta é a estrutura que o SDK `createWorkspace` cria.
      // Portanto, o SDK deve ser instanciado com `entry.basePath` (o pai da pasta do workspace).

      // CORREÇÃO DE LÓGICA:
      // O `basePath` que o SDK espera é o diretório *pai* da pasta do workspace.
      // Ex: se o workspace 'ws1' está em `/data/meus_workspaces/ws1`,
      // o `basePath` no catálogo deve ser `/data/meus_workspaces/ws1`.
      // E o SDK `createWorkspace` cria os arquivos `app-options.json` e `project-config.json`
      // diretamente DENTRO deste `basePath` (ex: `/data/meus_workspaces/ws1/app-options.json`).
      // Isso difere da minha suposição anterior. Vou verificar o SDK `createWorkspace`.
      // `const appPath = path.join(this.basePath, code);` -> this.basePath é o PAI.
      // `const appOptionsPath = path.join(appPath, 'app-options.json');`
      // Ok, então `entry.basePath` no catálogo deve ser o caminho para a *própria pasta do workspace*.
      // Ex: `/user/my_workspaces/ws1`.
      // E o SDK, para ler configs desse workspace, precisa ser instanciado com o *pai* desse `basePath`,
      // e então chamar `loadProjectConfig('ws1')`. Isso é complicado.

      // Abordagem Mais Simples:
      // O `basePath` no catálogo aponta DIRETAMENTE para a pasta do workspace.
      // Ex: `WorkspaceCatalogEntry { code: "my_app", basePath: "/path/to/my_app_folder" }`
      // E os arquivos de config estão em: `/path/to/my_app_folder/app-options.json`
      // Então, para ler, precisamos de uma função no SDK que leia de um caminho absoluto ou
      // instanciar o SDK com `basePath` como `/path/to/my_app_folder` e chamar um método que lê `app-options.json`
      // a partir da raiz desse `basePath`.
      // O `loadProjectConfig(appCode)` do SDK espera que `appCode` seja um subdiretório do `this.basePath` do SDK.
      // O `listWorkspaces()` do SDK varre subdiretórios de `this.basePath`.

      // Para manter a compatibilidade com a forma como o SDK opera (esperando `appCode` como subdiretório):
      // 1. O `basePath` no catálogo DEVE ser o diretório PAI que PODE CONTER MÚLTIPLOS workspaces.
      // 2. O `code` no catálogo é o nome da subpasta desse workspace.
      // Ex: `WorkspaceCatalogEntry { code: "my_app", basePath: "/path/where_workspaces_live" }`
      //    e o workspace 'my_app' está em `/path/where_workspaces_live/my_app/`.
      //    Então, instanciamos o SDK com `basePath = "/path/where_workspaces_live"`.
      //    E `sdk.workspaces.loadProjectConfig("my_app")` funcionaria.

      // Esta é a interpretação que faz mais sentido com o SDK atual.
      // Portanto, `explicitBasePath` em `createStudioWorkspace` deve ser o diretório PAI.
      // E o `basePath` salvo no catálogo também é este PAI.
      // O nome da pasta do workspace é o `code`.

      // Refazendo `createStudioWorkspace` e `listStudioWorkspaces` com esta lógica:
      // `explicitBasePath` em `createStudioWorkspace` é onde a pasta `code` será criada.
      // No catálogo: `basePath` é este `explicitBasePath`, `code` é o nome da pasta.

      const sdk = getSdkWithSpecificBasePath(entry.basePath); // SDK com o diretório pai
      const appOptionsContent = await sdk.fileSystem.readFile(nodePath.join(entry.basePath, entry.code, 'app-options.json'));
      if (appOptionsContent) {
        const appOpt = JSON.parse(appOptionsContent) as AppOptions;
        appOptionsList.push(appOpt);
      } else {
         // Se app-options.json não for encontrado, podemos adicionar uma entrada parcial ou logar.
         // Por enquanto, vamos apenas adicionar os que têm app-options.json.
         // Ou, alternativamente, poderíamos retornar as entradas do catálogo diretamente,
         // e a UI decide como lidar se app-options não puder ser carregado.
         // Para consistência com o retorno de AppOptions[], vamos carregar.
        console.warn(`[WorkspaceManager] app-options.json não encontrado para ${entry.code} em ${entry.basePath}`);
      }
    } catch (error) {
      console.error(`[WorkspaceManager] Falha ao carregar app-options para workspace ${entry.code} em ${entry.basePath}:`, error);
    }
  }
  return appOptionsList;
}


/**
 * Deleta um workspace (arquivos e entrada do catálogo).
 * @param workspaceCode O código do workspace a ser deletado.
 * @returns Resultado da operação do SDK para deleção de arquivos.
 */
export async function deleteStudioWorkspace(workspaceCode: string): Promise<FileOperationResult> {
  const basePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!basePath) {
    return { success: false, message: `Workspace ${workspaceCode} não encontrado no catálogo.` };
  }
  const sdk = getSdkWithSpecificBasePath(basePath); // SDK com o diretório pai
  const result = await sdk.workspaces.deleteWorkspace(workspaceCode); // Deleta a pasta workspaceCode dentro de basePath

  if (result.success) {
    await catalog.removeWorkspaceFromCatalog(workspaceCode);
  }
  return result;
}

/**
 * Atualiza as opções (metadados em app-options.json) de um workspace.
 * @param workspaceCode Código do workspace a ser atualizado.
 * @param updates Objeto com as propriedades a serem atualizadas (ex: title, description).
 * @returns Resultado da operação do SDK.
 */
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
    // Atualizar title/description no catálogo também, se eles mudaram
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
        await catalog.addWorkspaceToCatalog(entry); // addWorkspaceToCatalog lida com atualização
      }
    }
  }
  return result;
}

// As funções wrapper para áreas, processos, etc., agora precisam do workspaceCode (appCode)
// para buscar o basePath correto do catálogo.

export async function addStudioArea(
  workspaceCode: string, // Anteriormente appCode
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
  workspaceCode: string, // Anteriormente appCode
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
  workspaceCode: string, // Anteriormente appCode
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
  return sdk.processes.readProcessDefinition(workspaceCode, areaCode, processCode, subAreaCode);
}

export async function addStudioSubArea(
  workspaceCode: string, // Anteriormente appCode
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
  workspaceCode: string, // Anteriormente appCode
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
  workspaceCode: string, // Anteriormente appCode
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
  workspaceCode: string, // Anteriormente appCode
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
  workspaceCode: string, // Anteriormente appCode
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
  workspaceCode: string, // Anteriormente appCode
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

// Funções de manipulação de arquivos (readStudioFile, writeStudioFile, ensureStudioDir)
// agora também precisam do workspaceCode para determinar o caminho completo.
// Elas usam fs/promises diretamente, construindo o caminho absoluto.
// O `basePath` do catálogo é o diretório PAI, e `workspaceCode` é o nome da pasta do workspace.
// `relativePathInWorkspace` é o caminho DENTRO da pasta do workspace.
// Ex: workspaceCode = "my_app", relativePath = "_forms/form.json"
// Full path = catalogBasePath/my_app/_forms/form.json

// Comentários sobre importações removidos pois elas estão no topo agora.

export async function readStudioFile(workspaceCode: string, relativePathInWorkspace: string): Promise<string | null> {
  const parentBasePath = await catalog.getWorkspaceBasePathFromCatalog(workspaceCode);
  if (!parentBasePath) {
    console.error(`[WorkspaceManager] Impossível ler arquivo: basePath não encontrado para workspace ${workspaceCode}.`);
    return null;
  }
  const absolutePath = nodePath.join(parentBasePath, workspaceCode, relativePathInWorkspace);
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
  // const basePath = await getBaseWorkspacePath(); // Removido, basePath agora vem do catálogo por workspaceCode
  // const absolutePath = nodePath.join(basePath, relativePathInWorkspace); // Ajustado acima

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
    if (error.code === 'EEXIST') { // Diretório já existe
        return { success: true, message: 'Diretório já existe.', path: absolutePath };
    }
    console.error(`[WorkspaceManager] Erro ao assegurar diretório ${absolutePath}:`, error.message);
    return { success: false, message: `Erro ao assegurar diretório: ${error.message}` };
  }
}

// Comentários sobre importações e ajustes removidos.
