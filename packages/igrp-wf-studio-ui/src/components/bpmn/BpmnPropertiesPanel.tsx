import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import FormEditorLink from './editors/FormEditorLink';
import DecisionTableLink from './editors/DecisionTableLink';

// Estilos para o painel de propriedades
const PropertiesPanelContainer = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background-color: #f8f8f8;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
  transition: transform 0.3s ease;
  transform: translateX(${props => props.isVisible ? '0' : '100%'});
  z-index: 10;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
`;

const PanelHeader = styled.div`
  padding: 12px 16px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 500;
  font-size: 14px;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelContent = styled.div`
  padding: 16px;
  max-height: calc(100% - 50px);
  overflow-y: auto;
`;

const PropertyGroup = styled.div`
  margin-bottom: 20px;
`;

const GroupTitle = styled.h4`
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
`;

const PropertyRow = styled.div`
  margin-bottom: 12px;
`;

const PropertyLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #666;
`;

const PropertyInput = styled.input`
  width: 100%;
  padding: 8px;
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
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const PropertyTextarea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const NoSelectionMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
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
export interface BpmnPropertiesPanelProps {
  modeler: any;
  selectedElement: any;
  isVisible?: boolean;
  className?: string;
  appCode?: string; // Added appCode prop for form editor
}

/**
 * BpmnPropertiesPanel Component
 * 
 * Painel de propriedades para o editor BPMN
 * Permite editar propriedades dos elementos selecionados
 */
const BpmnPropertiesPanel: React.FC<BpmnPropertiesPanelProps> = ({ 
  modeler, 
  selectedElement,
  isVisible = true,
  className = '',
  appCode = 'default' // Default value to prevent errors
}) => {
  const [properties, setProperties] = useState<any>({});
  const [elementType, setElementType] = useState<string>('');
  const [elementBusinessObject, setElementBusinessObject] = useState<any>(null);
  
  // Extrair propriedades do elemento selecionado
  useEffect(() => {
    if (!selectedElement) {
      setProperties({});
      setElementType('');
      setElementBusinessObject(null);
      return;
    }
    
    const businessObject = selectedElement.businessObject;
    setElementBusinessObject(businessObject);
    
    // Determinar o tipo de elemento
    let type = selectedElement.type;
    if (type.startsWith('bpmn:')) {
      type = type.substring(5);
    }
    setElementType(type);
    
    // Extrair propriedades comuns
    const commonProps = {
      id: businessObject.id || '',
      name: businessObject.name || '',
    };
    
    // Extrair propriedades específicas por tipo
    let specificProps = {};
    
    switch (type) {
      case 'Task':
      case 'UserTask':
      case 'ServiceTask':
      case 'SendTask':
      case 'ReceiveTask':
      case 'ManualTask':
      case 'BusinessRuleTask':
      case 'ScriptTask':
        specificProps = {
          // Propriedades comuns de tarefas
          implementation: businessObject.implementation || '',
          
          // Propriedades específicas do Activiti
          assignee: businessObject.$attrs?.['activiti:assignee'] || '',
          candidateUsers: businessObject.$attrs?.['activiti:candidateUsers'] || '',
          candidateGroups: businessObject.$attrs?.['activiti:candidateGroups'] || '',
          dueDate: businessObject.$attrs?.['activiti:dueDate'] || '',
          priority: businessObject.$attrs?.['activiti:priority'] || '',
          
          // Propriedades específicas por tipo de tarefa
          ...(type === 'UserTask' && {
            formKey: businessObject.formKey || businessObject.$attrs?.['activiti:formKey'] || '',
          }),
          ...(type === 'ServiceTask' && {
            class: businessObject.$attrs?.['activiti:class'] || '',
            delegateExpression: businessObject.$attrs?.['activiti:delegateExpression'] || '',
            expression: businessObject.$attrs?.['activiti:expression'] || '',
            resultVariable: businessObject.$attrs?.['activiti:resultVariable'] || '',
          }),
          ...(type === 'BusinessRuleTask' && {
            rules: businessObject.$attrs?.['activiti:rules'] || '',
            resultVariable: businessObject.$attrs?.['activiti:resultVariable'] || '',
            exclude: businessObject.$attrs?.['activiti:exclude'] || '',
          }),
          ...(type === 'ScriptTask' && {
            scriptFormat: businessObject.scriptFormat || '',
            script: businessObject.script || '',
            resultVariable: businessObject.$attrs?.['activiti:resultVariable'] || '',
          }),
        };
        break;
        
      case 'SequenceFlow':
        specificProps = {
          sourceRef: businessObject.sourceRef?.id || '',
          targetRef: businessObject.targetRef?.id || '',
          conditionExpression: businessObject.conditionExpression?.body || '',
        };
        break;
        
      case 'Gateway':
      case 'ExclusiveGateway':
      case 'ParallelGateway':
      case 'InclusiveGateway':
      case 'EventBasedGateway':
        specificProps = {
          gatewayDirection: businessObject.gatewayDirection || 'Unspecified',
          default: businessObject.default?.id || '',
        };
        break;
        
      case 'StartEvent':
      case 'EndEvent':
      case 'IntermediateThrowEvent':
      case 'IntermediateCatchEvent':
      case 'BoundaryEvent':
        specificProps = {
          eventDefinitionType: getEventDefinitionType(businessObject),
          ...(businessObject.eventDefinitions?.[0]?.$type === 'bpmn:TimerEventDefinition' && {
            timeDuration: businessObject.eventDefinitions[0].timeDuration?.body || '',
            timeDate: businessObject.eventDefinitions[0].timeDate?.body || '',
            timeCycle: businessObject.eventDefinitions[0].timeCycle?.body || '',
          }),
          ...(businessObject.eventDefinitions?.[0]?.$type === 'bpmn:MessageEventDefinition' && {
            messageRef: businessObject.eventDefinitions[0].messageRef?.id || '',
          }),
          ...(businessObject.eventDefinitions?.[0]?.$type === 'bpmn:SignalEventDefinition' && {
            signalRef: businessObject.eventDefinitions[0].signalRef?.id || '',
          }),
          ...(businessObject.eventDefinitions?.[0]?.$type === 'bpmn:ErrorEventDefinition' && {
            errorRef: businessObject.eventDefinitions[0].errorRef?.id || '',
          }),
        };
        break;
        
      case 'SubProcess':
        specificProps = {
          triggeredByEvent: businessObject.triggeredByEvent || false,
        };
        break;
        
      case 'DataObject':
      case 'DataObjectReference':
        specificProps = {
          dataObjectRef: businessObject.dataObjectRef?.id || '',
          isCollection: businessObject.isCollection || false,
        };
        break;
        
      case 'DataStore':
      case 'DataStoreReference':
        specificProps = {
          dataStoreRef: businessObject.dataStoreRef?.id || '',
          capacity: businessObject.capacity || '',
          isUnlimited: businessObject.isUnlimited || false,
        };
        break;
        
      case 'TextAnnotation':
        specificProps = {
          text: businessObject.text || '',
        };
        break;
        
      case 'Group':
        specificProps = {
          categoryValueRef: businessObject.categoryValueRef?.id || '',
        };
        break;
    }
    
    // Combinar propriedades comuns e específicas
    setProperties({
      ...commonProps,
      ...specificProps,
    });
  }, [selectedElement]);
  
  // Determinar o tipo de definição de evento
  const getEventDefinitionType = (businessObject: any): string => {
    if (!businessObject.eventDefinitions || businessObject.eventDefinitions.length === 0) {
      return 'None';
    }
    
    const eventDefinition = businessObject.eventDefinitions[0];
    const type = eventDefinition.$type;
    
    switch (type) {
      case 'bpmn:MessageEventDefinition':
        return 'Message';
      case 'bpmn:TimerEventDefinition':
        return 'Timer';
      case 'bpmn:SignalEventDefinition':
        return 'Signal';
      case 'bpmn:ErrorEventDefinition':
        return 'Error';
      case 'bpmn:EscalationEventDefinition':
        return 'Escalation';
      case 'bpmn:CompensateEventDefinition':
        return 'Compensate';
      case 'bpmn:LinkEventDefinition':
        return 'Link';
      case 'bpmn:TerminateEventDefinition':
        return 'Terminate';
      case 'bpmn:ConditionalEventDefinition':
        return 'Conditional';
      default:
        return 'Unknown';
    }
  };
  
  // Atualizar propriedades do elemento
  const updateElementProperties = useCallback((updatedProperties: any) => {
    if (!modeler || !selectedElement) return;
    
    const modeling = modeler.get('modeling');
    
    // Preparar objeto de atualização
    const updateObj: any = {};
    
    // Processar propriedades comuns
    if ('name' in updatedProperties) {
      updateObj.name = updatedProperties.name;
    }
    
    // Processar propriedades específicas do namespace Activiti
    const activitiAttrs: any = {};
    
    // Propriedades comuns de tarefas
    if ('assignee' in updatedProperties) {
      activitiAttrs['activiti:assignee'] = updatedProperties.assignee;
    }
    if ('candidateUsers' in updatedProperties) {
      activitiAttrs['activiti:candidateUsers'] = updatedProperties.candidateUsers;
    }
    if ('candidateGroups' in updatedProperties) {
      activitiAttrs['activiti:candidateGroups'] = updatedProperties.candidateGroups;
    }
    if ('dueDate' in updatedProperties) {
      activitiAttrs['activiti:dueDate'] = updatedProperties.dueDate;
    }
    if ('priority' in updatedProperties) {
      activitiAttrs['activiti:priority'] = updatedProperties.priority;
    }
    
    // Propriedades específicas por tipo
    switch (elementType) {
      case 'UserTask':
        if ('formKey' in updatedProperties) {
          updateObj.formKey = updatedProperties.formKey;
          activitiAttrs['activiti:formKey'] = updatedProperties.formKey;
        }
        break;
        
      case 'ServiceTask':
        if ('class' in updatedProperties) {
          activitiAttrs['activiti:class'] = updatedProperties.class;
        }
        if ('delegateExpression' in updatedProperties) {
          activitiAttrs['activiti:delegateExpression'] = updatedProperties.delegateExpression;
        }
        if ('expression' in updatedProperties) {
          activitiAttrs['activiti:expression'] = updatedProperties.expression;
        }
        if ('resultVariable' in updatedProperties) {
          activitiAttrs['activiti:resultVariable'] = updatedProperties.resultVariable;
        }
        break;
        
      case 'BusinessRuleTask':
        if ('rules' in updatedProperties) {
          activitiAttrs['activiti:rules'] = updatedProperties.rules;
        }
        if ('resultVariable' in updatedProperties) {
          activitiAttrs['activiti:resultVariable'] = updatedProperties.resultVariable;
        }
        if ('exclude' in updatedProperties) {
          activitiAttrs['activiti:exclude'] = updatedProperties.exclude;
        }
        break;
        
      case 'ScriptTask':
        if ('scriptFormat' in updatedProperties) {
          updateObj.scriptFormat = updatedProperties.scriptFormat;
        }
        if ('script' in updatedProperties) {
          updateObj.script = updatedProperties.script;
        }
        if ('resultVariable' in updatedProperties) {
          activitiAttrs['activiti:resultVariable'] = updatedProperties.resultVariable;
        }
        break;
        
      case 'SequenceFlow':
        if ('conditionExpression' in updatedProperties) {
          // Atualizar expressão de condição
          const expressionValue = updatedProperties.conditionExpression;
          if (expressionValue) {
            const moddle = modeler.get('moddle');
            const conditionExpression = moddle.create('bpmn:FormalExpression', {
              body: expressionValue
            });
            updateObj.conditionExpression = conditionExpression;
          } else {
            updateObj.conditionExpression = null;
          }
        }
        break;
        
      case 'TextAnnotation':
        if ('text' in updatedProperties) {
          updateObj.text = updatedProperties.text;
        }
        break;
    }
    
    // Adicionar atributos Activiti se houver algum
    if (Object.keys(activitiAttrs).length > 0) {
      // Usar extensionElements para atributos Activiti
      updateObj.$attrs = {
        ...elementBusinessObject.$attrs,
        ...activitiAttrs
      };
    }
    
    // Aplicar atualizações
    if (Object.keys(updateObj).length > 0) {
      modeling.updateProperties(selectedElement, updateObj);
      
      // Forçar atualização do canvas para refletir as mudanças
      const canvas = modeler.get('canvas');
      const currentZoom = canvas.zoom();
      canvas.zoom(currentZoom, 'auto');
    }
  }, [modeler, selectedElement, elementType, elementBusinessObject]);
  
  // Manipular mudanças nas propriedades
  const handlePropertyChange = useCallback((key: string, value: any) => {
    const updatedProperties = {
      ...properties,
      [key]: value
    };
    
    setProperties(updatedProperties);
    updateElementProperties({ [key]: value });
  }, [properties, updateElementProperties]);
  
  // Abrir editor de formulário
  const handleOpenFormEditor = useCallback(() => {
    if (!properties.formKey) {
      // Se não houver formKey, criar um novo
      const newFormKey = `form_${Date.now()}.json`;
      handlePropertyChange('formKey', newFormKey);
    }
    
    console.log('Opening form editor with key:', properties.formKey);
    
    // Importar dinamicamente para evitar problemas de ciclo de dependência
    import('./editors/FormEditorModal').then(module => {
      const { openFormEditorModal } = module;
      
      openFormEditorModal({
        appCode, // Add the appCode prop
        formKey: properties.formKey,
        onSave: (formKey: string) => {
          // Atualizar formKey se mudou
          if (formKey !== properties.formKey) {
            handlePropertyChange('formKey', formKey);
          }
        }
      });
    }).catch(error => {
      console.error('Erro ao carregar editor de formulário:', error);
    });
  }, [properties.formKey, handlePropertyChange]);
  
  // Abrir editor de tabela de decisão
  const handleOpenDecisionEditor = useCallback(() => {
    if (!properties.rules) {
      // Se não houver rules, criar um novo
      const newRules = `decision_${Date.now()}.dmn`;
      handlePropertyChange('rules', newRules);
    }
    
    console.log('Opening decision editor with key:', properties.rules);
    
    // Importar dinamicamente para evitar problemas de ciclo de dependência
    import('./editors/DecisionEditorModal').then(module => {
      const { openDecisionEditorModal } = module;
      
      openDecisionEditorModal({
        decisionTableKey: properties.rules,
        onSave: (decisionTableKey: string) => {
          // Atualizar rules se mudou
          if (decisionTableKey !== properties.rules) {
            handlePropertyChange('rules', decisionTableKey);
          }
        }
      });
    }).catch(error => {
      console.error('Erro ao carregar editor de tabela de decisão:', error);
    });
  }, [properties.rules, handlePropertyChange]);
  
  // Renderizar grupos de propriedades
  const renderPropertyGroups = () => {
    if (!selectedElement) {
      return (
        <NoSelectionMessage>
          Selecione um elemento no diagrama para editar suas propriedades.
        </NoSelectionMessage>
      );
    }
    
    return (
      <>
        {/* Grupo de propriedades gerais */}
        <PropertyGroup>
          <GroupTitle>Propriedades Gerais</GroupTitle>
          <PropertyRow>
            <PropertyLabel>ID</PropertyLabel>
            <PropertyInput
              value={properties.id || ''}
              readOnly
            />
          </PropertyRow>
          <PropertyRow>
            <PropertyLabel>Nome</PropertyLabel>
            <PropertyInput
              value={properties.name || ''}
              onChange={(e) => handlePropertyChange('name', e.target.value)}
            />
          </PropertyRow>
        </PropertyGroup>
        
        {/* Propriedades específicas por tipo */}
        {renderTypeSpecificProperties()}
      </>
    );
  };
  
  // Renderizar propriedades específicas por tipo
  const renderTypeSpecificProperties = () => {
    switch (elementType) {
      case 'UserTask':
        return (
          <PropertyGroup>
            <GroupTitle>Propriedades de Tarefa de Usuário</GroupTitle>
            <PropertyRow>
              <PropertyLabel>Responsável</PropertyLabel>
              <PropertyInput
                value={properties.assignee || ''}
                onChange={(e) => handlePropertyChange('assignee', e.target.value)}
                placeholder="Expressão ou ID do usuário"
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Usuários Candidatos</PropertyLabel>
              <PropertyInput
                value={properties.candidateUsers || ''}
                onChange={(e) => handlePropertyChange('candidateUsers', e.target.value)}
                placeholder="Lista separada por vírgulas"
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Grupos Candidatos</PropertyLabel>
              <PropertyInput
                value={properties.candidateGroups || ''}
                onChange={(e) => handlePropertyChange('candidateGroups', e.target.value)}
                placeholder="Lista separada por vírgulas"
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Prioridade</PropertyLabel>
              <PropertyInput
                value={properties.priority || ''}
                onChange={(e) => handlePropertyChange('priority', e.target.value)}
                type="number"
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Data de Vencimento</PropertyLabel>
              <PropertyInput
                value={properties.dueDate || ''}
                onChange={(e) => handlePropertyChange('dueDate', e.target.value)}
                placeholder="Expressão de data"
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Chave do Formulário</PropertyLabel>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FormEditorLink
                  formKey={properties.formKey}
                  onChange={(value) => handlePropertyChange('formKey', value)}
                  onOpenEditor={handleOpenFormEditor}
                />
              </div>
            </PropertyRow>
          </PropertyGroup>
        );
        
      case 'ServiceTask':
        return (
          <PropertyGroup>
            <GroupTitle>Propriedades de Tarefa de Serviço</GroupTitle>
            <PropertyRow>
              <PropertyLabel>Classe</PropertyLabel>
              <PropertyInput
                value={properties.class || ''}
                onChange={(e) => handlePropertyChange('class', e.target.value)}
                placeholder="Nome completo da classe"
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Expressão de Delegação</PropertyLabel>
              <PropertyInput
                value={properties.delegateExpression || ''}
                onChange={(e) => handlePropertyChange('delegateExpression', e.target.value)}
                placeholder="Expressão de delegação"
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Expressão</PropertyLabel>
              <PropertyInput
                value={properties.expression || ''}
                onChange={(e) => handlePropertyChange('expression', e.target.value)}
                placeholder="Expressão"
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Variável de Resultado</PropertyLabel>
              <PropertyInput
                value={properties.resultVariable || ''}
                onChange={(e) => handlePropertyChange('resultVariable', e.target.value)}
                placeholder="Nome da variável"
              />
            </PropertyRow>
          </PropertyGroup>
        );
        
      case 'BusinessRuleTask':
        return (
          <PropertyGroup>
            <GroupTitle>Propriedades de Tarefa de Regra de Negócio</GroupTitle>
            <PropertyRow>
              <PropertyLabel>Regras</PropertyLabel>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <DecisionTableLink
                  decisionTable={properties.rules}
                  onChange={(value) => handlePropertyChange('rules', value)}
                  onOpenEditor={handleOpenDecisionEditor}
                />
              </div>
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Variável de Resultado</PropertyLabel>
              <PropertyInput
                value={properties.resultVariable || ''}
                onChange={(e) => handlePropertyChange('resultVariable', e.target.value)}
                placeholder="Nome da variável"
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Excluir</PropertyLabel>
              <PropertyInput
                value={properties.exclude || ''}
                onChange={(e) => handlePropertyChange('exclude', e.target.value)}
                placeholder="Lista de regras a excluir"
              />
            </PropertyRow>
          </PropertyGroup>
        );
        
      case 'ScriptTask':
        return (
          <PropertyGroup>
            <GroupTitle>Propriedades de Tarefa de Script</GroupTitle>
            <PropertyRow>
              <PropertyLabel>Formato do Script</PropertyLabel>
              <PropertyInput
                value={properties.scriptFormat || ''}
                onChange={(e) => handlePropertyChange('scriptFormat', e.target.value)}
                placeholder="javascript, groovy, etc."
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Script</PropertyLabel>
              <PropertyTextarea
                value={properties.script || ''}
                onChange={(e) => handlePropertyChange('script', e.target.value)}
                placeholder="Código do script"
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Variável de Resultado</PropertyLabel>
              <PropertyInput
                value={properties.resultVariable || ''}
                onChange={(e) => handlePropertyChange('resultVariable', e.target.value)}
                placeholder="Nome da variável"
              />
            </PropertyRow>
          </PropertyGroup>
        );
        
      case 'SequenceFlow':
        return (
          <PropertyGroup>
            <GroupTitle>Propriedades de Fluxo de Sequência</GroupTitle>
            <PropertyRow>
              <PropertyLabel>Origem</PropertyLabel>
              <PropertyInput
                value={properties.sourceRef || ''}
                readOnly
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Destino</PropertyLabel>
              <PropertyInput
                value={properties.targetRef || ''}
                readOnly
              />
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Expressão de Condição</PropertyLabel>
              <PropertyTextarea
                value={properties.conditionExpression || ''}
                onChange={(e) => handlePropertyChange('conditionExpression', e.target.value)}
                placeholder="Expressão de condição"
              />
            </PropertyRow>
          </PropertyGroup>
        );
        
      case 'StartEvent':
      case 'EndEvent':
      case 'IntermediateThrowEvent':
      case 'IntermediateCatchEvent':
      case 'BoundaryEvent':
        return (
          <PropertyGroup>
            <GroupTitle>Propriedades de Evento</GroupTitle>
            <PropertyRow>
              <PropertyLabel>Tipo de Definição</PropertyLabel>
              <PropertyInput
                value={properties.eventDefinitionType || 'None'}
                readOnly
              />
            </PropertyRow>
            {properties.eventDefinitionType === 'Timer' && (
              <>
                <PropertyRow>
                  <PropertyLabel>Data/Hora</PropertyLabel>
                  <PropertyInput
                    value={properties.timeDate || ''}
                    onChange={(e) => handlePropertyChange('timeDate', e.target.value)}
                    placeholder="Expressão de data/hora"
                  />
                </PropertyRow>
                <PropertyRow>
                  <PropertyLabel>Duração</PropertyLabel>
                  <PropertyInput
                    value={properties.timeDuration || ''}
                    onChange={(e) => handlePropertyChange('timeDuration', e.target.value)}
                    placeholder="Expressão de duração"
                  />
                </PropertyRow>
                <PropertyRow>
                  <PropertyLabel>Ciclo</PropertyLabel>
                  <PropertyInput
                    value={properties.timeCycle || ''}
                    onChange={(e) => handlePropertyChange('timeCycle', e.target.value)}
                    placeholder="Expressão de ciclo"
                  />
                </PropertyRow>
              </>
            )}
            {properties.eventDefinitionType === 'Message' && (
              <PropertyRow>
                <PropertyLabel>Referência de Mensagem</PropertyLabel>
                <PropertyInput
                  value={properties.messageRef || ''}
                  readOnly
                />
              </PropertyRow>
            )}
            {properties.eventDefinitionType === 'Signal' && (
              <PropertyRow>
                <PropertyLabel>Referência de Sinal</PropertyLabel>
                <PropertyInput
                  value={properties.signalRef || ''}
                  readOnly
                />
              </PropertyRow>
            )}
            {properties.eventDefinitionType === 'Error' && (
              <PropertyRow>
                <PropertyLabel>Referência de Erro</PropertyLabel>
                <PropertyInput
                  value={properties.errorRef || ''}
                  readOnly
                />
              </PropertyRow>
            )}
          </PropertyGroup>
        );
        
      case 'ExclusiveGateway':
      case 'ParallelGateway':
      case 'InclusiveGateway':
      case 'EventBasedGateway':
        return (
          <PropertyGroup>
            <GroupTitle>Propriedades de Gateway</GroupTitle>
            <PropertyRow>
              <PropertyLabel>Direção</PropertyLabel>
              <PropertySelect
                value={properties.gatewayDirection || 'Unspecified'}
                onChange={(e) => handlePropertyChange('gatewayDirection', e.target.value)}
              >
                <option value="Unspecified">Não especificada</option>
                <option value="Converging">Convergente</option>
                <option value="Diverging">Divergente</option>
                <option value="Mixed">Mista</option>
              </PropertySelect>
            </PropertyRow>
            <PropertyRow>
              <PropertyLabel>Fluxo Padrão</PropertyLabel>
              <PropertyInput
                value={properties.default || ''}
                readOnly
              />
            </PropertyRow>
          </PropertyGroup>
        );
        
      case 'SubProcess':
        return (
          <PropertyGroup>
            <GroupTitle>Propriedades de Subprocesso</GroupTitle>
            <PropertyRow>
              <PropertyLabel>Acionado por Evento</PropertyLabel>
              <PropertyInput
                type="checkbox"
                checked={properties.triggeredByEvent || false}
                onChange={(e) => handlePropertyChange('triggeredByEvent', e.target.checked)}
              />
            </PropertyRow>
          </PropertyGroup>
        );
        
      case 'TextAnnotation':
        return (
          <PropertyGroup>
            <GroupTitle>Propriedades de Anotação de Texto</GroupTitle>
            <PropertyRow>
              <PropertyLabel>Texto</PropertyLabel>
              <PropertyTextarea
                value={properties.text || ''}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                placeholder="Texto da anotação"
              />
            </PropertyRow>
          </PropertyGroup>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <PropertiesPanelContainer isVisible={isVisible} className={className}>
      <PanelHeader>
        Propriedades {elementType ? `(${elementType})` : ''}
      </PanelHeader>
      <PanelContent>
        {renderPropertyGroups()}
      </PanelContent>
    </PropertiesPanelContainer>
  );
};

export default BpmnPropertiesPanel;
