import React, { useEffect, useRef, useState } from 'react';
import BpmnJS from 'bpmn-js/lib/Modeler';
// import type Canvas from 'diagram-js/lib/core/Canvas'; // Removed Canvas import
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomPropertiesProvider from './custompropertiesprovider';
import ActivitiPropertiesProvider from './activitipropertiesprovider';
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
        //camunda: camundaModdleDescriptor,
         custom: customModdleDescriptor,
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
      propertiesPanel.classList.add('bpp-properties-panel');

      // Add custom styles for collapsible groups
      const style = document.createElement('style');
      style.textContent = `
        .bpp-properties-panel [data-group-id] {
          margin-bottom: 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .bpp-properties-panel [data-group-id] .group-header {
          cursor: pointer;
          user-select: none;
          padding: 0.75rem 1rem;
          background-color: #f9fafb;
          transition: background-color 0.2s;
        }

        .bpp-properties-panel [data-group-id] .group-header:hover {
          background-color: #f3f4f6;
        }

        .bpp-properties-panel [data-group-id] .group-header .group-label {
          font-weight: 500;
          color: #374151;
        }

        .bpp-properties-panel [data-group-id] .entries {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .bpp-properties-panel [data-group-id].collapsed .entries {
          display: none;
        }

        .bpp-properties-panel [data-group-id] .group-header::after {
          content: '';
          display: inline-block;
          width: 1rem;
          height: 1rem;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>');
          background-size: contain;
          transition: transform 0.2s;
          float: right;
        }

        .bpp-properties-panel [data-group-id].collapsed .group-header::after {
          transform: rotate(180deg);
        }
      `;
      document.head.appendChild(style);

      // Add click handlers for group headers
      const observer = new MutationObserver(() => {
        const groups = propertiesPanel.querySelectorAll('[data-group-id]');
        groups.forEach(group => {
          const header = group.querySelector('.group-header');
          if (header && !header.hasAttribute('data-click-handler')) {
            header.setAttribute('data-click-handler', 'true');
            header.addEventListener('click', () => {
              group.classList.toggle('collapsed');
            });
          }
        });
      });

      observer.observe(propertiesPanel, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      (modeler as any).destroy();
    };
  }, [xml]);

  const createNewDiagram = async (modeler: BpmnJS) => {
    try {
      const newDiagramXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                   id="Definitions_1"
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

      await modeler.importXML(newDiagramXML);
      
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