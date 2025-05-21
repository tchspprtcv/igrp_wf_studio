// DecisionStorageService.ts
// Serviço para armazenamento e exportação de tabelas de decisão

export class DecisionStorageService {
  // Cache em memória
  private static decisionCache: Record<string, string> = {};
  
  /**
   * Obtém uma tabela de decisão pelo decisionTable
   * @param decisionTable Chave da tabela de decisão (caminho)
   * @returns Definição da tabela de decisão ou null se não existir
   */
  static async getDecision(decisionTable: string): Promise<string | null> {
    // Verificar cache
    if (this.decisionCache[decisionTable]) {
      return this.decisionCache[decisionTable];
    }
    
    try {
      // Tentar carregar do localStorage
      const dmnXml = localStorage.getItem(`decision:${decisionTable}`);
      if (dmnXml) {
        this.decisionCache[decisionTable] = dmnXml;
        return dmnXml;
      }
      
      // Retornar uma tabela de decisão vazia se não existir
      return this.getDefaultDmnXml(decisionTable);
    } catch (error) {
      console.error('Erro ao carregar tabela de decisão:', error);
      return this.getDefaultDmnXml(decisionTable);
    }
  }
  
  /**
   * Salva uma tabela de decisão
   * @param decisionTable Chave da tabela de decisão (caminho)
   * @param dmnXml Definição da tabela de decisão em XML
   * @returns Chave da tabela de decisão salva
   */
  static async saveDecision(decisionTable: string, dmnXml: string): Promise<string> {
    try {
      // Salvar no localStorage
      localStorage.setItem(`decision:${decisionTable}`, dmnXml);
      
      // Atualizar cache
      this.decisionCache[decisionTable] = dmnXml;
      
      return decisionTable;
    } catch (error) {
      console.error('Erro ao salvar tabela de decisão:', error);
      throw error;
    }
  }
  
  /**
   * Lista todas as tabelas de decisão
   * @returns Lista de chaves de tabelas de decisão
   */
  static async listDecisions(): Promise<string[]> {
    const decisions: string[] = [];
    
    // Listar tabelas de decisão do localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('decision:')) {
        decisions.push(key.substring(9)); // Remover 'decision:'
      }
    }
    
    return decisions;
  }
  
  /**
   * Exporta todas as tabelas de decisão
   * @returns Mapa de chaves para definições de tabelas de decisão
   */
  static async exportAllDecisions(): Promise<Record<string, string>> {
    const decisions: Record<string, string> = {};
    
    // Exportar tabelas de decisão do localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('decision:')) {
        const decisionKey = key.substring(9); // Remover 'decision:'
        const dmnXml = localStorage.getItem(key);
        if (dmnXml) {
          decisions[decisionKey] = dmnXml;
        }
      }
    }
    
    return decisions;
  }
  
  /**
   * Exporta tabelas de decisão relacionadas a um processo
   * @param processId ID do processo
   * @returns Mapa de chaves para definições de tabelas de decisão
   */
  static async exportProcessDecisions(processId: string): Promise<Record<string, string>> {
    const decisions: Record<string, string> = {};
    const prefix = `decisions/${processId}/`;
    
    // Exportar tabelas de decisão do localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('decision:')) {
        const decisionKey = key.substring(9); // Remover 'decision:'
        if (decisionKey.startsWith(prefix)) {
          const dmnXml = localStorage.getItem(key);
          if (dmnXml) {
            decisions[decisionKey] = dmnXml;
          }
        }
      }
    }
    
    return decisions;
  }
  
  /**
   * Importa tabelas de decisão
   * @param decisions Mapa de chaves para definições de tabelas de decisão
   */
  static async importDecisions(decisions: Record<string, string>): Promise<void> {
    for (const [decisionKey, dmnXml] of Object.entries(decisions)) {
      await this.saveDecision(decisionKey, dmnXml);
    }
  }
  
  /**
   * Exclui uma tabela de decisão
   * @param decisionTable Chave da tabela de decisão
   */
  static async deleteDecision(decisionTable: string): Promise<void> {
    // Remover do localStorage
    localStorage.removeItem(`decision:${decisionTable}`);
    
    // Remover do cache
    delete this.decisionCache[decisionTable];
  }
  
  /**
   * Obtém XML DMN padrão
   * @param decisionTable Chave da tabela de decisão
   * @returns XML DMN padrão
   */
  private static getDefaultDmnXml(decisionTable: string): string {
    const id = decisionTable.split('/').pop()?.replace('.dmn', '') || 'decision';
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="definitions_${id}" name="Decision" namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="${id}" name="Decision">
    <decisionTable id="decisionTable_${id}">
      <input id="input1" label="Input 1">
        <inputExpression id="inputExpression1" typeRef="string">
          <text>input1</text>
        </inputExpression>
      </input>
      <output id="output1" label="Output 1" name="output1" typeRef="string" />
      <rule id="rule1">
        <inputEntry id="inputEntry1">
          <text>"value"</text>
        </inputEntry>
        <outputEntry id="outputEntry1">
          <text>"result"</text>
        </outputEntry>
      </rule>
    </decisionTable>
  </decision>
</definitions>`;
  }
}

export default DecisionStorageService;
