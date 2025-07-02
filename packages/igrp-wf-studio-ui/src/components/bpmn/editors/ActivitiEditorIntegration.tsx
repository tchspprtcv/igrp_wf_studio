// Integração dos editores no ActivitiPropertiesProvider.tsx
import React from 'react';
import FormEditorLink from './FormEditorLink';
import DecisionTableLink from './DecisionTableLink';
import { openFormEditorModal } from './FormEditorModal';
import { openDecisionEditorModal } from './DecisionEditorModal';

// Substituir o componente ActivitiFormKeyProperty existente
const ActivitiFormKeyProperty = (props: any) => {
  const { element, getValue, setValue, translate } = props;
  
  const handleEditForm = () => {
    // Obter formKey atual ou gerar um padrão
    const formKey = getValue() || `forms/${element.businessObject.$parent?.id || 'process'}/${element.id}-form.json`;
    
    // Abrir o editor de formulário
    openFormEditorModal({
      formKey,
      onSave: (updatedFormKey) => {
        setValue(updatedFormKey);
      }
    });
  };
  
  return (
    <FormEditorLink
      {...props}
      onEditClick={handleEditForm}
    />
  );
};

// Adicionar componente para DecisionTable
const ActivitiDecisionTableProperty = (props: any) => {
  const { element, getValue, setValue, translate } = props;
  
  const handleEditDecision = () => {
    // Obter decisionTable atual ou gerar um padrão
    const decisionTable = getValue() || `decisions/${element.businessObject.$parent?.id || 'process'}/${element.id}.dmn`;
    
    // Abrir o editor de tabela de decisão
    openDecisionEditorModal({
      decisionTable,
      onSave: (updatedDecisionTable) => {
        setValue(updatedDecisionTable);
      }
    });
  };
  
  return (
    <DecisionTableLink
      {...props}
      onEditClick={handleEditDecision}
    />
  );
};

// Exportar os componentes para uso no ActivitiPropertiesProvider
export {
  ActivitiFormKeyProperty,
  ActivitiDecisionTableProperty
};
