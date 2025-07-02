import React from 'react';
import styled from 'styled-components';

// Estilos para o componente
const FormKeyContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const FormKeyInput = styled.input`
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
export interface FormEditorLinkProps {
  formKey?: string;
  onChange?: (value: string) => void;
  onOpenEditor?: () => void;
  id?: string;
  label?: string;
  getValue?: () => any;
  setValue?: (value: any) => void;
  disabled?: boolean;
}

/**
 * FormEditorLink Component
 * 
 * Componente para editar a chave do formulário e abrir o editor de formulários
 */
const FormEditorLink: React.FC<FormEditorLinkProps> = ({
  formKey = '',
  onChange,
  onOpenEditor,
  id,
  label,
  getValue,
  setValue,
  disabled = false
}) => {
  // Compatibilidade com a API do TextFieldEntry
  const value = getValue ? getValue() : formKey;
  
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
    <FormKeyContainer>
      <FormKeyInput
        id={id}
        value={value}
        onChange={handleChange}
        placeholder="Chave do formulário"
        disabled={disabled}
      />
      <EditButton
        onClick={handleEditClick}
        disabled={disabled}
        title="Editar Formulário"
      >
        Editar
      </EditButton>
    </FormKeyContainer>
  );
};

export default FormEditorLink;
