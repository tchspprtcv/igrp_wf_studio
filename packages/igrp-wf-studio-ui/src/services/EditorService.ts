/**
 * EditorService.ts
 * Serviço para integração com o backend para formulários e tabelas de decisão
 */

import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export class EditorService {
  /**
   * Carrega um formulário pelo formKey
   * @param formKey Chave do formulário
   * @returns Definição do formulário
   */
  static async loadForm(formKey: string): Promise<any> {
    try {
      // Verificar se o formKey é válido
      if (!formKey) {
        throw new Error('FormKey inválido');
      }

      // Tentar carregar do backend
      const response = await api.get(`/forms/${encodeURIComponent(formKey)}`);
      
      if (response.status === 200 && response.data) {
        return response.data;
      }
      
      // Se não encontrar, retornar um formulário vazio
      return this.createEmptyForm(formKey);
    } catch (error) {
      console.error('Erro ao carregar formulário:', error);
      // Em caso de erro, retornar um formulário vazio
      return this.createEmptyForm(formKey);
    }
  }

  /**
   * Salva um formulário
   * @param formKey Chave do formulário
   * @param formDefinition Definição do formulário
   * @returns Chave do formulário salvo
   */
  static async saveForm(formKey: string, formDefinition: any): Promise<string> {
    try {
      // Verificar se o formKey é válido
      if (!formKey) {
        throw new Error('FormKey inválido');
      }

      // Garantir que o formulário tenha um ID
      if (!formDefinition.id) {
        formDefinition.id = formKey.split('/').pop()?.replace('.json', '') || 'form';
      }

      // Salvar no backend
      await api.post(`/forms/${encodeURIComponent(formKey)}`, formDefinition);
      
      return formKey;
    } catch (error: any) {
      console.error('Erro ao salvar formulário:', error);
      if (error.response) {
        // A requisição foi feita e o servidor respondeu com um status code
        // que cai fora do range de 2xx
        console.error('Detalhes do erro - Resposta:', error.response.data);
        console.error('Detalhes do erro - Status:', error.response.status);
        console.error('Detalhes do erro - Headers:', error.response.headers);
      } else if (error.request) {
        // A requisição foi feita mas nenhuma resposta foi recebida
        // `error.request` é uma instância do XMLHttpRequest no browser e uma instância de
        // http.ClientRequest no node.js
        console.error('Detalhes do erro - Requisição:', error.request);
      } else {
        // Algo aconteceu na configuração da requisição que acionou um erro
        console.error('Detalhes do erro - Mensagem:', error.message);
      }
      console.error('Configuração da requisição:', error.config);
      throw error;
    }
  }

  /**
   * Carrega uma tabela de decisão pelo decisionTable
   * @param decisionTable Chave da tabela de decisão
   * @returns Definição da tabela de decisão em XML
   */
  static async loadDecision(decisionTable: string): Promise<string> {
    try {
      // Verificar se o decisionTable é válido
      if (!decisionTable) {
        throw new Error('DecisionTable inválido');
      }

      // Tentar carregar do backend
      const response = await api.get(`/decisions/${encodeURIComponent(decisionTable)}`);
      
      if (response.status === 200 && response.data) {
        return response.data;
      }
      
      // Se não encontrar, retornar uma tabela de decisão vazia
      return this.createEmptyDecision(decisionTable);
    } catch (error) {
      console.error('Erro ao carregar tabela de decisão:', error);
      // Em caso de erro, retornar uma tabela de decisão vazia
      return this.createEmptyDecision(decisionTable);
    }
  }

  /**
   * Salva uma tabela de decisão
   * @param decisionTable Chave da tabela de decisão
   * @param dmnXml Definição da tabela de decisão em XML
   * @returns Chave da tabela de decisão salva
   */
  static async saveDecision(decisionTable: string, dmnXml: string): Promise<string> {
    try {
      // Verificar se o decisionTable é válido
      if (!decisionTable) {
        throw new Error('DecisionTable inválido');
      }

      // Salvar no backend
      await api.post(`/decisions/${encodeURIComponent(decisionTable)}`, { xml: dmnXml });
      
      return decisionTable;
    } catch (error) {
      console.error('Erro ao salvar tabela de decisão:', error);
      throw error;
    }
  }

  /**
   * Cria um formulário vazio
   * @param formKey Chave do formulário
   * @returns Formulário vazio
   */
  private static createEmptyForm(formKey: string): any {
    const id = formKey.split('/').pop()?.replace('.json', '') || 'form';
    
    return {
      id,
      name: "Novo Formulário",
      display: "form",
      components: []
    };
  }

  /**
   * Cria uma tabela de decisão vazia
   * @param decisionTable Chave da tabela de decisão
   * @returns XML DMN para tabela de decisão vazia
   */
  private static createEmptyDecision(decisionTable: string): string {
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

export default EditorService;
