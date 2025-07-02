/**
 * FormEditorModal.tsx
 * Modal para edição de formulários usando form-js
 * Redesenhado com base no exemplo oficial do demo.bpmn.io
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
// Removed unused import: FormBuilder and FormEdit
import EditorService from '../../../services/EditorService';
import { createRoot, Root } from 'react-dom/client';
import { v4 as uuidv4 } from 'uuid';

// Form component interfaces
interface FormComponent {
  type: string;
  key?: string;
  label?: string;
  placeholder?: string;
  description?: string;
  components?: FormComponent[];
  columns?: FormColumn[];
  title?: string;
  data?: {
    values?: FormOption[];
  };
  [key: string]: any; // Allow for additional properties
}

interface FormColumn {
  components?: FormComponent[];
  [key: string]: any;
}

interface FormOption {
  value: string;
  label: string;
  [key: string]: any;
}

interface FormDefinition {
  display?: string;
  components?: FormComponent[];
  title?: string;
  name?: string;
  [key: string]: any;
}

// Extended HTMLDivElement with _reactRootContainer property
interface ExtendedHTMLDivElement extends HTMLDivElement {
  _reactRootContainer?: Root;
}

// Estilos para o modal - inspirados no demo.bpmn.io
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 95%;  /* Aumentado para ocupar quase toda a largura */
  max-width: 1400px; /* Aumentado para telas maiores */
  height: 95vh; /* Ocupar quase toda a altura da tela */
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const ModalBody = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  background-color: #f8f8f8;
  border-top: 1px solid #e0e0e0;
  gap: 8px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid ${props => props.primary ? '#2196f3' : '#ddd'};
  background-color: ${props => props.primary ? '#2196f3' : 'white'};
  color: ${props => props.primary ? 'white' : '#333'};
  
  &:hover {
    background-color: ${props => props.primary ? '#1976d2' : '#f5f5f5'};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

// Componentes específicos do editor de formulários
const ComponentsPanel = styled.div`
  width: 280px;
  border-right: 1px solid #e0e0e0;
  background-color: #f8f8f8;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const SearchInput = styled.input`
  margin: 12px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const ComponentCategory = styled.div`
  margin-bottom: 12px;
`;

const CategoryTitle = styled.h4`
  margin: 0;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  background-color: #eee;
`;

const ComponentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 8px;
  gap: 8px;
`;

const ComponentButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(50% - 8px);
  height: 70px;
  padding: 8px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #f0f0f0;
    border-color: #bbb;
  }
  
  &:active {
    background-color: #e6f7ff;
    border-color: #91d5ff;
  }
`;

const ComponentIcon = styled.div`
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    color: #555;
  }
`;

const ComponentName = styled.span`
  font-size: 12px;
  color: #333;
  text-align: center;
`;

const EditorPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const EditorToolbar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f8f8;
  overflow-x: auto;
`;

const ToolbarButton = styled.button`
  padding: 6px 12px;
  margin-right: 8px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    background-color: #f0f0f0;
  }
  
  &.active {
    background-color: #e6f7ff;
    border-color: #91d5ff;
    color: #1890ff;
  }
`;

const FormContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fafafa;
  position: relative;
`;

const DropIndicator = styled.div<{ visible: boolean; top: number; left: number; width: number; height: number }>`
  position: absolute;
  border: 2px dashed #2196f3;
  background-color: rgba(33, 150, 243, 0.1);
  border-radius: 4px;
  pointer-events: none;
  display: ${props => props.visible ? 'block' : 'none'};
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  z-index: 10;
`;

const PropertiesPanel = styled.div`
  width: 300px;
  border-left: 1px solid #e0e0e0;
  background-color: #f8f8f8;
  overflow-y: auto;
`;

const PropertiesHeader = styled.div`
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 500;
  font-size: 14px;
  color: #333;
`;

const PropertiesContent = styled.div`
  padding: 12px;
`;

const PropertyGroup = styled.div`
  margin-bottom: 16px;
`;

const PropertyGroupTitle = styled.h5`
  margin: 0 0 8px 0;
  padding-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  border-bottom: 1px solid #eee;
`;

const PropertyField = styled.div`
  margin-bottom: 12px;
`;

const PropertyLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #555;
`;

const PropertyInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#2196f3' : 'transparent'};
  color: ${props => props.active ? '#2196f3' : '#333'};
  font-weight: ${props => props.active ? '500' : 'normal'};
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const JsonEditor = styled.textarea`
  width: 100%;
  height: 100%;
  padding: 12px;
  border: none;
  font-family: monospace;
  font-size: 14px;
  resize: none;
  
  &:focus {
    outline: none;
  }
`;

const PreviewContainer = styled.div`
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background-color: white;
`;

// Componente para arrastar e soltar
const DragPreview = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 1000;
  background-color: white;
  border: 1px solid #2196f3;
  border-radius: 4px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #333;
`;

// Componente de carregamento
const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  padding: 16px;
  margin: 16px;
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  color: #b71c1c;
`;

// Estilo para destacar componentes recém-adicionados
const HighlightStyle = `
  @keyframes highlight-pulse {
    0% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(33, 150, 243, 0); }
    100% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0); }
  }
  
  .highlight-component {
    animation: highlight-pulse 1s ease-out;
    border: 1px solid #2196f3 !important;
    background-color: #e3f2fd !important;
  }
`;

// Componente de formulário simples para o modo de design
const SimpleFormBuilder = styled.div`
  width: 100%;
  min-height: 400px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  padding: 20px;
  background-color: white;
  
  .form-component {
    margin-bottom: 15px;
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #f9f9f9;
    cursor: pointer;
    
    &:hover {
      border-color: #2196f3;
      background-color: #e3f2fd;
    }
    
    &.selected {
      border: 2px solid #2196f3;
      background-color: #e3f2fd;
    }
  }
  
  .form-component-label {
    font-weight: 500;
    margin-bottom: 5px;
  }
  
  .form-component-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
  }
  
  .form-component-description {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
  }
  
  .placeholder-text {
    color: #999;
    text-align: center;
    padding: 40px 0;
  }
`;

interface FormEditorModalProps {
  formKey: string;
  onSave: (formKey: string) => void;
  onClose: () => void;
}

// Formulário padrão para novos formulários
const DEFAULT_FORM = {
  display: 'form',
  components: [],
  type: 'form',
  tags: [],
  title: 'Novo Formulário',
  name: 'novoFormulario'
};

/**
 * FormEditorModal Component
 * 
 * Modal para edição de formulários usando form-js
 * Redesenhado com base no exemplo oficial do demo.bpmn.io
 */
const FormEditorModal: React.FC<FormEditorModalProps> = ({ formKey, onSave, onClose }) => {
  const [formDefinition, setFormDefinition] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'json' | 'preview'>('design');
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dropIndicator, setDropIndicator] = useState({
    visible: false,
    top: 0,
    left: 0,
    width: 0,
    height: 0
  });
  const [dragPreview, setDragPreview] = useState({
    visible: false,
    top: 0,
    left: 0,
    content: ''
  });
  
  const jsonEditorRef = useRef<HTMLTextAreaElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const formEditRef = useRef<HTMLDivElement>(null);
  const simpleFormBuilderRef = useRef<HTMLDivElement>(null);
  
  // Adicionar estilos para highlight
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = HighlightStyle;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Carregar definição do formulário
  useEffect(() => {
    const loadForm = async () => {
      setIsLoading(true);
      setLoadError(null);
      
      try {
        // Tentar carregar o formulário
        let form = null;
        
        try {
          form = await EditorService.loadForm(formKey);
        } catch (error) {
          console.log('Erro ao carregar formulário do serviço:', error);
          throw error;
        }
        
        // Verificar se o retorno é um objeto válido
        if (typeof form !== 'object' || form === null) {
          console.log('Formato de formulário inválido:', form);
          throw new Error('Formato de formulário inválido');
        }
        
        // Garantir que o formulário tenha um ID
        if (!form.id) {
          form.id = generateFormId(formKey);
        }
        
        // Garantir que o formulário tenha um nome
        if (!form.name) {
          form.name = 'Formulário ' + form.id;
        }
        
        // Garantir que o formulário tenha componentes
        if (!form.components) {
          form.components = [];
        }
        
        // Garantir que o formulário tenha um tipo
        if (!form.type) {
          form.type = 'form';
        }
        
        setFormDefinition(form);
      } catch (error) {
        console.error('Erro ao carregar formulário:', error);
        
        // Criar um formulário vazio com ID e nome
        const newFormId = generateFormId(formKey);
        const newForm = {
          ...DEFAULT_FORM,
          id: newFormId,
          name: 'Formulário ' + newFormId.substring(0, 8)
        };
        
        setFormDefinition(newForm);
        setLoadError('Não foi possível carregar o formulário. Um novo formulário foi criado.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadForm();
  }, [formKey]);
  
  // Gerar ID para novos formulários
  const generateFormId = useCallback((formKey: string) => {
    // Tentar extrair um nome do formKey
    const baseName = formKey.split('/').pop()?.replace('.json', '') || '';
    
    // Se tiver um nome base, usá-lo com um sufixo único
    if (baseName) {
      return `${baseName}_${uuidv4().substring(0, 8)}`;
    }
    
    // Caso contrário, gerar um ID completamente novo
    return `form_${uuidv4().substring(0, 12)}`;
  }, []);
  
  // Atualizar editor JSON quando o formulário mudar
  useEffect(() => {
    if (jsonEditorRef.current && formDefinition && activeTab === 'json') {
      jsonEditorRef.current.value = JSON.stringify(formDefinition, null, 2);
    }
  }, [formDefinition, activeTab]);
  
  // Renderizar o preview do formulário quando mudar para a aba preview
  useEffect(() => {
    if (activeTab === 'preview' && formEditRef.current && formDefinition) {
      try {
        // Limpar o conteúdo anterior
        while (formEditRef.current.firstChild) {
          formEditRef.current.removeChild(formEditRef.current.firstChild);
        }
        
        // Criar um elemento div para o formulário
        const formElement = document.createElement('div');
        formEditRef.current.appendChild(formElement);
        
        // Usar uma abordagem alternativa para renderizar o preview sem hooks
        // Renderizar o formulário como HTML estático em vez de usar FormEdit
        const renderFormPreview = (container: HTMLElement, form: FormDefinition): void => {
          if (!container || !form) return;
          
          // Função para renderizar um componente como HTML
          const renderComponent = (component: FormComponent): string => {
            let html = '';
            
            switch (component.type) {
              case 'textfield':
                html = `
                  <div class="formio-component formio-component-textfield" style="margin-bottom: 15px;">
                    <label class="form-label">${component.label || 'Text Field'}</label>
                    <input type="text" class="form-control" placeholder="${component.placeholder || ''}" value="${component.defaultValue || ''}" />
                    ${component.description ? `<div class="form-text text-muted">${component.description}</div>` : ''}
                  </div>
                `;
                break;
                
              case 'textarea':
                html = `
                  <div class="formio-component formio-component-textarea" style="margin-bottom: 15px;">
                    <label class="form-label">${component.label || 'Text Area'}</label>
                    <textarea class="form-control" placeholder="${component.placeholder || ''}" rows="3">${component.defaultValue || ''}</textarea>
                    ${component.description ? `<div class="form-text text-muted">${component.description}</div>` : ''}
                  </div>
                `;
                break;
                
              case 'number':
                html = `
                  <div class="formio-component formio-component-number" style="margin-bottom: 15px;">
                    <label class="form-label">${component.label || 'Number'}</label>
                    <input type="number" class="form-control" placeholder="${component.placeholder || ''}" value="${component.defaultValue || ''}" />
                    ${component.description ? `<div class="form-text text-muted">${component.description}</div>` : ''}
                  </div>
                `;
                break;
                
              case 'checkbox':
                html = `
                  <div class="formio-component formio-component-checkbox" style="margin-bottom: 15px;">
                    <div class="form-check">
                      <input type="checkbox" class="form-check-input" ${component.defaultValue ? 'checked' : ''} />
                      <label class="form-check-label">${component.label || 'Checkbox'}</label>
                    </div>
                    ${component.description ? `<div class="form-text text-muted">${component.description}</div>` : ''}
                  </div>
                `;
                break;
                
              case 'select':
                html = `
                  <div class="formio-component formio-component-select" style="margin-bottom: 15px;">
                    <label class="form-label">${component.label || 'Select'}</label>
                    <select class="form-control">
                      <option value="">${component.placeholder || 'Select an option'}</option>
                      ${component.data && component.data.values ? 
                        component.data.values.map((option: FormOption) => 
                          `<option value="${option.value}">${option.label}</option>`
                        ).join('') : ''}
                    </select>
                    ${component.description ? `<div class="form-text text-muted">${component.description}</div>` : ''}
                  </div>
                `;
                break;
                
              case 'button':
                html = `
                  <div class="formio-component formio-component-button" style="margin-bottom: 15px;">
                    <button class="btn btn-primary">${component.label || 'Button'}</button>
                  </div>
                `;
                break;
                
              case 'columns':
                html = `
                  <div class="formio-component formio-component-columns" style="margin-bottom: 15px;">
                    <div class="row">
                      ${component.columns ? 
                        component.columns.map((column: FormColumn) => 
                          `<div class="col-md-${Math.floor(12 / (component.columns?.length || 1))}">
                            ${column.components ? column.components.map((comp: FormComponent) => renderComponent(comp)).join('') : ''}
                          </div>`
                        ).join('') : ''}
                    </div>
                  </div>
                `;
                break;
                
              case 'panel':
                html = `
                  <div class="formio-component formio-component-panel card" style="margin-bottom: 15px;">
                    <div class="card-header">${component.title || 'Panel'}</div>
                    <div class="card-body">
                      ${component.components ? component.components.map((comp: FormComponent) => renderComponent(comp)).join('') : ''}
                    </div>
                  </div>
                `;
                break;
                
              default:
                html = `
                  <div class="formio-component" style="margin-bottom: 15px;">
                    <label class="form-label">${component.label || component.type || 'Component'}</label>
                    <div class="form-control-plaintext">${component.type} component</div>
                    ${component.description ? `<div class="form-text text-muted">${component.description}</div>` : ''}
                  </div>
                `;
            }
            
            return html;
          };
          
          // Adicionar estilos básicos
          const styles = `
            <style>
              .form-control {
                display: block;
                width: 100%;
                padding: 0.375rem 0.75rem;
                font-size: 1rem;
                font-weight: 400;
                line-height: 1.5;
                color: #212529;
                background-color: #fff;
                background-clip: padding-box;
                border: 1px solid #ced4da;
                border-radius: 0.25rem;
                transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
              }
              
              .form-label {
                margin-bottom: 0.5rem;
                font-weight: 500;
              }
              
              .form-text {
                margin-top: 0.25rem;
                font-size: 0.875em;
              }
              
              .btn {
                display: inline-block;
                font-weight: 400;
                line-height: 1.5;
                text-align: center;
                text-decoration: none;
                vertical-align: middle;
                cursor: pointer;
                user-select: none;
                padding: 0.375rem 0.75rem;
                font-size: 1rem;
                border-radius: 0.25rem;
                transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
              }
              
              .btn-primary {
                color: #fff;
                background-color: #0d6efd;
                border-color: #0d6efd;
              }
              
              .row {
                display: flex;
                flex-wrap: wrap;
                margin-right: -0.75rem;
                margin-left: -0.75rem;
              }
              
              .col-md-6 {
                flex: 0 0 auto;
                width: 50%;
                padding-right: 0.75rem;
                padding-left: 0.75rem;
              }
              
              .card {
                position: relative;
                display: flex;
                flex-direction: column;
                min-width: 0;
                word-wrap: break-word;
                background-color: #fff;
                background-clip: border-box;
                border: 1px solid rgba(0, 0, 0, 0.125);
                border-radius: 0.25rem;
              }
              
              .card-header {
                padding: 0.5rem 1rem;
                margin-bottom: 0;
                background-color: rgba(0, 0, 0, 0.03);
                border-bottom: 1px solid rgba(0, 0, 0, 0.125);
              }
              
              .card-body {
                flex: 1 1 auto;
                padding: 1rem 1rem;
              }
              
              .form-check {
                display: block;
                min-height: 1.5rem;
                padding-left: 1.5em;
                margin-bottom: 0.125rem;
              }
              
              .form-check-input {
                width: 1em;
                height: 1em;
                margin-top: 0.25em;
                vertical-align: top;
                background-color: #fff;
                background-repeat: no-repeat;
                background-position: center;
                background-size: contain;
                border: 1px solid rgba(0, 0, 0, 0.25);
                appearance: none;
              }
              
              .form-check-label {
                margin-bottom: 0;
              }
            </style>
          `;
          
          // Renderizar o formulário
          let formHtml = `
            <div class="formio-form">
              <h3>${form.title || form.name || 'Formulário'}</h3>
              ${styles}
              <div class="formio-components">
                ${form.components ? form.components.map((component: FormComponent) => renderComponent(component)).join('') : ''}
              </div>
            </div>
          `;
          
          container.innerHTML = formHtml;
        };
        
        // Renderizar o preview
        renderFormPreview(formElement, formDefinition);
      } catch (error) {
        console.error('Erro ao renderizar preview do formulário:', error);
        
        // Mostrar mensagem de erro
        if (formEditRef.current) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          formEditRef.current.innerHTML = `
            <div style="padding: 16px; color: #b71c1c; background-color: #ffebee; border: 1px solid #ffcdd2; border-radius: 4px;">
              <p><strong>Erro ao renderizar preview:</strong> ${errorMessage}</p>
              <p>Verifique se o formulário está corretamente configurado.</p>
            </div>
          `;
        }
      }
    }
  }, [activeTab, formDefinition]);
  
  // Renderizar o formulário simples
  const renderSimpleFormBuilder = useCallback(() => {
    if (!simpleFormBuilderRef.current || !formDefinition) return;
    
    // Limpar o conteúdo anterior
    simpleFormBuilderRef.current.innerHTML = '';
    
    if (!formDefinition.components || formDefinition.components.length === 0) {
      // Mostrar placeholder se não houver componentes
      const placeholder = document.createElement('div');
      placeholder.className = 'placeholder-text';
      placeholder.textContent = 'Arraste componentes aqui para criar seu formulário';
      simpleFormBuilderRef.current.appendChild(placeholder);
      return;
    }
    
    // Renderizar cada componente
    formDefinition.components.forEach((component: any, index: number) => {
      const componentElement = document.createElement('div');
      componentElement.className = 'form-component';
      componentElement.dataset.index = index.toString();
      componentElement.dataset.key = component.key || '';
      
      // Adicionar evento de clique para selecionar o componente
      componentElement.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Remover seleção anterior
        const selectedElements = simpleFormBuilderRef.current?.querySelectorAll('.selected');
        selectedElements?.forEach(el => el.classList.remove('selected'));
        
        // Adicionar seleção ao componente atual
        componentElement.classList.add('selected');
        
        // Atualizar componente selecionado
        setSelectedComponent(component);
      });
      
      // Renderizar conteúdo do componente
      let componentContent = '';
      
      switch (component.type) {
        case 'textfield':
          componentContent = `
            <div class="form-component-label">${component.label || 'Text Field'}</div>
            <input type="text" class="form-component-input" placeholder="${component.placeholder || ''}" disabled />
            ${component.description ? `<div class="form-component-description">${component.description}</div>` : ''}
          `;
          break;
          
        case 'textarea':
          componentContent = `
            <div class="form-component-label">${component.label || 'Text Area'}</div>
            <textarea class="form-component-input" placeholder="${component.placeholder || ''}" disabled></textarea>
            ${component.description ? `<div class="form-component-description">${component.description}</div>` : ''}
          `;
          break;
          
        case 'number':
          componentContent = `
            <div class="form-component-label">${component.label || 'Number'}</div>
            <input type="number" class="form-component-input" placeholder="${component.placeholder || ''}" disabled />
            ${component.description ? `<div class="form-component-description">${component.description}</div>` : ''}
          `;
          break;
          
        case 'checkbox':
          componentContent = `
            <div style="display: flex; align-items: center;">
              <input type="checkbox" disabled ${component.defaultValue ? 'checked' : ''} style="margin-right: 8px;" />
              <div class="form-component-label">${component.label || 'Checkbox'}</div>
            </div>
            ${component.description ? `<div class="form-component-description">${component.description}</div>` : ''}
          `;
          break;
          
        case 'select':
          componentContent = `
            <div class="form-component-label">${component.label || 'Select'}</div>
            <select class="form-component-input" disabled>
              <option>${component.placeholder || 'Select an option'}</option>
              ${component.data && component.data.values ? 
                component.data.values.map((option: any) => 
                  `<option>${option.label || option.value}</option>`
                ).join('') : ''}
            </select>
            ${component.description ? `<div class="form-component-description">${component.description}</div>` : ''}
          `;
          break;
          
        case 'button':
          componentContent = `
            <button style="padding: 8px 16px; background-color: #2196f3; color: white; border: none; border-radius: 4px; cursor: not-allowed;">
              ${component.label || 'Button'}
            </button>
          `;
          break;
          
        case 'columns':
          componentContent = `
            <div class="form-component-label">Columns</div>
            <div style="display: flex; gap: 10px;">
              ${component.columns ? 
                component.columns.map((column: any) => 
                  `<div style="flex: ${column.size || 1}; padding: 10px; background-color: #f0f0f0; border-radius: 4px;">
                    Column (${column.size || 1})
                  </div>`
                ).join('') : ''}
            </div>
          `;
          break;
          
        case 'panel':
          componentContent = `
            <div style="border: 1px solid #ddd; border-radius: 4px; padding: 10px;">
              <div style="font-weight: 500; margin-bottom: 8px;">${component.title || 'Panel'}</div>
              <div style="color: #666; font-style: italic;">Panel content (${component.components?.length || 0} components)</div>
            </div>
          `;
          break;
          
        default:
          componentContent = `
            <div class="form-component-label">${component.label || component.type || 'Component'}</div>
            <div style="color: #666; font-style: italic;">${component.type} component</div>
          `;
      }
      
      componentElement.innerHTML = componentContent;
      if (simpleFormBuilderRef.current) {
        simpleFormBuilderRef.current.appendChild(componentElement);
      }
    });
  }, [formDefinition]);
  
  // Renderizar o formulário simples quando mudar para a aba design
  // ou quando o formDefinition for atualizado
  useEffect(() => {
    if (activeTab === 'design' && simpleFormBuilderRef.current && formDefinition) {
      // Renderizar imediatamente sem atrasos
      renderSimpleFormBuilder();
    }
  }, [activeTab, formDefinition, renderSimpleFormBuilder]);
  
  // Manipular mudanças no formulário
  const handleFormChange = useCallback((updatedForm: any) => {
    // Verificar se o updatedForm é válido
    if (!updatedForm || typeof updatedForm !== 'object') {
      console.error('Formulário inválido:', updatedForm);
      return;
    }
    
    // Garantir que o ID e nome sejam preservados
    const updatedFormWithMeta = {
      ...updatedForm,
      id: updatedForm.id || formDefinition?.id || generateFormId(formKey),
      name: updatedForm.name || formDefinition?.name || 'Formulário'
    };
    
    // Atualizar o estado do formulário imediatamente para garantir renderização reativa
    setFormDefinition(updatedFormWithMeta);
    
    // Não é mais necessário chamar renderSimpleFormBuilder explicitamente
    // pois o useEffect já vai disparar a renderização quando formDefinition mudar
  }, [formDefinition, formKey, generateFormId]);
  
  // Salvar formulário
  const handleSave = async () => {
    try {
      let updatedFormDefinition = formDefinition;
      
      // Se estiver na aba JSON, obter o valor do textarea
      if (activeTab === 'json' && jsonEditorRef.current) {
        try {
          updatedFormDefinition = JSON.parse(jsonEditorRef.current.value);
        } catch (error) {
          console.error('JSON inválido:', error);
          alert('O JSON do formulário é inválido. Por favor, corrija os erros antes de salvar.');
          return;
        }
      }
      
      // Garantir que o formulário tenha um ID
      if (!updatedFormDefinition.id) {
        updatedFormDefinition.id = generateFormId(formKey);
      }
      
      // Garantir que o formulário tenha um nome
      if (!updatedFormDefinition.name) {
        updatedFormDefinition.name = 'Formulário ' + updatedFormDefinition.id;
      }
      
      // Salvar formulário no backend ou localStorage
      const savedFormKey = await EditorService.saveForm(formKey, updatedFormDefinition);
      
      // Notificar componente pai
      onSave(savedFormKey);
      
      // Fechar modal
      onClose();
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      alert('Erro ao salvar formulário. Verifique o console para mais detalhes.');
    }
  };
  
  // Componentes disponíveis para o formulário
  const components = {
    input: [
      { name: 'Text field', icon: '✏️', type: 'textfield' },
      { name: 'Text area', icon: '📝', type: 'textarea' },
      { name: 'Number', icon: '🔢', type: 'number' },
      { name: 'Date time', icon: '📅', type: 'datetime' },
      { name: 'Email', icon: '📧', type: 'email' },
      { name: 'Phone', icon: '📞', type: 'phoneNumber' },
      { name: 'Password', icon: '🔒', type: 'password' },
      { name: 'Currency', icon: '💰', type: 'currency' },
    ],
    selection: [
      { name: 'Checkbox', icon: '☑️', type: 'checkbox' },
      { name: 'Select', icon: '▼', type: 'select' },
      { name: 'Radio', icon: '⚪', type: 'radio' },
      { name: 'Tags', icon: '🏷️', type: 'tags' },
    ],
    presentation: [
      { name: 'Text', icon: '📄', type: 'content' },
      { name: 'HTML', icon: '🌐', type: 'htmlelement' },
      { name: 'Image', icon: '🖼️', type: 'image' },
      { name: 'Table', icon: '🏢', type: 'table' },
      { name: 'Separator', icon: '➖', type: 'divider' },
    ],
    layout: [
      { name: 'Columns', icon: '⚏', type: 'columns' },
      { name: 'Panel', icon: '📦', type: 'panel' },
      { name: 'Tabs', icon: '📑', type: 'tabs' },
      { name: 'Fieldset', icon: '🔲', type: 'fieldset' },
    ],
    action: [
      { name: 'Button', icon: '🔘', type: 'button' },
    ]
  };
  
  // Filtrar componentes com base no termo de pesquisa
  const filterComponents = useCallback((components: any, searchTerm: string) => {
    if (!searchTerm) return components;
    
    const filtered: any = {};
    
    Object.keys(components).forEach(category => {
      const filteredComponents = components[category].filter((component: any) => 
        component.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filteredComponents.length > 0) {
        filtered[category] = filteredComponents;
      }
    });
    
    return filtered;
  }, []);
  
  const filteredComponents = filterComponents(components, searchTerm);
  
  // Adicionar componente ao formulário via drag and drop
  const handleDragStart = useCallback((e: React.DragEvent, componentType: string, componentName: string) => {
    e.dataTransfer.setData('componentType', componentType);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Configurar o preview de arrasto
    setDragPreview({
      visible: true,
      top: e.clientY,
      left: e.clientX,
      content: componentName
    });
    
    // Adicionar dados adicionais para melhorar a experiência de drag
    const dragIcon = document.createElement('div');
    dragIcon.style.width = '100px';
    dragIcon.style.height = '30px';
    dragIcon.style.backgroundColor = '#f0f0f0';
    dragIcon.style.border = '1px solid #ccc';
    dragIcon.style.borderRadius = '4px';
    dragIcon.style.display = 'flex';
    dragIcon.style.alignItems = 'center';
    dragIcon.style.justifyContent = 'center';
    dragIcon.textContent = getDefaultLabel(componentType);
    document.body.appendChild(dragIcon);
    
    try {
      e.dataTransfer.setDragImage(dragIcon, 50, 15);
    } finally {
      // Remover o elemento após um curto período
      setTimeout(() => {
        document.body.removeChild(dragIcon);
      }, 0);
    }
    
    // Adicionar event listeners para acompanhar o movimento do mouse
    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('dragend', handleGlobalDragEnd);
  }, []);
  
  // Acompanhar o movimento do mouse durante o arrasto
  const handleGlobalDragOver = useCallback((e: DragEvent) => {
    setDragPreview(prev => ({
      ...prev,
      top: e.clientY,
      left: e.clientX
    }));
  }, []);
  
  // Limpar o preview de arrasto quando o arrasto terminar
  const handleGlobalDragEnd = useCallback(() => {
    setDragPreview({
      visible: false,
      top: 0,
      left: 0,
      content: ''
    });
    
    document.removeEventListener('dragover', handleGlobalDragOver);
    document.removeEventListener('dragend', handleGlobalDragEnd);
  }, [handleGlobalDragOver]);
  
  // Permitir drop no container do formulário
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    if (formContainerRef.current && simpleFormBuilderRef.current) {
      const rect = simpleFormBuilderRef.current.getBoundingClientRect();
      
      // Calcular posição relativa ao container
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Atualizar indicador de drop
      setDropIndicator({
        visible: true,
        top: y,
        left: x - 100, // Centralizar no cursor
        width: 200,
        height: 40
      });
    }
  }, []);
  
  // Limpar indicador de drop quando o cursor sai da área
  const handleDragLeave = useCallback(() => {
    setDropIndicator({
      visible: false,
      top: 0,
      left: 0,
      width: 0,
      height: 0
    });
  }, []);
  
  // Processar drop de componente
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType');
    
    // Limpar indicador de drop
    setDropIndicator({
      visible: false,
      top: 0,
      left: 0,
      width: 0,
      height: 0
    });
    
    // Limpar preview de arrasto
    setDragPreview({
      visible: false,
      top: 0,
      left: 0,
      content: ''
    });
    
    if (componentType) {
      // Adicionar componente ao formulário
      const newComponent = createComponent(componentType);
      
      // Atualizar o formulário com o novo componente
      const updatedForm = {
        ...formDefinition,
        components: [...(formDefinition.components || []), newComponent]
      };
      
      // Atualizar o estado imediatamente para renderização instantânea
      handleFormChange(updatedForm);
      
      // Selecionar o componente recém-adicionado
      // Reduzido o timeout para 10ms para seleção mais rápida após renderização
      setTimeout(() => {
        setSelectedComponent(newComponent);
        
        // Forçar foco no componente adicionado
        if (simpleFormBuilderRef.current) {
          const componentElements = simpleFormBuilderRef.current.querySelectorAll('.form-component');
          const lastComponent = componentElements[componentElements.length - 1];
          
          if (lastComponent) {
            // Remover seleção anterior
            const selectedElements = simpleFormBuilderRef.current.querySelectorAll('.selected');
            selectedElements.forEach(el => el.classList.remove('selected'));
            
            // Adicionar seleção ao novo componente
            lastComponent.classList.add('selected');
            
            // Scroll para o componente
            lastComponent.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Adicionar efeito visual para destacar o componente
            lastComponent.classList.add('highlight-component');
            setTimeout(() => {
              lastComponent.classList.remove('highlight-component');
            }, 1000);
          }
        }
      }, 10); // Reduzido para 10ms para resposta mais rápida
    }
  }, [formDefinition, handleFormChange]);
  
  // Criar um componente baseado no tipo
  const createComponent = useCallback((componentType: string) => {
    const defaultLabel = getDefaultLabel(componentType);
    const key = defaultLabel.toLowerCase().replace(/\s+/g, '');
    
    // Componente base
    const baseComponent = {
      type: componentType,
      key: key + Math.floor(Math.random() * 1000),
      label: defaultLabel,
    };
    
    // Adicionar propriedades específicas por tipo
    switch (componentType) {
      case 'textfield':
        return {
          ...baseComponent,
          placeholder: 'Enter text here',
          input: true,
        };
      case 'textarea':
        return {
          ...baseComponent,
          placeholder: 'Enter text here',
          autoExpand: false,
          input: true,
        };
      case 'number':
        return {
          ...baseComponent,
          placeholder: 'Enter number',
          input: true,
        };
      case 'checkbox':
        return {
          ...baseComponent,
          input: true,
          defaultValue: false,
        };
      case 'select':
        return {
          ...baseComponent,
          placeholder: 'Select an option',
          data: {
            values: [
              { label: 'Option 1', value: 'option1' },
              { label: 'Option 2', value: 'option2' },
              { label: 'Option 3', value: 'option3' },
            ],
          },
          dataSrc: 'values',
          input: true,
        };
      case 'button':
        return {
          ...baseComponent,
          action: 'submit',
          theme: 'primary',
          size: 'md',
          block: false,
          input: true,
        };
      case 'columns':
        return {
          ...baseComponent,
          columns: [
            { size: 6, components: [] },
            { size: 6, components: [] },
          ],
          input: false,
        };
      case 'panel':
        return {
          ...baseComponent,
          title: 'Panel',
          collapsible: false,
          collapsed: false,
          components: [],
          input: false,
        };
      default:
        return baseComponent;
    }
  }, []);
  
  // Obter label padrão para um tipo de componente
  const getDefaultLabel = useCallback((componentType: string) => {
    switch (componentType) {
      case 'textfield': return 'Text Field';
      case 'textarea': return 'Text Area';
      case 'number': return 'Number';
      case 'checkbox': return 'Checkbox';
      case 'select': return 'Select';
      case 'radio': return 'Radio';
      case 'button': return 'Submit';
      case 'columns': return 'Columns';
      case 'panel': return 'Panel';
      case 'tabs': return 'Tabs';
      case 'table': return 'Table';
      case 'content': return 'Content';
      case 'htmlelement': return 'HTML';
      case 'datetime': return 'Date / Time';
      case 'email': return 'Email';
      case 'phoneNumber': return 'Phone Number';
      case 'password': return 'Password';
      case 'currency': return 'Currency';
      case 'tags': return 'Tags';
      case 'image': return 'Image';
      case 'divider': return 'Divider';
      case 'fieldset': return 'Fieldset';
      default: return componentType.charAt(0).toUpperCase() + componentType.slice(1);
    }
  }, []);
  
  // Atualizar propriedade do componente selecionado
  const updateComponentProperty = useCallback((property: string, value: any) => {
    if (!selectedComponent) return;
    
    // Encontrar o componente no formulário
    const updatedComponents = formDefinition.components.map((component: any) => {
      if (component.key === selectedComponent.key) {
        return {
          ...component,
          [property]: value
        };
      }
      return component;
    });
    
    // Atualizar o formulário
    const updatedForm = {
      ...formDefinition,
      components: updatedComponents
    };
    
    handleFormChange(updatedForm);
    
    // Atualizar o componente selecionado
    setSelectedComponent({
      ...selectedComponent,
      [property]: value
    });
  }, [selectedComponent, formDefinition, handleFormChange]);
  
  // Remover componente selecionado
  const removeSelectedComponent = useCallback(() => {
    if (!selectedComponent) return;
    
    // Filtrar o componente do formulário
    const updatedComponents = formDefinition.components.filter((component: any) => 
      component.key !== selectedComponent.key
    );
    
    // Atualizar o formulário
    const updatedForm = {
      ...formDefinition,
      components: updatedComponents
    };
    
    handleFormChange(updatedForm);
    
    // Limpar seleção
    setSelectedComponent(null);
  }, [selectedComponent, formDefinition, handleFormChange]);
  
  // Renderizar componentes disponíveis
  const renderComponentsPanel = () => {
    return (
      <ComponentsPanel>
        <SearchInput
          placeholder="Pesquisar componentes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {Object.keys(filteredComponents).length === 0 ? (
          <div style={{ padding: '12px', color: '#666', textAlign: 'center' }}>
            Nenhum componente encontrado.
          </div>
        ) : (
          Object.entries(filteredComponents).map(([category, items]: [string, any]) => (
            <ComponentCategory key={category}>
              <CategoryTitle>
                {category === 'input' && 'Campos de Entrada'}
                {category === 'selection' && 'Campos de Seleção'}
                {category === 'presentation' && 'Apresentação'}
                {category === 'layout' && 'Layout'}
                {category === 'action' && 'Ações'}
              </CategoryTitle>
              <ComponentList>
                {items.map((component: any) => (
                  <ComponentButton
                    key={component.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, component.type, component.name)}
                    onClick={() => {
                      // Adicionar componente ao formulário ao clicar
                      const newComponent = createComponent(component.type);
                      const updatedForm = {
                        ...formDefinition,
                        components: [...(formDefinition.components || []), newComponent]
                      };
                      
                      handleFormChange(updatedForm);
                      
                      // Selecionar o componente recém-adicionado
                      setTimeout(() => {
                        setSelectedComponent(newComponent);
                        
                        // Forçar foco no componente adicionado
                        if (simpleFormBuilderRef.current) {
                          const componentElements = simpleFormBuilderRef.current.querySelectorAll('.form-component');
                          const lastComponent = componentElements[componentElements.length - 1];
                          
                          if (lastComponent) {
                            // Remover seleção anterior
                            const selectedElements = simpleFormBuilderRef.current.querySelectorAll('.selected');
                            selectedElements.forEach(el => el.classList.remove('selected'));
                            
                            // Adicionar seleção ao novo componente
                            lastComponent.classList.add('selected');
                            
                            // Scroll para o componente
                            lastComponent.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            
                            // Adicionar efeito visual para destacar o componente
                            lastComponent.classList.add('highlight-component');
                            setTimeout(() => {
                              lastComponent.classList.remove('highlight-component');
                            }, 1000);
                          }
                        }
                      }, 100);
                    }}
                  >
                    <ComponentIcon>{component.icon}</ComponentIcon>
                    <ComponentName>{component.name}</ComponentName>
                  </ComponentButton>
                ))}
              </ComponentList>
            </ComponentCategory>
          ))
        )}
      </ComponentsPanel>
    );
  };
  
  // Renderizar o editor de formulários
  const renderFormEditor = () => {
    if (isLoading) {
      return (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      );
    }
    
    if (loadError) {
      return (
        <ErrorMessage>
          <p><strong>Erro:</strong> {loadError}</p>
          <p>Um novo formulário foi criado. Você pode continuar a edição ou fechar e tentar novamente.</p>
        </ErrorMessage>
      );
    }
    
    switch (activeTab) {
      case 'design':
        return (
          <FormContainer
            ref={formContainerRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <DropIndicator
              visible={dropIndicator.visible}
              top={dropIndicator.top}
              left={dropIndicator.left}
              width={dropIndicator.width}
              height={dropIndicator.height}
            />
            <SimpleFormBuilder ref={simpleFormBuilderRef} />
          </FormContainer>
        );
        
      case 'json':
        return (
          <JsonEditor
            ref={jsonEditorRef}
            defaultValue={JSON.stringify(formDefinition, null, 2)}
          />
        );
        
      case 'preview':
        return (
          <PreviewContainer ref={formEditRef}>
            {/* FormEdit será renderizado aqui via useEffect */}
          </PreviewContainer>
        );
        
      default:
        return null;
    }
  };
  
  // Renderizar painel de propriedades
  const renderPropertiesPanel = () => {
    if (activeTab !== 'design') return null;
    
    return (
      <PropertiesPanel>
        <PropertiesHeader>
          Propriedades
        </PropertiesHeader>
        <PropertiesContent>
          {!selectedComponent ? (
            <PropertyGroup>
              <PropertyGroupTitle>Formulário</PropertyGroupTitle>
              <PropertyField>
                <PropertyLabel>Nome</PropertyLabel>
                <PropertyInput
                  value={formDefinition?.name || ''}
                  onChange={(e) => {
                    handleFormChange({
                      ...formDefinition,
                      name: e.target.value
                    });
                  }}
                />
              </PropertyField>
              <PropertyField>
                <PropertyLabel>ID</PropertyLabel>
                <PropertyInput
                  value={formDefinition?.id || ''}
                  readOnly
                />
              </PropertyField>
            </PropertyGroup>
          ) : (
            <>
              <PropertyGroup>
                <PropertyGroupTitle>Componente</PropertyGroupTitle>
                <PropertyField>
                  <PropertyLabel>Tipo</PropertyLabel>
                  <PropertyInput
                    value={selectedComponent.type || ''}
                    readOnly
                  />
                </PropertyField>
                <PropertyField>
                  <PropertyLabel>Label</PropertyLabel>
                  <PropertyInput
                    value={selectedComponent.label || ''}
                    onChange={(e) => updateComponentProperty('label', e.target.value)}
                  />
                </PropertyField>
                <PropertyField>
                  <PropertyLabel>Key</PropertyLabel>
                  <PropertyInput
                    value={selectedComponent.key || ''}
                    onChange={(e) => updateComponentProperty('key', e.target.value)}
                  />
                </PropertyField>
                {(selectedComponent.type === 'textfield' || selectedComponent.type === 'textarea' || selectedComponent.type === 'number') && (
                  <PropertyField>
                    <PropertyLabel>Placeholder</PropertyLabel>
                    <PropertyInput
                      value={selectedComponent.placeholder || ''}
                      onChange={(e) => updateComponentProperty('placeholder', e.target.value)}
                    />
                  </PropertyField>
                )}
                <PropertyField>
                  <PropertyLabel>Descrição</PropertyLabel>
                  <PropertyInput
                    value={selectedComponent.description || ''}
                    onChange={(e) => updateComponentProperty('description', e.target.value)}
                  />
                </PropertyField>
                <PropertyField>
                  <Button onClick={removeSelectedComponent}>Remover Componente</Button>
                </PropertyField>
              </PropertyGroup>
              
              {/* Propriedades específicas por tipo */}
              {selectedComponent.type === 'select' && (
                <PropertyGroup>
                  <PropertyGroupTitle>Opções</PropertyGroupTitle>
                  {selectedComponent.data?.values?.map((option: any, index: number) => (
                    <PropertyField key={index}>
                      <PropertyLabel>Opção {index + 1}</PropertyLabel>
                      <PropertyInput
                        value={option.label || ''}
                        onChange={(e) => {
                          const updatedValues = [...selectedComponent.data.values];
                          updatedValues[index] = {
                            ...updatedValues[index],
                            label: e.target.value,
                            value: e.target.value.toLowerCase().replace(/\s+/g, '_')
                          };
                          
                          updateComponentProperty('data', {
                            ...selectedComponent.data,
                            values: updatedValues
                          });
                        }}
                      />
                    </PropertyField>
                  ))}
                  <PropertyField>
                    <Button
                      onClick={() => {
                        const updatedValues = [...(selectedComponent.data?.values || [])];
                        updatedValues.push({
                          label: `Option ${updatedValues.length + 1}`,
                          value: `option${updatedValues.length + 1}`
                        });
                        
                        updateComponentProperty('data', {
                          ...selectedComponent.data,
                          values: updatedValues
                        });
                      }}
                    >
                      Adicionar Opção
                    </Button>
                  </PropertyField>
                </PropertyGroup>
              )}
            </>
          )}
        </PropertiesContent>
      </PropertiesPanel>
    );
  };
  
  // Renderizar o modal
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {formDefinition?.name || 'Editor de Formulário'}
          </ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <Tabs>
          <Tab
            active={activeTab === 'design'}
            onClick={() => setActiveTab('design')}
          >
            Design
          </Tab>
          <Tab
            active={activeTab === 'json'}
            onClick={() => setActiveTab('json')}
          >
            JSON
          </Tab>
          <Tab
            active={activeTab === 'preview'}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </Tab>
        </Tabs>
        
        <ModalBody>
          {activeTab === 'design' && renderComponentsPanel()}
          <EditorPanel>
            {activeTab === 'design' && (
              <EditorToolbar>
                <ToolbarButton title="Desfazer">
                  <span>↩️ Desfazer</span>
                </ToolbarButton>
                <ToolbarButton title="Refazer">
                  <span>↪️ Refazer</span>
                </ToolbarButton>
                <ToolbarButton title="Limpar formulário" onClick={() => {
                  if (window.confirm('Tem certeza que deseja limpar o formulário? Todos os componentes serão removidos.')) {
                    handleFormChange({
                      ...formDefinition,
                      components: []
                    });
                    setSelectedComponent(null);
                  }
                }}>
                  <span>🗑️ Limpar</span>
                </ToolbarButton>
              </EditorToolbar>
            )}
            {renderFormEditor()}
          </EditorPanel>
          {renderPropertiesPanel()}
        </ModalBody>
        
        <ModalFooter>
          <Button onClick={onClose}>Cancelar</Button>
          <Button primary onClick={handleSave}>Salvar</Button>
        </ModalFooter>
      </ModalContent>
      
      {/* Preview de arrasto */}
      {dragPreview.visible && (
        <DragPreview
          style={{
            top: dragPreview.top + 10,
            left: dragPreview.left + 10,
          }}
        >
          {dragPreview.content}
        </DragPreview>
      )}
    </ModalOverlay>
  );
};

// Função para abrir o modal de editor de formulário
export const openFormEditorModal = (props: Omit<FormEditorModalProps, 'onClose'>) => {
  const modalRoot = document.createElement('div') as ExtendedHTMLDivElement;
  modalRoot.id = 'form-editor-modal-root';
  document.body.appendChild(modalRoot);
  
  const handleClose = () => {
    // Usar createRoot em vez de ReactDOM.render para compatibilidade com React 18
    const root = modalRoot._reactRootContainer;
    if (root) {
      root.unmount();
    }
    
    if (document.body.contains(modalRoot)) {
      document.body.removeChild(modalRoot);
    }
  };
  
  // Usar createRoot em vez de ReactDOM.render para compatibilidade com React 18
  const root = createRoot(modalRoot);
  root.render(
    <FormEditorModal
      {...props}
      onClose={handleClose}
    />
  );
  
  // Armazenar a referência do root para unmount posterior
  modalRoot._reactRootContainer = root;
};

export default FormEditorModal;
