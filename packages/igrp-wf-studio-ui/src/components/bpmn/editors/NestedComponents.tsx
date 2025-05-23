/**
 * NestedComponents.tsx
 * Componentes para criação e edição de elementos aninhados no editor de formulários
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Interface para componente aninhado
export interface NestedComponentDefinition {
  id: string;
  type: string;
  label: string;
  children?: NestedComponentDefinition[];
  properties?: Record<string, any>;
}

// Componentes estilizados
const NestedEditorContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
`;

const NestedComponentPreview = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
  background-color: #fff;
`;

const ComponentContainer = styled.div<{ $level: number }>`
  margin-left: ${props => props.$level * 20}px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: ${props => props.$level === 0 ? '#f5f5f5' : '#fff'};
`;

const ComponentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  
  h4 {
    margin: 0;
  }
  
  .actions {
    display: flex;
    gap: 5px;
  }
`;

const AddComponentButton = styled.button`
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #45a049;
  }
`;

const RemoveButton = styled.button`
  padding: 3px 8px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

// Componente para edição de elementos aninhados
export const NestedComponentEditor: React.FC<{
  value: NestedComponentDefinition;
  onChange: (value: NestedComponentDefinition) => void;
  maxLevel?: number;
}> = ({ value, onChange, maxLevel = 2 }) => {
  const [componentDefinition, setComponentDefinition] = useState<NestedComponentDefinition>(
    value || { id: `comp_${Date.now()}`, type: 'container', label: 'Container', children: [] }
  );
  
  useEffect(() => {
    onChange(componentDefinition);
  }, [componentDefinition, onChange]);
  
  // Renderizar componente aninhado recursivamente
  const renderNestedComponent = (component: NestedComponentDefinition, level: number) => {
    return (
      <ComponentContainer key={component.id} $level={level}>
        <ComponentHeader>
          <h4>{component.label}</h4>
          <div className="actions">
            {level < maxLevel - 1 && (
              <AddComponentButton onClick={() => addChildComponent(component.id)}>
                Adicionar Componente
              </AddComponentButton>
            )}
            {level > 0 && (
              <RemoveButton onClick={() => removeComponent(component.id)}>
                Remover
              </RemoveButton>
            )}
          </div>
        </ComponentHeader>
        
        {component.children && component.children.length > 0 && (
          <div className="children">
            {component.children.map(child => renderNestedComponent(child, level + 1))}
          </div>
        )}
      </ComponentContainer>
    );
  };
  
  // Adicionar componente filho
  const addChildComponent = (parentId: string) => {
    const newComponent: NestedComponentDefinition = {
      id: `comp_${Date.now()}`,
      type: 'field',
      label: `Campo ${Date.now().toString().slice(-4)}`,
      properties: {
        placeholder: 'Digite aqui...',
        required: false
      }
    };
    
    const addChildToComponent = (component: NestedComponentDefinition): NestedComponentDefinition => {
      if (component.id === parentId) {
        return {
          ...component,
          children: [...(component.children || []), newComponent]
        };
      }
      
      if (component.children) {
        return {
          ...component,
          children: component.children.map(child => addChildToComponent(child))
        };
      }
      
      return component;
    };
    
    setComponentDefinition(addChildToComponent(componentDefinition));
  };
  
  // Remover componente
  const removeComponent = (componentId: string) => {
    const removeComponentFromChildren = (children: NestedComponentDefinition[]): NestedComponentDefinition[] => {
      return children
        .filter(child => child.id !== componentId)
        .map(child => ({
          ...child,
          children: child.children ? removeComponentFromChildren(child.children) : undefined
        }));
    };
    
    setComponentDefinition({
      ...componentDefinition,
      children: componentDefinition.children 
        ? removeComponentFromChildren(componentDefinition.children) 
        : []
    });
  };
  
  return (
    <NestedEditorContainer>
      <h3>Editor de Componentes Aninhados</h3>
      {renderNestedComponent(componentDefinition, 0)}
      
      <h4>Pré-visualização</h4>
      <NestedComponentPreview>
        <NestedComponentRenderer definition={componentDefinition} />
      </NestedComponentPreview>
    </NestedEditorContainer>
  );
};

// Componente para renderizar elementos aninhados
export const NestedComponentRenderer: React.FC<{
  definition: NestedComponentDefinition;
}> = ({ definition }) => {
  // Renderizar componente baseado no tipo
  const renderComponent = (component: NestedComponentDefinition) => {
    switch (component.type) {
      case 'container':
        return (
          <div className="nested-container" key={component.id}>
            <h4>{component.label}</h4>
            {component.children && component.children.map(child => renderComponent(child))}
          </div>
        );
      case 'field':
        return (
          <div className="nested-field" key={component.id}>
            <label>{component.label}</label>
            <input 
              type="text" 
              placeholder={component.properties?.placeholder || ''}
              readOnly
            />
          </div>
        );
      default:
        return <div key={component.id}>Componente não suportado</div>;
    }
  };
  
  return <div className="nested-component-renderer">{renderComponent(definition)}</div>;
};

// Função para criar um componente aninhado
export function createNestedComponent(type: string = 'container'): NestedComponentDefinition {
  return {
    id: `comp_${Date.now()}`,
    type,
    label: type === 'container' ? 'Container' : 'Campo',
    children: type === 'container' ? [] : undefined,
    properties: type === 'field' ? {
      placeholder: 'Digite aqui...',
      required: false
    } : {}
  };
}

// Função para gerar HTML para visualização de componente aninhado
export function generateNestedComponentHTML(definition: NestedComponentDefinition): string {
  const generateComponentHTML = (component: NestedComponentDefinition): string => {
    switch (component.type) {
      case 'container':
        let containerHtml = `<div class="nested-container">`;
        containerHtml += `<h4>${component.label}</h4>`;
        
        if (component.children && component.children.length > 0) {
          component.children.forEach(child => {
            containerHtml += generateComponentHTML(child);
          });
        }
        
        containerHtml += `</div>`;
        return containerHtml;
        
      case 'field':
        return `
          <div class="nested-field">
            <label>${component.label}</label>
            <input type="text" placeholder="${component.properties?.placeholder || ''}" readonly>
          </div>
        `;
        
      default:
        return `<div>Componente não suportado</div>`;
    }
  };
  
  return generateComponentHTML(definition);
}
