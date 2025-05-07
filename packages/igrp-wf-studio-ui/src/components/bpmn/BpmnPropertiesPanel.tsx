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
    if (!element || element.type === 'bpmn:Process' || element.type === 'bpmn:Collaboration') {
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
    if (element.type === 'bpmn:Task' || element.type.includes('Task')) {
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
    }

    // Extract custom extension elements if available
    if (businessObject.extensionElements && 
        businessObject.extensionElements.values && 
        businessObject.extensionElements.values.length > 0) {
      
      businessObject.extensionElements.values.forEach((extension: any) => {
        if (extension.$type === 'camunda:Properties' && extension.values) {
          extension.values.forEach((prop: any) => {
            properties[`extension_${prop.name}`] = prop.value;
          });
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
    
    // Find the element in the registry (to ensure we're working with the latest version)
    const element = elementRegistry.get(selectedElement.id);
    if (!element) return;

    // Prepare the properties to update
    const propertiesToUpdate: any = {};
    
    // Handle name property
    if (updatedProperties.name !== undefined) {
      propertiesToUpdate.name = updatedProperties.name;
    }
    
    // Handle documentation
    if (updatedProperties.documentation !== undefined) {
      const documentationElement = modeler.get('moddle').create('bpmn:Documentation', {
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
        const expressionElement = modeler.get('moddle').create('bpmn:FormalExpression', {
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
    }
    
    // Update extension elements if needed
    const extensionProps = Object.keys(updatedProperties).filter(key => key.startsWith('extension_'));
    if (extensionProps.length > 0) {
      // This is a simplified approach - in a real implementation, you would need to
      // properly handle the creation and updating of extension elements
      const moddle = modeler.get('moddle');
      const extensionElements = element.businessObject.extensionElements || 
                               moddle.create('bpmn:ExtensionElements');
      
      let camundaProperties = extensionElements.values?.find(
        (ext: any) => ext.$type === 'camunda:Properties'
      );
      
      if (!camundaProperties) {
        camundaProperties = moddle.create('camunda:Properties');
        extensionElements.values = extensionElements.values || [];
        extensionElements.values.push(camundaProperties);
      }
      
      camundaProperties.values = camundaProperties.values || [];
      
      extensionProps.forEach(key => {
        const propName = key.replace('extension_', '');
        const existingProp = camundaProperties.values.find(
          (p: any) => p.name === propName
        );
        
        if (existingProp) {
          existingProp.value = updatedProperties[key];
        } else {
          const newProp = moddle.create('camunda:Property', {
            name: propName,
            value: updatedProperties[key]
          });
          camundaProperties.values.push(newProp);
        }
      });
      
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
    // Default fields for all element types
    const defaultFields: PropertyField[] = [
      { key: 'id', label: 'ID', type: 'text', readOnly: true },
      { key: 'name', label: 'Name', type: 'text', placeholder: 'Enter element name' },
      { key: 'documentation', label: 'Documentation', type: 'textarea', placeholder: 'Enter documentation' }
    ];
    
    // If no element is selected or it's a process/collaboration, return empty array
    if (!selectedElement || !elementType || 
        elementType === 'bpmn:Process' || 
        elementType === 'bpmn:Collaboration') {
      return [];
    }
    
    // Check if there are custom fields defined for this element type
    if (customPropertyFields[elementType]) {
      return [...defaultFields, ...customPropertyFields[elementType]];
    }
    
    // Add specific fields based on element type
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
    } else if (elementType === 'bpmn:DataObject') {
      typeSpecificFields = [
        { key: 'isCollection', label: 'Is Collection', type: 'checkbox' }
      ];
    } else if (elementType === 'bpmn:Event' || elementType.includes('Event')) {
      typeSpecificFields = [
        { key: 'isInterrupting', label: 'Is Interrupting', type: 'checkbox' }
      ];
    }
    
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
