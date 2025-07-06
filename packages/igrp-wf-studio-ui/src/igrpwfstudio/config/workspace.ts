// Funções para definir e obter o diretório base do workspace.
// Salvar esta configuração em arquivo .json persistente.

import path from 'node:path'; // Usar node:path no servidor
import os from 'node:os';
// Usaremos fs/promises diretamente pois fs-extra pode não estar disponível
// ou pode ser um overhead desnecessário para operações simples.
// Se fs-extra for preferido e já estiver no projeto, podemos mudar.
import fs from 'node:fs/promises';
import { WorkspaceConfig } from '../types/workspace';

const DEFAULT_CONFIG_DIR_NAME = '.igrp_wf_studio'; // Pasta dentro do home do usuário
const CONFIG_FILE_NAME = 'workspace_config.json'; // Arquivo de configuração do basePath

/**
 * Retorna o caminho completo para o arquivo de configuração do workspace.
 * Ex: /home/user/.igrp_wf_studio/workspace_config.json
 */
function getConfigFilePath(): string {
  return path.join(os.homedir(), DEFAULT_CONFIG_DIR_NAME, CONFIG_FILE_NAME);
}

/**
 * Retorna o caminho padrão para os workspaces se nenhuma configuração for encontrada.
 * Ex: /home/user/.igrp_wf_studio_workspaces
 */
function getDefaultWorkspaceBasePath(): string {
  return path.join(os.homedir(), '.igrp_wf_studio_workspaces');
}

/**
 * Assegura que o diretório de configuração exista.
 * @param configPath O caminho para o arquivo de configuração.
 */
async function ensureConfigFileDirExists(configFilePath: string): Promise<void> {
  const dir = path.dirname(configFilePath);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error: any) {
    // Ignora o erro se o diretório já existir
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Obtém o caminho base do workspace configurado pelo usuário.
 * Se nenhuma configuração for encontrada, retorna um caminho padrão.
 * Esta função é destinada a ser executada no lado do servidor (Server Actions, Route Handlers).
 */
export async function getBaseWorkspacePath(): Promise<string> {
  const configFilePath = getConfigFilePath();
  try {
    const data = await fs.readFile(configFilePath, 'utf-8');
    const config: WorkspaceConfig = JSON.parse(data);
    if (config.basePath && typeof config.basePath === 'string') {
      return path.resolve(config.basePath); // Resolve para garantir caminho absoluto
    }
  } catch (error: any) {
    // Se o arquivo não existir (ENOENT) ou não for JSON válido,
    // não é um erro crítico, apenas significa que nenhuma configuração foi definida.
    if (error.code !== 'ENOENT') {
      console.warn(`[WorkspaceConfig] Erro ao ler arquivo de configuração (${configFilePath}):`, error.message);
    }
  }
  // Retorna o padrão se não houver configuração ou em caso de erro na leitura/parse
  return path.resolve(getDefaultWorkspaceBasePath());
}

/**
 * Define e salva o caminho base do workspace.
 * Esta função deve ser uma Server Action.
 * @param newPath O novo caminho base para os workspaces.
 */
export async function setBaseWorkspacePath(newPath: string): Promise<{ success: boolean; message?: string; path?: string }> {
  if (!newPath || typeof newPath !== 'string' || newPath.trim() === '') {
    return { success: false, message: "O caminho fornecido é inválido." };
  }

  const resolvedPath = path.resolve(newPath); // Normaliza e torna absoluto
  const configFilePath = getConfigFilePath();

  try {
    // Tenta criar o diretório fornecido para verificar se é válido e temos permissão.
    // Não queremos criar a pasta de workspaces aqui, apenas validar o caminho.
    // O SDK se encarregará de criar a pasta do workspace específico.
    // Uma verificação mais robusta poderia tentar criar um arquivo temporário.
    // Por agora, vamos assumir que se o diretório de configuração puder ser escrito, está ok.
    // A validação de 'resolvedPath' para ser um diretório válido para workspaces
    // pode ser mais complexa (ex: verificar permissões de escrita no próprio resolvedPath).
    // Por simplicidade, focamos em salvar a configuração.

    await ensureConfigFileDirExists(configFilePath);

    const config: WorkspaceConfig = { basePath: resolvedPath };
    await fs.writeFile(configFilePath, JSON.stringify(config, null, 2), 'utf-8');

    console.log(`[WorkspaceConfig] Caminho base do workspace salvo em ${configFilePath}: ${resolvedPath}`);
    return { success: true, message: "Diretório base do workspace atualizado com sucesso.", path: resolvedPath };
  } catch (error: any) {
    console.error(`[WorkspaceConfig] Erro ao salvar configuração do workspace (${configFilePath}):`, error.message);
    return { success: false, message: `Erro ao salvar configuração: ${error.message}` };
  }
}
