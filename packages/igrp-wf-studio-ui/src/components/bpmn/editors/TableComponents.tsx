/**
 * TableComponents.tsx
 * Componentes para criação e edição de tabelas no editor de formulários
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Tipos de dados para colunas de tabela
export enum ColumnDataType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  EMAIL = 'email',
  PHONE = 'phone',
  CURRENCY = 'currency'
}

// Interface para definição de coluna
export interface TableColumn {
  id: string;
  name: string;
  type: ColumnDataType;
  width?: string;
  options?: string[]; // Para tipo SELECT
  required?: boolean;
}

// Interface para definição de tabela
export interface TableDefinition {
  columns: TableColumn[];
  rows?: any[];
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
}

// Componentes estilizados
const TableEditorContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
`;

const TablePreview = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const ColumnControls = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  
  button {
    margin-right: 5px;
    padding: 5px 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background-color: #45a049;
    }
    
    &.remove {
      background-color: #f44336;
      
      &:hover {
        background-color: #d32f2f;
      }
    }
  }
`;

const ColumnEditor = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  
  input, select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    flex: 1;
    min-width: 120px;
  }
  
  .column-name {
    flex: 2;
  }
  
  .column-type {
    flex: 1;
  }
  
  .column-actions {
    display: flex;
    gap: 5px;
  }
`;

// Componente para edição de tabelas
export const TableEditor: React.FC<{
  value: TableDefinition;
  onChange: (value: TableDefinition) => void;
}> = ({ value, onChange }) => {
  const [tableDefinition, setTableDefinition] = useState<TableDefinition>(
    value || { columns: [] }
  );
  
  useEffect(() => {
    onChange(tableDefinition);
  }, [tableDefinition, onChange]);
  
  // Adicionar nova coluna
  const addColumn = () => {
    const newColumn: TableColumn = {
      id: `col_${Date.now()}`,
      name: `Coluna ${tableDefinition.columns.length + 1}`,
      type: ColumnDataType.TEXT
    };
    
    setTableDefinition({
      ...tableDefinition,
      columns: [...tableDefinition.columns, newColumn]
    });
  };
  
  // Remover coluna
  const removeColumn = (columnId: string) => {
    setTableDefinition({
      ...tableDefinition,
      columns: tableDefinition.columns.filter(col => col.id !== columnId)
    });
  };
  
  // Atualizar coluna
  const updateColumn = (columnId: string, updates: Partial<TableColumn>) => {
    setTableDefinition({
      ...tableDefinition,
      columns: tableDefinition.columns.map(col => 
        col.id === columnId ? { ...col, ...updates } : col
      )
    });
  };
  
  return (
    <TableEditorContainer>
      <h3>Editor de Tabela</h3>
      
      <ColumnControls>
        <button onClick={addColumn}>Adicionar Coluna</button>
      </ColumnControls>
      
      {tableDefinition.columns.map(column => (
        <ColumnEditor key={column.id}>
          <input
            className="column-name"
            type="text"
            value={column.name}
            onChange={(e) => updateColumn(column.id, { name: e.target.value })}
            placeholder="Nome da coluna"
          />
          
          <select
            className="column-type"
            value={column.type}
            onChange={(e) => updateColumn(column.id, { 
              type: e.target.value as ColumnDataType 
            })}
          >
            <option value={ColumnDataType.TEXT}>Texto</option>
            <option value={ColumnDataType.NUMBER}>Número</option>
            <option value={ColumnDataType.DATE}>Data</option>
            <option value={ColumnDataType.BOOLEAN}>Sim/Não</option>
            <option value={ColumnDataType.SELECT}>Seleção</option>
            <option value={ColumnDataType.EMAIL}>Email</option>
            <option value={ColumnDataType.PHONE}>Telefone</option>
            <option value={ColumnDataType.CURRENCY}>Moeda</option>
          </select>
          
          <div className="column-actions">
            <button 
              className="remove" 
              onClick={() => removeColumn(column.id)}
            >
              Remover
            </button>
          </div>
        </ColumnEditor>
      ))}
      
      <h4>Pré-visualização</h4>
      <TablePreview>
        <thead>
          <tr>
            {tableDefinition.columns.map(column => (
              <th key={column.id}>{column.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {tableDefinition.columns.map(column => (
              <td key={column.id}>
                {getPlaceholderForType(column.type)}
              </td>
            ))}
          </tr>
          <tr>
            {tableDefinition.columns.map(column => (
              <td key={column.id}>
                {getPlaceholderForType(column.type)}
              </td>
            ))}
          </tr>
        </tbody>
      </TablePreview>
    </TableEditorContainer>
  );
};

// Função auxiliar para gerar placeholder baseado no tipo de dados
function getPlaceholderForType(type: ColumnDataType): string {
  switch (type) {
    case ColumnDataType.TEXT:
      return 'Texto exemplo';
    case ColumnDataType.NUMBER:
      return '123';
    case ColumnDataType.DATE:
      return '01/01/2025';
    case ColumnDataType.BOOLEAN:
      return 'Sim';
    case ColumnDataType.SELECT:
      return 'Opção 1';
    case ColumnDataType.EMAIL:
      return 'email@exemplo.com';
    case ColumnDataType.PHONE:
      return '(123) 456-7890';
    case ColumnDataType.CURRENCY:
      return '€ 100,00';
    default:
      return 'Exemplo';
  }
}

// Componente para renderizar uma tabela no formulário
export const TableRenderer: React.FC<{
  definition: TableDefinition;
}> = ({ definition }) => {
  return (
    <TablePreview>
      <thead>
        <tr>
          {definition.columns.map(column => (
            <th key={column.id}>{column.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {definition.columns.map(column => (
            <td key={column.id}>
              {getPlaceholderForType(column.type)}
            </td>
          ))}
        </tr>
      </tbody>
    </TablePreview>
  );
};

// Função para criar um componente de tabela
export function createTableComponent(columns: number = 3): TableDefinition {
  const tableColumns: TableColumn[] = [];
  
  for (let i = 0; i < columns; i++) {
    tableColumns.push({
      id: `col_${Date.now()}_${i}`,
      name: `Coluna ${i + 1}`,
      type: ColumnDataType.TEXT
    });
  }
  
  return {
    columns: tableColumns,
    editable: true,
    sortable: true
  };
}

// Função para gerar HTML para visualização de tabela
export function generateTableHTML(definition: TableDefinition): string {
  let html = '<table class="form-table" width="100%" border="1" cellspacing="0" cellpadding="4">';
  
  // Cabeçalho
  html += '<thead><tr>';
  definition.columns.forEach(column => {
    html += `<th>${column.name}</th>`;
  });
  html += '</tr></thead>';
  
  // Corpo
  html += '<tbody><tr>';
  definition.columns.forEach(column => {
    html += `<td>${getPlaceholderForType(column.type)}</td>`;
  });
  html += '</tr></tbody>';
  
  html += '</table>';
  return html;
}
