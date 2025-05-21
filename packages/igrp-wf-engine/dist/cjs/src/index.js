"use strict";
/**
 * IGRP Workflow Engine
 * Core business logic for workflow management
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngineSDK = exports.generateProjectConfigTemplate = exports.generateEmptyBpmnTemplate = exports.generateAppOptionsTemplate = exports.fileExists = exports.readFile = exports.writeFile = exports.ensureDir = exports.ProcessManager = exports.WorkflowWorkspaceManager = void 0;
// Export types
__exportStar(require("./types"), exports);
// Export core functionality
var workflowWorkspace_js_1 = require("./core/workflowWorkspace.js");
Object.defineProperty(exports, "WorkflowWorkspaceManager", { enumerable: true, get: function () { return workflowWorkspace_js_1.WorkflowWorkspaceManager; } });
var processManager_js_1 = require("./core/processManager.js");
Object.defineProperty(exports, "ProcessManager", { enumerable: true, get: function () { return processManager_js_1.ProcessManager; } });
// Export utility functions
var fileSystem_js_1 = require("./utils/fileSystem.js");
Object.defineProperty(exports, "ensureDir", { enumerable: true, get: function () { return fileSystem_js_1.ensureDir; } });
Object.defineProperty(exports, "writeFile", { enumerable: true, get: function () { return fileSystem_js_1.writeFile; } });
Object.defineProperty(exports, "readFile", { enumerable: true, get: function () { return fileSystem_js_1.readFile; } });
Object.defineProperty(exports, "fileExists", { enumerable: true, get: function () { return fileSystem_js_1.fileExists; } });
var templates_js_1 = require("./core/templates.js");
Object.defineProperty(exports, "generateAppOptionsTemplate", { enumerable: true, get: function () { return templates_js_1.generateAppOptionsTemplate; } });
Object.defineProperty(exports, "generateEmptyBpmnTemplate", { enumerable: true, get: function () { return templates_js_1.generateEmptyBpmnTemplate; } });
Object.defineProperty(exports, "generateProjectConfigTemplate", { enumerable: true, get: function () { return templates_js_1.generateProjectConfigTemplate; } });
// Import required classes
const workflowWorkspace_js_2 = require("./core/workflowWorkspace.js");
const processManager_js_2 = require("./core/processManager.js");
const logger_1 = require("./utils/logger");
/**
 * Main SDK class that provides access to all functionality
 */
class WorkflowEngineSDK {
    constructor(basePath = './') {
        logger_1.appLogger.info('Initializing WorkflowEngineSDK with base path: %s', basePath);
        this.basePath = basePath;
        this.workspaces = new workflowWorkspace_js_2.WorkflowWorkspaceManager(basePath);
        this.processes = new processManager_js_2.ProcessManager(basePath);
    }
    /**
     * Sets the base path for the project
     */
    setBasePath(basePath) {
        logger_1.appLogger.info('Setting new base path: %s', basePath);
        this.basePath = basePath;
        this.workspaces.setBasePath(basePath);
        this.processes.setBasePath(basePath);
    }
}
exports.WorkflowEngineSDK = WorkflowEngineSDK;
