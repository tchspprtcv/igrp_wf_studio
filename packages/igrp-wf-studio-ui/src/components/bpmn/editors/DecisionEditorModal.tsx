import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom'; // Added this line
import styled from 'styled-components';
import DmnJS from 'dmn-js/lib/Modeler';
import EditorService from '../../../services/EditorService';

// Estilos para o modal
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
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
`;

const ModalBody = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex: 1;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px;
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

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#2196f3' : 'transparent'};
  color: ${props => props.active ? '#2196f3' : '#333'};
  font-weight: ${props => props.active ? '500' : 'normal'};
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const DmnContainer = styled.div`
  width: 100%;
  height: 500px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
`;

interface DecisionEditorModalProps {
  decisionTable: string;
  onSave: (decisionTable: string) => void;
  onClose: () => void;
}

/**
 * DecisionEditorModal Component
 * 
 * Modal para edição de tabelas de decisão usando DMN.js
 */
const DecisionEditorModal: React.FC<DecisionEditorModalProps> = ({ decisionTable, onSave, onClose }) => {
  const [dmnDefinition, setDmnDefinition] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'visual' | 'xml'>('visual');
  const dmnContainerRef = useRef<HTMLDivElement>(null);
  const dmnModelerRef = useRef<any>(null);
  const xmlEditorRef = useRef<HTMLTextAreaElement>(null);
  
  // Carregar definição da tabela de decisão
  useEffect(() => {
    const loadDecision = async () => {
      setIsLoading(true);
      try {
        const dmn = await EditorService.loadDecision(decisionTable);
        setDmnDefinition(dmn);
      } catch (error) {
        console.error('Erro ao carregar tabela de decisão:', error);
        setDmnDefinition(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDecision();
  }, [decisionTable]);
  
  // Inicializar DMN editor
  useEffect(() => {
    if (dmnContainerRef.current && dmnDefinition && !isLoading && activeTab === 'visual') {
      try {
        // Criar instância do DMN Modeler
        const dmnModeler = new DmnJS({
          container: dmnContainerRef.current,
          keyboard: { bindTo: document },
          drd: {
            additionalModules: []
          },
          decisionTable: {
            additionalModules: []
          }
        });
        
        // Importar definição DMN
        dmnModeler.importXML(dmnDefinition, (err: any) => {
          if (err) {
            console.error('Erro ao importar XML DMN:', err);
            return;
          }
          
          // Abrir primeira tabela de decisão
          const activeViewer = dmnModeler.getActiveViewer();
          if (activeViewer) {
            activeViewer.get('canvas').zoom('fit-viewport');
          }
        });
        
        // Armazenar referência ao modeler
        dmnModelerRef.current = dmnModeler;
        
        // Limpar ao desmontar
        return () => {
          dmnModeler.destroy();
        };
      } catch (error) {
        console.error('Erro ao inicializar DMN editor:', error);
      }
    }
  }, [dmnDefinition, isLoading, activeTab]);
  
  // Atualizar editor XML quando a definição mudar
  useEffect(() => {
    if (xmlEditorRef.current && dmnDefinition && activeTab === 'xml') {
      xmlEditorRef.current.value = dmnDefinition;
    }
  }, [dmnDefinition, activeTab]);
  
  // Salvar tabela de decisão
  const handleSave = async () => {
    try {
      let updatedDmnDefinition = dmnDefinition;
      
      // Se estiver na aba visual, exportar XML do modeler
      if (activeTab === 'visual' && dmnModelerRef.current) {
        try {
          const { xml } = await new Promise<{ xml: string }>((resolve, reject) => {
            dmnModelerRef.current.saveXML({ format: true }, (err: any, xml: string) => {
              if (err) {
                reject(err);
              } else {
                resolve({ xml });
              }
            });
          });
          
          updatedDmnDefinition = xml;
        } catch (error) {
          console.error('Erro ao exportar XML DMN:', error);
          alert('Erro ao exportar XML DMN. Verifique o console para mais detalhes.');
          return;
        }
      }
      
      // Se estiver na aba XML, obter o valor do textarea
      if (activeTab === 'xml' && xmlEditorRef.current) {
        updatedDmnDefinition = xmlEditorRef.current.value;
      }
      
      // Salvar tabela de decisão no backend
      if (updatedDmnDefinition) {
        await EditorService.saveDecision(decisionTable, updatedDmnDefinition);
        
        // Notificar componente pai
        onSave(decisionTable);
        
        // Fechar modal
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar tabela de decisão:', error);
      alert('Erro ao salvar tabela de decisão. Verifique o console para mais detalhes.');
    }
  };
  
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Editor de Tabela de Decisão - {decisionTable}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <ModalBody>
          {isLoading ? (
            <div>Carregando tabela de decisão...</div>
          ) : (
            <>
              <Tabs>
                <Tab 
                  active={activeTab === 'visual'} 
                  onClick={() => setActiveTab('visual')}
                >
                  Editor Visual
                </Tab>
                <Tab 
                  active={activeTab === 'xml'} 
                  onClick={() => setActiveTab('xml')}
                >
                  Editor XML
                </Tab>
              </Tabs>
              
              {activeTab === 'visual' ? (
                <DmnContainer ref={dmnContainerRef} />
              ) : (
                <div>
                  <textarea
                    ref={xmlEditorRef}
                    style={{ 
                      width: '100%', 
                      height: '400px', 
                      fontFamily: 'monospace',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    defaultValue={dmnDefinition || ''}
                  />
                </div>
              )}
            </>
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

// Factory para abrir o modal
const openDecisionEditorModal = (props: { decisionTable: string; onSave: (decisionTable: string) => void }) => {
  const { decisionTable, onSave } = props;
  
  // Criar elemento para o modal
  const modalRoot = document.createElement('div');
  modalRoot.id = 'decision-editor-modal-root';
  document.body.appendChild(modalRoot);
  
  // Função para fechar e limpar o modal
  const closeModal = () => {
    const unmountResult = ReactDOM.unmountComponentAtNode(modalRoot);
    if (unmountResult && modalRoot.parentNode) {
      modalRoot.parentNode.removeChild(modalRoot);
    }
  };
  
  // Renderizar o modal
  ReactDOM.render(
    <DecisionEditorModal
      decisionTable={decisionTable}
      onSave={onSave}
      onClose={closeModal}
    />,
    modalRoot
  );
};

export { DecisionEditorModal, openDecisionEditorModal };
export default DecisionEditorModal;
