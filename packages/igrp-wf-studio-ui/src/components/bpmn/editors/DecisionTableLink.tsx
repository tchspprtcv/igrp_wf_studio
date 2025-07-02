import React from 'react';
import styled from 'styled-components';

// Estilos para o componente
const DecisionTableContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const DecisionTableInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const EditButton = styled.button`
  padding: 4px 8px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 8px;
  
  &:hover {
    background-color: #1976d2;
  }
`;

// Interface para as propriedades do componente
export interface DecisionTableLinkProps {
  decisionTable?: string;
  onChange?: (value: string) => void;
  onOpenEditor?: () => void;
  id?: string;
  label?: string;
  getValue?: () => any;
  setValue?: (value: any) => void;
  disabled?: boolean;
}

/**
 * DecisionTableLink Component
 * 
 * Componente para editar a chave da tabela de decisão e abrir o editor DMN
 */
const DecisionTableLink: React.FC<DecisionTableLinkProps> = ({
  decisionTable = '',
  onChange,
  onOpenEditor,
  id,
  label,
  getValue,
  setValue,
  disabled = false
}) => {
  // Compatibilidade com a API do TextFieldEntry
  const value = getValue ? getValue() : decisionTable;
  
  // Manipular mudança no input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Usar a API do TextFieldEntry se disponível
    if (setValue) {
      setValue(newValue);
    }
    
    // Usar a API direta se disponível
    if (onChange) {
      onChange(newValue);
    }
  };
  
  // Manipular clique no botão de edição
  const handleEditClick = () => {
    if (onOpenEditor) {
      onOpenEditor();
    }
  };
  
  return (
    <DecisionTableContainer>
      <DecisionTableInput
        id={id}
        value={value}
        onChange={handleChange}
        placeholder="Chave da tabela de decisão"
        disabled={disabled}
      />
      <EditButton
        onClick={handleEditClick}
        disabled={disabled}
        title="Editar Tabela de Decisão"
      >
        Editar
      </EditButton>
    </DecisionTableContainer>
  );
};

export default DecisionTableLink;
