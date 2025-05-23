/**
 * ComplexComponentsIntegration.tsx
 * Integração de componentes complexos (tabelas e elementos aninhados) no editor de formulários
 */

import React from 'react';
import { TableEditor, TableDefinition, createTableComponent, generateTableHTML } from './TableComponents';
import { NestedComponentEditor, NestedComponentDefinition, createNestedComponent, generateNestedComponentHTML } from './NestedComponents';

// Interface para propriedades de componentes complexos
export interface ComplexComponentProps {
  componentType: string;
  componentData: any;
  onChange: (data: any) => void;
}

// Componente para edição de componentes complexos
export const ComplexComponentEditor: React.FC<ComplexComponentProps> = ({ 
  componentType, 
  componentData, 
  onChange 
}) => {
  // Renderizar editor baseado no tipo de componente
  switch (componentType) {
    case 'table':
      return (
        <TableEditor 
          value={componentData as TableDefinition} 
          onChange={onChange} 
        />
      );
      
    case 'nested':
      return (
        <NestedComponentEditor 
          value={componentData as NestedComponentDefinition} 
          onChange={onChange} 
          maxLevel={2} // Limite de 2 níveis de aninhamento
        />
      );
      
    default:
      return <div>Tipo de componente complexo não suportado</div>;
  }
};

// Função para criar um componente complexo baseado no tipo
export function createComplexComponent(type: string): any {
  switch (type) {
    case 'table':
      return createTableComponent(3); // Tabela com 3 colunas por padrão
      
    case 'nested':
      return createNestedComponent('container');
      
    default:
      throw new Error(`Tipo de componente complexo não suportado: ${type}`);
  }
}

// Função para gerar HTML para visualização de componente complexo
export function generateComplexComponentHTML(type: string, data: any): string {
  switch (type) {
    case 'table':
      return generateTableHTML(data as TableDefinition);
      
    case 'nested':
      return generateNestedComponentHTML(data as NestedComponentDefinition);
      
    default:
      return '<div>Tipo de componente complexo não suportado</div>';
  }
}

// Função para verificar se um componente é complexo
export function isComplexComponent(componentType: string): boolean {
  return ['table', 'nested'].includes(componentType);
}

// Função para obter o editor de componente complexo
export function getComplexComponentEditor(
  componentType: string, 
  componentData: any, 
  onChange: (data: any) => void
): JSX.Element {
  return (
    <ComplexComponentEditor 
      componentType={componentType} 
      componentData={componentData} 
      onChange={onChange} 
    />
  );
}

// Função para integrar componentes complexos ao painel de propriedades
export function integrateComplexComponentsToPropertiesPanel(
  componentType: string,
  componentData: any,
  onChange: (data: any) => void,
  panelContent: JSX.Element[]
): JSX.Element[] {
  if (isComplexComponent(componentType)) {
    panelContent.push(
      <div key="complex-component-editor" className="complex-component-section">
        <h3>Editor de {componentType === 'table' ? 'Tabela' : 'Componente Aninhado'}</h3>
        {getComplexComponentEditor(componentType, componentData, onChange)}
      </div>
    );
  }
  
  return panelContent;
}

// Função para adicionar botões de componentes complexos à paleta
export function addComplexComponentsToPalette(
  paletteItems: JSX.Element[],
  onAddComponent: (type: string) => void
): JSX.Element[] {
  // Adicionar botão para tabela
  paletteItems.push(
    <div 
      key="add-table" 
      className="palette-item" 
      onClick={() => onAddComponent('table')}
      style={{ 
        padding: '8px', 
        margin: '4px', 
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: '#f5f5f5'
      }}
    >
      <span className="icon">📊</span>
      <span className="label">Tabela</span>
    </div>
  );
  
  // Adicionar botão para componente aninhado
  paletteItems.push(
    <div 
      key="add-nested" 
      className="palette-item" 
      onClick={() => onAddComponent('nested')}
      style={{ 
        padding: '8px', 
        margin: '4px', 
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: '#f5f5f5'
      }}
    >
      <span className="icon">📦</span>
      <span className="label">Container</span>
    </div>
  );
  
  return paletteItems;
}

// Função para renderizar preview de componente complexo
export function renderComplexComponentPreview(
  componentType: string,
  componentData: any
): JSX.Element {
  switch (componentType) {
    case 'table':
      return (
        <div 
          className="table-preview"
          dangerouslySetInnerHTML={{ 
            __html: generateTableHTML(componentData as TableDefinition) 
          }}
        />
      );
      
    case 'nested':
      return (
        <div 
          className="nested-preview"
          dangerouslySetInnerHTML={{ 
            __html: generateNestedComponentHTML(componentData as NestedComponentDefinition) 
          }}
        />
      );
      
    default:
      return <div>Preview não disponível para este tipo de componente</div>;
  }
}
