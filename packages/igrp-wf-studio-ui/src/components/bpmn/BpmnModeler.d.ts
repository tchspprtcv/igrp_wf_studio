import React from 'react';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
interface BpmnModelerProps {
    xml?: string;
    onChange?: (xml: string) => void;
}
declare const BpmnModeler: React.FC<BpmnModelerProps>;
export default BpmnModeler;
//# sourceMappingURL=BpmnModeler.d.ts.map