/**
 * Integração dos editores no painel de propriedades BPMN
 */
import React from 'react';
import { openFormEditorModal } from './editors/FormEditorModal';
import { openDecisionEditorModal } from './editors/DecisionEditorModal';
import FormEditorLink from './editors/FormEditorLink';
import DecisionTableLink from './editors/DecisionTableLink';
import EditorService from '../../services/EditorService';

/**
 * Componente para propriedade formKey com editor de formulários
 */
export const ActivitiFormKeyProperty = (props: any) => {
  const { element, getValue, setValue, translate } = props;
  
  const handleEditForm = async () => {
    try {
      // Obter formKey atual ou gerar um padrão
      const formKey = getValue() || `forms/${element.businessObject.$parent?.id || 'process'}/${element.id}-form.json`;
      
      // Abrir o editor de formulário
      openFormEditorModal({
        formKey,
        onSave: async (updatedFormKey) => {
          // Atualizar o valor no elemento BPMN
          setValue(updatedFormKey);
        }
      });
    } catch (error) {
      console.error('Erro ao abrir editor de formulário:', error);
    }
  };
  
  return (
    <FormEditorLink
      {...props}
      onEditClick={handleEditForm}
    />
  );
};

/**
 * Componente para propriedade decisionTable com editor de tabelas de decisão
 */
export const ActivitiDecisionTableProperty = (props: any) => {
  const { element, getValue, setValue, translate } = props;
  
  const handleEditDecision = async () => {
    try {
      // Obter decisionTable atual ou gerar um padrão
      const decisionTable = getValue() || `decisions/${element.businessObject.$parent?.id || 'process'}/${element.id}.dmn`;
      
      // Abrir o editor de tabela de decisão
      openDecisionEditorModal({
        decisionTable,
        onSave: async (updatedDecisionTable) => {
          // Atualizar o valor no elemento BPMN
          setValue(updatedDecisionTable);
        }
      });
    } catch (error) {
      console.error('Erro ao abrir editor de tabela de decisão:', error);
    }
  };
  
  return (
    <DecisionTableLink
      {...props}
      onEditClick={handleEditDecision}
    />
  );
};

/**
 * Função para registrar os componentes personalizados no painel de propriedades
 */
export const registerCustomPropertyProviders = (propertiesPanel: any) => {
  // Substituir o componente padrão para formKey
  if (propertiesPanel && propertiesPanel.registerProvider) {
    propertiesPanel.registerProvider('activiti', 'formKey', ActivitiFormKeyProperty);
    propertiesPanel.registerProvider('activiti', 'decisionTable', ActivitiDecisionTableProperty);
  }
};
