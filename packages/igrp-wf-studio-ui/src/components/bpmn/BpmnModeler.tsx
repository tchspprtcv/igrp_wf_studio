import React, { useEffect, useRef, useState } from 'react';
import BpmnJS from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css'; // Changed this line
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomPropertiesProvider from './CustomPropertiesProvider';
import ActivitiPropertiesProvider from './ActivitiPropertiesProvider';
import customModdleDescriptor from './custom.json';
import activitiModdleDescriptor from '../../bpmn/activiti.json';

interface BpmnModelerProps {
  xml?: string;
  onChange?: (xml: string) => void;
}

const BpmnModeler: React.FC<BpmnModelerProps> = ({ xml, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnJS | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [selectedElement, setSelectedElement] = useState<any>(null);

  // Define the default diagram XML as a string constant
  const DEFAULT_DIAGRAM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
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
    if (!containerRef.current || !propertiesPanelRef.current) return;

    const modeler = new BpmnJS({
      container: containerRef.current,
      propertiesPanel: {
        parent: propertiesPanelRef.current
      },
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
        camunda: camundaModdleDescriptor,
        custom: customModdleDescriptor
        //activiti: activitiModdleDescriptor
      },
      keyboard: {
        bindTo: document
      }
    });

    modelerRef.current = modeler;

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

    // Apply custom styling to properties panel
    const propertiesPanel = propertiesPanelRef.current;
    if (propertiesPanel) {
      // The class 'bpp-properties-panel' might still be useful if you have global overrides
      // or if other parts of your application expect it.
      // propertiesPanel.classList.add('bpp-properties-panel');

      // Removed custom style injection and MutationObserver logic,
      // as the imported 'bpmn-js-properties-panel.css' should handle this.
    }

    return () => {
      (modeler as any).destroy();
    };
  }, [xml]);

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
        isPanelCollapsed ? "mr-0" : "mr-96"
      )} />
      
      <div className={cn(
        "absolute right-0 h-full flex transition-all duration-300 ease-in-out",
        isPanelCollapsed ? "translate-x-full" : "translate-x-0"
      )}>
        <button
          onClick={togglePanel}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full",
            "bg-white border border-gray-200 rounded-l-md p-1.5",
            "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500",
            "transition-colors duration-200"
          )}
          title={isPanelCollapsed ? "Show Properties" : "Hide Properties"}
        >
          {isPanelCollapsed ? (
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </button>
        <div ref={propertiesPanelRef} className={cn(
          "w-96 h-full bg-white border-l border-gray-200 overflow-auto",
          "shadow-lg transition-shadow duration-300",
          selectedElement ? "opacity-100" : "opacity-50"
        )} />
      </div>
    </div>
  );
};

export default BpmnModeler;