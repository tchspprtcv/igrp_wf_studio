/**
 * IGRP Workflow Engine
 * Core business logic for workflow management
 */
// Export types
export * from './types';
// Export core functionality
export { WorkflowWorkspaceManager } from './core/workflowWorkspace.js';
export { ProcessManager } from './core/processManager.js';
// Export utility functions
export { ensureDir, writeFile, readFile, fileExists } from './utils/fileSystem.js';
export { generateAppOptionsTemplate, generateEmptyBpmnTemplate, generateProjectConfigTemplate } from './core/templates.js';
// Import required classes
import { WorkflowWorkspaceManager } from './core/workflowWorkspace.js';
import { ProcessManager } from './core/processManager.js';
import { appLogger as logger } from './utils/logger';
/**
 * Main SDK class that provides access to all functionality
 */
export class WorkflowEngineSDK {
    constructor(basePath = './') {
        logger.info('Initializing WorkflowEngineSDK with base path: %s', basePath);
        this.basePath = basePath;
        this.workspaces = new WorkflowWorkspaceManager(basePath);
        this.processes = new ProcessManager(basePath);
    }
    /**
     * Sets the base path for the project
     */
    setBasePath(basePath) {
        logger.info('Setting new base path: %s', basePath);
        this.basePath = basePath;
        this.workspaces.setBasePath(basePath);
        this.processes.setBasePath(basePath);
    }
}
