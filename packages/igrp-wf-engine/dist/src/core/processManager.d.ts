import { ProcessDefinition, FileOperationResult } from '../types';
/**
 * ProcessManager class for managing BPMN process definitions
 */
export declare class ProcessManager {
    private basePath;
    constructor(basePath?: string);
    /**
     * Sets the base path for the project
     */
    setBasePath(basePath: string): void;
    /**
     * Reads a process definition BPMN file
     */
    readProcessDefinition(appCode: string, areaCode: string, processCode: string, subareaCode?: string): Promise<ProcessDefinition | null>;
    /**
     * Saves a process definition BPMN file
     */
    saveProcessDefinition(appCode: string, areaCode: string, processCode: string, bpmnXml: string, subareaCode?: string): Promise<FileOperationResult>;
    /**
     * Updates a process definition (metadata and content)
     */
    updateProcessDefinition(appCode: string, areaCode: string, processCode: string, updates: {
        title?: string;
        description?: string;
        status?: 'active' | 'inactive' | 'draft';
        bpmnXml?: string;
    }, subareaCode?: string): Promise<FileOperationResult>;
    /**
     * Creates a new process definition with empty BPMN content
     */
    createEmptyProcessDefinition(appCode: string, areaCode: string, processCode: string, title: string, subareaCode?: string): Promise<FileOperationResult>;
}
