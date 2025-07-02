// ExportService.ts
// Serviço para exportação de processos com formulários e tabelas de decisão

import FormStorageService from './FormStorageService';
import DecisionStorageService from './DecisionStorageService';

export class ExportService {
  /**
   * Extrai formKeys de uma definição BPMN
   * @param bpmnXml Definição BPMN em XML
   * @returns Lista de formKeys encontrados
   */
  static extractFormKeysFromBpmn(bpmnXml: string): string[] {
    const formKeys: string[] = [];
    
    try {
      // Expressão regular para encontrar formKey em elementos BPMN
      const formKeyRegex = /activiti:formKey="([^"]+)"/g;
      let match;
      
      while ((match = formKeyRegex.exec(bpmnXml)) !== null) {
        const formKey = match[1];
        if (!formKeys.includes(formKey)) {
          formKeys.push(formKey);
        }
      }
    } catch (error) {
      console.error('Erro ao extrair formKeys:', error);
    }
    
    return formKeys;
  }
  
  /**
   * Extrai decisionTables de uma definição BPMN
   * @param bpmnXml Definição BPMN em XML
   * @returns Lista de decisionTables encontrados
   */
  static extractDecisionTablesFromBpmn(bpmnXml: string): string[] {
    const decisionTables: string[] = [];
    
    try {
      // Expressão regular para encontrar decisionTable em elementos BPMN
      const decisionTableRegex = /activiti:decisionTable="([^"]+)"/g;
      let match;
      
      while ((match = decisionTableRegex.exec(bpmnXml)) !== null) {
        const decisionTable = match[1];
        if (!decisionTables.includes(decisionTable)) {
          decisionTables.push(decisionTable);
        }
      }
    } catch (error) {
      console.error('Erro ao extrair decisionTables:', error);
    }
    
    return decisionTables;
  }
  
  /**
   * Exporta um processo com seus formulários e tabelas de decisão
   * @param processId ID do processo
   * @param bpmnXml Definição BPMN em XML
   * @returns Pacote de exportação com BPMN, formulários e tabelas de decisão
   */
  static async exportProcess(processId: string, bpmnXml: string): Promise<ProcessExportPackage> {
    try {
      // Extrair formKeys e decisionTables da definição BPMN
      const formKeys = this.extractFormKeysFromBpmn(bpmnXml);
      const decisionTables = this.extractDecisionTablesFromBpmn(bpmnXml);
      
      // Obter formulários relacionados
      const allForms = await FormStorageService.exportProcessForms(processId);
      const relatedForms: Record<string, any> = {};
      
      // Filtrar formulários relacionados
      for (const formKey of formKeys) {
        if (allForms[formKey]) {
          relatedForms[formKey] = allForms[formKey];
        }
      }
      
      // Obter tabelas de decisão relacionadas
      const allDecisions = await DecisionStorageService.exportProcessDecisions(processId);
      const relatedDecisions: Record<string, string> = {};
      
      // Filtrar tabelas de decisão relacionadas
      for (const decisionTable of decisionTables) {
        if (allDecisions[decisionTable]) {
          relatedDecisions[decisionTable] = allDecisions[decisionTable];
        }
      }
      
      // Criar pacote de exportação
      return {
        processId,
        bpmn: bpmnXml,
        forms: relatedForms,
        decisions: relatedDecisions
      };
    } catch (error) {
      console.error('Erro ao exportar processo:', error);
      throw error;
    }
  }
  
  /**
   * Importa um processo com seus formulários e tabelas de decisão
   * @param exportPackage Pacote de exportação
   * @returns ID do processo importado
   */
  static async importProcess(exportPackage: ProcessExportPackage): Promise<string> {
    try {
      const { processId, forms, decisions } = exportPackage;
      
      // Importar formulários
      await FormStorageService.importForms(forms);
      
      // Importar tabelas de decisão
      await DecisionStorageService.importDecisions(decisions);
      
      return processId;
    } catch (error) {
      console.error('Erro ao importar processo:', error);
      throw error;
    }
  }
}

/**
 * Interface para pacote de exportação de processo
 */
export interface ProcessExportPackage {
  processId: string;
  bpmn: string;
  forms: Record<string, any>;
  decisions: Record<string, string>;
}

export default ExportService;
