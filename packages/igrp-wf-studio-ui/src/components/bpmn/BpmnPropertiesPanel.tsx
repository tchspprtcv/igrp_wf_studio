import React, { useEffect, useState, useRef, useCallback } from 'react';
import { debounce } from 'lodash';

/**
 * Interface for BPMN element properties
 * This represents the common properties that can be edited for BPMN elements
 */
interface BpmnElementProperties {
  // Propriedades básicas
  id: string;
  name?: string;
  documentation?: string;
  
  // Propriedades de processo
  versionTag?: string;
  isExecutable?: boolean;
  jobPriority?: string;
  historyTimeToLive?: string;
  taskPriority?: string;
  
  // Propriedades gerais do Activiti
  activiti_async?: boolean;
  activiti_exclusive?: boolean;
  activiti_jobPriority?: string;
  
  // Propriedades de eventos
  isInterrupting?: boolean;
  timeDate?: string;
  timeDuration?: string;
  timeCycle?: string;
  messageRef?: string;
  errorRef?: string;
  attachedToRef?: string;
  cancelActivity?: boolean;
  
  // Propriedades de tarefas
  isAsync?: boolean;
  isForCompensation?: boolean;
  
  // Propriedades de tarefas de usuário
  activiti_assignee?: string;
  activiti_candidateUsers?: string;
  activiti_candidateGroups?: string;
  activiti_dueDate?: string;
  activiti_priority?: string;
  activiti_formKey?: string;
  
  // Propriedades de tarefas de serviço
  activiti_class?: string;
  activiti_expression?: string;
  activiti_delegateExpression?: string;
  activiti_type?: string;
  activiti_resultVariable?: string;
  
  // Propriedades de tarefas de script
  scriptFormat?: string;
  script?: string;
  activiti_autoStoreVariables?: boolean;
  
  // Propriedades de gateways
  gatewayDirection?: string;
  default?: string;
  instantiate?: boolean;
  eventGatewayType?: string;
  
  // Propriedades de fluxos de sequência
  conditionExpression?: string;
  isImmediate?: boolean;
  skipExpression?: string;
  sourceRef?: string;
  targetRef?: string;
  
  // Propriedades de subprocessos
  triggeredByEvent?: boolean;
  
  // Propriedades de multi-instâncias
  activiti_asyncBefore?: boolean;
  activiti_asyncAfter?: boolean;
  activiti_failedJobRetryTimeCycle?: string;
  
  // Propriedades de data objects
  isCollection?: boolean;
  itemSubjectRef?: string;
  dataState?: string;
  
  // Propriedades de data stores
  capacity?: string;
  isUnlimited?: boolean;
  
  // Propriedades de anotações de texto
  text?: string;
  textFormat?: string;
  includeInHistory?: boolean;
  
  // Propriedades de grupos
  categoryValueRef?: string;
  
  // Propriedades de associações
  associationDirection?: string;
  
  // Propriedades de atividades de chamada
  activiti_calledElementBinding?: string;
  activiti_calledElementVersion?: string;
  activiti_calledElementVersionTag?: string;
  activiti_calledElementTenantId?: string;
  
  // Propriedades de processos específicas do Activiti
  activiti_candidateStarterGroups?: string;
  activiti_candidateStarterUsers?: string;
  activiti_versionTag?: string;
  activiti_historyTimeToLive?: string;
  activiti_isStartableInTasklist?: boolean;
  
  // Propriedades de eventos de início
  activiti_initiator?: string;
  
  // Propriedades de tarefas de regras de negócio
  activiti_ruleVariablesInput?: string;
  activiti_rules?: string;
  activiti_exclude?: string;
  
  // Suporte para propriedades adicionais
  [key: string]: any;
}

/**
 * Interface for property field configuration
 * Used to define how each property should be rendered in the panel
 */
interface PropertyField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
  options?: Array<{ value: string; label: string }>; // For select fields
  placeholder?: string;
  description?: string;
  readOnly?: boolean;
  onChange?: (value: any) => void;
  onBlur?: (value: any) => void;
  onFocus?: (value: any) => void;
  onKeyDown?: (value: any) => void;
  onKeyUp?: (value: any) => void;
  onKeyPress?: (value: any) => void;
  onMouseDown?: (value: any) => void;
  onMouseUp?: (value: any) => void;
  onMouseOver?: (value: any) => void;
  onMouseOut?: (value: any) => void;
}

/**
 * Props for the BpmnPropertiesPanel component
 */
interface BpmnPropertiesPanelProps {
  // The selected BPMN element
  selectedElement: any | null;
  // Reference to the BPMN modeler instance
  modeler: any | null;
  // Whether the panel is visible
  isVisible?: boolean;
  // Whether the panel is in read-only mode
  readOnly?: boolean;
  // Custom styling for the panel
  style?: React.CSSProperties;
  // Custom class name for the panel
  className?: string;
  // Callback when properties are updated
  onPropertiesUpdated?: (element: any, properties: BpmnElementProperties) => void;
  // Custom property fields to display for specific element types
  customPropertyFields?: Record<string, PropertyField[]>;
  // Whether the panel can be toggled
  toggleable?: boolean;
}

/**
 * BpmnPropertiesPanel Component
 * 
 * A React component that provides a properties panel for editing BPMN element properties.
 * This component integrates with the BpmnEditor component and allows users to view and
 * modify properties of selected BPMN elements.
 * 
 * @param props - Component properties (see BpmnPropertiesPanelProps interface)
 */
const BpmnPropertiesPanel: React.FC<BpmnPropertiesPanelProps> = ({
  selectedElement,
  modeler,
  isVisible = true,
  readOnly = false,
  style = {},
  className = '',
  onPropertiesUpdated,
  customPropertyFields = {},
  toggleable = true,
}) => {
  // State to store the properties of the selected element
  const [properties, setProperties] = useState<BpmnElementProperties | null>(null);
  // State to track if the panel is expanded or collapsed
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  // State to store the element type
  const [elementType, setElementType] = useState<string>('');
  // Reference to track if the component is mounted
  const isMounted = useRef(true);

/**
 * Extract properties from the selected BPMN element
 * Refatorado para suportar todos os atributos BPMN do Activiti
 */
const extractElementProperties = useCallback((element: any): BpmnElementProperties | null => {
  if (!element) {
    return null;
  }

  // Get the business object from the element
  const businessObject = element.businessObject || {};
  
  // Extract basic properties
  const properties: BpmnElementProperties = {
    id: businessObject.id || '',
    name: businessObject.name || '',
  };

  // Extract documentation if available
  if (businessObject.documentation && businessObject.documentation.length > 0) {
    properties.documentation = businessObject.documentation[0].text || '';
  } else {
    properties.documentation = '';
  }

  // Extract Activiti namespace properties
  const activitiNs = businessObject.$attrs || {};
  Object.keys(activitiNs).forEach(key => {
    if (key.startsWith('activiti:')) {
      const propName = key.replace('activiti:', 'activiti_');
      properties[propName] = activitiNs[key];
    }
  });

  // Extract element-specific properties based on element type
  switch (element.type) {
    case 'bpmn:Process':
      properties.versionTag = businessObject.versionTag || '';
      properties.isExecutable = businessObject.isExecutable || false;
      properties.jobPriority = businessObject.jobPriority || '';
      properties.historyTimeToLive = businessObject.historyTimeToLive || '';
      properties.activiti_candidateStarterGroups = activitiNs['activiti:candidateStarterGroups'] || '';
      properties.activiti_candidateStarterUsers = activitiNs['activiti:candidateStarterUsers'] || '';
      properties.activiti_versionTag = activitiNs['activiti:versionTag'] || '';
      properties.activiti_historyTimeToLive = activitiNs['activiti:historyTimeToLive'] || '';
      properties.activiti_isStartableInTasklist = activitiNs['activiti:isStartableInTasklist'] === 'true';
      break;
      
    case 'bpmn:StartEvent':
    case 'bpmn:EndEvent':
    case 'bpmn:IntermediateCatchEvent':
    case 'bpmn:IntermediateThrowEvent':
    case 'bpmn:BoundaryEvent':
      properties.isInterrupting = businessObject.isInterrupting !== false;
      
      // Extract event definitions
      if (businessObject.eventDefinitions && businessObject.eventDefinitions.length > 0) {
        const eventDef = businessObject.eventDefinitions[0];
        
        if (eventDef.$type === 'bpmn:TimerEventDefinition') {
          properties.timeDate = eventDef.timeDate?.body || '';
          properties.timeDuration = eventDef.timeDuration?.body || '';
          properties.timeCycle = eventDef.timeCycle?.body || '';
        } else if (eventDef.$type === 'bpmn:MessageEventDefinition') {
          properties.messageRef = eventDef.messageRef?.id || '';
        } else if (eventDef.$type === 'bpmn:ErrorEventDefinition') {
          properties.errorRef = eventDef.errorRef?.id || '';
        }
      }
      
      // For boundary events
      if (element.type === 'bpmn:BoundaryEvent') {
        properties.attachedToRef = businessObject.attachedToRef?.id || '';
        properties.cancelActivity = businessObject.cancelActivity !== false;
      }
      
      // For start events
      if (element.type === 'bpmn:StartEvent') {
        properties.activiti_formKey = activitiNs['activiti:formKey'] || '';
        properties.activiti_initiator = activitiNs['activiti:initiator'] || '';
      }
      break;
      
    case 'bpmn:Task':
    case 'bpmn:UserTask':
    case 'bpmn:ServiceTask':
    case 'bpmn:ScriptTask':
    case 'bpmn:ReceiveTask':
    case 'bpmn:ManualTask':
    case 'bpmn:SendTask':
    case 'bpmn:BusinessRuleTask':
      properties.isAsync = businessObject.isAsync || false;
      properties.isForCompensation = businessObject.isForCompensation || false;
      properties.activiti_async = activitiNs['activiti:async'] === 'true';
      properties.activiti_exclusive = activitiNs['activiti:exclusive'] !== 'false';
      properties.activiti_jobPriority = activitiNs['activiti:jobPriority'] || '';
      
      // User Task specific properties
      if (element.type === 'bpmn:UserTask') {
        properties.activiti_assignee = activitiNs['activiti:assignee'] || '';
        properties.activiti_candidateUsers = activitiNs['activiti:candidateUsers'] || '';
        properties.activiti_candidateGroups = activitiNs['activiti:candidateGroups'] || '';
        properties.activiti_dueDate = activitiNs['activiti:dueDate'] || '';
        properties.activiti_priority = activitiNs['activiti:priority'] || '';
        properties.activiti_formKey = activitiNs['activiti:formKey'] || '';
      }
      
      // Service Task specific properties
      if (element.type === 'bpmn:ServiceTask') {
        properties.activiti_class = activitiNs['activiti:class'] || '';
        properties.activiti_expression = activitiNs['activiti:expression'] || '';
        properties.activiti_delegateExpression = activitiNs['activiti:delegateExpression'] || '';
        properties.activiti_type = activitiNs['activiti:type'] || '';
        properties.activiti_resultVariable = activitiNs['activiti:resultVariable'] || '';
      }
      
      // Script Task specific properties
      if (element.type === 'bpmn:ScriptTask') {
        properties.scriptFormat = businessObject.scriptFormat || '';
        properties.script = businessObject.script || '';
        properties.activiti_autoStoreVariables = activitiNs['activiti:autoStoreVariables'] === 'true';
        properties.activiti_resultVariable = activitiNs['activiti:resultVariable'] || '';
      }
      
      // Business Rule Task specific properties
      if (element.type === 'bpmn:BusinessRuleTask') {
        properties.activiti_ruleVariablesInput = activitiNs['activiti:ruleVariablesInput'] || '';
        properties.activiti_resultVariable = activitiNs['activiti:resultVariable'] || '';
        properties.activiti_rules = activitiNs['activiti:rules'] || '';
        properties.activiti_exclude = activitiNs['activiti:exclude'] || '';
      }
      
      // Send Task specific properties
      if (element.type === 'bpmn:SendTask') {
        properties.messageRef = businessObject.messageRef?.id || '';
      }
      
      // Receive Task specific properties
      if (element.type === 'bpmn:ReceiveTask') {
        properties.messageRef = businessObject.messageRef?.id || '';
      }
      break;
      
    case 'bpmn:ExclusiveGateway':
    case 'bpmn:ParallelGateway':
    case 'bpmn:InclusiveGateway':
    case 'bpmn:EventBasedGateway':
      properties.gatewayDirection = businessObject.gatewayDirection || 'Unspecified';
      properties.default = businessObject.default?.id || '';
      
      if (element.type === 'bpmn:EventBasedGateway') {
        properties.instantiate = businessObject.instantiate || false;
        properties.eventGatewayType = businessObject.eventGatewayType || 'Exclusive';
      }
      break;
      
    case 'bpmn:SequenceFlow':
      properties.sourceRef = businessObject.sourceRef?.id || '';
      properties.targetRef = businessObject.targetRef?.id || '';
      properties.conditionExpression = businessObject.conditionExpression?.body || '';
      properties.isImmediate = businessObject.isImmediate || false;
      properties.skipExpression = activitiNs['activiti:skipExpression'] || '';
      break;
      
    case 'bpmn:SubProcess':
    case 'bpmn:CallActivity':
      properties.triggeredByEvent = businessObject.triggeredByEvent || false;
      properties.activiti_async = activitiNs['activiti:async'] === 'true';
      properties.activiti_exclusive = activitiNs['activiti:exclusive'] !== 'false';
      
      // Multi-instance properties
      if (businessObject.loopCharacteristics && 
          businessObject.loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics') {
        const loopCharacteristics = businessObject.loopCharacteristics;
        properties.activiti_asyncBefore = loopCharacteristics.asyncBefore || false;
        properties.activiti_asyncAfter = loopCharacteristics.asyncAfter || false;
        properties.activiti_failedJobRetryTimeCycle = loopCharacteristics.failedJobRetryTimeCycle || '';
      }
      
      // Call Activity specific properties
      if (element.type === 'bpmn:CallActivity') {
        properties.activiti_calledElementBinding = activitiNs['activiti:calledElementBinding'] || '';
        properties.activiti_calledElementVersion = activitiNs['activiti:calledElementVersion'] || '';
        properties.activiti_calledElementVersionTag = activitiNs['activiti:calledElementVersionTag'] || '';
        properties.activiti_calledElementTenantId = activitiNs['activiti:calledElementTenantId'] || '';
      }
      break;
      
    case 'bpmn:DataObject':
      properties.isCollection = businessObject.isCollection || false;
      properties.itemSubjectRef = businessObject.itemSubjectRef?.id || '';
      
      // Extract data state if available
      if (businessObject.dataState) {
        properties.dataState = businessObject.dataState.name || '';
      }
      break;
      
    case 'bpmn:DataStore':
      properties.capacity = businessObject.capacity || '';
      properties.isUnlimited = businessObject.isUnlimited || false;
      properties.itemSubjectRef = businessObject.itemSubjectRef?.id || '';
      break;
      
    case 'bpmn:TextAnnotation':
      properties.text = businessObject.text || '';
      properties.textFormat = businessObject.textFormat || 'text/plain';
      properties.includeInHistory = activitiNs['activiti:includeInHistory'] === 'true';
      break;
      
    case 'bpmn:Group':
      properties.categoryValueRef = businessObject.categoryValueRef?.id || '';
      break;
      
    case 'bpmn:Association':
      properties.sourceRef = businessObject.sourceRef?.id || '';
      properties.targetRef = businessObject.targetRef?.id || '';
      properties.associationDirection = businessObject.associationDirection || 'None';
      break;
  }

  // Extract extension elements if available
  if (businessObject.extensionElements && 
      businessObject.extensionElements.values && 
      businessObject.extensionElements.values.length > 0) {
    
    businessObject.extensionElements.values.forEach((extension: any) => {
      // Handle Activiti extension elements
      if (extension.$type === 'activiti:Properties' && extension.values) {
        extension.values.forEach((prop: any) => {
          properties[`activiti_property_${prop.name}`] = prop.value;
        });
      }
      
      // Handle form properties
      if (extension.$type === 'activiti:FormProperty' && extension.values) {
        extension.values.forEach((formProp: any, index: number) => {
          properties[`activiti_formProperty_${index}_id`] = formProp.id || '';
          properties[`activiti_formProperty_${index}_name`] = formProp.name || '';
          properties[`activiti_formProperty_${index}_type`] = formProp.type || '';
          properties[`activiti_formProperty_${index}_required`] = formProp.required === 'true';
          properties[`activiti_formProperty_${index}_readable`] = formProp.readable !== 'false';
          properties[`activiti_formProperty_${index}_writable`] = formProp.writable !== 'false';
          properties[`activiti_formProperty_${index}_variable`] = formProp.variable || '';
        });
      }
      
      // Handle execution listeners
      if (extension.$type === 'activiti:ExecutionListener' && extension.values) {
        extension.values.forEach((listener: any, index: number) => {
          properties[`activiti_executionListener_${index}_event`] = listener.event || '';
          properties[`activiti_executionListener_${index}_class`] = listener.class || '';
          properties[`activiti_executionListener_${index}_expression`] = listener.expression || '';
          properties[`activiti_executionListener_${index}_delegateExpression`] = listener.delegateExpression || '';
        });
      }
      
      // Handle task listeners
      if (extension.$type === 'activiti:TaskListener' && extension.values) {
        extension.values.forEach((listener: any, index: number) => {
          properties[`activiti_taskListener_${index}_event`] = listener.event || '';
          properties[`activiti_taskListener_${index}_class`] = listener.class || '';
          properties[`activiti_taskListener_${index}_expression`] = listener.expression || '';
          properties[`activiti_taskListener_${index}_delegateExpression`] = listener.delegateExpression || '';
        });
      }
      
      // Handle custom extensions
      if (extension.$type === 'custom:DataObjectProperties') {
        // Properties from CustomPropertiesProvider for DataObjects
        if (extension.dataType !== undefined) properties.dataType = extension.dataType;
        if (extension.isCollection !== undefined) properties.isCollection = extension.isCollection;
      } else if (extension.$type === 'custom:ArtifactProperties') {
        // Properties from CustomPropertiesProvider for Artifacts
        if (element.type === 'bpmn:TextAnnotation') {
          if (extension.textFormat !== undefined) properties.textFormat = extension.textFormat;
          if (extension.includeInHistory !== undefined) properties.includeInHistory = extension.includeInHistory;
          // Visual properties for TextAnnotation
          if (extension.fontSize !== undefined) properties.fontSizeAnnotation = extension.fontSize;
          if (extension.fontWeight !== undefined) properties.fontWeightAnnotation = extension.fontWeight;
          if (extension.fontStyle !== undefined) properties.fontStyleAnnotation = extension.fontStyle;
          if (extension.fontColor !== undefined) properties.fontColorAnnotation = extension.fontColor;
          if (extension.backgroundColor !== undefined) properties.backgroundColorAnnotation = extension.backgroundColor;
          if (extension.borderColor !== undefined) properties.borderColorAnnotation = extension.borderColor;
        } else if (element.type === 'bpmn:Group') {
          if (extension.categoryValueRef !== undefined) properties.categoryValueRef = extension.categoryValueRef;
          // Visual properties for Group
          if (extension.borderColor !== undefined) properties.borderColorGroup = extension.borderColor;
          if (extension.backgroundColor !== undefined) properties.backgroundColorGroup = extension.backgroundColor;
          if (extension.fontColor !== undefined) properties.fontColorGroup = extension.fontColor;
          if (extension.fontSize !== undefined) properties.fontSizeGroup = extension.fontSize;
        }
      } else if (extension.$type === 'custom:WorkspaceProperties') {
        // Properties from CustomPropertiesProvider for Workspace
        if (extension.workspaceName !== undefined) properties.workspaceName = extension.workspaceName;
      }
    });
  }

  return properties;
}, []);

/**
 * Update the properties of the selected element
 * Refatorado para suportar todos os atributos BPMN do Activiti
 */
const updateElementProperties = useCallback((updatedProperties: BpmnElementProperties) => {
  if (!selectedElement || !modeler || readOnly) return;

  const modeling = modeler.get('modeling');
  const elementRegistry = modeler.get('elementRegistry');
  const moddle = modeler.get('moddle');
  
  // Find the element in the registry
  const element = elementRegistry.get(selectedElement.id);
  if (!element) return;

  // Prepare the properties to update
  const propertiesToUpdate: any = {};
  
  // Handle basic properties
  if (updatedProperties.name !== undefined) {
    propertiesToUpdate.name = updatedProperties.name;
  }
  
  // Handle documentation
  if (updatedProperties.documentation !== undefined) {
    const documentationElement = moddle.create('bpmn:Documentation', {
      text: updatedProperties.documentation
    });
    
    // Update or create documentation
    if (element.businessObject.documentation && element.businessObject.documentation.length > 0) {
      element.businessObject.documentation[0].text = updatedProperties.documentation;
    } else {
      propertiesToUpdate.documentation = [documentationElement];
    }
  }
  
  // Prepare Activiti namespace properties
  const activitiProps: any = {};
  
  // Extract all Activiti namespace properties
  Object.keys(updatedProperties).forEach(key => {
    if (key.startsWith('activiti_') && 
        !key.includes('property_') && 
        !key.includes('formProperty_') && 
        !key.includes('executionListener_') && 
        !key.includes('taskListener_')) {
      const activitiKey = key.replace('activiti_', 'activiti:');
      activitiProps[activitiKey] = updatedProperties[key];
    }
  });
  
  // Handle element-specific properties based on element type
  switch (element.type) {
    case 'bpmn:Process':
      if (updatedProperties.versionTag !== undefined) {
        propertiesToUpdate.versionTag = updatedProperties.versionTag;
      }
      if (updatedProperties.isExecutable !== undefined) {
        propertiesToUpdate.isExecutable = !!updatedProperties.isExecutable;
      }
      if (updatedProperties.jobPriority !== undefined) {
        propertiesToUpdate.jobPriority = updatedProperties.jobPriority;
      }
      if (updatedProperties.historyTimeToLive !== undefined) {
        propertiesToUpdate.historyTimeToLive = updatedProperties.historyTimeToLive;
      }
      break;
      
    case 'bpmn:StartEvent':
    case 'bpmn:EndEvent':
    case 'bpmn:IntermediateCatchEvent':
    case 'bpmn:IntermediateThrowEvent':
    case 'bpmn:BoundaryEvent':
      if (updatedProperties.isInterrupting !== undefined) {
        propertiesToUpdate.isInterrupting = !!updatedProperties.isInterrupting;
      }
      
      // Handle event definitions
      if (element.businessObject.eventDefinitions && element.businessObject.eventDefinitions.length > 0) {
        const eventDef = element.businessObject.eventDefinitions[0];
        
        if (eventDef.$type === 'bpmn:TimerEventDefinition') {
          // Handle timer event properties
          if (updatedProperties.timeDate !== undefined) {
            const timeDateExpression = moddle.create('bpmn:FormalExpression', {
              body: updatedProperties.timeDate
            });
            eventDef.timeDate = timeDateExpression;
          }
          
          if (updatedProperties.timeDuration !== undefined) {
            const timeDurationExpression = moddle.create('bpmn:FormalExpression', {
              body: updatedProperties.timeDuration
            });
            eventDef.timeDuration = timeDurationExpression;
          }
          
          if (updatedProperties.timeCycle !== undefined) {
            const timeCycleExpression = moddle.create('bpmn:FormalExpression', {
              body: updatedProperties.timeCycle
            });
            eventDef.timeCycle = timeCycleExpression;
          }
        } else if (eventDef.$type === 'bpmn:MessageEventDefinition') {
          // Handle message event properties
          if (updatedProperties.messageRef !== undefined && updatedProperties.messageRef !== '') {
            // Find message by ID or create a new one
            const message = elementRegistry.get(updatedProperties.messageRef) || 
                           moddle.create('bpmn:Message', { id: updatedProperties.messageRef });
            eventDef.messageRef = message;
          }
        } else if (eventDef.$type === 'bpmn:ErrorEventDefinition') {
          // Handle error event properties
          if (updatedProperties.errorRef !== undefined && updatedProperties.errorRef !== '') {
            // Find error by ID or create a new one
            const error = elementRegistry.get(updatedProperties.errorRef) || 
                         moddle.create('bpmn:Error', { id: updatedProperties.errorRef });
            eventDef.errorRef = error;
          }
        }
      }
      
      // For boundary events
      if (element.type === 'bpmn:BoundaryEvent') {
        if (updatedProperties.cancelActivity !== undefined) {
          propertiesToUpdate.cancelActivity = !!updatedProperties.cancelActivity;
        }
      }
      break;
      
    case 'bpmn:Task':
    case 'bpmn:UserTask':
    case 'bpmn:ServiceTask':
    case 'bpmn:ScriptTask':
    case 'bpmn:ReceiveTask':
    case 'bpmn:ManualTask':
    case 'bpmn:SendTask':
    case 'bpmn:BusinessRuleTask':
      if (updatedProperties.isAsync !== undefined) {
        propertiesToUpdate.isAsync = !!updatedProperties.isAsync;
      }
      if (updatedProperties.isForCompensation !== undefined) {
        propertiesToUpdate.isForCompensation = !!updatedProperties.isForCompensation;
      }
      
      // Script Task specific properties
      if (element.type === 'bpmn:ScriptTask') {
        if (updatedProperties.scriptFormat !== undefined) {
          propertiesToUpdate.scriptFormat = updatedProperties.scriptFormat;
        }
        if (updatedProperties.script !== undefined) {
          propertiesToUpdate.script = updatedProperties.script;
        }
      }
      
      // Send/Receive Task specific properties
      if (element.type === 'bpmn:SendTask' || element.type === 'bpmn:ReceiveTask') {
        if (updatedProperties.messageRef !== undefined && updatedProperties.messageRef !== '') {
          // Find message by ID or create a new one
          const message = elementRegistry.get(updatedProperties.messageRef) || 
                         moddle.create('bpmn:Message', { id: updatedProperties.messageRef });
          propertiesToUpdate.messageRef = message;
        }
      }
      break;
      
    case 'bpmn:ExclusiveGateway':
    case 'bpmn:ParallelGateway':
    case 'bpmn:InclusiveGateway':
    case 'bpmn:EventBasedGateway':
      if (updatedProperties.gatewayDirection !== undefined) {
        propertiesToUpdate.gatewayDirection = updatedProperties.gatewayDirection;
      }
      
      if (updatedProperties.default !== undefined && updatedProperties.default !== '') {
        // Find sequence flow by ID
        const sequenceFlow = elementRegistry.get(updatedProperties.default);
        if (sequenceFlow) {
          propertiesToUpdate.default = sequenceFlow.businessObject;
        }
      }
      
      if (element.type === 'bpmn:EventBasedGateway') {
        if (updatedProperties.instantiate !== undefined) {
          propertiesToUpdate.instantiate = !!updatedProperties.instantiate;
        }
        if (updatedProperties.eventGatewayType !== undefined) {
          propertiesToUpdate.eventGatewayType = updatedProperties.eventGatewayType;
        }
      }
      break;
      
    case 'bpmn:SequenceFlow':
      if (updatedProperties.conditionExpression !== undefined) {
        const expressionElement = moddle.create('bpmn:FormalExpression', {
          body: updatedProperties.conditionExpression
        });
        propertiesToUpdate.conditionExpression = expressionElement;
      }
      if (updatedProperties.isImmediate !== undefined) {
        propertiesToUpdate.isImmediate = !!updatedProperties.isImmediate;
      }
      break;
      
    case 'bpmn:SubProcess':
    case 'bpmn:CallActivity':
      if (updatedProperties.triggeredByEvent !== undefined) {
        propertiesToUpdate.triggeredByEvent = !!updatedProperties.triggeredByEvent;
      }
      break;
      
    case 'bpmn:DataObject':
      if (updatedProperties.isCollection !== undefined) {
        propertiesToUpdate.isCollection = !!updatedProperties.isCollection;
      }
      
      if (updatedProperties.itemSubjectRef !== undefined && updatedProperties.itemSubjectRef !== '') {
        // Find item definition by ID or create a new one
        const itemDefinition = elementRegistry.get(updatedProperties.itemSubjectRef) || 
                              moddle.create('bpmn:ItemDefinition', { id: updatedProperties.itemSubjectRef });
        propertiesToUpdate.itemSubjectRef = itemDefinition;
      }
      
      if (updatedProperties.dataState !== undefined && updatedProperties.dataState !== '') {
        const dataState = moddle.create('bpmn:DataState', { name: updatedProperties.dataState });
        propertiesToUpdate.dataState = dataState;
      }
      break;
      
    case 'bpmn:DataStore':
      if (updatedProperties.capacity !== undefined) {
        propertiesToUpdate.capacity = updatedProperties.capacity;
      }
      if (updatedProperties.isUnlimited !== undefined) {
        propertiesToUpdate.isUnlimited = !!updatedProperties.isUnlimited;
      }
      
      if (updatedProperties.itemSubjectRef !== undefined && updatedProperties.itemSubjectRef !== '') {
        // Find item definition by ID or create a new one
        const itemDefinition = elementRegistry.get(updatedProperties.itemSubjectRef) || 
                              moddle.create('bpmn:ItemDefinition', { id: updatedProperties.itemSubjectRef });
        propertiesToUpdate.itemSubjectRef = itemDefinition;
      }
      break;
      
    case 'bpmn:TextAnnotation':
      if (updatedProperties.text !== undefined) {
        propertiesToUpdate.text = updatedProperties.text;
      }
      if (updatedProperties.textFormat !== undefined) {
        propertiesToUpdate.textFormat = updatedProperties.textFormat;
      }
      break;
      
    case 'bpmn:Group':
      if (updatedProperties.categoryValueRef !== undefined && updatedProperties.categoryValueRef !== '') {
        // Find category value by ID or create a new one
        const categoryValue = elementRegistry.get(updatedProperties.categoryValueRef) || 
                             moddle.create('bpmn:CategoryValue', { id: updatedProperties.categoryValueRef });
        propertiesToUpdate.categoryValueRef = categoryValue;
      }
      break;
      
    case 'bpmn:Association':
      if (updatedProperties.associationDirection !== undefined) {
        propertiesToUpdate.associationDirection = updatedProperties.associationDirection;
      }
      break;
  }
  
  // Handle extension elements
  let extensionElements = element.businessObject.extensionElements || 
                          moddle.create('bpmn:ExtensionElements');
  let needsExtensionElementsUpdate = false;
  
  // Helper function to get or create specific extension property group
  const getOrCreateExtension = (extensionType: string) => {
    let specificExtension = extensionElements.values?.find((ext: any) => ext.$type === extensionType);
    if (!specificExtension) {
      specificExtension = moddle.create(extensionType);
      extensionElements.values = extensionElements.values || [];
      extensionElements.values.push(specificExtension);
      needsExtensionElementsUpdate = true;
    }
    return specificExtension;
  };
  
  // Handle Activiti Properties extension
  const activitiPropertyKeys = Object.keys(updatedProperties).filter(key => key.startsWith('activiti_property_'));
  if (activitiPropertyKeys.length > 0) {
    let activitiProperties = getOrCreateExtension('activiti:Properties');
    activitiProperties.values = activitiProperties.values || [];
    
    activitiPropertyKeys.forEach(key => {
      const propName = key.replace('activiti_property_', '');
      let property = activitiProperties.values.find((p: any) => p.name === propName);
      
      if (property) {
        property.value = updatedProperties[key];
      } else {
        property = moddle.create('activiti:Property', { name: propName, value: updatedProperties[key] });
        activitiProperties.values.push(property);
      }
    });
    
    needsExtensionElementsUpdate = true;
  }
  
  // Handle Activiti Form Properties extension
  const formPropertyKeys = Object.keys(updatedProperties).filter(key => key.startsWith('activiti_formProperty_'));
  if (formPropertyKeys.length > 0) {
    // Group form property keys by index
    const formPropertyIndices = new Set<string>();
    formPropertyKeys.forEach(key => {
      const match = key.match(/activiti_formProperty_(\d+)_/);
      if (match) {
        formPropertyIndices.add(match[1]);
      }
    });
    
    // Create or update form properties
    let formProperties = extensionElements.values?.find((ext: any) => ext.$type === 'activiti:FormProperties');
    if (!formProperties) {
      formProperties = moddle.create('activiti:FormProperties');
      extensionElements.values = extensionElements.values || [];
      extensionElements.values.push(formProperties);
      formProperties.values = [];
      needsExtensionElementsUpdate = true;
    }
    
    // Update existing form properties or create new ones
    Array.from(formPropertyIndices).forEach(index => {
      const idKey = `activiti_formProperty_${index}_id`;
      const nameKey = `activiti_formProperty_${index}_name`;
      const typeKey = `activiti_formProperty_${index}_type`;
      const requiredKey = `activiti_formProperty_${index}_required`;
      const readableKey = `activiti_formProperty_${index}_readable`;
      const writableKey = `activiti_formProperty_${index}_writable`;
      const variableKey = `activiti_formProperty_${index}_variable`;
      
      let formProperty = formProperties.values[parseInt(index)];
      if (!formProperty) {
        formProperty = moddle.create('activiti:FormProperty');
        formProperties.values.push(formProperty);
      }
      
      if (updatedProperties[idKey] !== undefined) formProperty.id = updatedProperties[idKey];
      if (updatedProperties[nameKey] !== undefined) formProperty.name = updatedProperties[nameKey];
      if (updatedProperties[typeKey] !== undefined) formProperty.type = updatedProperties[typeKey];
      if (updatedProperties[requiredKey] !== undefined) formProperty.required = updatedProperties[requiredKey].toString();
      if (updatedProperties[readableKey] !== undefined) formProperty.readable = updatedProperties[readableKey].toString();
      if (updatedProperties[writableKey] !== undefined) formProperty.writable = updatedProperties[writableKey].toString();
      if (updatedProperties[variableKey] !== undefined) formProperty.variable = updatedProperties[variableKey];
    });
    
    needsExtensionElementsUpdate = true;
  }
  
  // Handle Activiti Execution Listeners extension
  const executionListenerKeys = Object.keys(updatedProperties).filter(key => key.startsWith('activiti_executionListener_'));
  if (executionListenerKeys.length > 0) {
    // Group execution listener keys by index
    const executionListenerIndices = new Set<string>();
    executionListenerKeys.forEach(key => {
      const match = key.match(/activiti_executionListener_(\d+)_/);
      if (match) {
        executionListenerIndices.add(match[1]);
      }
    });
    
    // Create or update execution listeners
    Array.from(executionListenerIndices).forEach(index => {
      const eventKey = `activiti_executionListener_${index}_event`;
      const classKey = `activiti_executionListener_${index}_class`;
      const expressionKey = `activiti_executionListener_${index}_expression`;
      const delegateExpressionKey = `activiti_executionListener_${index}_delegateExpression`;
      
      let executionListener = extensionElements.values?.find((ext: any) => 
        ext.$type === 'activiti:ExecutionListener' && 
        ext.event === updatedProperties[eventKey]
      );
      
      if (!executionListener) {
        executionListener = moddle.create('activiti:ExecutionListener');
        extensionElements.values = extensionElements.values || [];
        extensionElements.values.push(executionListener);
      }
      
      if (updatedProperties[eventKey] !== undefined) executionListener.event = updatedProperties[eventKey];
      if (updatedProperties[classKey] !== undefined) executionListener.class = updatedProperties[classKey];
      if (updatedProperties[expressionKey] !== undefined) executionListener.expression = updatedProperties[expressionKey];
      if (updatedProperties[delegateExpressionKey] !== undefined) executionListener.delegateExpression = updatedProperties[delegateExpressionKey];
    });
    
    needsExtensionElementsUpdate = true;
  }
  
  // Handle Activiti Task Listeners extension
  const taskListenerKeys = Object.keys(updatedProperties).filter(key => key.startsWith('activiti_taskListener_'));
  if (taskListenerKeys.length > 0) {
    // Group task listener keys by index
    const taskListenerIndices = new Set<string>();
    taskListenerKeys.forEach(key => {
      const match = key.match(/activiti_taskListener_(\d+)_/);
      if (match) {
        taskListenerIndices.add(match[1]);
      }
    });
    
    // Create or update task listeners
    Array.from(taskListenerIndices).forEach(index => {
      const eventKey = `activiti_taskListener_${index}_event`;
      const classKey = `activiti_taskListener_${index}_class`;
      const expressionKey = `activiti_taskListener_${index}_expression`;
      const delegateExpressionKey = `activiti_taskListener_${index}_delegateExpression`;
      
      let taskListener = extensionElements.values?.find((ext: any) => 
        ext.$type === 'activiti:TaskListener' && 
        ext.event === updatedProperties[eventKey]
      );
      
      if (!taskListener) {
        taskListener = moddle.create('activiti:TaskListener');
        extensionElements.values = extensionElements.values || [];
        extensionElements.values.push(taskListener);
      }
      
      if (updatedProperties[eventKey] !== undefined) taskListener.event = updatedProperties[eventKey];
      if (updatedProperties[classKey] !== undefined) taskListener.class = updatedProperties[classKey];
      if (updatedProperties[expressionKey] !== undefined) taskListener.expression = updatedProperties[expressionKey];
      if (updatedProperties[delegateExpressionKey] !== undefined) taskListener.delegateExpression = updatedProperties[delegateExpressionKey];
    });
    
    needsExtensionElementsUpdate = true;
  }
  
  // Handle custom DataObject properties
  if (element.type === 'bpmn:DataObject') {
    if (updatedProperties.dataType !== undefined) {
      let dataObjectProperties = getOrCreateExtension('custom:DataObjectProperties');
      dataObjectProperties.dataType = updatedProperties.dataType;
      needsExtensionElementsUpdate = true;
    }
  }
  
  // Handle custom Artifact properties
  if (element.type === 'bpmn:TextAnnotation' || element.type === 'bpmn:Group') {
    let artifactProperties = getOrCreateExtension('custom:ArtifactProperties');
    
    if (element.type === 'bpmn:TextAnnotation') {
      // Handle TextAnnotation specific properties
      const textAnnotationProps = [
        { key: 'textFormat', value: updatedProperties.textFormat },
        { key: 'includeInHistory', value: updatedProperties.includeInHistory },
        { key: 'fontSize', value: updatedProperties.fontSizeAnnotation },
        { key: 'fontWeight', value: updatedProperties.fontWeightAnnotation },
        { key: 'fontStyle', value: updatedProperties.fontStyleAnnotation },
        { key: 'fontColor', value: updatedProperties.fontColorAnnotation },
        { key: 'backgroundColor', value: updatedProperties.backgroundColorAnnotation },
        { key: 'borderColor', value: updatedProperties.borderColorAnnotation }
      ];
      
      textAnnotationProps.forEach(({ key, value }) => {
        if (value !== undefined) {
          artifactProperties[key] = value;
          needsExtensionElementsUpdate = true;
        }
      });
    } else if (element.type === 'bpmn:Group') {
      // Handle Group specific properties
      const groupProps = [
        { key: 'categoryValueRef', value: updatedProperties.categoryValueRef },
        { key: 'borderColor', value: updatedProperties.borderColorGroup },
        { key: 'backgroundColor', value: updatedProperties.backgroundColorGroup },
        { key: 'fontColor', value: updatedProperties.fontColorGroup },
        { key: 'fontSize', value: updatedProperties.fontSizeGroup }
      ];
      
      groupProps.forEach(({ key, value }) => {
        if (value !== undefined) {
          artifactProperties[key] = value;
          needsExtensionElementsUpdate = true;
        }
      });
    }
  }
  
  // Handle custom Workspace properties
  if (element.type === 'bpmn:Process' || element.type === 'bpmn:Collaboration') {
    if (updatedProperties.workspaceName !== undefined) {
      let workspaceProperties = getOrCreateExtension('custom:WorkspaceProperties');
      workspaceProperties.workspaceName = updatedProperties.workspaceName;
      needsExtensionElementsUpdate = true;
    }
  }
  
  // Update extension elements if needed
  if (needsExtensionElementsUpdate) {
    propertiesToUpdate.extensionElements = extensionElements;
  }
  
  // Apply all property updates
  if (Object.keys(propertiesToUpdate).length > 0) {
    modeling.updateProperties(element, propertiesToUpdate);
  }
  
  // Apply Activiti namespace properties
  if (Object.keys(activitiProps).length > 0) {
    modeling.updateProperties(element, activitiProps);
  }
  
  // Notify about property updates if callback is provided
  if (onPropertiesUpdated) {
    onPropertiesUpdated(element, updatedProperties);
  }
}, [selectedElement, modeler, readOnly, onPropertiesUpdated]);

  /**
   * Debounced version of updateElementProperties to avoid too many updates
   */
  const debouncedUpdateProperties = useCallback(
    debounce((updatedProperties: BpmnElementProperties) => {
      if (isMounted.current) {
        updateElementProperties(updatedProperties);
      }
    }, 300),
    [updateElementProperties]
  );

  /**
   * Handle property change
   */
  const handlePropertyChange = useCallback((key: string, value: any) => {
    if (!properties) return;
    
    const updatedProperties = { ...properties, [key]: value };
    setProperties(updatedProperties);
    debouncedUpdateProperties(updatedProperties);
  }, [properties, debouncedUpdateProperties]);

/**
 * Get property fields based on element type
 * Atualizado para suportar todos os atributos BPMN do Activiti
 */
const getPropertyFields = useCallback((): PropertyField[] => {
  if (!selectedElement) return [];

  // Default fields for all element types
  const defaultFields: PropertyField[] = [
    { key: 'id', label: 'ID', type: 'text', readOnly: true },
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Digite o nome' },
    { key: 'documentation', label: 'Documentação', type: 'textarea', placeholder: 'Digite a documentação' },
  ];

  // Fields specific to the element type
  let typeSpecificFields: PropertyField[] = [];

  // Get custom property fields for this element type if available
  const customFields = customPropertyFields[elementType] || [];

  switch (elementType) {
    case 'bpmn:Process':
      typeSpecificFields = [
        { key: 'versionTag', label: 'Tag de Versão', type: 'text', placeholder: 'Digite a tag de versão' },
        { key: 'isExecutable', label: 'Executável', type: 'checkbox' },
        { key: 'jobPriority', label: 'Prioridade do Job', type: 'text', placeholder: 'Digite a prioridade do job' },
        { key: 'historyTimeToLive', label: 'Tempo de Vida do Histórico', type: 'text', placeholder: 'Digite o tempo de vida' },
        { key: 'activiti_candidateStarterGroups', label: 'Grupos Candidatos Iniciais', type: 'text', placeholder: 'Digite os grupos separados por vírgula' },
        { key: 'activiti_candidateStarterUsers', label: 'Usuários Candidatos Iniciais', type: 'text', placeholder: 'Digite os usuários separados por vírgula' },
        { key: 'activiti_versionTag', label: 'Tag de Versão (Activiti)', type: 'text', placeholder: 'Digite a tag de versão Activiti' },
        { key: 'activiti_historyTimeToLive', label: 'Tempo de Vida do Histórico (Activiti)', type: 'text', placeholder: 'Digite o tempo de vida' },
        { key: 'activiti_isStartableInTasklist', label: 'Iniciável na Lista de Tarefas', type: 'checkbox' },
      ];
      break;

    case 'bpmn:StartEvent':
      typeSpecificFields = [
        { key: 'isInterrupting', label: 'Interruptor', type: 'checkbox' },
        { key: 'activiti_formKey', label: 'Chave do Formulário', type: 'text', placeholder: 'Digite a chave do formulário' },
        { key: 'activiti_initiator', label: 'Iniciador', type: 'text', placeholder: 'Digite o iniciador' },
      ];
      
      // Adicionar campos específicos para definições de eventos de timer
      if (selectedElement.businessObject.eventDefinitions && 
          selectedElement.businessObject.eventDefinitions.some((def: any) => def.$type === 'bpmn:TimerEventDefinition')) {
        typeSpecificFields = [
          ...typeSpecificFields,
          { key: 'timeDate', label: 'Data/Hora', type: 'text', placeholder: 'Digite a data/hora (ISO 8601)' },
          { key: 'timeDuration', label: 'Duração', type: 'text', placeholder: 'Digite a duração (ISO 8601)' },
          { key: 'timeCycle', label: 'Ciclo', type: 'text', placeholder: 'Digite o ciclo (ISO 8601 ou cron)' },
        ];
      }
      
      // Adicionar campos específicos para definições de eventos de mensagem
      if (selectedElement.businessObject.eventDefinitions && 
          selectedElement.businessObject.eventDefinitions.some((def: any) => def.$type === 'bpmn:MessageEventDefinition')) {
        typeSpecificFields = [
          ...typeSpecificFields,
          { key: 'messageRef', label: 'Referência de Mensagem', type: 'text', placeholder: 'Digite a referência de mensagem' },
        ];
      }
      break;

    case 'bpmn:EndEvent':
      typeSpecificFields = [];
      
      // Adicionar campos específicos para definições de eventos de erro
      if (selectedElement.businessObject.eventDefinitions && 
          selectedElement.businessObject.eventDefinitions.some((def: any) => def.$type === 'bpmn:ErrorEventDefinition')) {
        typeSpecificFields = [
          ...typeSpecificFields,
          { key: 'errorRef', label: 'Referência de Erro', type: 'text', placeholder: 'Digite a referência de erro' },
        ];
      }
      break;

    case 'bpmn:IntermediateCatchEvent':
    case 'bpmn:IntermediateThrowEvent':
      typeSpecificFields = [];
      
      // Adicionar campos específicos para definições de eventos de timer
      if (selectedElement.businessObject.eventDefinitions && 
          selectedElement.businessObject.eventDefinitions.some((def: any) => def.$type === 'bpmn:TimerEventDefinition')) {
        typeSpecificFields = [
          ...typeSpecificFields,
          { key: 'timeDate', label: 'Data/Hora', type: 'text', placeholder: 'Digite a data/hora (ISO 8601)' },
          { key: 'timeDuration', label: 'Duração', type: 'text', placeholder: 'Digite a duração (ISO 8601)' },
          { key: 'timeCycle', label: 'Ciclo', type: 'text', placeholder: 'Digite o ciclo (ISO 8601 ou cron)' },
        ];
      }
      
      // Adicionar campos específicos para definições de eventos de mensagem
      if (selectedElement.businessObject.eventDefinitions && 
          selectedElement.businessObject.eventDefinitions.some((def: any) => def.$type === 'bpmn:MessageEventDefinition')) {
        typeSpecificFields = [
          ...typeSpecificFields,
          { key: 'messageRef', label: 'Referência de Mensagem', type: 'text', placeholder: 'Digite a referência de mensagem' },
        ];
      }
      break;

    case 'bpmn:BoundaryEvent':
      typeSpecificFields = [
        { key: 'isInterrupting', label: 'Interruptor', type: 'checkbox' },
        { key: 'attachedToRef', label: 'Anexado a', type: 'text', readOnly: true },
        { key: 'cancelActivity', label: 'Cancelar Atividade', type: 'checkbox' },
      ];
      
      // Adicionar campos específicos para definições de eventos de timer
      if (selectedElement.businessObject.eventDefinitions && 
          selectedElement.businessObject.eventDefinitions.some((def: any) => def.$type === 'bpmn:TimerEventDefinition')) {
        typeSpecificFields = [
          ...typeSpecificFields,
          { key: 'timeDate', label: 'Data/Hora', type: 'text', placeholder: 'Digite a data/hora (ISO 8601)' },
          { key: 'timeDuration', label: 'Duração', type: 'text', placeholder: 'Digite a duração (ISO 8601)' },
          { key: 'timeCycle', label: 'Ciclo', type: 'text', placeholder: 'Digite o ciclo (ISO 8601 ou cron)' },
        ];
      }
      
      // Adicionar campos específicos para definições de eventos de erro
      if (selectedElement.businessObject.eventDefinitions && 
          selectedElement.businessObject.eventDefinitions.some((def: any) => def.$type === 'bpmn:ErrorEventDefinition')) {
        typeSpecificFields = [
          ...typeSpecificFields,
          { key: 'errorRef', label: 'Referência de Erro', type: 'text', placeholder: 'Digite a referência de erro' },
        ];
      }
      break;

    case 'bpmn:Task':
      typeSpecificFields = [
        { key: 'isAsync', label: 'Assíncrono', type: 'checkbox' },
        { key: 'isForCompensation', label: 'Para Compensação', type: 'checkbox' },
        { key: 'activiti_async', label: 'Assíncrono (Activiti)', type: 'checkbox' },
        { key: 'activiti_exclusive', label: 'Exclusivo (Activiti)', type: 'checkbox' },
        { key: 'activiti_jobPriority', label: 'Prioridade do Job (Activiti)', type: 'text', placeholder: 'Digite a prioridade do job' },
      ];
      break;

    case 'bpmn:UserTask':
      typeSpecificFields = [
        { key: 'isAsync', label: 'Assíncrono', type: 'checkbox' },
        { key: 'isForCompensation', label: 'Para Compensação', type: 'checkbox' },
        { key: 'activiti_async', label: 'Assíncrono (Activiti)', type: 'checkbox' },
        { key: 'activiti_exclusive', label: 'Exclusivo (Activiti)', type: 'checkbox' },
        { key: 'activiti_assignee', label: 'Responsável', type: 'text', placeholder: 'Digite o responsável' },
        { key: 'activiti_candidateUsers', label: 'Usuários Candidatos', type: 'text', placeholder: 'Digite os usuários separados por vírgula' },
        { key: 'activiti_candidateGroups', label: 'Grupos Candidatos', type: 'text', placeholder: 'Digite os grupos separados por vírgula' },
        { key: 'activiti_dueDate', label: 'Data de Vencimento', type: 'text', placeholder: 'Digite a data de vencimento' },
        { key: 'activiti_priority', label: 'Prioridade', type: 'text', placeholder: 'Digite a prioridade' },
        { key: 'activiti_formKey', label: 'Chave do Formulário', type: 'text', placeholder: 'Digite a chave do formulário' },
      ];
      break;

    case 'bpmn:ServiceTask':
      typeSpecificFields = [
        { key: 'isAsync', label: 'Assíncrono', type: 'checkbox' },
        { key: 'isForCompensation', label: 'Para Compensação', type: 'checkbox' },
        { key: 'activiti_async', label: 'Assíncrono (Activiti)', type: 'checkbox' },
        { key: 'activiti_exclusive', label: 'Exclusivo (Activiti)', type: 'checkbox' },
        { key: 'activiti_class', label: 'Classe', type: 'text', placeholder: 'Digite o nome da classe' },
        { key: 'activiti_expression', label: 'Expressão', type: 'text', placeholder: 'Digite a expressão' },
        { key: 'activiti_delegateExpression', label: 'Expressão de Delegação', type: 'text', placeholder: 'Digite a expressão de delegação' },
        { key: 'activiti_type', label: 'Tipo', type: 'select', options: [
          { value: '', label: 'Selecione um tipo' },
          { value: 'mail', label: 'E-mail' },
          { value: 'shell', label: 'Shell' },
          { value: 'webservice', label: 'Web Service' },
        ]},
        { key: 'activiti_resultVariable', label: 'Variável de Resultado', type: 'text', placeholder: 'Digite o nome da variável de resultado' },
      ];
      break;

    case 'bpmn:ScriptTask':
      typeSpecificFields = [
        { key: 'isAsync', label: 'Assíncrono', type: 'checkbox' },
        { key: 'isForCompensation', label: 'Para Compensação', type: 'checkbox' },
        { key: 'scriptFormat', label: 'Formato do Script', type: 'text', placeholder: 'Digite o formato do script (ex: javascript)' },
        { key: 'script', label: 'Script', type: 'textarea', placeholder: 'Digite o script' },
        { key: 'activiti_autoStoreVariables', label: 'Armazenar Variáveis Automaticamente', type: 'checkbox' },
        { key: 'activiti_resultVariable', label: 'Variável de Resultado', type: 'text', placeholder: 'Digite o nome da variável de resultado' },
      ];
      break;

    case 'bpmn:BusinessRuleTask':
      typeSpecificFields = [
        { key: 'isAsync', label: 'Assíncrono', type: 'checkbox' },
        { key: 'isForCompensation', label: 'Para Compensação', type: 'checkbox' },
        { key: 'activiti_ruleVariablesInput', label: 'Variáveis de Entrada da Regra', type: 'text', placeholder: 'Digite as variáveis de entrada' },
        { key: 'activiti_resultVariable', label: 'Variável de Resultado', type: 'text', placeholder: 'Digite o nome da variável de resultado' },
        { key: 'activiti_rules', label: 'Regras', type: 'text', placeholder: 'Digite as regras separadas por vírgula' },
        { key: 'activiti_exclude', label: 'Excluir', type: 'text', placeholder: 'Digite as regras a excluir' },
      ];
      break;

    case 'bpmn:SendTask':
    case 'bpmn:ReceiveTask':
      typeSpecificFields = [
        { key: 'isAsync', label: 'Assíncrono', type: 'checkbox' },
        { key: 'isForCompensation', label: 'Para Compensação', type: 'checkbox' },
        { key: 'messageRef', label: 'Referência de Mensagem', type: 'text', placeholder: 'Digite a referência de mensagem' },
      ];
      break;

    case 'bpmn:ManualTask':
      typeSpecificFields = [
        { key: 'isAsync', label: 'Assíncrono', type: 'checkbox' },
        { key: 'isForCompensation', label: 'Para Compensação', type: 'checkbox' },
      ];
      break;

    case 'bpmn:ExclusiveGateway':
    case 'bpmn:ParallelGateway':
    case 'bpmn:InclusiveGateway':
      typeSpecificFields = [
        { key: 'gatewayDirection', label: 'Direção do Gateway', type: 'select', options: [
          { value: 'Unspecified', label: 'Não Especificado' },
          { value: 'Converging', label: 'Convergente' },
          { value: 'Diverging', label: 'Divergente' },
          { value: 'Mixed', label: 'Misto' },
        ]},
        { key: 'default', label: 'Fluxo Padrão', type: 'text', placeholder: 'ID do fluxo padrão' },
      ];
      break;

    case 'bpmn:EventBasedGateway':
      typeSpecificFields = [
        { key: 'gatewayDirection', label: 'Direção do Gateway', type: 'select', options: [
          { value: 'Unspecified', label: 'Não Especificado' },
          { value: 'Converging', label: 'Convergente' },
          { value: 'Diverging', label: 'Divergente' },
          { value: 'Mixed', label: 'Misto' },
        ]},
        { key: 'instantiate', label: 'Instanciar', type: 'checkbox' },
        { key: 'eventGatewayType', label: 'Tipo de Gateway de Evento', type: 'select', options: [
          { value: 'Exclusive', label: 'Exclusivo' },
          { value: 'Parallel', label: 'Paralelo' },
        ]},
      ];
      break;

    case 'bpmn:SequenceFlow':
      typeSpecificFields = [
        { key: 'sourceRef', label: 'Origem', type: 'text', readOnly: true },
        { key: 'targetRef', label: 'Destino', type: 'text', readOnly: true },
        { key: 'conditionExpression', label: 'Expressão de Condição', type: 'textarea', placeholder: 'Digite a expressão de condição' },
        { key: 'isImmediate', label: 'Imediato', type: 'checkbox' },
        { key: 'skipExpression', label: 'Expressão de Salto', type: 'text', placeholder: 'Digite a expressão de salto' },
      ];
      break;

    case 'bpmn:SubProcess':
      typeSpecificFields = [
        { key: 'triggeredByEvent', label: 'Acionado por Evento', type: 'checkbox' },
        { key: 'activiti_async', label: 'Assíncrono (Activiti)', type: 'checkbox' },
        { key: 'activiti_exclusive', label: 'Exclusivo (Activiti)', type: 'checkbox' },
      ];
      
      // Adicionar campos específicos para multi-instâncias
      if (selectedElement.businessObject.loopCharacteristics && 
          selectedElement.businessObject.loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics') {
        typeSpecificFields = [
          ...typeSpecificFields,
          { key: 'activiti_asyncBefore', label: 'Assíncrono Antes', type: 'checkbox' },
          { key: 'activiti_asyncAfter', label: 'Assíncrono Depois', type: 'checkbox' },
          { key: 'activiti_failedJobRetryTimeCycle', label: 'Ciclo de Repetição de Job Falho', type: 'text', placeholder: 'Digite o ciclo de repetição' },
        ];
      }
      break;

    case 'bpmn:CallActivity':
      typeSpecificFields = [
        { key: 'triggeredByEvent', label: 'Acionado por Evento', type: 'checkbox' },
        { key: 'activiti_async', label: 'Assíncrono (Activiti)', type: 'checkbox' },
        { key: 'activiti_exclusive', label: 'Exclusivo (Activiti)', type: 'checkbox' },
        { key: 'activiti_calledElementBinding', label: 'Vinculação do Elemento Chamado', type: 'select', options: [
          { value: 'latest', label: 'Mais Recente' },
          { value: 'deployment', label: 'Implantação' },
          { value: 'version', label: 'Versão' },
          { value: 'versionTag', label: 'Tag de Versão' },
        ]},
        { key: 'activiti_calledElementVersion', label: 'Versão do Elemento Chamado', type: 'text', placeholder: 'Digite a versão' },
        { key: 'activiti_calledElementVersionTag', label: 'Tag de Versão do Elemento Chamado', type: 'text', placeholder: 'Digite a tag de versão' },
        { key: 'activiti_calledElementTenantId', label: 'ID do Tenant do Elemento Chamado', type: 'text', placeholder: 'Digite o ID do tenant' },
      ];
      
      // Adicionar campos específicos para multi-instâncias
      if (selectedElement.businessObject.loopCharacteristics && 
          selectedElement.businessObject.loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics') {
        typeSpecificFields = [
          ...typeSpecificFields,
          { key: 'activiti_asyncBefore', label: 'Assíncrono Antes', type: 'checkbox' },
          { key: 'activiti_asyncAfter', label: 'Assíncrono Depois', type: 'checkbox' },
          { key: 'activiti_failedJobRetryTimeCycle', label: 'Ciclo de Repetição de Job Falho', type: 'text', placeholder: 'Digite o ciclo de repetição' },
        ];
      }
      break;

    case 'bpmn:DataObject':
      typeSpecificFields = [
        { key: 'isCollection', label: 'É Coleção', type: 'checkbox' },
        { key: 'itemSubjectRef', label: 'Referência do Item', type: 'text', placeholder: 'Digite a referência do item' },
        { key: 'dataState', label: 'Estado dos Dados', type: 'text', placeholder: 'Digite o estado dos dados' },
        { key: 'dataType', label: 'Tipo de Dados', type: 'text', placeholder: 'Digite o tipo de dados' },
      ];
      break;

    case 'bpmn:DataStore':
      typeSpecificFields = [
        { key: 'capacity', label: 'Capacidade', type: 'text', placeholder: 'Digite a capacidade' },
        { key: 'isUnlimited', label: 'É Ilimitado', type: 'checkbox' },
        { key: 'itemSubjectRef', label: 'Referência do Item', type: 'text', placeholder: 'Digite a referência do item' },
      ];
      break;

    case 'bpmn:TextAnnotation':
      typeSpecificFields = [
        { key: 'text', label: 'Texto', type: 'textarea', placeholder: 'Digite o texto' },
        { key: 'textFormat', label: 'Formato do Texto', type: 'text', placeholder: 'Digite o formato do texto' },
        { key: 'includeInHistory', label: 'Incluir no Histórico', type: 'checkbox' },
        { key: 'fontSizeAnnotation', label: 'Tamanho da Fonte', type: 'text', placeholder: 'Digite o tamanho da fonte' },
        { key: 'fontWeightAnnotation', label: 'Peso da Fonte', type: 'select', options: [
          { value: 'normal', label: 'Normal' },
          { value: 'bold', label: 'Negrito' },
        ]},
        { key: 'fontStyleAnnotation', label: 'Estilo da Fonte', type: 'select', options: [
          { value: 'normal', label: 'Normal' },
          { value: 'italic', label: 'Itálico' },
        ]},
        { key: 'fontColorAnnotation', label: 'Cor da Fonte', type: 'text', placeholder: 'Digite a cor da fonte' },
        { key: 'backgroundColorAnnotation', label: 'Cor de Fundo', type: 'text', placeholder: 'Digite a cor de fundo' },
        { key: 'borderColorAnnotation', label: 'Cor da Borda', type: 'text', placeholder: 'Digite a cor da borda' },
      ];
      break;

    case 'bpmn:Group':
      typeSpecificFields = [
        { key: 'categoryValueRef', label: 'Referência do Valor da Categoria', type: 'text', placeholder: 'Digite a referência da categoria' },
        { key: 'borderColorGroup', label: 'Cor da Borda', type: 'text', placeholder: 'Digite a cor da borda' },
        { key: 'backgroundColorGroup', label: 'Cor de Fundo', type: 'text', placeholder: 'Digite a cor de fundo' },
        { key: 'fontColorGroup', label: 'Cor da Fonte', type: 'text', placeholder: 'Digite a cor da fonte' },
        { key: 'fontSizeGroup', label: 'Tamanho da Fonte', type: 'text', placeholder: 'Digite o tamanho da fonte' },
      ];
      break;

    case 'bpmn:Association':
      typeSpecificFields = [
        { key: 'sourceRef', label: 'Origem', type: 'text', readOnly: true },
        { key: 'targetRef', label: 'Destino', type: 'text', readOnly: true },
        { key: 'associationDirection', label: 'Direção da Associação', type: 'select', options: [
          { value: 'None', label: 'Nenhuma' },
          { value: 'One', label: 'Uma' },
          { value: 'Both', label: 'Ambas' },
        ]},
      ];
      break;

    case 'bpmn:Collaboration':
      typeSpecificFields = [
        { key: 'workspaceName', label: 'Nome do Workspace', type: 'text', placeholder: 'Digite o nome do workspace' },
      ];
      break;
  }

  // Combine default fields, type-specific fields, and custom fields
  return [...defaultFields, ...typeSpecificFields, ...customFields];
}, [selectedElement, elementType, customPropertyFields]);

  /**
   * Update properties when selected element changes
   */
  useEffect(() => {
    if (selectedElement && modeler) {
      const extractedProperties = extractElementProperties(selectedElement);
      setProperties(extractedProperties);
      setElementType(selectedElement.type || '');
    } else {
      setProperties(null);
      setElementType('');
    }
  }, [selectedElement, modeler, extractElementProperties]);

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      isMounted.current = false;
      debouncedUpdateProperties.cancel();
    };
  }, [debouncedUpdateProperties]);

  /**
   * Render a property field based on its type
   */
  const renderPropertyField = (field: PropertyField) => {
    if (!properties) return null;
    
    const value = properties[field.key] !== undefined ? properties[field.key] : '';
    const isFieldReadOnly = readOnly || field.readOnly;
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={`property-${field.key}`}
            value={value}
            onChange={(e) => handlePropertyChange(field.key, e.target.value)}
            placeholder={field.placeholder || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isFieldReadOnly}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            id={`property-${field.key}`}
            value={value}
            onChange={(e) => handlePropertyChange(field.key, e.target.value)}
            placeholder={field.placeholder || ''}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isFieldReadOnly}
          />
        );
      
      case 'select':
        return (
          <select
            id={`property-${field.key}`}
            value={value}
            onChange={(e) => handlePropertyChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isFieldReadOnly}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`property-${field.key}`}
              checked={!!value}
              onChange={(e) => handlePropertyChange(field.key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isFieldReadOnly}
            />
            <label htmlFor={`property-${field.key}`} className="ml-2 block text-sm text-gray-900">
              {field.label}
            </label>
          </div>
        );
      
      case 'number':
        return (
          <input
            type="number"
            id={`property-${field.key}`}
            value={value}
            onChange={(e) => handlePropertyChange(field.key, parseFloat(e.target.value))}
            placeholder={field.placeholder || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isFieldReadOnly}
          />
        );
      
      default:
        return null;
    }
  };

  // If the panel is not visible, return null
  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`bpmn-properties-panel ${className} ${isExpanded ? 'expanded' : 'collapsed'}`}
      style={{
        width: isExpanded ? '300px' : '30px',
        transition: 'width 0.3s ease',
        backgroundColor: '#f8f8f8',
        borderLeft: '1px solid #ccc',
        height: '100%',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Toggle button */}
      {toggleable && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="toggle-button p-1 bg-gray-200 hover:bg-gray-300 rounded-md m-1"
          title={isExpanded ? 'Collapse panel' : 'Expand panel'}
        >
          {isExpanded ? '»' : '«'}
        </button>
      )}
      
      {/* Panel content */}
      {isExpanded && (
        <div className="panel-content p-4 overflow-y-auto h-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Properties</h3>
          
          {!selectedElement && (
            <p className="text-gray-500">Select an element to view its properties</p>
          )}
          
          {selectedElement && !properties && (
            <p className="text-gray-500">No editable properties for this element</p>
          )}
          
          {selectedElement && properties && (
            <div className="space-y-4">
              {getPropertyFields().map((field) => (
                <div key={field.key} className="property-field">
                  {field.type !== 'checkbox' && (
                    <label 
                      htmlFor={`property-${field.key}`} 
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {field.label}
                    </label>
                  )}
                  {renderPropertyField(field)}
                  {field.description && (
                    <p className="mt-1 text-xs text-gray-500">{field.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BpmnPropertiesPanel;
