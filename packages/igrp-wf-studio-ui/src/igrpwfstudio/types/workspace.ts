// Definiremos os tipos aqui conforme necessário.
// Por enquanto, um placeholder.

export interface WorkspaceConfig {
  basePath: string;
}

export interface StudioWorkspace {
  code: string;
  title: string;
  description?: string;
  // Outros metadados relevantes podem ser adicionados aqui
}
