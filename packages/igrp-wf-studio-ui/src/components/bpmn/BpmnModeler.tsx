import React, { useEffect, useRef, useState } from 'react';
import BpmnJS from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css'; // Changed this line
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule,  } from 'bpmn-js-properties-panel';
//import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomPropertiesProvider from './CustomPropertiesProvider';
import ActivitiPropertiesProvider from './ActivitiPropertiesProvider';
import ZoomControls from './ZoomControls';
import BpmnPropertiesPanel from './BpmnPropertiesPanel'; // Added import
import customModdleDescriptor from './custom.json';
import activitiModdleDescriptor from '../../bpmn/activiti.json';

interface BpmnModelerProps {
  xml?: string;
  onChange?: (xml: string) => void;
  onLoad?: (modeler: BpmnJS) => void;
}

const BpmnModeler: React.FC<BpmnModelerProps> = ({ xml, onChange, onLoad }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // const propertiesPanelRef = useRef<HTMLDivElement>(null); // Removed propertiesPanelRef
  const modelerRef = useRef<BpmnJS | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [selectedElement, setSelectedElement] = useState<any>(null);

  // Define the default diagram XML as a string constant
  const DEFAULT_DIAGRAM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:activiti="http://activiti.org/bpmn" id="sample-diagram" targetNamespace="http://activiti.org/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:process id="Process_1" isExecutable="false">
    <bpmn2:startEvent id="StartEvent_1"/>
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds height="36.0" width="36.0" x="412.0" y="240.0"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;

  useEffect(() => {
    // if (!containerRef.current || !propertiesPanelRef.current) return; // Adjusted condition
    if (!containerRef.current) return;

    const modeler = new BpmnJS({
      container: containerRef.current,
      // propertiesPanel: { // Properties panel is now a separate component
      //   parent: propertiesPanelRef.current
      // },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        {
          __init__: ['customPropertiesProvider'],
          customPropertiesProvider: ['type', CustomPropertiesProvider]
        },
        {
          __init__: ['activitiPropertiesProvider'],
          activitiPropertiesProvider: ['type', ActivitiPropertiesProvider]
        }
      ],
      moddleExtensions: {
        // Support for both Camunda and Activiti
        //camunda: camundaModdleDescriptor,
        custom: customModdleDescriptor,
        activiti: activitiModdleDescriptor
      }
    });

    modelerRef.current = modeler;
    onLoad?.(modeler); // Call onLoad with the modeler instance

    // Load initial diagram
    if (xml) {
      modeler.importXML(xml);
    } else {
      createNewDiagram(modeler);
    }

    // Setup change events
    modeler.on('commandStack.changed', async () => {
      try {
        const { xml } = await modeler.saveXML({ format: true });
        // Ensure onChange is called only when xml is successfully retrieved
        if (xml) {
          onChange?.(xml);
        }
      } catch (err) {
        console.error('Failed to save BPMN XML:', err);
      }
    });

    // Track selected element
    modeler.on('selection.changed', (e: any) => {
      const { newSelection } = e;
      setSelectedElement(newSelection[0] || null);
      
      // Auto-expand panel when element is selected
      if (newSelection.length > 0 && isPanelCollapsed) {
        setIsPanelCollapsed(false);
      }
    });

    // Removed custom style injection and MutationObserver logic,
    // as the imported 'bpmn-js-properties-panel.css' should handle this.

    return () => {
      (modeler as any).destroy();
    };
  // }, [xml]); // Removed xml from dependencies as it's handled by importXML
  }, [onLoad, onChange]); // Adjusted dependencies

  const createNewDiagram = async (modeler: BpmnJS) => {
    try {
      //const newDiagramXML = newDiagramXML;

      await modeler.importXML(DEFAULT_DIAGRAM_XML);
      
      // Get the canvas and zoom to fit the viewport
      const canvas = (modeler as any).get('canvas'); // Cast modeler to any to access get method
      canvas.zoom('fit-viewport');
    } catch (err) {
      console.error('Failed to create new diagram:', err);
    }
  };

  const togglePanel = () => {
    setIsPanelCollapsed(!isPanelCollapsed);
  };

  return (
    <div className="flex h-full relative">
      <div ref={containerRef} className={cn(
        "flex-1 h-full transition-all duration-300 ease-in-out",
        isPanelCollapsed ? "mr-0" : "mr-96" // Adjust margin based on panel state
      )} />
      
      {/* Adicionar ZoomControls */}
      {modelerRef.current && <ZoomControls modeler={modelerRef.current} />}

      {/* Properties Panel Container */}
      <div className={cn(
        "absolute right-0 top-0 h-full flex transition-transform duration-300 ease-in-out",
        isPanelCollapsed ? "translate-x-full" : "translate-x-0",
        "z-10" // Ensure panel is above the modeler canvas
      )}>
        {/* Toggle Button */}
        <button
          onClick={togglePanel}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full",
            "bg-white border border-r-0 border-gray-300 rounded-l-md p-1.5 shadow-md",
            "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
            "transition-all duration-200 ease-in-out"
          )}
          title={isPanelCollapsed ? "Show Properties" : "Hide Properties"}
        >
          {isPanelCollapsed ? (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {/* BpmnPropertiesPanel Component */}
        <BpmnPropertiesPanel
          modeler={modelerRef.current}
          selectedElement={selectedElement}
          isVisible={!isPanelCollapsed}
          className={cn(
            "w-96 h-full bg-gray-50 border-l border-gray-300 shadow-lg overflow-y-auto",
            "transition-opacity duration-300",
            selectedElement ? "opacity-100" : "opacity-70" // Slight fade if no element selected
          )}
          // You might need to pass onPropertiesUpdated if your BpmnModeler needs to react to property changes
          // onPropertiesUpdated={(element, properties) => console.log('Properties updated', element, properties)}
        />
      </div>
    </div>
  );
};

export default BpmnModeler;