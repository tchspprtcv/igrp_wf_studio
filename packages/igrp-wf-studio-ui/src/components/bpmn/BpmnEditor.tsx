import React, { useEffect, useRef, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

// Optional modules that can be passed to enhance functionality
import minimapModule from 'diagram-js-minimap';
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';

// Default BPMN template for new diagrams
const DEFAULT_DIAGRAM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="156" y="81" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="162" y="124" width="24" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

// Type definitions for props
interface BpmnEditorProps {
  // Initial BPMN XML to load (optional)
  initialDiagram?: string;
  // Callback when diagram changes
  onChange?: (newXml: string) => void;
  // Callback when an element is selected
  onElementSelect?: (element: any) => void;
  // Container height
  height?: string | number;
  // Container width
  width?: string | number;
  // Additional modules to load
  additionalModules?: any[];
  // Whether to show the properties panel
  showPropertiesPanel?: boolean;
  // Whether the editor is in read-only mode
  readOnly?: boolean;
  // Custom styling for the container
  containerStyle?: React.CSSProperties;
  // Custom class name for the container
  className?: string;
}

/**
 * BpmnEditor Component
 * 
 * A React component that integrates BPMN.js to provide a full-featured
 * BPMN diagram editor. This component handles the initialization of the
 * BPMN modeler, event listeners, and proper cleanup on unmount.
 * 
 * @param props - Component properties (see BpmnEditorProps interface)
 */
const BpmnEditor: React.FC<BpmnEditorProps> = ({
  initialDiagram = DEFAULT_DIAGRAM_XML,
  onChange,
  onElementSelect,
  height = '100%',
  width = '100%',
  additionalModules = [],
  showPropertiesPanel = false,
  readOnly = false,
  containerStyle = {},
  className = '',
}) => {
  // Reference to the container div element
  const containerRef = useRef<HTMLDivElement>(null);
  // Reference to the properties panel container
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  // State to store the BPMN modeler instance
  const [modeler, setModeler] = useState<any>(null);
  // State to track if the diagram has been imported
  const [diagramImported, setDiagramImported] = useState<boolean>(false);
  // State to store any import errors
  const [importError, setImportError] = useState<Error | null>(null);

  // Initialize the BPMN modeler when the component mounts
  useEffect(() => {
    if (!containerRef.current) return;

    // Determine which modules to include
    const modules = [...additionalModules];
    
    // Add minimap module if available
    if (minimapModule) {
      modules.push(minimapModule);
    }
    
    // Add properties panel modules if needed
    if (showPropertiesPanel && BpmnPropertiesPanelModule && BpmnPropertiesProviderModule) {
      modules.push(BpmnPropertiesPanelModule);
      modules.push(BpmnPropertiesProviderModule);
    }

    // Create a new BPMN modeler instance
    const bpmnModeler = new BpmnModeler({
      container: containerRef.current,
      propertiesPanel: showPropertiesPanel && propertiesPanelRef.current ? {
        parent: propertiesPanelRef.current
      } : undefined,
      additionalModules: modules,
      keyboard: { bindTo: document },
      // Set read-only mode if specified
      ...(readOnly ? { 
        keyboard: { bindTo: null },
        textAnnotation: { editingAllowed: false },
        contextPad: { enabled: false },
        palette: { enabled: false },
        bendpoints: { enabled: false },
        dragging: { enabled: false },
        resize: { enabled: false },
        move: { enabled: false },
        connect: { enabled: false },
        create: { enabled: false },
        spaceTool: { enabled: false },
        lassoTool: { enabled: false },
        handTool: { enabled: false },
        globalConnect: { enabled: false },
        editing: { enabled: false },
      } : {})
    });

    // Store the modeler instance in state
    setModeler(bpmnModeler);

    // Clean up function to destroy the modeler when component unmounts
    return () => {
      if (bpmnModeler) {
        bpmnModeler.destroy();
      }
    };
  }, [additionalModules, showPropertiesPanel, readOnly]);

  // Import the initial diagram when the modeler is ready
  useEffect(() => {
    if (modeler && !diagramImported) {
      try {
        // Import the BPMN diagram XML
        modeler.importXML(initialDiagram).then(({ warnings }: { warnings: any[] }) => {
          if (warnings && warnings.length) {
            console.warn('BPMN import warnings:', warnings);
          }
          
          // Adjust the view to fit the diagram
          modeler.get('canvas').zoom('fit-viewport', 'auto');
          setDiagramImported(true);
          setImportError(null);
        }).catch((err: Error) => {
          console.error('BPMN import error:', err);
          setImportError(err);
        });
      } catch (err) {
        console.error('BPMN import exception:', err);
        setImportError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }, [modeler, initialDiagram, diagramImported]);

  // Set up event listeners for diagram changes
  useEffect(() => {
    if (!modeler || !diagramImported) return;

    // Listen for changes to the diagram
    const eventBus = modeler.get('eventBus');
    const commandStack = modeler.get('commandStack');

    // Handler for when the diagram changes
    const onChanged = () => {
      if (onChange) {
        modeler.saveXML({ format: true }).then(({ xml }: { xml: string }) => {
          onChange(xml);
        }).catch((err: Error) => {
          console.error('Error saving BPMN XML:', err);
        });
      }
    };

    // Handler for element selection
    const onSelection = (e: any) => {
      if (onElementSelect) {
        const { element } = e;
        onElementSelect(element);
      }
    };

    // Register event listeners
    commandStack.on('changed', onChanged);
    eventBus.on('selection.changed', onSelection);
    eventBus.on('element.click', onSelection);

    // Clean up event listeners when component unmounts or when dependencies change
    return () => {
      commandStack.off('changed', onChanged);
      eventBus.off('selection.changed', onSelection);
      eventBus.off('element.click', onSelection);
    };
  }, [modeler, diagramImported, onChange, onElementSelect]);

  // Combine container styles
  const combinedContainerStyle: React.CSSProperties = {
    height,
    width,
    position: 'relative',
    ...containerStyle,
  };

  return (
    <div className={`bpmn-editor-container ${className}`} style={{ display: 'flex', height, width }}>
      {/* Main BPMN editor container */}
      <div 
        ref={containerRef} 
        className="bpmn-canvas" 
        style={{ 
          ...combinedContainerStyle,
          flex: showPropertiesPanel ? '3' : '1',
        }}
      />
      
      {/* Properties panel container (if enabled) */}
      {showPropertiesPanel && (
        <div 
          ref={propertiesPanelRef} 
          className="bpmn-properties-panel" 
          style={{ 
            flex: '1',
            maxWidth: '300px',
            height,
            overflow: 'auto',
            borderLeft: '1px solid #ccc',
            backgroundColor: '#f8f8f8',
          }}
        />
      )}
      
      {/* Error message display */}
      {importError && (
        <div className="bpmn-import-error" style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          padding: '10px',
          backgroundColor: 'rgba(255, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '4px',
          zIndex: 100,
        }}>
          Error importing BPMN diagram: {importError.message}
        </div>
      )}
    </div>
  );
};

export default BpmnEditor;
