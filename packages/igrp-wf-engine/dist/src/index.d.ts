/**
 * IGRP Workflow Engine
 * Core business logic for workflow management
 */
export * from './types';
export { WorkflowWorkspaceManager } from './core/workflowWorkspace.js';
export { ProcessManager } from './core/processManager.js';
export { ensureDir, writeFile, readFile, fileExists } from './utils/fileSystem.js';
export { generateAppOptionsTemplate, generateEmptyBpmnTemplate, generateProjectConfigTemplate } from './core/templates.js';
import { WorkflowWorkspaceManager } from './core/workflowWorkspace.js';
import { ProcessManager } from './core/processManager.js';
/**
 * Main SDK class that provides access to all functionality
 */
export declare class WorkflowEngineSDK {
    private basePath;
    workspaces: WorkflowWorkspaceManager;
    processes: ProcessManager;
    constructor(basePath?: string);
    /**
     * Sets the base path for the project
     */
    setBasePath(basePath: string): void;
}
