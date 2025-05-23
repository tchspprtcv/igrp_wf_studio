/**
 * FormEditorIntegration.tsx
 * Integração completa do editor de formulários com suporte a grid/layout e elementos complexos
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { openFormEditorModal } from './FormEditorModal';
import { 
  TableEditor, 
  TableDefinition, 
  createTableComponent 
} from './TableComponents';
import { 
  NestedComponentEditor, 
  NestedComponentDefinition, 
  createNestedComponent 
} from './NestedComponents';
import { 
  isComplexComponent, 
  getComplexComponentEditor, 
  createComplexComponent,
  integrateComplexComponentsToPropertiesPanel,
  addComplexComponentsToPalette,
  renderComplexComponentPreview
} from './ComplexComponentsIntegration';

// Interfaces para tipagem
interface FormComponent {
  id: string;
  type: string;
  label: string;
  data?: any;
  content?: string;
  components?: FormComponent[];
  [key: string]: any;
}

interface FormDefinition {
  components: FormComponent[];
  [key: string]: any;
}

// Função para abrir o editor de formulários
export function openFormEditor(
  formKey: string,
  onSaveCallback: (formKey: string, formData: any) => void,
  onCloseCallback: () => void
): void {
  openFormEditorModal({
    formKey,
    onSave: (savedFormKey, formData) => {
      onSaveCallback(savedFormKey, formData);
    },
    onClose: () => {
      onCloseCallback();
    },
  });
}

// Função para integrar elementos complexos ao editor de formulários
export function integrateComplexComponents(
  formDefinition: FormDefinition,
  setFormDefinition: (formDefinition: FormDefinition) => void,
  selectedComponent: FormComponent | null,
  setSelectedComponent: (component: FormComponent | null) => void
): {
  paletteItems: JSX.Element[],
  propertiesPanelContent: JSX.Element[],
  renderComponent: (component: FormComponent) => JSX.Element
} {
  // Itens da paleta
  const paletteItems: JSX.Element[] = [];
  
  // Conteúdo do painel de propriedades
  const propertiesPanelContent: JSX.Element[] = [];
  
  // Função para adicionar componente complexo
  const addComplexComponent = (type: string) => {
    const newComponent: FormComponent = {
      id: `comp_${Date.now()}`,
      type,
      label: type === 'table' ? 'Tabela' : 'Container',
      data: createComplexComponent(type)
    };
    
    setFormDefinition({
      ...formDefinition,
      components: [...(formDefinition.components || []), newComponent]
    });
    
    // Selecionar o novo componente
    setSelectedComponent(newComponent);
  };
  
  // Adicionar botões de componentes complexos à paleta
  addComplexComponentsToPalette(paletteItems, addComplexComponent);
  
  // Integrar componentes complexos ao painel de propriedades
  if (selectedComponent && isComplexComponent(selectedComponent.type)) {
    const handleComplexComponentChange = (data: any) => {
      // Atualizar o componente selecionado
      const updatedComponent = {
        ...selectedComponent,
        data
      };
      
      // Atualizar o componente no formDefinition
      const updatedComponents = formDefinition.components.map((comp: FormComponent) =>
        comp.id === selectedComponent.id ? updatedComponent : comp
      );
      
      setFormDefinition({
        ...formDefinition,
        components: updatedComponents
      });
      
      // Atualizar o componente selecionado
      setSelectedComponent(updatedComponent);
    };
    
    integrateComplexComponentsToPropertiesPanel(
      selectedComponent.type,
      selectedComponent.data,
      handleComplexComponentChange,
      propertiesPanelContent
    );
  }
  
  // Função para renderizar componente
  const renderComponent = (component: FormComponent): JSX.Element => {
    if (isComplexComponent(component.type)) {
      return renderComplexComponentPreview(component.type, component.data);
    }
    
    // Renderização padrão para componentes não complexos
    return (
      <div className="default-component">
        <label>{component.label || 'Componente'}</label>
        <div className="component-content">{component.content || ''}</div>
      </div>
    );
  };
  
  return {
    paletteItems,
    propertiesPanelContent,
    renderComponent
  };
}

// Exportar componentes e funções
// Usar 'export type' para tipos quando isolatedModules está habilitado
export { TableEditor, createTableComponent };
export type { TableDefinition };

export { NestedComponentEditor, createNestedComponent };
export type { NestedComponentDefinition };

export { 
  isComplexComponent,
  getComplexComponentEditor,
  createComplexComponent,
  renderComplexComponentPreview
};

export type { FormComponent, FormDefinition };
