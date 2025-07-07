// Mark this file as server-only to prevent it from being imported in client components
import 'server-only';
import { WorkspaceCatalogEntry } from '../types/workspace';

// Use dynamic imports for Node.js modules
let path: typeof import('path');
let os: typeof import('os');
let fs: typeof import('fs/promises');

// Initialize Node.js modules
if (typeof window === 'undefined') {
  // We're on the server
  path = require('path');
  os = require('os');
  fs = require('fs/promises');
}

const CATALOG_DIR_NAME = '.igrp_wf_studio';
const CATALOG_FILE_NAME = 'workspaces_catalog.json';

/**
 * Retorna o caminho completo para o diretório de configuração/catálogo do IGRP WF Studio.
 * Ex: /home/user/.igrp_wf_studio
 */
function getCatalogDir(): string {
  return path.join(os.homedir(), CATALOG_DIR_NAME);
}

/**
 * Retorna o caminho completo para o arquivo de catálogo de workspaces.
 * Ex: /home/user/.igrp_wf_studio/workspaces_catalog.json
 */
export function getCatalogFilePath(): string {
  return path.join(getCatalogDir(), CATALOG_FILE_NAME);
}

/**
 * Assegura que o diretório do catálogo exista.
 */
async function ensureCatalogDirExists(): Promise<void> {
  const dir = getCatalogDir();
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Lê o catálogo de workspaces do arquivo JSON.
 * Retorna um array vazio se o arquivo não existir ou em caso de erro.
 */
export async function readCatalog(): Promise<WorkspaceCatalogEntry[]> {
  const filePath = getCatalogFilePath();
  try {
    await ensureCatalogDirExists(); // Garante que o diretório exista antes de tentar ler
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as WorkspaceCatalogEntry[];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // Arquivo não existe, retorna catálogo vazio
    }
    console.error(`[WorkspaceCatalog] Erro ao ler catálogo (${filePath}):`, error.message);
    return []; // Retorna vazio em outros erros de leitura/parse para não quebrar a aplicação
  }
}

/**
 * Escreve o array de entradas do catálogo no arquivo JSON.
 * @param entries O array completo de entradas do catálogo a ser salvo.
 */
export async function writeCatalog(entries: WorkspaceCatalogEntry[]): Promise<void> {
  const filePath = getCatalogFilePath();
  try {
    await ensureCatalogDirExists();
    const data = JSON.stringify(entries, null, 2);
    await fs.writeFile(filePath, data, 'utf-8');
    console.log(`[WorkspaceCatalog] Catálogo salvo em ${filePath} com ${entries.length} entradas.`); // Log adicionado
  } catch (error: any) {
    console.error(`[WorkspaceCatalog] Erro ao salvar catálogo (${filePath}):`, error.message);
    throw error; // Re-lança o erro para que o chamador saiba que a escrita falhou
  }
}

/**
 * Adiciona uma nova entrada de workspace ao catálogo.
 * Se já existir uma entrada com o mesmo código, ela será atualizada.
 * @param newEntry A entrada do workspace a ser adicionada/atualizada.
 */
export async function addWorkspaceToCatalog(newEntry: WorkspaceCatalogEntry): Promise<void> {
  if (!newEntry.code || !newEntry.basePath) {
    throw new Error("[WorkspaceCatalog] A entrada do workspace deve conter 'code' e 'basePath'.");
  }
  const entries = await readCatalog();
  const existingIndex = entries.findIndex(entry => entry.code === newEntry.code);

  if (existingIndex !== -1) {
    // Atualiza a entrada existente, preservando createdAt se não fornecido no newEntry
    entries[existingIndex] = {
      ...entries[existingIndex],
      ...newEntry,
      createdAt: entries[existingIndex].createdAt || newEntry.createdAt || new Date().toISOString()
    };
    console.log(`[WorkspaceCatalog] Entrada atualizada para o workspace: ${newEntry.code} em basePath: ${newEntry.basePath}`);
  } else {
    entries.push({
      ...newEntry,
      createdAt: newEntry.createdAt || new Date().toISOString()
    });
    console.log(`[WorkspaceCatalog] Nova entrada adicionada para o workspace: ${newEntry.code} em basePath: ${newEntry.basePath}`);
  }
  await writeCatalog(entries);
}

/**
 * Remove uma entrada de workspace do catálogo pelo código do workspace.
 * @param workspaceCode O código do workspace a ser removido.
 */
export async function removeWorkspaceFromCatalog(workspaceCode: string): Promise<void> {
  let entries = await readCatalog();
  const initialLength = entries.length;
  entries = entries.filter(entry => entry.code !== workspaceCode);

  if (entries.length < initialLength) {
    await writeCatalog(entries);
    console.log(`[WorkspaceCatalog] Workspace removido do catálogo: ${workspaceCode}`);
  } else {
    console.warn(`[WorkspaceCatalog] Tentativa de remover workspace não encontrado no catálogo: ${workspaceCode}`);
  }
}

/**
 * Busca o basePath de um workspace específico no catálogo.
 * @param workspaceCode O código do workspace.
 * @returns O basePath do workspace se encontrado, caso contrário null.
 */
export async function getWorkspaceBasePathFromCatalog(workspaceCode: string): Promise<string | null> {
  const entries = await readCatalog();
  const entry = entries.find(e => e.code === workspaceCode);
  if (entry && entry.basePath) {
    return path.resolve(entry.basePath); // Resolve para garantir que seja absoluto
  }
  return null;
}
