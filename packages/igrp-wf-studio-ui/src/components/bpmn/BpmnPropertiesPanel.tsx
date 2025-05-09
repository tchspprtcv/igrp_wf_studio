import React, { useEffect, useState, useRef, useCallback } from 'react';
import { debounce } from 'lodash';

/**
 * Interface for BPMN element properties
 * This represents the common properties that can be edited for BPMN elements
 */
interface BpmnElementProperties {
  id: string;
  name?: string;
  documentation?: string;
  versionTag?: string;
  isExecutable?: boolean;
  jobPriority?: string;
  historyTimeToLive?: string;
  taskPriority?: string;
  isInterrupting?: boolean;
  isAsync?: boolean;
  isForCompensation?: boolean;
  gatewayDirection?: string;
  conditionExpression?: string;
  isImmediate?: boolean;
  isCollection?: boolean;
  [key: string]: any; // For additional custom properties
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

    // Extract additional properties based on element type
    // Handle bpmn:Process and bpmn:Collaboration first to ensure their specific properties are captured
    if (element.type === 'bpmn:Process') {
      properties.versionTag = businessObject.versionTag || '';
      properties.isExecutable = businessObject.isExecutable || false;
      properties.jobPriority = businessObject.jobPriority || '';
      properties.historyTimeToLive = businessObject.historyTimeToLive || '';
      // For taskPriority (Activiti extension)
      if (businessObject.extensionElements && businessObject.extensionElements.values) {
        const activitiProps = businessObject.extensionElements.values.find((ext: any) => ext.$type === 'activiti:Properties');
        if (activitiProps && activitiProps.values) {
          const taskPriorityProp = activitiProps.values.find((p: any) => p.name === 'taskPriority');
          if (taskPriorityProp) {
            properties.taskPriority = taskPriorityProp.value;
          }
        }
      }
    } else if (element.type === 'bpmn:Collaboration') {
      // Add any specific collaboration properties here if needed in the future
      // For now, it will fall through to common properties like ID, name, documentation
    } else if (element.type === 'bpmn:Task' || element.type.includes('Task')) {
      properties.isAsync = businessObject.isAsync || false;
      properties.isForCompensation = businessObject.isForCompensation || false;
    } else if (element.type === 'bpmn:Gateway') {
      properties.gatewayDirection = businessObject.gatewayDirection || 'Unspecified';
    } else if (element.type === 'bpmn:SequenceFlow') {
      properties.conditionExpression = businessObject.conditionExpression?.body || '';
      properties.isImmediate = businessObject.isImmediate || false;
    } else if (element.type === 'bpmn:DataObject') {
      properties.isCollection = businessObject.isCollection || false;
    } else if (element.type === 'bpmn:Event' || element.type.includes('Event')) {
      properties.isInterrupting = businessObject.isInterrupting !== false; // Default to true
    } else if (element.type === 'bpmn:Process') {
      properties.versionTag = businessObject.versionTag || '';
      properties.isExecutable = businessObject.isExecutable || false;
      properties.jobPriority = businessObject.jobPriority || '';
      properties.historyTimeToLive = businessObject.historyTimeToLive || '';
      // For taskPriority (Activiti extension)
      if (businessObject.extensionElements && businessObject.extensionElements.values) {
        const activitiProps = businessObject.extensionElements.values.find((ext: any) => ext.$type === 'activiti:Properties');
        if (activitiProps && activitiProps.values) {
          const taskPriorityProp = activitiProps.values.find((p: any) => p.name === 'taskPriority');
          if (taskPriorityProp) {
            properties.taskPriority = taskPriorityProp.value;
          }
        }
      }
    }

    // Extract custom extension elements if available
    if (businessObject.extensionElements && 
        businessObject.extensionElements.values && 
        businessObject.extensionElements.values.length > 0) {
      
      businessObject.extensionElements.values.forEach((extension: any) => {
        if (extension.$type === 'camunda:Properties' && extension.values) {
          extension.values.forEach((prop: any) => {
            properties[`extension_camunda_${prop.name}`] = prop.value;
          });
        } else if (extension.$type === 'custom:DataObjectProperties') {
          // Properties from CustomPropertiesProvider for DataObjects
          if (extension.dataType !== undefined) properties.dataType = extension.dataType;
          if (extension.isCollection !== undefined) properties.isCollection = extension.isCollection;
        } else if (extension.$type === 'custom:ArtifactProperties') {
          // Properties from CustomPropertiesProvider for Artifacts
          if (element.type === 'bpmn:TextAnnotation') {
            if (extension.textFormat !== undefined) properties.textFormat = extension.textFormat;
            if (extension.includeInHistory !== undefined) properties.includeInHistory = extension.includeInHistory;
            // Visual properties for TextAnnotation (assuming they are stored similarly or need specific handling)
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
   */
  const updateElementProperties = useCallback((updatedProperties: BpmnElementProperties) => {
    if (!selectedElement || !modeler || readOnly) return;

    const modeling = modeler.get('modeling');
    const elementRegistry = modeler.get('elementRegistry');
    const moddle = modeler.get('moddle'); // Moved moddle declaration here
    
    // Find the element in the registry (to ensure we're working with the latest version)
    const element = elementRegistry.get(selectedElement.id);
    if (!element) return;

    // Prepare the properties to update
    const propertiesToUpdate: any = {};
    let needsExtensionElementsUpdate = false; // Initialize here as it's used in the Process block
    
    // Handle name property
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
    
    // Handle specific element type properties
    if (element.type === 'bpmn:Task' || element.type.includes('Task')) {
      if (updatedProperties.isAsync !== undefined) {
        propertiesToUpdate.isAsync = updatedProperties.isAsync;
      }
      if (updatedProperties.isForCompensation !== undefined) {
        propertiesToUpdate.isForCompensation = updatedProperties.isForCompensation;
      }
    } else if (element.type === 'bpmn:Gateway') {
      if (updatedProperties.gatewayDirection !== undefined) {
        propertiesToUpdate.gatewayDirection = updatedProperties.gatewayDirection;
      }
    } else if (element.type === 'bpmn:SequenceFlow') {
      if (updatedProperties.conditionExpression !== undefined) {
        const expressionElement = moddle.create('bpmn:FormalExpression', {
          body: updatedProperties.conditionExpression
        });
        propertiesToUpdate.conditionExpression = expressionElement;
      }
      if (updatedProperties.isImmediate !== undefined) {
        propertiesToUpdate.isImmediate = updatedProperties.isImmediate;
      }
    } else if (element.type === 'bpmn:DataObject') {
      if (updatedProperties.isCollection !== undefined) {
        propertiesToUpdate.isCollection = updatedProperties.isCollection;
      }
    } else if (element.type === 'bpmn:Event' || element.type.includes('Event')) {
      if (updatedProperties.isInterrupting !== undefined) {
        propertiesToUpdate.isInterrupting = updatedProperties.isInterrupting;
      }
    } else if (element.type === 'bpmn:Process') {
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
      // For taskPriority (Activiti extension)
      if (updatedProperties.taskPriority !== undefined) {
        let extensionElements = element.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');
        let activitiProperties = extensionElements.values?.find((ext: any) => ext.$type === 'activiti:Properties');
        if (!activitiProperties) {
          activitiProperties = moddle.create('activiti:Properties');
          extensionElements.values = extensionElements.values || [];
          extensionElements.values.push(activitiProperties);
        }
        activitiProperties.values = activitiProperties.values || [];
        let taskPriorityProp = activitiProperties.values.find((p: any) => p.name === 'taskPriority');
        if (taskPriorityProp) {
          taskPriorityProp.value = updatedProperties.taskPriority;
        } else {
          taskPriorityProp = moddle.create('activiti:Property', { name: 'taskPriority', value: updatedProperties.taskPriority });
          activitiProperties.values.push(taskPriorityProp);
        }
        propertiesToUpdate.extensionElements = extensionElements;
        needsExtensionElementsUpdate = true; // Ensure this flag is set if not already handled by other custom props
      }
    }
    
    let extensionElements = element.businessObject.extensionElements || 
                            moddle.create('bpmn:ExtensionElements');
    // needsExtensionElementsUpdate is already declared and potentially set above

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

    // Handle Camunda extension properties
    const camundaExtensionProps = Object.keys(updatedProperties).filter(key => key.startsWith('extension_camunda_'));
    if (camundaExtensionProps.length > 0) {
      let camundaProperties = getOrCreateExtension('camunda:Properties');
      camundaProperties.values = camundaProperties.values || [];
      camundaExtensionProps.forEach(key => {
        const propName = key.replace('extension_camunda_', '');
        const existingProp = camundaProperties.values.find((p: any) => p.name === propName);
        if (existingProp) {
          existingProp.value = updatedProperties[key];
        } else {
          const newProp = moddle.create('camunda:Property', { name: propName, value: updatedProperties[key] });
          camundaProperties.values.push(newProp);
        }
      });
      needsExtensionElementsUpdate = true;
    }

    // Handle custom:DataObjectProperties
    if (element.type === 'bpmn:DataObjectReference' || element.type === 'bpmn:DataObject') {
      const dataObjectPropsToUpdate: any = {};
      if (updatedProperties.dataType !== undefined) dataObjectPropsToUpdate.dataType = updatedProperties.dataType;
      if (updatedProperties.isCollection !== undefined) dataObjectPropsToUpdate.isCollection = updatedProperties.isCollection;
      if (Object.keys(dataObjectPropsToUpdate).length > 0) {
        const customDataObjectProps = getOrCreateExtension('custom:DataObjectProperties');
        Object.assign(customDataObjectProps, dataObjectPropsToUpdate);
        needsExtensionElementsUpdate = true;
      }
    }

    // Handle custom:ArtifactProperties
    if (element.type === 'bpmn:TextAnnotation' || element.type === 'bpmn:Group') {
      const artifactPropsToUpdate: any = {};
      if (element.type === 'bpmn:TextAnnotation') {
        if (updatedProperties.textFormat !== undefined) artifactPropsToUpdate.textFormat = updatedProperties.textFormat;
        if (updatedProperties.includeInHistory !== undefined) artifactPropsToUpdate.includeInHistory = updatedProperties.includeInHistory;
        if (updatedProperties.fontSizeAnnotation !== undefined) artifactPropsToUpdate.fontSize = updatedProperties.fontSizeAnnotation;
        if (updatedProperties.fontWeightAnnotation !== undefined) artifactPropsToUpdate.fontWeight = updatedProperties.fontWeightAnnotation;
        if (updatedProperties.fontStyleAnnotation !== undefined) artifactPropsToUpdate.fontStyle = updatedProperties.fontStyleAnnotation;
        if (updatedProperties.fontColorAnnotation !== undefined) artifactPropsToUpdate.fontColor = updatedProperties.fontColorAnnotation;
        if (updatedProperties.backgroundColorAnnotation !== undefined) artifactPropsToUpdate.backgroundColor = updatedProperties.backgroundColorAnnotation;
        if (updatedProperties.borderColorAnnotation !== undefined) artifactPropsToUpdate.borderColor = updatedProperties.borderColorAnnotation;
      } else if (element.type === 'bpmn:Group') {
        if (updatedProperties.categoryValueRef !== undefined) artifactPropsToUpdate.categoryValueRef = updatedProperties.categoryValueRef;
        if (updatedProperties.borderColorGroup !== undefined) artifactPropsToUpdate.borderColor = updatedProperties.borderColorGroup;
        if (updatedProperties.backgroundColorGroup !== undefined) artifactPropsToUpdate.backgroundColor = updatedProperties.backgroundColorGroup;
        if (updatedProperties.fontColorGroup !== undefined) artifactPropsToUpdate.fontColor = updatedProperties.fontColorGroup;
        if (updatedProperties.fontSizeGroup !== undefined) artifactPropsToUpdate.fontSize = updatedProperties.fontSizeGroup;
      }
      if (Object.keys(artifactPropsToUpdate).length > 0) {
        const customArtifactProps = getOrCreateExtension('custom:ArtifactProperties');
        Object.assign(customArtifactProps, artifactPropsToUpdate);
        needsExtensionElementsUpdate = true;
      }
    }
    
    // Handle custom:WorkspaceProperties
    if (element.type === 'bpmn:Process' || element.type === 'bpmn:Collaboration') {
        if (updatedProperties.workspaceName !== undefined) {
            const customWorkspaceProps = getOrCreateExtension('custom:WorkspaceProperties');
            customWorkspaceProps.workspaceName = updatedProperties.workspaceName;
            needsExtensionElementsUpdate = true;
        }
    }

    if (needsExtensionElementsUpdate) {
      propertiesToUpdate.extensionElements = extensionElements;
    }
    
    // Apply the updates
    modeling.updateProperties(element, propertiesToUpdate);
    
    // Notify parent component if callback is provided
    if (onPropertiesUpdated) {
      onPropertiesUpdated(element, updatedProperties);
    }
  }, [selectedElement, modeler, readOnly, onPropertiesUpdated]);

  // Debounced version of updateElementProperties to avoid too many updates
  const debouncedUpdateProperties = useCallback(
    debounce((props: BpmnElementProperties) => {
      if (isMounted.current) {
        updateElementProperties(props);
      }
    }, 300),
    [updateElementProperties]
  );

  /**
   * Handle input change for property fields
   */
  const handlePropertyChange = (key: string, value: any) => {
    if (!properties || readOnly) return;
    
    const updatedProperties = { ...properties, [key]: value };
    setProperties(updatedProperties);
    debouncedUpdateProperties(updatedProperties);
  };

  /**
   * Get the appropriate property fields based on the element type
   */
  const getPropertyFields = useCallback((): PropertyField[] => {
    const defaultFields: PropertyField[] = [
      { key: 'id', label: 'ID', type: 'text', readOnly: true },
      { key: 'name', label: 'Name', type: 'text', placeholder: 'Enter element name' },
      { key: 'teste', label: 'teste', type: 'text', placeholder: 'Enter teste name' },
      { key: 'documentation', label: 'Documentation', type: 'textarea', placeholder: 'Enter documentation' }
    ];

    if (!selectedElement || !elementType) {
      return []; // No element, no properties
    }

    // Handle custom properties first: if they exist and are non-empty, they take precedence.
    if (customPropertyFields[elementType] && customPropertyFields[elementType].length > 0) {
      return [...defaultFields, ...customPropertyFields[elementType]];
    }

    // If no overriding custom properties, define type-specific fields.
    let typeSpecificFields: PropertyField[] = [];

    if (elementType === 'bpmn:Task' || elementType.includes('Task')) {
      typeSpecificFields = [
        { key: 'isAsync', label: 'Asynchronous', type: 'checkbox' },
        { key: 'isForCompensation', label: 'For Compensation', type: 'checkbox' }
      ];
    } else if (elementType === 'bpmn:Gateway') {
      typeSpecificFields = [
        { 
          key: 'gatewayDirection', 
          label: 'Gateway Direction', 
          type: 'select',
          options: [
            { value: 'Unspecified', label: 'Unspecified' },
            { value: 'Converging', label: 'Converging' },
            { value: 'Diverging', label: 'Diverging' },
            { value: 'Mixed', label: 'Mixed' }
          ]
        }
      ];
    } else if (elementType === 'bpmn:SequenceFlow') {
      typeSpecificFields = [
        { key: 'conditionExpression', label: 'Condition Expression', type: 'textarea' },
        { key: 'isImmediate', label: 'Is Immediate', type: 'checkbox' }
      ];
    } else if (elementType === 'bpmn:DataObject' || elementType === 'bpmn:DataObjectReference') {
      typeSpecificFields = [
        { key: 'dataType', label: 'Data Type (Custom)', type: 'text', placeholder: 'Enter data type' },
        { key: 'isCollection', label: 'Is Collection (Custom)', type: 'checkbox' } 
      ];
    } else if (elementType === 'bpmn:Event' || elementType.includes('Event')) {
      typeSpecificFields = [
        { key: 'isInterrupting', label: 'Is Interrupting', type: 'checkbox' }
      ];
    } else if (elementType === 'bpmn:TextAnnotation') {
      typeSpecificFields = [
        { key: 'textFormat', label: 'Text Format', type: 'text', placeholder: 'e.g., text/plain', description: 'MIME type of the text' },
        { key: 'includeInHistory', label: 'Include in History', type: 'checkbox', description: 'Include in historical data' },
        { key: 'fontSizeAnnotation', label: 'Font Size', type: 'text', placeholder: 'e.g., 12px' },
        { key: 'fontWeightAnnotation', label: 'Font Weight', type: 'text', placeholder: 'e.g., bold' },
        { key: 'fontStyleAnnotation', label: 'Font Style', type: 'text', placeholder: 'e.g., italic' },
        { key: 'fontColorAnnotation', label: 'Font Color', type: 'text', placeholder: 'e.g., #FF0000' },
        { key: 'backgroundColorAnnotation', label: 'Background Color', type: 'text', placeholder: 'e.g., #FFFF00' },
        { key: 'borderColorAnnotation', label: 'Border Color', type: 'text', placeholder: 'e.g., #0000FF' },
      ];
    } else if (elementType === 'bpmn:Group') {
      typeSpecificFields = [
        { key: 'categoryValueRef', label: 'Category Value Ref', type: 'text', placeholder: 'Enter category reference', description: 'Reference to a category value' },
        { key: 'borderColorGroup', label: 'Border Color', type: 'text', placeholder: 'e.g., #00FF00' },
        { key: 'backgroundColorGroup', label: 'Background Color', type: 'text', placeholder: 'e.g., #E0E0E0' },
        { key: 'fontColorGroup', label: 'Font Color', type: 'text', placeholder: 'e.g., #333333' },
        { key: 'fontSizeGroup', label: 'Font Size', type: 'text', placeholder: 'e.g., 14px' },
      ];
    } else if (elementType === 'bpmn:Process') {
        typeSpecificFields = [
            { key: 'versionTag', label: 'Version Tag', type: 'text', placeholder: 'Enter version tag' },
            { key: 'isExecutable', label: 'Executable', type: 'checkbox' },
            { key: 'taskPriority', label: 'Task Priority', type: 'text', placeholder: 'Enter task priority' }, // Label simplificado
            { key: 'jobPriority', label: 'Job Priority', type: 'text', placeholder: 'Enter job priority' }, // Label simplificado
            { key: 'historyTimeToLive', label: 'History Time To Live', type: 'text', placeholder: 'Enter history time to live' },
            // { key: 'workspaceName', label: 'Workspace Name', type: 'text', placeholder: 'Enter workspace name' } // Removido ou comentado se não for uma propriedade direta do processo Activiti
        ];
    } else if (elementType === 'bpmn:Collaboration') {
        typeSpecificFields = [
            { key: 'workspaceName', label: 'Workspace Name', type: 'text', placeholder: 'Enter workspace name' }
        ];
    }
    // For all types (including Process/Collaboration if custom fields were empty/not present),
    // combine default fields with the determined type-specific fields.
    return [...defaultFields, ...typeSpecificFields];
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
