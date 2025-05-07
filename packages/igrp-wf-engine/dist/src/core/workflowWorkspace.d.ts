import { ProjectConfig, FileOperationResult, AppOptions } from '../types';
export declare class WorkflowWorkspaceManager {
    private basePath;
    constructor(basePath?: string);
    setBasePath(basePath: string): void;
    listWorkspaces(): Promise<AppOptions[]>;
    loadProjectConfig(appCode: string): Promise<ProjectConfig | null>;
    createWorkspace(code: string, title: string, description: string, status?: 'active' | 'inactive' | 'draft'): Promise<FileOperationResult>;
    deleteWorkspace(code: string): Promise<FileOperationResult>;
    updateWorkspaceOptions(code: string, updates: Partial<AppOptions>): Promise<FileOperationResult>;
    updateArea(appCode: string, areaCode: string, title: string, description: string, status: 'active' | 'inactive' | 'draft'): Promise<FileOperationResult>;
    updateSubArea(appCode: string, areaCode: string, subareaCode: string, title: string, description: string, status: 'active' | 'inactive' | 'draft'): Promise<FileOperationResult>;
    updateProcess(appCode: string, areaCode: string, processCode: string, title: string, description: string, status: 'active' | 'inactive' | 'draft', subareaCode?: string): Promise<FileOperationResult>;
    addArea(appCode: string, areaCode: string, title: string, description: string, status?: 'active' | 'inactive' | 'draft'): Promise<FileOperationResult>;
    addSubArea(appCode: string, areaCode: string, subareaCode: string, title: string, description: string, status?: 'active' | 'inactive' | 'draft'): Promise<FileOperationResult>;
    addProcessDefinition(appCode: string, areaCode: string, processCode: string, title: string, description: string, subareaCode?: string, status?: 'active' | 'inactive' | 'draft'): Promise<FileOperationResult>;
    deleteArea(appCode: string, areaCode: string): Promise<FileOperationResult>;
    deleteSubArea(appCode: string, areaCode: string, subareaCode: string): Promise<FileOperationResult>;
    deleteProcess(appCode: string, areaCode: string, processCode: string, subareaCode?: string): Promise<FileOperationResult>;
}
