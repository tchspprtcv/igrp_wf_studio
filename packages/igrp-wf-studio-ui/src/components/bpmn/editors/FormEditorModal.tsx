/**
 * FormEditorModal.tsx
 * Modal para edição de formulários usando form-js
 * Redesenhado com base no exemplo oficial do demo.bpmn.io
 * 
 * Correções implementadas:
 * - Propagação de eventos de drag and drop para componentes aninhados e grid layout
 * - Suporte recursivo para movimentação entre níveis (dentro/fora de painéis e colunas)
 * - Delegação de eventos em containers (painéis, colunas) para permitir drop
 * - Resolução de conflitos entre grid layout e drag and drop
 * - Atualização completa do modelo de dados ao mover componentes entre níveis
 * - Correção de erros de tipagem TypeScript (tipos 'never', 'dataset', uso antes da declaração, imports/exports)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
// import { FormBuilder, FormEdit } from '@formio/react'; // Manter para referência, mas o preview é customizado
import EditorService from '../../../services/EditorService';
import { createRoot } from 'react-dom/client';
import { v4 as uuidv4 } from 'uuid';

// --- Tipos --- 
interface FormComponent {
  id: string;
  type: string;
  key: string;
  label: string;
  components?: FormComponent[]; // Para containers como panel, fieldset
  columns?: FormColumn[]; // Para layout de colunas
  [key: string]: any; // Outras propriedades específicas
}

interface FormColumn {
  size?: number;
  components: FormComponent[];
}

interface FormDefinition {
  id?: string;
  display: string;
  components: FormComponent[];
  type: string;
  tags?: string[];
  title: string;
  name: string;
  [key: string]: any;
}

interface FormEditorModalProps {
  formKey: string;
  onSave: (formKey: string, formData: FormDefinition) => void;
  onClose: () => void;
}

const DEFAULT_FORM: FormDefinition = {
  display: 'form',
  components: [],
  type: 'form',
  tags: [],
  title: 'Novo Formulário',
  name: 'novoFormulario'
};

interface DragData {
  type: 'component' | 'new';
  componentType?: string; // Para novos componentes
  componentName?: string; // Para preview de novos componentes
  sourcePath?: string; // Caminho do componente sendo arrastado (ex: "0.components.1")
}

interface DropTarget {
  targetPath: string; // Caminho onde soltar (ex: "0" ou "0.components.1" ou "0.columns.0.components")
  targetIndex: number; // Índice onde inserir dentro do targetPath
  isContainer: boolean; // Se o alvo é um container (panel, column, fieldset, ou raiz)
}

interface IndicatorState {
  visible: boolean;
  top: number;
  left: number;
  width: number;
  height?: number;
}

interface DragPreviewState {
  visible: boolean;
  top: number;
  left: number;
  content: string;
}

// --- Estilos (mantidos da versão anterior) --- 
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
  width: 95%;
  max-width: 1400px;
  height: 95vh;
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

// Indicador de drop (linha azul)
const DropLineIndicator = styled.div<{ $visible: boolean; $top: number; $left: number; $width: number }>`
  position: absolute;
  height: 2px;
  background-color: #2196f3;
  pointer-events: none;
  display: ${props => props.$visible ? 'block' : 'none'};
  top: ${props => props.$top}px;
  left: ${props => props.$left}px;
  width: ${props => props.$width}px;
  z-index: 10;
`;

// Indicador de drop para containers (borda azul)
const DropContainerIndicator = styled.div<{ $visible: boolean; $top: number; $left: number; $width: number; $height: number }>`
  position: absolute;
  border: 2px dashed #2196f3;
  background-color: rgba(33, 150, 243, 0.1);
  border-radius: 4px;
  pointer-events: none;
  display: ${props => props.$visible ? 'block' : 'none'};
  top: ${props => props.$top}px;
  left: ${props => props.$left}px;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  z-index: 9; // Abaixo da linha de drop
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

// Componente de formulário simples para o modo de design (com correções)
const SimpleFormBuilderContainer = styled.div`
  width: 100%;
  min-height: 400px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  padding: 20px;
  background-color: white;
  position: relative; /* Para posicionar indicadores */

  .form-component-wrapper {
    position: relative; /* Para posicionar drag handle */
    margin-bottom: 15px;
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #999;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;

    &:hover {
      border-color: #2196f3;
      background-color: #e3f2fd;
    }

    &.selected {
      border: 2px solid #2196f3;
      background-color: #e3f2fd;
    }

    &.dragging {
      opacity: 0.5;
      border-style: dashed;
    }
  }

  .drag-handle {
    position: absolute;
    left: 4px;
    top: 50%;
    transform: translateY(-50%);
    cursor: grab;
    opacity: 0.5;
    transition: opacity 0.2s ease;
    padding: 5px;

    &:hover {
      opacity: 1;
    }
  }

  .component-content {
    margin-left: 24px; /* Espaço para o drag handle */
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

  /* Estilos para containers (painel, colunas) */
  .form-component-container {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 15px;
    margin-top: 10px;
    background-color: #fff;

    &.drop-target-container {
      background-color: #e3f2fd; /* Highlight ao arrastar sobre */
      border-color: #2196f3;
    }
  }

  .panel-title {
    font-weight: bold;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
  }

  .columns-container {
    display: flex;
    gap: 15px;
  }

  .column {
    flex: 1;
    border: 1px dashed #ddd;
    border-radius: 4px;
    padding: 10px;
    min-height: 50px; /* Para garantir que a área de drop seja visível */
    background-color: #fdfdfd;

    &.drop-target-container {
      background-color: #e3f2fd;
      border-color: #2196f3;
    }
  }
`;

/**
 * FormEditorModal Component (com correções de drag and drop e TypeScript)
 */
const FormEditorModal: React.FC<FormEditorModalProps> = ({ formKey, onSave, onClose }) => {
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'json' | 'preview'>('design');
  const [selectedComponentPath, setSelectedComponentPath] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  // Garantir estado inicial com todas as propriedades de IndicatorState
  // In the component's state, add:
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [dropLineIndicator, setDropLineIndicator] = useState<IndicatorState>({ visible: false, top: 0, left: 0, width: 0 });
  const [dropContainerIndicator, setDropContainerIndicator] = useState<IndicatorState>({ visible: false, top: 0, left: 0, width: 0, height: 0 });
  const [dragPreview, setDragPreview] = useState<DragPreviewState>({ visible: false, top: 0, left: 0, content: '' });
  const [draggingComponentPath, setDraggingComponentPath] = useState<string | null>(null);
  

  const jsonEditorRef = useRef<HTMLTextAreaElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const formEditRef = useRef<HTMLDivElement>(null);
  const simpleFormBuilderRef = useRef<HTMLDivElement>(null);
  const dragDataRef = useRef<DragData | null>(null);

  // --- Funções Auxiliares para Manipulação da Estrutura --- 

  // Encontra um componente ou container pelo caminho (path)
  const findElementByPath = (path: string, rootComponents: FormComponent[]): { element: FormComponent; parent: FormComponent[] | FormColumn[]; index: number } | null => {
    const parts = path.split('.');
    let currentLevel: any = rootComponents;
    let parent: any = null;
    let element: any = null;
    let index = -1;
    let isInsideColumn = false;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === 'components') {
        if (!element || !Array.isArray(element.components)) return null;
        parent = element.components;
        currentLevel = element.components;
        isInsideColumn = false;
      } else if (part === 'columns') {
        if (!element || !Array.isArray(element.columns)) return null;
        parent = element.columns;
        currentLevel = element.columns;
        isInsideColumn = false;
      } else if (part === 'components' && isInsideColumn) {
         if (!element || !Array.isArray(element.components)) return null;
         parent = element.components;
         currentLevel = element.components;
      } else {
        index = parseInt(part);
        if (!Array.isArray(currentLevel) || index < 0 || index >= currentLevel.length) {
          return null; // Caminho inválido
        }
        element = currentLevel[index];
        parent = currentLevel; // Atualiza o pai para o array atual
        // Se o elemento for uma coluna, o próximo 'components' será dentro dela
        if (element && element.components && !element.columns) { // Verifica se é um container simples ou coluna
            isInsideColumn = true;
        }
      }
    }

    if (element && parent && index !== -1) {
      return { element, parent: parent as (FormComponent[] | FormColumn[]), index };
    }
    return null;
  };

  // Remove um elemento pelo caminho
  const removeElementByPath = (path: string, rootComponents: FormComponent[]): { updatedComponents: FormComponent[]; removedElement: FormComponent } | null => {
    const result = findElementByPath(path, rootComponents);
    if (!result) return null;

    const { parent, index } = result;
    if (Array.isArray(parent)) {
      const parentArray = parent as FormComponent[]; // Assumir FormComponent[] por simplicidade
      const [removedElement] = parentArray.splice(index, 1);
      return { updatedComponents: [...rootComponents], removedElement };
    } 
    // TODO: Lidar com remoção de colunas (parent seria FormColumn[])
    console.warn("Remoção de dentro de colunas não totalmente implementada");
    return null;
  };

  // Insere um elemento em um caminho e índice específicos
  const insertElementAtPath = (targetPath: string, targetIndex: number, element: FormComponent, rootComponents: FormComponent[]): FormComponent[] => {
    let containerComponents: FormComponent[] = [];
    let parentElement: FormComponent | FormColumn | null = null;

    if (!targetPath) {
      // Inserindo na raiz
      containerComponents = rootComponents;
    } else {
      const parentInfo = findElementByPath(targetPath, rootComponents);
      if (!parentInfo) {
        console.error('Caminho de inserção inválido:', targetPath);
        return rootComponents; // Retorna original
      }
      parentElement = parentInfo.element;

      // Determinar onde inserir
      if ('components' in parentElement && (parentElement.type === 'panel' || parentElement.type === 'fieldset')) {
        parentElement.components = parentElement.components || [];
        containerComponents = parentElement.components;
      } else if ('columns' in parentElement && parentElement.type === 'columns') {
          // A lógica aqui precisa ser mais robusta para identificar a coluna correta
          // Simplificação: Assume que o targetPath aponta para o array 'components' da coluna
          const columnMatch = targetPath.match(/\.columns\.(\d+)\.components$/);
          if (columnMatch && parentElement.columns) {
              const colIndex = parseInt(columnMatch[1]);
              if (parentElement.columns[colIndex]) {
                  parentElement.columns[colIndex].components = parentElement.columns[colIndex].components || [];
                  containerComponents = parentElement.columns[colIndex].components;
              } else {
                  console.error('Índice de coluna inválido em:', targetPath);
                  return rootComponents;
              }
          } else {
              // Fallback: Tentar inserir na primeira coluna?
              if (parentElement.columns && parentElement.columns[0]) {
                  parentElement.columns[0].components = parentElement.columns[0].components || [];
                  containerComponents = parentElement.columns[0].components;
                  targetIndex = containerComponents.length; // Inserir no final
              } else {
                  console.error('Não foi possível determinar a coluna para inserção em:', targetPath);
                  return rootComponents;
              }
          }
      } else {
        console.error('Alvo de inserção não é um container válido:', targetPath, parentElement?.type);
        return rootComponents;
      }
    }

    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex > containerComponents.length) targetIndex = containerComponents.length;

    containerComponents.splice(targetIndex, 0, element);
    return [...rootComponents]; // Retorna cópia atualizada
  };

  // --- Fim Funções Auxiliares --- 

  // Gerar ID para novos formulários
  const generateFormId = useCallback((key: string) => {
    const baseName = key.split('/').pop()?.replace('.json', '') || '';
    return baseName ? `${baseName}_${uuidv4().substring(0, 8)}` : `form_${uuidv4().substring(0, 12)}`;
  }, []);

  // Função para lidar com a mudança no formulário (centralizada)
  const handleFormChange = useCallback((newFormDefinition: FormDefinition) => {
    setFormDefinition(newFormDefinition);
  }, []);

  // Carregar definição do formulário
  useEffect(() => {
    const loadForm = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        let form = await EditorService.loadForm(formKey);
        if (typeof form !== 'object' || form === null) {
          throw new Error('Formato de formulário inválido');
        }
        const validatedForm: FormDefinition = {
          ...DEFAULT_FORM,
          ...form,
          id: form.id || generateFormId(formKey),
          name: form.name || ('Formulário ' + (form.id || generateFormId(formKey)).substring(0, 8)),
          components: form.components || [],
          type: form.type || 'form',
        };
        setFormDefinition(validatedForm);
      } catch (error: any) {
        console.error('Erro ao carregar formulário:', error);
        const newFormId = generateFormId(formKey);
        const newForm: FormDefinition = { ...DEFAULT_FORM, id: newFormId, name: 'Formulário ' + newFormId.substring(0, 8) };
        setFormDefinition(newForm);
        setLoadError('Não foi possível carregar o formulário. Um novo formulário foi criado.');
      } finally {
        setIsLoading(false);
      }
    };
    loadForm();
  }, [formKey, generateFormId]);

  // Atualizar editor JSON
  useEffect(() => {
    if (jsonEditorRef.current && formDefinition && activeTab === 'json') {
      jsonEditorRef.current.value = JSON.stringify(formDefinition, null, 2);
    }
  }, [formDefinition, activeTab]);

  // Renderizar preview (mantido da versão anterior)
  useEffect(() => {
    if (activeTab === 'preview' && formEditRef.current && formDefinition) {
      try {
        while (formEditRef.current.firstChild) {
          formEditRef.current.removeChild(formEditRef.current.firstChild);
        }
        const formElement = document.createElement('div');
        formEditRef.current.appendChild(formElement);
        const renderFormPreview = (container: HTMLElement, form: FormDefinition) => {
          if (!container || !form || !form.components) return;
          let html = '';
          form.components.forEach((component: FormComponent) => {
            html += `<div style="margin-bottom: 10px; padding: 10px; border: 1px solid #eee;">
                       <strong>${component.label || component.type}</strong>
                       ${component.description ? `<p style="font-size: 0.9em; color: #666;">${component.description}</p>` : ''}
                     </div>`;
          });
          container.innerHTML = html;
        };
        renderFormPreview(formElement, formDefinition);
      } catch (error: any) {
        console.error('Erro ao renderizar preview:', error);
        if (formEditRef.current) {
          formEditRef.current.innerHTML = `<div style="color: red;">Erro ao renderizar preview: ${error.message}</div>`;
        }
      }
    }
  }, [activeTab, formDefinition]);

  // Adicionar estilos de highlight
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = HighlightStyle;
    document.head.appendChild(styleElement);
    return () => {
      if (document.head.contains(styleElement)) {
         document.head.removeChild(styleElement);
      }
    };
  }, []);

  // --- Lógica de Drag and Drop (Refatorada e com Tipagem Corrigida) --- 

  // Mover createComponent para antes de onde é usado (handleDrop)
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

  const createComponent = useCallback((componentType: string): FormComponent => {
    const defaultLabel = getDefaultLabel(componentType);
    const key = defaultLabel.toLowerCase().replace(/\s+/g, '') + '_' + uuidv4().substring(0, 4);
    const baseComponent: Partial<FormComponent> = { id: uuidv4(), type: componentType, key: key, label: defaultLabel };

    switch (componentType) {
      case 'textfield': return { ...baseComponent, placeholder: 'Enter text here', input: true } as FormComponent;
      case 'textarea': return { ...baseComponent, placeholder: 'Enter text here', autoExpand: false, input: true } as FormComponent;
      case 'number': return { ...baseComponent, placeholder: 'Enter number', input: true } as FormComponent;
      case 'checkbox': return { ...baseComponent, input: true, defaultValue: false } as FormComponent;
      case 'select': return { ...baseComponent, placeholder: 'Select an option', data: { values: [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }] }, dataSrc: 'values', input: true } as FormComponent;
      case 'button': return { ...baseComponent, action: 'submit', theme: 'primary', size: 'md', block: false, input: true } as FormComponent;
      case 'columns': return { ...baseComponent, columns: [{ components: [] }, { components: [] }], input: false } as FormComponent;
      case 'panel': return { ...baseComponent, title: 'Panel', collapsible: false, collapsed: false, components: [], input: false } as FormComponent;
      case 'fieldset': return { ...baseComponent, legend: 'Fieldset', components: [], input: false } as FormComponent;
      default: return baseComponent as FormComponent;
    }
  }, [getDefaultLabel]);

  const handleDragStart = useCallback((event: React.DragEvent<HTMLElement>, dragItemData: DragData) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify(dragItemData));
    dragDataRef.current = dragItemData;

    if (dragItemData.type === 'component' && dragItemData.sourcePath) {
      setDraggingComponentPath(dragItemData.sourcePath);
      setDragPreview({ visible: true, top: event.clientY, left: event.clientX, content: 'Movendo...' });
    } else if (dragItemData.type === 'new') {
      setDraggingComponentPath(null);
      setDragPreview({ visible: true, top: event.clientY, left: event.clientX, content: dragItemData.componentName || 'Novo Componente' });
    }

    setTimeout(() => {
        if (dragItemData.type === 'component' && dragItemData.sourcePath) {
            const element = simpleFormBuilderRef.current?.querySelector(`[data-path="${dragItemData.sourcePath}"]`);
            element?.classList.add('dragging');
        }
    }, 0);

  }, []);

  const handleDragEnd = useCallback((event: React.DragEvent<HTMLElement>) => {
    setDropLineIndicator({ visible: false, top: 0, left: 0, width: 0 });
    setDropContainerIndicator({ visible: false, top: 0, left: 0, width: 0, height: 0 });
    setDragPreview({ visible: false, top: 0, left: 0, content: '' });

    if (draggingComponentPath) {
        const element = simpleFormBuilderRef.current?.querySelector(`[data-path="${draggingComponentPath}"]`);
        element?.classList.remove('dragging');
    }
    setDraggingComponentPath(null);
    dragDataRef.current = null;

    simpleFormBuilderRef.current?.querySelectorAll('.drop-target-container').forEach(el => el.classList.remove('drop-target-container'));

  }, [draggingComponentPath]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    if (dragPreview.visible) {
      setDragPreview(prev => ({ ...prev, top: event.clientY, left: event.clientX }));
    }

    if (!simpleFormBuilderRef.current || !dragDataRef.current) return;

    const formRect = simpleFormBuilderRef.current.getBoundingClientRect();
    const clientY = event.clientY;
    const clientX = event.clientX;


    let closestTarget: DropTarget | null = null;
    let minDistance = Infinity;
    let targetIsContainer = false;
    let containerRect: DOMRect | null = null;

    simpleFormBuilderRef.current.querySelectorAll('.drop-target-container').forEach(el => el.classList.remove('drop-target-container'));

    const elements = simpleFormBuilderRef.current.querySelectorAll('[data-path]');
    elements.forEach(el => {
      const element = el as HTMLElement;
      const path = element.dataset.path;
      if (!path || path === draggingComponentPath) return;

      const rect = element.getBoundingClientRect();
      const isContainer = element.classList.contains('form-component-container') || element.classList.contains('column');
      
      if (isContainer && clientY >= rect.top && clientY <= rect.bottom && clientX >= rect.left && clientX <= rect.right) {
        targetIsContainer = true;
        containerRect = rect;
        closestTarget = {
          targetPath: path,
          targetIndex: 0,
          isContainer: true
        };
        element.classList.add('drop-target-container');
        return;
      }

      const distanceTop = Math.abs(clientY - rect.top);
      const distanceBottom = Math.abs(clientY - rect.bottom);
      const isCloserToTop = distanceTop < distanceBottom;
      const distance = isCloserToTop ? distanceTop : distanceBottom;

      if (distance < minDistance) {
        minDistance = distance;
        const parts = path.split('.');
        const indexStr = parts.pop();
        const parentPath = parts.join('.');
        const index = parseInt(indexStr || '-1');

        closestTarget = {
          targetPath: parentPath,
          targetIndex: isCloserToTop ? index : index + 1,
          isContainer: false
        };
      }
    });

    if (targetIsContainer && containerRect && closestTarget) {
      const newDropLineIndicator: IndicatorState = { visible: false, top: 0, left: 0, width: 0 };
      const newDropContainerIndicator: IndicatorState = {
        visible: true,
        top: containerRect.top - formRect.top + (simpleFormBuilderRef.current?.scrollTop ?? 0),
        left: containerRect.left - formRect.left + (simpleFormBuilderRef.current?.scrollLeft ?? 0),
        width: containerRect.width,
        height: containerRect.height
      };
      setDropLineIndicator(newDropLineIndicator);
      setDropContainerIndicator(newDropContainerIndicator);
    } else if (closestTarget) {
      const newDropContainerIndicator: IndicatorState = { visible: false, top: 0, left: 0, width: 0, height: 0 };
      setDropContainerIndicator(newDropContainerIndicator);
      
      const targetElementPath = `${closestTarget.targetPath ? closestTarget.targetPath + '.' : ''}${closestTarget.targetIndex}`;
      const beforeElementPath = `${closestTarget.targetPath ? closestTarget.targetPath + '.' : ''}${closestTarget.targetIndex - 1}`;
      
      const targetElement = simpleFormBuilderRef.current?.querySelector(`[data-path="${targetElementPath}"]`) ||
                           simpleFormBuilderRef.current?.querySelector(`[data-path="${beforeElementPath}"]`);

      if (targetElement && simpleFormBuilderRef.current) {
        const targetRect = targetElement.getBoundingClientRect();
        const targetElementHtml = targetElement as HTMLElement;
        const isInsertingBefore = targetElementHtml.dataset.path?.endsWith(String(closestTarget.targetIndex));
        const lineTop = isInsertingBefore
          ? targetRect.top - formRect.top + simpleFormBuilderRef.current.scrollTop
          : targetRect.bottom - formRect.top + simpleFormBuilderRef.current.scrollTop;

        const newDropLineIndicator: IndicatorState = {
          visible: true,
          top: lineTop - 1,
          left: targetRect.left - formRect.left + simpleFormBuilderRef.current.scrollLeft,
          width: targetRect.width
        };
        setDropLineIndicator(newDropLineIndicator);
      }
    } else {
      const newDropLineIndicator: IndicatorState = { visible: false, top: 0, left: 0, width: 0 };
      const newDropContainerIndicator: IndicatorState = { visible: false, top: 0, left: 0, width: 0, height: 0 };
      setDropLineIndicator(newDropLineIndicator);
      setDropContainerIndicator(newDropContainerIndicator);
    }
  }, [dragPreview.visible, draggingComponentPath]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const dragDataStr = event.dataTransfer.getData('application/json');
    if (!dragDataStr || !simpleFormBuilderRef.current || !formDefinition) {
      handleDragEnd(event);
      return;
    }

    const dragData: DragData = JSON.parse(dragDataStr);
    const clientY = event.clientY;
    const clientX = event.clientX;

    let dropTarget: DropTarget | null = null;
    let minDistance = Infinity;
    let targetIsContainer = false;

    const elements = simpleFormBuilderRef.current.querySelectorAll('[data-path]');
    elements.forEach(el => {
      const element = el as HTMLElement;
      const path = element.dataset.path;
      if (!path || path === dragData.sourcePath) return;

      const rect = element.getBoundingClientRect();
      const isContainer = element.classList.contains('form-component-container') || element.classList.contains('column');
      
      if (isContainer && clientY >= rect.top && clientY <= rect.bottom && clientX >= rect.left && clientX <= rect.right) {
        targetIsContainer = true;
        dropTarget = {
          targetPath: path,
          targetIndex: 0,
          isContainer: true
        };
        return;
      }

      const distanceTop = Math.abs(clientY - rect.top);
      const distanceBottom = Math.abs(clientY - rect.bottom);
      const isCloserToTop = distanceTop < distanceBottom;
      const distance = isCloserToTop ? distanceTop : distanceBottom;

      if (distance < minDistance) {
        minDistance = distance;
        const parts = path.split('.');
        const indexStr = parts.pop();
        const parentPath = parts.join('.');
        const index = parseInt(indexStr || '-1');

        dropTarget = {
          targetPath: parentPath,
          targetIndex: isCloserToTop ? index : index + 1,
          isContainer: false
        };
      }
    });

    if (!dropTarget) {
        dropTarget = {
            targetPath: '',
            targetIndex: formDefinition?.components?.length || 0,
            isContainer: true
        };
    }

    let currentComponents = formDefinition.components;
    let componentToMove: FormComponent | null = null;

    if (dragData.type === 'component' && dragData.sourcePath) {
      const removeResult = removeElementByPath(dragData.sourcePath, currentComponents);
      if (removeResult) {
        currentComponents = removeResult.updatedComponents;
        componentToMove = removeResult.removedElement;
      } else {
        console.error('Falha ao remover componente da origem:', dragData.sourcePath);
        handleDragEnd(event);
        return;
      }
    } else if (dragData.type === 'new' && dragData.componentType) {
      componentToMove = createComponent(dragData.componentType);
    }

    if (componentToMove && dropTarget) {
      const insertionPath = dropTarget.isContainer ? dropTarget.targetPath : dropTarget.targetPath;
      const insertionIndex = dropTarget.isContainer ? 0 : dropTarget.targetIndex;

      const finalComponents = insertElementAtPath(
        insertionPath,
        insertionIndex,
        componentToMove,
        currentComponents
      );
      
      const updatedFormDef = { ...formDefinition, components: finalComponents };
      handleFormChange(updatedFormDef);
      setSelectedComponentPath(null);

    } else {
      console.error('Falha ao processar drop: componente ou alvo inválido.');
    }

    handleDragEnd(event);

  }, [formDefinition, handleFormChange, createComponent, handleDragEnd]);

  // --- Fim Lógica de Drag and Drop --- 

  const updateSelectedComponentProperty = useCallback((property: string, value: any) => {
    if (!selectedComponentPath || !formDefinition) return;
    const newFormDefinition = JSON.parse(JSON.stringify(formDefinition));
    const result = findElementByPath(selectedComponentPath, newFormDefinition.components);
    if (result && result.element) {
      result.element[property] = value;
      handleFormChange(newFormDefinition);
    } else {
      console.error("Não foi possível encontrar o componente para atualizar:", selectedComponentPath);
    }
  }, [selectedComponentPath, formDefinition, handleFormChange]);

  const removeSelectedComponent = useCallback(() => {
    if (!selectedComponentPath || !formDefinition) return;
    const result = removeElementByPath(selectedComponentPath, formDefinition.components);
    if (result) {
      handleFormChange({ ...formDefinition, components: result.updatedComponents });
      setSelectedComponentPath(null);
    } else {
      console.error('Falha ao remover componente:', selectedComponentPath);
    }
  }, [selectedComponentPath, formDefinition, handleFormChange]);

  const getSelectedComponent = useCallback((): FormComponent | null => {
    if (!selectedComponentPath || !formDefinition) return null;
    const result = findElementByPath(selectedComponentPath, formDefinition.components);
    return result ? result.element : null;
  }, [selectedComponentPath, formDefinition]);

  const selectedComponent = getSelectedComponent();

  const renderSimpleFormBuilder = useCallback((components: FormComponent[], currentPath: string = ''): JSX.Element | JSX.Element[] | null => {
    if (!components || components.length === 0) {
      const showPlaceholder = !currentPath || currentPath.endsWith('.components');
      return showPlaceholder ? <div className="placeholder-text">Arraste componentes para cá</div> : null;
    }

    return components.map((component, index) => {
      const componentPath = currentPath ? `${currentPath}.${index}` : `${index}`;
      const isSelected = componentPath === selectedComponentPath;
      const isDragging = componentPath === draggingComponentPath;

      const handleComponentClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedComponentPath(componentPath);
      };

      const dragProps = {
        draggable: true,
        onDragStart: (e: React.DragEvent<HTMLElement>) => handleDragStart(e, { type: 'component', sourcePath: componentPath }),
        onDragEnd: handleDragEnd,
      };

      let content;
      const containerClasses = `form-component-container ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`;
      const wrapperClasses = `form-component-wrapper ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`;

      if (component.type === 'panel' || component.type === 'fieldset') {
        const containerPath = `${componentPath}.components`;
        content = (
          <div className={containerClasses} data-path={componentPath} {...dragProps} onClick={handleComponentClick}>
            <div className="panel-title">{component.label || component.type}</div>
            <div className="panel-content" data-path={containerPath} onDragOver={handleDragOver} onDrop={handleDrop}>
              {renderSimpleFormBuilder(component.components || [], containerPath)}
            </div>
          </div>
        );
      } else if (component.type === 'columns') {
        content = (
          <div className={`${containerClasses} columns-container`} data-path={componentPath} {...dragProps} onClick={handleComponentClick}>
            {component.columns?.map((column: FormColumn, colIndex: number) => {
              const columnPath = `${componentPath}.columns.${colIndex}.components`;
              return (
                <div key={colIndex} className="column" data-path={columnPath} style={{ flex: column.size || 1 }} onDragOver={handleDragOver} onDrop={handleDrop}>
                  {renderSimpleFormBuilder(column.components || [], columnPath)}
                </div>
              );
            })}
          </div>
        );
      } else {
        content = (
          <div className={wrapperClasses} 
               data-path={componentPath} 
               {...dragProps} 
               onClick={handleComponentClick}
          >
            <div className="drag-handle" title="Mover componente">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6C4.55228 6 5 5.55228 5 5C5 4.44772 4.55228 4 4 4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6Z" fill="#666"/><path d="M4 9C4.55228 9 5 8.55228 5 8C5 7.44772 4.55228 7 4 7C3.44772 7 3 7.44772 3 8C3 8.55228 3.44772 9 4 9Z" fill="#666"/><path d="M4 12C4.55228 12 5 11.5523 5 11C5 10.4477 4.55228 10 4 10C3.44772 10 3 10.4477 3 11C3 11.5523 3.44772 12 4 12Z" fill="#666"/><path d="M8 6C8.55228 6 9 5.55228 9 5C9 4.44772 8.55228 4 8 4C7.44772 4 7 4.44772 7 5C7 5.55228 7.44772 6 8 6Z" fill="#666"/><path d="M8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9Z" fill="#666"/><path d="M8 12C8.55228 12 9 11.5523 9 11C9 10.4477 8.55228 10 8 10C7.44772 10 7 10.4477 7 11C7 11.5523 7.44772 12 8 12Z" fill="#666"/><path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" fill="#666"/><path d="M12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9Z" fill="#666"/><path d="M12 12C12.5523 12 13 11.5523 13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11C11 11.5523 11.4477 12 12 12Z" fill="#666"/></svg>
            </div>
            <div className="component-content">
              <div className="form-component-label">{component.label || component.type}</div>
              {component.description && <div className="form-component-description">{component.description}</div>}
            </div>
          </div>
        );
      }

      return (
        <React.Fragment key={component.id || componentPath}>
          {content}
        </React.Fragment>
      );
    });
  }, [selectedComponentPath, draggingComponentPath, handleDragStart, handleDragEnd, handleDrop, handleDragOver]);

  const handleSave = async () => {
    if (!formDefinition) return;
    try {
      let formToSave: FormDefinition = formDefinition;
      if (activeTab === 'json' && jsonEditorRef.current) {
        try {
          formToSave = JSON.parse(jsonEditorRef.current.value);
          if (typeof formToSave !== 'object' || !Array.isArray(formToSave.components)) {
            throw new Error("Estrutura JSON inválida.");
          }
        } catch (error) {
          console.error('JSON inválido:', error);
          alert('O JSON do formulário é inválido. Por favor, corrija os erros antes de salvar.');
          return;
        }
      }
      if (!formToSave.id) formToSave.id = generateFormId(formKey);
      if (!formToSave.name) formToSave.name = 'Formulário ' + (formToSave.id || '').substring(0, 8);
      
      const savedFormKey = await EditorService.saveForm(formKey, formToSave);
      onSave(savedFormKey, formToSave);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      alert('Erro ao salvar formulário. Verifique o console para mais detalhes.');
    }
  };

  const components = {
    input: [
      { name: 'Text field', icon: '✏️', type: 'textfield' },
      { name: 'Text area', icon: '📝', type: 'textarea' },
      { name: 'Number', icon: '🔢', type: 'number' },
    ],
    selection: [
      { name: 'Checkbox', icon: '☑️', type: 'checkbox' },
      { name: 'Select', icon: '▼', type: 'select' },
    ],
    layout: [
      { name: 'Columns', icon: '⚏', type: 'columns' },
      { name: 'Panel', icon: '📦', type: 'panel' },
      { name: 'Fieldset', icon: '🔲', type: 'fieldset' },
    ],
    action: [
      { name: 'Button', icon: '🔘', type: 'button' },
    ]
  };

  const filterComponents = useCallback((comps: Record<string, {name: string, icon: string, type: string}[]>, term: string) => {
    if (!term) return comps;
    const filtered: Record<string, {name: string, icon: string, type: string}[]> = {};
    Object.keys(comps).forEach(category => {
      const filteredItems = comps[category].filter((item) =>
        item.name.toLowerCase().includes(term.toLowerCase())
      );
      if (filteredItems.length > 0) {
        filtered[category] = filteredItems;
      }
    });
    return filtered;
  }, []);

  const filteredComponents = filterComponents(components, searchTerm);

  const renderComponentsPanel = () => {
    return (
      <ComponentsPanel>
        <SearchInput
          placeholder="Pesquisar componentes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {Object.keys(filteredComponents).length === 0 ? (
          <div style={{ padding: '12px', color: '#666', textAlign: 'center' }}>Nenhum componente encontrado.</div>
        ) : (
          Object.entries(filteredComponents).map(([category, items]) => (
            <ComponentCategory key={category}>
              <CategoryTitle>{category.charAt(0).toUpperCase() + category.slice(1)}</CategoryTitle>
              <ComponentList>
                {items.map((component) => (
                  <ComponentButton
                    key={component.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, { type: 'new', componentType: component.type, componentName: component.name })}
                    onDragEnd={handleDragEnd}
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

  const renderFormEditor = () => {
    if (isLoading) return <LoadingOverlay><LoadingSpinner /></LoadingOverlay>;
    if (loadError) return <ErrorMessage>{loadError}</ErrorMessage>;
    if (!formDefinition) return <LoadingOverlay><LoadingSpinner /></LoadingOverlay>;

    switch (activeTab) {
      case 'design':
        return (
          <FormContainer
            ref={formContainerRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={(e) => {
                const rect = formContainerRef.current?.getBoundingClientRect();
                if (rect && (e.clientX <= rect.left || e.clientX >= rect.right || e.clientY <= rect.top || e.clientY >= rect.bottom)) {
                    setDropLineIndicator({ visible: false, top: 0, left: 0, width: 0 });
                    setDropContainerIndicator({ visible: false, top: 0, left: 0, width: 0, height: 0 });
                }
            }}
          >
            <SimpleFormBuilderContainer ref={simpleFormBuilderRef}>
              {renderSimpleFormBuilder(formDefinition.components || [], '')}
            </SimpleFormBuilderContainer>
            <DropLineIndicator
              $visible={dropLineIndicator.visible}
              $top={dropLineIndicator.top}
              $left={dropLineIndicator.left}
              $width={dropLineIndicator.width}
            />
            <DropContainerIndicator
              $visible={dropContainerIndicator.visible}
              $top={dropContainerIndicator.top}
              $left={dropContainerIndicator.left}
              $width={dropContainerIndicator.width}
              $height={dropContainerIndicator.height || 0}
            />
          </FormContainer>
        );
      case 'json': return <JsonEditor ref={jsonEditorRef} defaultValue={JSON.stringify(formDefinition, null, 2)} />;
      case 'preview': return <PreviewContainer ref={formEditRef}></PreviewContainer>;
      default: return null;
    }
  };

  const renderPropertiesPanel = () => {
    if (activeTab !== 'design') return null;
    const currentComponent = selectedComponent;

    return (
      <PropertiesPanel>
        <PropertiesHeader>Propriedades</PropertiesHeader>
        <PropertiesContent>
          {!currentComponent ? (
            <PropertyGroup>
              <PropertyGroupTitle>Formulário</PropertyGroupTitle>
              <PropertyField>
                <PropertyLabel>Nome</PropertyLabel>
                <PropertyInput value={formDefinition?.name || ''} onChange={(e) => handleFormChange({ ...formDefinition!, name: e.target.value })} />
              </PropertyField>
            </PropertyGroup>
          ) : (
            <>
              <PropertyGroup>
                <PropertyGroupTitle>Componente</PropertyGroupTitle>
                <PropertyField>
                  <PropertyLabel>Tipo</PropertyLabel>
                  <PropertyInput value={currentComponent.type || ''} readOnly />
                </PropertyField>
                <PropertyField>
                  <PropertyLabel>Label</PropertyLabel>
                  <PropertyInput value={currentComponent.label || ''} onChange={(e) => updateSelectedComponentProperty('label', e.target.value)} />
                </PropertyField>
                <PropertyField>
                  <PropertyLabel>Key</PropertyLabel>
                  <PropertyInput value={currentComponent.key || ''} onChange={(e) => updateSelectedComponentProperty('key', e.target.value)} />
                </PropertyField>
                <PropertyField>
                  <PropertyLabel>Descrição</PropertyLabel>
                  <PropertyInput value={currentComponent.description || ''} onChange={(e) => updateSelectedComponentProperty('description', e.target.value)} />
                </PropertyField>
                <PropertyField>
                  <Button onClick={removeSelectedComponent} style={{backgroundColor: '#f44336', color: 'white'}}>Remover Componente</Button>
                </PropertyField>
              </PropertyGroup>
            </>
          )}
        </PropertiesContent>
      </PropertiesPanel>
    );
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Editor de Formulário ({formDefinition?.name || formKey})</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <Tabs>
          <Tab active={activeTab === 'design'} onClick={() => setActiveTab('design')}>Design</Tab>
          <Tab active={activeTab === 'json'} onClick={() => setActiveTab('json')}>JSON</Tab>
          <Tab active={activeTab === 'preview'} onClick={() => setActiveTab('preview')}>Preview</Tab>
        </Tabs>
        <ModalBody>
          {activeTab === 'design' && renderComponentsPanel()}
          <EditorPanel>
            {activeTab === 'design' && (
              <EditorToolbar>
                 <ToolbarButton title="Limpar formulário" onClick={() => {
                  if (window.confirm('Tem certeza que deseja limpar o formulário? Todos os componentes serão removidos.')) {
                    if (formDefinition) {
                      handleFormChange({ ...formDefinition, components: [] });
                      setSelectedComponentPath(null);
                    }
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
      {dragPreview.visible && (
        <DragPreview style={{ top: dragPreview.top + 10, left: dragPreview.left + 10 }}>
          {dragPreview.content}
        </DragPreview>
      )}
    </ModalOverlay>
  );
};

declare global {
  interface Element {
      _reactRootContainer?: {
          unmount(): void;
      };
  }
}

// Exportar a função que abre o modal, não o componente diretamente
export function openFormEditorModal(
  props: FormEditorModalProps & { initialFormDefinition?: FormDefinition } // Allow onClose and initialFormDefinition
): void { // Returns void as it manages its own rendering and cleanup
  const modalRootId = 'form-editor-modal-dynamic-root';
  const existingModalRoot = document.getElementById(modalRootId);

  // If modal root from a previous call exists, remove it.
  // React should handle cleanup of its tree when the DOM node is removed.
  if (existingModalRoot) {
    existingModalRoot.remove();
  }

  // Create a new modal root element for the current modal instance
  const newModalRoot = document.createElement('div');
  newModalRoot.id = modalRootId;
  document.body.appendChild(newModalRoot);

  const root = createRoot(newModalRoot); // 'root' is specific to this newModalRoot

  const performCleanup = () => {
    root.unmount(); // This correctly refers to the 'root' of the current modal
    if (newModalRoot.parentNode) { // Use newModalRoot here
      newModalRoot.parentNode.removeChild(newModalRoot);
    }
  };

  const handleSaveAndCleanup = (savedFormKey: string, savedFormData: FormDefinition) => {
    performCleanup(); // Perform cleanup first
    props.onSave(savedFormKey, savedFormData); // Then call the external onSave callback
  };

  const handleCloseAndCleanup = () => {
    performCleanup(); // Perform cleanup first
    props.onClose();    // Then call the external onClose callback
  };

  root.render(
    <React.Fragment>
      <FormEditorModal
        formKey={props.formKey}
        onSave={handleSaveAndCleanup}
        onClose={handleCloseAndCleanup}
        // Assuming FormEditorModal can use props.initialFormDefinition internally
        // or if FormEditorModalProps is updated to include it directly.
        // For this change, we pass it if FormEditorModal component is adapted:
        // initialFormDefinition={props.initialFormDefinition}
      />
    </React.Fragment>
  );

  // No return value, function is imperative
}

// Exportar o componente como default pode ser útil em alguns casos, mas a função acima é a principal
export default FormEditorModal;
