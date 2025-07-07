/**
 * Integração dos editores no painel de propriedades BPMN
 */
import React from 'react';
import { openFormEditorModal } from './editors/FormEditorModal';
import { openDecisionEditorModal } from './editors/DecisionEditorModal';
import FormEditorLink from './editors/FormEditorLink';
import DecisionTableLink from './editors/DecisionTableLink';

/**
 * Componente para propriedade formKey com editor de formulários
 */
export const ActivitiFormKeyProperty = (props: any) => {
  const { element, getValue, setValue, translate } = props;
  
  const handleEditForm = async () => {
    try {
      // Obter formKey atual ou gerar um padrão
      const formKey = getValue() || `forms/${element.businessObject.$parent?.id || 'process'}/${element.id}-form.json`;
      
      // Extrair appCode do formKey (formato esperado: "appCode:path/to/form.json")
      const [appCode, formPath] = formKey.split(':');
      
      // Abrir o editor de formulário
      openFormEditorModal({
        appCode: appCode || 'default', // Usar um valor padrão se não houver appCode
        formKey: formPath || formKey, // Usar o caminho extraído ou o formKey completo
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
      const decisionTableKey = getValue() || `decisions/${element.businessObject.$parent?.id || 'process'}/${element.id}.dmn`;
      
      // Abrir o editor de tabela de decisão
      openDecisionEditorModal({
        decisionTableKey,
        onSave: async (updatedDecisionTableKey) => {
          // Atualizar o valor no elemento BPMN
          setValue(updatedDecisionTableKey);
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
