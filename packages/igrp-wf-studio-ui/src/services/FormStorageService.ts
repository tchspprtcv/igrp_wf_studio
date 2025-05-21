// FormStorageService.ts
// Serviço para armazenamento e exportação de formulários

export class FormStorageService {
  // Cache em memória
  private static formCache: Record<string, any> = {};
  
  /**
   * Obtém um formulário pelo formKey
   * @param formKey Chave do formulário (caminho)
   * @returns Definição do formulário ou null se não existir
   */
  static async getForm(formKey: string): Promise<any> {
    // Verificar cache
    if (this.formCache[formKey]) {
      return this.formCache[formKey];
    }
    
    try {
      // Tentar carregar do localStorage
      const formJson = localStorage.getItem(`form:${formKey}`);
      if (formJson) {
        const form = JSON.parse(formJson);
        this.formCache[formKey] = form;
        return form;
      }
      
      // Retornar um formulário vazio se não existir
      return {
        id: formKey.split('/').pop()?.replace('.json', '') || 'form',
        name: "Novo Formulário",
        components: []
      };
    } catch (error) {
      console.error('Erro ao carregar formulário:', error);
      return {
        id: formKey.split('/').pop()?.replace('.json', '') || 'form',
        name: "Novo Formulário",
        components: []
      };
    }
  }
  
  /**
   * Salva um formulário
   * @param formKey Chave do formulário (caminho)
   * @param formDefinition Definição do formulário
   * @returns Chave do formulário salvo
   */
  static async saveForm(formKey: string, formDefinition: any): Promise<string> {
    try {
      // Garantir que o formulário tenha um ID
      if (!formDefinition.id) {
        formDefinition.id = formKey.split('/').pop()?.replace('.json', '') || 'form';
      }
      
      // Salvar no localStorage
      localStorage.setItem(`form:${formKey}`, JSON.stringify(formDefinition));
      
      // Atualizar cache
      this.formCache[formKey] = formDefinition;
      
      return formKey;
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      throw error;
    }
  }
  
  /**
   * Lista todos os formulários
   * @returns Lista de chaves de formulários
   */
  static async listForms(): Promise<string[]> {
    const forms: string[] = [];
    
    // Listar formulários do localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('form:')) {
        forms.push(key.substring(5)); // Remover 'form:'
      }
    }
    
    return forms;
  }
  
  /**
   * Exporta todos os formulários
   * @returns Mapa de chaves para definições de formulários
   */
  static async exportAllForms(): Promise<Record<string, any>> {
    const forms: Record<string, any> = {};
    
    // Exportar formulários do localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('form:')) {
        const formKey = key.substring(5); // Remover 'form:'
        const formJson = localStorage.getItem(key);
        if (formJson) {
          forms[formKey] = JSON.parse(formJson);
        }
      }
    }
    
    return forms;
  }
  
  /**
   * Exporta formulários relacionados a um processo
   * @param processId ID do processo
   * @returns Mapa de chaves para definições de formulários
   */
  static async exportProcessForms(processId: string): Promise<Record<string, any>> {
    const forms: Record<string, any> = {};
    const prefix = `forms/${processId}/`;
    
    // Exportar formulários do localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('form:')) {
        const formKey = key.substring(5); // Remover 'form:'
        if (formKey.startsWith(prefix)) {
          const formJson = localStorage.getItem(key);
          if (formJson) {
            forms[formKey] = JSON.parse(formJson);
          }
        }
      }
    }
    
    return forms;
  }
  
  /**
   * Importa formulários
   * @param forms Mapa de chaves para definições de formulários
   */
  static async importForms(forms: Record<string, any>): Promise<void> {
    for (const [formKey, formDefinition] of Object.entries(forms)) {
      await this.saveForm(formKey, formDefinition);
    }
  }
  
  /**
   * Exclui um formulário
   * @param formKey Chave do formulário
   */
  static async deleteForm(formKey: string): Promise<void> {
    // Remover do localStorage
    localStorage.removeItem(`form:${formKey}`);
    
    // Remover do cache
    delete this.formCache[formKey];
  }
}

export default FormStorageService;
