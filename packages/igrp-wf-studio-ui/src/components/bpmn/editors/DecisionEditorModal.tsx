/**
 * DecisionEditorModal.tsx
 * Modal para edição de tabelas de decisão usando dmn-js
 * Redesenhado com base no exemplo oficial do demo.bpmn.io/dmn
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import DmnJS from 'dmn-js/dist/dmn-modeler.production.min.js';
import 'dmn-js/dist/assets/diagram-js.css';
import 'dmn-js/dist/assets/dmn-js-shared.css';
import 'dmn-js/dist/assets/dmn-js-drd.css';
import 'dmn-js/dist/assets/dmn-js-decision-table.css';
import 'dmn-js/dist/assets/dmn-js-literal-expression.css';
import 'dmn-js/dist/assets/dmn-font/css/dmn.css';
// Replace EditorService with server actions
import { loadDecisionTableAction, saveDecisionTableAction } from '@/app/actions';
import { createRoot } from 'react-dom/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

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
  position: relative;
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

// Componentes específicos do editor DMN
const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const EditorToolbar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f8f8;
  overflow-x: auto;
`;

const ToolbarButton = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  margin-right: 8px;
  background-color: ${props => props.active ? '#e6f7ff' : 'white'};
  border: 1px solid ${props => props.active ? '#91d5ff' : '#ddd'};
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  color: ${props => props.active ? '#1890ff' : '#333'};
  
  &:hover {
    background-color: ${props => props.active ? '#e6f7ff' : '#f0f0f0'};
  }
`;

const ToolbarSeparator = styled.div`
  width: 1px;
  height: 24px;
  background-color: #e0e0e0;
  margin: 0 8px;
`;

const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  margin-right: 8px;
`;

const DmnContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const PropertiesPanel = styled.div<{ visible: boolean }>`
  width: ${props => props.visible ? '300px' : '0'};
  border-left: ${props => props.visible ? '1px solid #e0e0e0' : 'none'};
  background-color: #f8f8f8;
  overflow-y: auto;
  transition: width 0.3s ease;
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

const PropertySelect = styled.select`
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

const XmlEditor = styled.textarea`
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

interface DecisionEditorModalProps {
  decisionTableKey: string;
  onSave: (decisionTableKey: string) => void;
  onClose: () => void;
}

// XML padrão para novas tabelas de decisão
const DEFAULT_DMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" xmlns:di="http://www.omg.org/spec/DMN/20180521/DI/" id="Definitions_${uuidv4().substring(0, 8)}" name="Nova Tabela de Decisão" namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="Decision_${uuidv4().substring(0, 8)}" name="Nova Decisão">
    <decisionTable id="DecisionTable_${uuidv4().substring(0, 8)}" hitPolicy="FIRST">
      <input id="Input_1" label="Input 1">
        <inputExpression id="InputExpression_1" typeRef="string">
          <text>input1</text>
        </inputExpression>
      </input>
      <output id="Output_1" label="Output 1" name="output1" typeRef="string" />
      <rule id="Rule_1">
        <inputEntry id="InputEntry_1">
          <text>"valor"</text>
        </inputEntry>
        <outputEntry id="OutputEntry_1">
          <text>"resultado"</text>
        </outputEntry>
      </rule>
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram id="DMNDiagram_1">
      <dmndi:DMNShape id="DMNShape_1" dmnElementRef="Decision_1">
        <dc:Bounds height="80" width="180" x="160" y="100" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>`;

/**
 * DecisionEditorModal Component
 * 
 * Modal para edição de tabelas de decisão usando dmn-js
 * Redesenhado com base no exemplo oficial do demo.bpmn.io/dmn
 */
const DecisionEditorModal: React.FC<DecisionEditorModalProps> = ({ decisionTableKey, onSave, onClose }) => {
  const [dmnXml, setDmnXml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'xml'>('design');
  const [showProperties, setShowProperties] = useState<boolean>(true);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'drd' | 'decisionTable' | 'literalExpression'>('decisionTable');
  const [viewerActive, setViewerActive] = useState<boolean>(false);
  
  const dmnContainerRef = useRef<HTMLDivElement>(null);
  const dmnModelerRef = useRef<any>(null);
  const xmlEditorRef = useRef<HTMLTextAreaElement>(null);
  
  // Carregar tabela de decisão
  useEffect(() => {
    const loadDecisionTable = async () => {
      setIsLoading(true);
      setLoadError(null);
      
      try {
        // Extrair appCode e elementId do decisionTableKey (formato esperado: "appCode:elementId")
        const [appCode, elementId] = decisionTableKey.split(':');
        
        if (!appCode || !elementId) {
          throw new Error('Formato de chave de tabela de decisão inválido');
        }
        
        // Tentar carregar a tabela de decisão usando server action
        const result = await loadDecisionTableAction({ appCode, elementId });
        
        if (!result.success || !result.data) {
          throw new Error(result.message || 'Falha ao carregar tabela de decisão');
        }
        
        // Verificar se o retorno é uma string XML válida
        if (typeof result.data !== 'string' || !result.data.includes('<?xml')) {
          throw new Error('Formato de tabela de decisão inválido');
        }
        
        setDmnXml(result.data);
      } catch (error: any) {
        console.error('Erro ao carregar tabela de decisão:', error);
        toast.error(error.message || 'Erro ao carregar tabela de decisão');
        
        // Criar uma nova tabela de decisão
        setDmnXml(DEFAULT_DMN_XML);
        setLoadError('Não foi possível carregar a tabela de decisão. Uma nova tabela foi criada.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDecisionTable();
  }, [decisionTableKey]);
  
  // Inicializar o DMN modeler
  useEffect(() => {
    if (!dmnXml || !dmnContainerRef.current) return;
    
    // Criar instância do DMN modeler
    const modeler = new DmnJS({
      container: dmnContainerRef.current,
      keyboard: {
        bindTo: window
      },
      drd: {
        additionalModules: []
      },
      decisionTable: {
        additionalModules: [],
        debounceInput: false
      },
      literalExpression: {
        additionalModules: []
      }
    });
    
    // Armazenar referência
    dmnModelerRef.current = modeler;
    
    // Importar XML
    modeler.importXML(dmnXml, (err: Error | null, warnings?: Array<any>) => {
      if (err) {
        console.error('Erro ao importar XML:', err);
        setLoadError(`Erro ao importar XML: ${err.message}`);
        return;
      }
      
      // Abrir a tabela de decisão por padrão
      const views = modeler.getViews();
      const decisionTableView = views.find((view: any) => view.type === 'decisionTable');
      
      if (decisionTableView) {
        modeler.open(decisionTableView, (err: Error | null) => {
          if (err) {
            console.error('Erro ao abrir tabela de decisão:', err);
          } else {
            setCurrentView('decisionTable');
            setViewerActive(true);
            
            // Configurar event listeners
            setupEventListeners(modeler);
          }
        });
      }
    });
    
    // Cleanup
    return () => {
      if (dmnModelerRef.current) {
        dmnModelerRef.current.destroy();
        dmnModelerRef.current = null;
      }
    };
  }, [dmnXml]);
  
  // Configurar event listeners para o DMN modeler
  const setupEventListeners = useCallback((modeler: any) => {
    // Event listener para seleção de elementos
    const activeViewer = modeler.getActiveViewer();
    
    if (activeViewer) {
      // Event listener para seleção de elementos
      activeViewer.on('element.click', (event: any) => {
        const { element } = event;
        setSelectedElement(element);
      });
      
      // Event listener para mudanças no modelo
      activeViewer.on('element.changed', (event: any) => {
        // Atualizar XML quando o modelo mudar
        modeler.saveXML({ format: true }, (err: Error, xml: string) => {
          if (!err) {
            setDmnXml(xml);
          }
        });
      });
    }
  }, []);
  
  // Atualizar editor XML quando o XML mudar
  useEffect(() => {
    if (xmlEditorRef.current && dmnXml && activeTab === 'xml') {
      xmlEditorRef.current.value = dmnXml;
    }
  }, [dmnXml, activeTab]);
  
  // Salvar tabela de decisão
  const handleSave = async () => {
    try {
      let updatedDmnXml = dmnXml;
      
      // Se estiver na aba XML, obter o valor do textarea
      if (activeTab === 'xml' && xmlEditorRef.current) {
        updatedDmnXml = xmlEditorRef.current.value;
        
        // Validar XML
        if (!updatedDmnXml.includes('<?xml')) {
          alert('O XML da tabela de decisão é inválido. Por favor, corrija os erros antes de salvar.');
          return;
        }
      } else if (dmnModelerRef.current) {
        // Obter XML atualizado do modeler
        try {
          const { xml } = await new Promise<{ xml: string }>((resolve, reject) => {
            dmnModelerRef.current.saveXML({ format: true }, (err: Error, xml: string) => {
              if (err) {
                reject(err);
              } else {
                resolve({ xml });
              }
            });
          });
          
          updatedDmnXml = xml;
        } catch (error) {
          console.error('Erro ao salvar XML:', error);
          alert('Erro ao salvar XML. Verifique o console para mais detalhes.');
          return;
        }
      }
      
      try {
        // Extrair appCode e elementId do decisionTableKey (formato esperado: "appCode:elementId")
        const [appCode, elementId] = decisionTableKey.split(':');
        
        if (!appCode || !elementId) {
          throw new Error('Formato de chave de tabela de decisão inválido');
        }
        
        // Salvar tabela de decisão usando server action
        const result = await saveDecisionTableAction({ 
          appCode, 
          elementId, 
          dmnXml: updatedDmnXml 
        });
        
        if (!result.success) {
          throw new Error(result.message || 'Falha ao salvar tabela de decisão');
        }
        
        // Mostrar mensagem de sucesso
        toast.success('Tabela de decisão salva com sucesso!');
        
        // Notificar componente pai
        onSave(decisionTableKey);
        
        // Fechar modal
        onClose();
      } catch (error: any) {
        console.error('Erro ao salvar tabela de decisão:', error);
        toast.error(error.message || 'Erro ao salvar tabela de decisão');
      }
    } catch (error) {
      console.error('Erro ao salvar tabela de decisão:', error);
      alert('Erro ao salvar tabela de decisão. Verifique o console para mais detalhes.');
    }
  };
  
  // Alternar entre visualizações
  const handleViewChange = useCallback((view: 'drd' | 'decisionTable' | 'literalExpression') => {
    if (!dmnModelerRef.current) return;
    
    const views = dmnModelerRef.current.getViews();
    const targetView = views.find((v: any) => v.type === view);
    
    if (targetView) {
      dmnModelerRef.current.open(targetView, (err: Error | null) => {
        if (err) {
          console.error(`Erro ao abrir visualização ${view}:`, err);
        } else {
          setCurrentView(view);
          
          // Configurar event listeners para a nova visualização
          setupEventListeners(dmnModelerRef.current);
        }
      });
    }
  }, [setupEventListeners]);
  
  // Adicionar input à tabela de decisão
  const handleAddInput = useCallback(() => {
    if (!dmnModelerRef.current || currentView !== 'decisionTable') return;
    
    const activeViewer = dmnModelerRef.current.getActiveViewer();
    if (!activeViewer) return;
    
    const modeling = activeViewer.get('modeling');
    const elementRegistry = activeViewer.get('elementRegistry');
    const table = elementRegistry.get('decisionTable');
    
    if (table && modeling) {
      modeling.addInput(table);
    }
  }, [currentView]);
  
  // Adicionar output à tabela de decisão
  const handleAddOutput = useCallback(() => {
    if (!dmnModelerRef.current || currentView !== 'decisionTable') return;
    
    const activeViewer = dmnModelerRef.current.getActiveViewer();
    if (!activeViewer) return;
    
    const modeling = activeViewer.get('modeling');
    const elementRegistry = activeViewer.get('elementRegistry');
    const table = elementRegistry.get('decisionTable');
    
    if (table && modeling) {
      modeling.addOutput(table);
    }
  }, [currentView]);
  
  // Adicionar regra à tabela de decisão
  const handleAddRule = useCallback(() => {
    if (!dmnModelerRef.current || currentView !== 'decisionTable') return;
    
    const activeViewer = dmnModelerRef.current.getActiveViewer();
    if (!activeViewer) return;
    
    const modeling = activeViewer.get('modeling');
    const elementRegistry = activeViewer.get('elementRegistry');
    const table = elementRegistry.get('decisionTable');
    
    if (table && modeling) {
      modeling.addRule(table);
    }
  }, [currentView]);
  
  // Atualizar propriedade do elemento selecionado
  const handlePropertyChange = useCallback((key: string, value: any) => {
    if (!dmnModelerRef.current || !selectedElement) return;
    
    const activeViewer = dmnModelerRef.current.getActiveViewer();
    if (!activeViewer) return;
    
    const modeling = activeViewer.get('modeling');
    
    if (modeling) {
      // Atualizar propriedade
      modeling.editAllowedValues(selectedElement, value);
      
      // Atualizar XML
      dmnModelerRef.current.saveXML({ format: true }, (err: Error, xml: string) => {
        if (!err) {
          setDmnXml(xml);
        }
      });
    }
  }, [selectedElement]);
  
  // Renderizar painel de propriedades
  const renderPropertiesPanel = () => {
    if (!selectedElement) {
      return (
        <div style={{ padding: '12px', color: '#666', textAlign: 'center' }}>
          Selecione um elemento para editar suas propriedades.
        </div>
      );
    }
    
    // Propriedades específicas por tipo de elemento
    switch (selectedElement.type) {
      case 'dmn:Decision':
        return (
          <>
            <PropertyGroup>
              <PropertyGroupTitle>Decisão</PropertyGroupTitle>
              <PropertyField>
                <PropertyLabel>ID</PropertyLabel>
                <PropertyInput
                  value={selectedElement.id || ''}
                  readOnly
                />
              </PropertyField>
              <PropertyField>
                <PropertyLabel>Nome</PropertyLabel>
                <PropertyInput
                  value={selectedElement.name || ''}
                  onChange={(e) => handlePropertyChange('name', e.target.value)}
                />
              </PropertyField>
            </PropertyGroup>
          </>
        );
        
      case 'dmn:DecisionTable':
        return (
          <>
            <PropertyGroup>
              <PropertyGroupTitle>Tabela de Decisão</PropertyGroupTitle>
              <PropertyField>
                <PropertyLabel>ID</PropertyLabel>
                <PropertyInput
                  value={selectedElement.id || ''}
                  readOnly
                />
              </PropertyField>
              <PropertyField>
                <PropertyLabel>Hit Policy</PropertyLabel>
                <PropertySelect
                  value={selectedElement.hitPolicy || 'FIRST'}
                  onChange={(e) => handlePropertyChange('hitPolicy', e.target.value)}
                >
                  <option value="UNIQUE">Unique</option>
                  <option value="FIRST">First</option>
                  <option value="PRIORITY">Priority</option>
                  <option value="ANY">Any</option>
                  <option value="COLLECT">Collect</option>
                  <option value="RULE ORDER">Rule Order</option>
                  <option value="OUTPUT ORDER">Output Order</option>
                </PropertySelect>
              </PropertyField>
            </PropertyGroup>
          </>
        );
        
      case 'dmn:InputClause':
        return (
          <>
            <PropertyGroup>
              <PropertyGroupTitle>Input</PropertyGroupTitle>
              <PropertyField>
                <PropertyLabel>ID</PropertyLabel>
                <PropertyInput
                  value={selectedElement.id || ''}
                  readOnly
                />
              </PropertyField>
              <PropertyField>
                <PropertyLabel>Label</PropertyLabel>
                <PropertyInput
                  value={selectedElement.label || ''}
                  onChange={(e) => handlePropertyChange('label', e.target.value)}
                />
              </PropertyField>
              <PropertyField>
                <PropertyLabel>Expression</PropertyLabel>
                <PropertyInput
                  value={selectedElement.inputExpression?.text || ''}
                  onChange={(e) => handlePropertyChange('inputExpression.text', e.target.value)}
                />
              </PropertyField>
              <PropertyField>
                <PropertyLabel>Type</PropertyLabel>
                <PropertySelect
                  value={selectedElement.inputExpression?.typeRef || 'string'}
                  onChange={(e) => handlePropertyChange('inputExpression.typeRef', e.target.value)}
                >
                  <option value="string">String</option>
                  <option value="boolean">Boolean</option>
                  <option value="integer">Integer</option>
                  <option value="long">Long</option>
                  <option value="double">Double</option>
                  <option value="date">Date</option>
                </PropertySelect>
              </PropertyField>
            </PropertyGroup>
          </>
        );
        
      case 'dmn:OutputClause':
        return (
          <>
            <PropertyGroup>
              <PropertyGroupTitle>Output</PropertyGroupTitle>
              <PropertyField>
                <PropertyLabel>ID</PropertyLabel>
                <PropertyInput
                  value={selectedElement.id || ''}
                  readOnly
                />
              </PropertyField>
              <PropertyField>
                <PropertyLabel>Label</PropertyLabel>
                <PropertyInput
                  value={selectedElement.label || ''}
                  onChange={(e) => handlePropertyChange('label', e.target.value)}
                />
              </PropertyField>
              <PropertyField>
                <PropertyLabel>Name</PropertyLabel>
                <PropertyInput
                  value={selectedElement.name || ''}
                  onChange={(e) => handlePropertyChange('name', e.target.value)}
                />
              </PropertyField>
              <PropertyField>
                <PropertyLabel>Type</PropertyLabel>
                <PropertySelect
                  value={selectedElement.typeRef || 'string'}
                  onChange={(e) => handlePropertyChange('typeRef', e.target.value)}
                >
                  <option value="string">String</option>
                  <option value="boolean">Boolean</option>
                  <option value="integer">Integer</option>
                  <option value="long">Long</option>
                  <option value="double">Double</option>
                  <option value="date">Date</option>
                </PropertySelect>
              </PropertyField>
            </PropertyGroup>
          </>
        );
        
      case 'dmn:Rule':
        return (
          <>
            <PropertyGroup>
              <PropertyGroupTitle>Regra</PropertyGroupTitle>
              <PropertyField>
                <PropertyLabel>ID</PropertyLabel>
                <PropertyInput
                  value={selectedElement.id || ''}
                  readOnly
                />
              </PropertyField>
              <PropertyField>
                <PropertyLabel>Descrição</PropertyLabel>
                <PropertyInput
                  value={selectedElement.description || ''}
                  onChange={(e) => handlePropertyChange('description', e.target.value)}
                />
              </PropertyField>
            </PropertyGroup>
          </>
        );
        
      default:
        return (
          <div style={{ padding: '12px', color: '#666', textAlign: 'center' }}>
            Propriedades não disponíveis para este tipo de elemento.
          </div>
        );
    }
  };
  
  // Renderizar o editor DMN
  const renderDmnEditor = () => {
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
          <p>Uma nova tabela de decisão foi criada. Você pode continuar a edição ou fechar e tentar novamente.</p>
        </ErrorMessage>
      );
    }
    
    switch (activeTab) {
      case 'design':
        return (
          <DmnContainer ref={dmnContainerRef} />
        );
        
      case 'xml':
        return (
          <XmlEditor
            ref={xmlEditorRef}
            defaultValue={dmnXml}
          />
        );
        
      default:
        return null;
    }
  };
  
  // Renderizar o modal
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            Editor de Tabela de Decisão
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
            active={activeTab === 'xml'}
            onClick={() => setActiveTab('xml')}
          >
            XML
          </Tab>
        </Tabs>
        
        {activeTab === 'design' && (
          <EditorToolbar>
            <ToolbarGroup>
              <ToolbarButton
                active={currentView === 'drd'}
                onClick={() => handleViewChange('drd')}
                title="Diagrama de Requisitos de Decisão"
              >
                DRD
              </ToolbarButton>
              <ToolbarButton
                active={currentView === 'decisionTable'}
                onClick={() => handleViewChange('decisionTable')}
                title="Tabela de Decisão"
              >
                Tabela
              </ToolbarButton>
              <ToolbarButton
                active={currentView === 'literalExpression'}
                onClick={() => handleViewChange('literalExpression')}
                title="Expressão Literal"
              >
                Expressão
              </ToolbarButton>
            </ToolbarGroup>
            
            <ToolbarSeparator />
            
            {currentView === 'decisionTable' && (
              <ToolbarGroup>
                <ToolbarButton
                  onClick={handleAddInput}
                  title="Adicionar Input"
                >
                  + Input
                </ToolbarButton>
                <ToolbarButton
                  onClick={handleAddOutput}
                  title="Adicionar Output"
                >
                  + Output
                </ToolbarButton>
                <ToolbarButton
                  onClick={handleAddRule}
                  title="Adicionar Regra"
                >
                  + Regra
                </ToolbarButton>
              </ToolbarGroup>
            )}
            
            <ToolbarSeparator />
            
            <ToolbarButton
              active={showProperties}
              onClick={() => setShowProperties(!showProperties)}
              title="Mostrar/Ocultar Propriedades"
            >
              Propriedades
            </ToolbarButton>
          </EditorToolbar>
        )}
        
        <ModalBody>
          <EditorContainer>
            {renderDmnEditor()}
          </EditorContainer>
          
          {activeTab === 'design' && (
            <PropertiesPanel visible={showProperties}>
              <PropertiesHeader>
                Propriedades
              </PropertiesHeader>
              <PropertiesContent>
                {renderPropertiesPanel()}
              </PropertiesContent>
            </PropertiesPanel>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button onClick={onClose}>Cancelar</Button>
          <Button primary onClick={handleSave}>Salvar</Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

// Função para abrir o modal de editor de tabela de decisão
export const openDecisionEditorModal = (props: Omit<DecisionEditorModalProps, 'onClose'>) => {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'decision-editor-modal-root';
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
    <DecisionEditorModal
      {...props}
      onClose={handleClose}
    />
  );
  
  // Armazenar a referência do root para unmount posterior
  modalRoot._reactRootContainer = root;
};

export default DecisionEditorModal;
