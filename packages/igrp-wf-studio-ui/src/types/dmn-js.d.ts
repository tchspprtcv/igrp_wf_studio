/**
 * Declaração de tipos para dmn-js
 * Resolve o erro: Could not find a declaration file for module 'dmn-js/lib/Modeler'
 */

declare module 'dmn-js/lib/Modeler' {
  export default class DmnJS {
    constructor(options?: any);
    
    importXML(xml: string, callback: (err: Error | null, warnings?: Array<any>) => void): void;
    saveXML(options: any, callback: (err: Error | null, xml: string) => void): void;
    
    getActiveViewer(): any;
    getActiveView(): any;
    
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    
    destroy(): void;
    
    get(name: string): any;
  }
}

declare module 'dmn-js' {
  import DmnJS from 'dmn-js/lib/Modeler';
  export default DmnJS;
}
