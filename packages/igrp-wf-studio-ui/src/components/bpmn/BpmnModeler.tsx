import React, { useEffect, useRef, useState } from 'react';
import BpmnJS from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomPropertiesProvider from './CustomPropertiesProvider';
import ActivitiPropertiesProvider from './ActivitiPropertiesProvider';
import ZoomControls from './ZoomControls';
import customModdleDescriptor from './custom.json';
import activitiModdleDescriptor from '../../bpmn/activiti.json';

// Importar o componente de painel de propriedades customizado
import BpmnPropertiesPanel from './BpmnPropertiesPanel';

interface BpmnModelerProps {
  xml?: string;
  onChange?: (xml: string) => void;
  onLoad?: (modeler: BpmnJS) => void;
}

const BpmnModeler: React.FC<BpmnModelerProps> = ({ xml, onChange, onLoad }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Remover a referência direta ao painel de propriedades DOM
  // const propertiesPanelRef = useRef<HTMLDivElement>(null);
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
    if (!containerRef.current) return;

    const modeler = new BpmnJS({
      container: containerRef.current,
      // Remover a injeção do painel de propriedades padrão
      /*propertiesPanel: {
         parent: propertiesPanelRef.current
      },*/
      additionalModules: [
        // Manter os módulos para compatibilidade com o editor
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
        custom: customModdleDescriptor,
        activiti: activitiModdleDescriptor
      }
    });

    modelerRef.current = modeler;
    onLoad?.(modeler);

    // Inicializar o canvas e criar as camadas necessárias
    const canvas = modeler.get('canvas');
    
    // Garantir que o diagrama seja renderizado antes de qualquer operação
    setTimeout(() => {
      // Inicializar com um diagrama vazio para garantir que as camadas sejam criadas
      if (xml) {
        // Usar Promise API para importXML
        modeler.importXML(xml)
          .then(result => {
            const { warnings } = result;
            if (warnings && warnings.length) {
              console.warn('Warnings during BPMN import:', warnings);
            }
            // Ajustar o zoom após a importação
            (canvas as any).zoom('fit-viewport');
          })
          .catch(err => {
            console.error('Error importing BPMN XML:', err);
            // Em caso de erro, criar um diagrama padrão
            createNewDiagram(modeler);
          });
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
    }, 100); // Pequeno atraso para garantir que o DOM esteja pronto

    return () => {
      (modeler as any).destroy();
    };
  }, [onLoad, onChange, xml]); // Adicionado xml de volta às dependências

  const createNewDiagram = async (modeler: BpmnJS) => {
    try {
      // Garantir que o canvas esteja inicializado
      const canvas = modeler.get('canvas');
      
      // Usar Promise API para importXML
      const result = await modeler.importXML(DEFAULT_DIAGRAM_XML);
      const { warnings } = result;
      if (warnings && warnings.length) {
        console.warn('Warnings during default diagram import:', warnings);
      }
      
      // Ajustar o zoom após a importação
      (canvas as any).zoom('fit-viewport');
      
      // Notificar a mudança
      onChange?.(DEFAULT_DIAGRAM_XML);
    } catch (err) {
      console.error('Error creating new diagram:', err);
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

function zoom(arg0: string) {
  throw new Error('Function not implemented.');
}
