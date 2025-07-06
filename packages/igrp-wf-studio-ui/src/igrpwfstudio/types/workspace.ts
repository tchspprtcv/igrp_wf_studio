// Tipos relacionados a workspaces e sua configuração.

export interface StudioWorkspace {
  code: string; // Código único do workspace
  title: string;
  description?: string;
  // Outros metadados relevantes podem ser adicionados aqui se necessário
}

// Nova interface para a entrada no catálogo de workspaces
export interface WorkspaceCatalogEntry {
  code: string;       // Código único do workspace, deve corresponder ao nome da pasta do workspace
  basePath: string;   // Caminho absoluto para o diretório onde este workspace está armazenado
  title?: string;      // Um título para exibição, pode ser sincronizado do app-options.json
  description?: string; // Uma descrição para exibição
  createdAt?: string;  // ISO date string de quando foi adicionado ao catálogo
  // Outros metadados que possam ser úteis para o catálogo
}
