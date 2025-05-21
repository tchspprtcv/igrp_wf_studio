/**
 * EditorService.ts
 * Serviço para gerenciar o armazenamento e carregamento de formulários e tabelas de decisão
 * Implementa fallback para armazenamento local quando o backend não está disponível
 */
import axios from 'axios';

// Chaves para armazenamento local
const FORM_STORAGE_KEY = 'igrp-wf-studio-forms';
const DECISION_TABLE_STORAGE_KEY = 'igrp-wf-studio-decision-tables';

/**
 * Classe EditorService
 * 
 * Gerencia o armazenamento e carregamento de formulários e tabelas de decisão
 * Implementa fallback para armazenamento local quando o backend não está disponível
 */
class EditorService {
  /**
   * Carregar um formulário pelo ID
   * 
   * @param formKey ID do formulário
   * @returns Definição do formulário
   */
  async loadForm(formKey: string): Promise<any> {
    try {
      // Tentar carregar do backend
      const response = await axios.get(`/api/forms/${formKey}`);
      
      // Verificar se o retorno é um objeto JSON válido
      if (response.data && typeof response.data === 'object') {
        return response.data;
      }
      
      // Se o retorno não for um objeto, verificar se é uma string HTML
      if (typeof response.data === 'string' && 
          (response.data.trim().startsWith('<!DOCTYPE') || 
           response.data.trim().startsWith('<html'))) {
        console.warn('Resposta do backend é HTML, não JSON. Usando localStorage.');
        throw new Error('Resposta do backend é HTML, não JSON');
      }
      
      // Se não for HTML mas também não for um objeto válido
      if (typeof response.data !== 'object') {
        console.warn('Resposta do backend não é um objeto JSON válido. Usando localStorage.');
        throw new Error('Resposta do backend não é um objeto JSON válido');
      }
      
      return response.data;
    } catch (error) {
      console.log('Erro ao carregar formulário do backend, tentando localStorage:', error);
      
      // Fallback para localStorage
      return this.loadFormFromLocalStorage(formKey);
    }
  }
  
  /**
   * Carregar um formulário do localStorage
   * 
   * @param formKey ID do formulário
   * @returns Definição do formulário
   */
  private loadFormFromLocalStorage(formKey: string): any {
    try {
      const storedForms = localStorage.getItem(FORM_STORAGE_KEY);
      if (storedForms) {
        try {
          const forms = JSON.parse(storedForms);
          if (forms[formKey]) {
            return forms[formKey];
          }
        } catch (parseError) {
          console.error('Erro ao fazer parse do JSON armazenado:', parseError);
          // Limpar o localStorage corrompido
          localStorage.removeItem(FORM_STORAGE_KEY);
        }
      }
      
      // Se não encontrar ou houver erro, retornar um formulário vazio
      return {
        display: 'form',
        components: [],
        type: 'form',
        tags: [],
        title: 'Novo Formulário',
        name: 'novoFormulario'
      };
    } catch (error) {
      console.error('Erro ao carregar formulário do localStorage:', error);
      
      // Retornar um formulário vazio em caso de erro
      return {
        display: 'form',
        components: [],
        type: 'form',
        tags: [],
        title: 'Novo Formulário',
        name: 'novoFormulario'
      };
    }
  }
  
  /**
   * Salvar um formulário
   * 
   * @param formKey ID do formulário
   * @param formDefinition Definição do formulário
   * @returns ID do formulário salvo
   */
  async saveForm(formKey: string, formDefinition: any): Promise<string> {
    try {
      // Verificar se formDefinition é um objeto válido
      if (!formDefinition || typeof formDefinition !== 'object') {
        throw new Error('Definição de formulário inválida');
      }
      
      // Tentar salvar no backend
      const response = await axios.post(`/api/forms/${formKey}`, formDefinition);
      
      // Verificar se a resposta é válida
      if (response.data && (response.data.formKey || response.data.id)) {
        return response.data.formKey || response.data.id || formKey;
      }
      
      // Se a resposta não contiver formKey, usar o original
      return formKey;
    } catch (error) {
      console.log('Erro ao salvar formulário no backend, usando localStorage:', error);
      
      // Fallback para localStorage
      return this.saveFormToLocalStorage(formKey, formDefinition);
    }
  }
  
  /**
   * Salvar um formulário no localStorage
   * 
   * @param formKey ID do formulário
   * @param formDefinition Definição do formulário
   * @returns ID do formulário salvo
   */
  private saveFormToLocalStorage(formKey: string, formDefinition: any): string {
    try {
      // Verificar se formDefinition é um objeto válido
      if (!formDefinition || typeof formDefinition !== 'object') {
        throw new Error('Definição de formulário inválida');
      }
      
      // Carregar formulários existentes
      let forms = {};
      try {
        const storedForms = localStorage.getItem(FORM_STORAGE_KEY);
        if (storedForms) {
          forms = JSON.parse(storedForms);
        }
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON armazenado:', parseError);
        // Continuar com um objeto vazio
        forms = {};
      }
      
      // Adicionar ou atualizar o formulário
      forms[formKey] = formDefinition;
      
      // Salvar de volta no localStorage
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(forms));
      
      return formKey;
    } catch (error) {
      console.error('Erro ao salvar formulário no localStorage:', error);
      
      // Em caso de erro, ainda retornar o formKey para não quebrar o fluxo
      return formKey;
    }
  }
  
  /**
   * Carregar uma tabela de decisão pelo ID
   * 
   * @param decisionTableKey ID da tabela de decisão
   * @returns XML da tabela de decisão
   */
  async loadDecisionTable(decisionTableKey: string): Promise<string> {
    try {
      // Tentar carregar do backend
      const response = await axios.get(`/api/decision-tables/${decisionTableKey}`);
      
      // Verificar se o retorno é uma string XML válida
      if (typeof response.data === 'string' && 
          (response.data.trim().startsWith('<?xml') || 
           response.data.trim().startsWith('<definitions'))) {
        return response.data;
      }
      
      // Se o retorno for um objeto com propriedade xml
      if (response.data && typeof response.data === 'object' && response.data.xml) {
        return response.data.xml;
      }
      
      // Se o retorno for HTML ou outro formato inválido
      if (typeof response.data === 'string' && 
          (response.data.trim().startsWith('<!DOCTYPE') || 
           response.data.trim().startsWith('<html'))) {
        console.warn('Resposta do backend é HTML, não XML. Usando localStorage.');
        throw new Error('Resposta do backend é HTML, não XML');
      }
      
      // Se não for um formato reconhecido
      throw new Error('Formato de resposta do backend não reconhecido');
    } catch (error) {
      console.log('Erro ao carregar tabela de decisão do backend, tentando localStorage:', error);
      
      // Fallback para localStorage
      return this.loadDecisionTableFromLocalStorage(decisionTableKey);
    }
  }
  
  /**
   * Carregar uma tabela de decisão do localStorage
   * 
   * @param decisionTableKey ID da tabela de decisão
   * @returns XML da tabela de decisão
   */
  private loadDecisionTableFromLocalStorage(decisionTableKey: string): string {
    try {
      const storedTables = localStorage.getItem(DECISION_TABLE_STORAGE_KEY);
      if (storedTables) {
        try {
          const tables = JSON.parse(storedTables);
          if (tables[decisionTableKey]) {
            return tables[decisionTableKey];
          }
        } catch (parseError) {
          console.error('Erro ao fazer parse do JSON armazenado:', parseError);
          // Limpar o localStorage corrompido
          localStorage.removeItem(DECISION_TABLE_STORAGE_KEY);
        }
      }
      
      // Se não encontrar, retornar uma tabela de decisão vazia
      return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" xmlns:di="http://www.omg.org/spec/DMN/20180521/DI/" id="Definitions_${decisionTableKey}" name="DRD" namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="Decision_${decisionTableKey}" name="Decision Table">
    <decisionTable id="DecisionTable_${decisionTableKey}">
      <input id="Input_1">
        <inputExpression id="InputExpression_1" typeRef="string">
          <text>input1</text>
        </inputExpression>
      </input>
      <output id="Output_1" typeRef="string" />
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram id="DMNDiagram_1">
      <dmndi:DMNShape id="DMNShape_1" dmnElementRef="Decision_${decisionTableKey}">
        <dc:Bounds height="80" width="180" x="160" y="100" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>`;
    } catch (error) {
      console.error('Erro ao carregar tabela de decisão do localStorage:', error);
      
      // Retornar uma tabela de decisão vazia em caso de erro
      return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" xmlns:di="http://www.omg.org/spec/DMN/20180521/DI/" id="Definitions_${decisionTableKey}" name="DRD" namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="Decision_${decisionTableKey}" name="Decision Table">
    <decisionTable id="DecisionTable_${decisionTableKey}">
      <input id="Input_1">
        <inputExpression id="InputExpression_1" typeRef="string">
          <text>input1</text>
        </inputExpression>
      </input>
      <output id="Output_1" typeRef="string" />
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram id="DMNDiagram_1">
      <dmndi:DMNShape id="DMNShape_1" dmnElementRef="Decision_${decisionTableKey}">
        <dc:Bounds height="80" width="180" x="160" y="100" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>`;
    }
  }
  
  /**
   * Salvar uma tabela de decisão
   * 
   * @param decisionTableKey ID da tabela de decisão
   * @param decisionTableXml XML da tabela de decisão
   * @returns ID da tabela de decisão salva
   */
  async saveDecisionTable(decisionTableKey: string, decisionTableXml: string): Promise<string> {
    try {
      // Verificar se decisionTableXml é uma string XML válida
      if (typeof decisionTableXml !== 'string' || 
          (!decisionTableXml.trim().startsWith('<?xml') && 
           !decisionTableXml.trim().startsWith('<definitions'))) {
        throw new Error('XML de tabela de decisão inválido');
      }
      
      // Tentar salvar no backend
      const response = await axios.post(`/api/decision-tables/${decisionTableKey}`, { xml: decisionTableXml });
      
      // Verificar se a resposta é válida
      if (response.data && (response.data.decisionTableKey || response.data.id)) {
        return response.data.decisionTableKey || response.data.id || decisionTableKey;
      }
      
      // Se a resposta não contiver decisionTableKey, usar o original
      return decisionTableKey;
    } catch (error) {
      console.log('Erro ao salvar tabela de decisão no backend, usando localStorage:', error);
      
      // Fallback para localStorage
      return this.saveDecisionTableToLocalStorage(decisionTableKey, decisionTableXml);
    }
  }
  
  /**
   * Salvar uma tabela de decisão no localStorage
   * 
   * @param decisionTableKey ID da tabela de decisão
   * @param decisionTableXml XML da tabela de decisão
   * @returns ID da tabela de decisão salva
   */
  private saveDecisionTableToLocalStorage(decisionTableKey: string, decisionTableXml: string): string {
    try {
      // Verificar se decisionTableXml é uma string válida
      if (typeof decisionTableXml !== 'string') {
        throw new Error('XML de tabela de decisão inválido');
      }
      
      // Carregar tabelas existentes
      let tables = {};
      try {
        const storedTables = localStorage.getItem(DECISION_TABLE_STORAGE_KEY);
        if (storedTables) {
          tables = JSON.parse(storedTables);
        }
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON armazenado:', parseError);
        // Continuar com um objeto vazio
        tables = {};
      }
      
      // Adicionar ou atualizar a tabela
      tables[decisionTableKey] = decisionTableXml;
      
      // Salvar de volta no localStorage
      localStorage.setItem(DECISION_TABLE_STORAGE_KEY, JSON.stringify(tables));
      
      return decisionTableKey;
    } catch (error) {
      console.error('Erro ao salvar tabela de decisão no localStorage:', error);
      
      // Em caso de erro, ainda retornar o decisionTableKey para não quebrar o fluxo
      return decisionTableKey;
    }
  }
  
  /**
   * Limpar o cache local de formulários e tabelas de decisão
   * Útil para debugging e resolução de problemas
   */
  clearLocalStorage(): void {
    try {
      localStorage.removeItem(FORM_STORAGE_KEY);
      localStorage.removeItem(DECISION_TABLE_STORAGE_KEY);
      console.log('Cache local limpo com sucesso');
    } catch (error) {
      console.error('Erro ao limpar cache local:', error);
    }
  }
}

// Exportar instância única
export default new EditorService();
