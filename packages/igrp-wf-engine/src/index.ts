/**
 * IGRP Workflow Engine
 * Core business logic for workflow management
 */

// Export types
export * from './types';

// Export core functionality
export { WorkflowWorkspaceManager } from './core/workflowWorkspace';
export { ProcessManager } from './core/processManager';

// Export utility functions
export { 
  ensureDir, 
  writeFile, 
  readFile, 
  fileExists 
} from './utils/fileSystem';

export { 
  generateAppOptionsTemplate, 
  generateEmptyBpmnTemplate,
  generateProjectConfigTemplate 
} from './core/templates';

// Import required classes
import { WorkflowWorkspaceManager } from './core/workflowWorkspace';
import { ProcessManager } from './core/processManager';
import { appLogger as logger } from './utils/logger';

/**
 * Main SDK class that provides access to all functionality
 */
export class WorkflowEngineSDK {
  private basePath: string;
  public workspaces: WorkflowWorkspaceManager;
  public processes: ProcessManager;

  constructor(basePath: string = './') {
    logger.info('Initializing WorkflowEngineSDK with base path: %s', basePath);
    this.basePath = basePath;
    this.workspaces = new WorkflowWorkspaceManager(basePath);
    this.processes = new ProcessManager(basePath);
  }

  /**
   * Sets the base path for the project
   */
  setBasePath(basePath: string): void {
    logger.info('Setting new base path: %s', basePath);
    this.basePath = basePath;
    this.workspaces.setBasePath(basePath);
    this.processes.setBasePath(basePath);
  }
}