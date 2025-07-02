import { v4 as uuidv4 } from 'uuid';
import { writeFile, readFile, fileExists, ensureDir, remove, getWorkspaceDir } from '../utils/fileSystem';
import { generateAppOptionsTemplate, generateEmptyBpmnTemplate, generateProjectConfigTemplate } from './templates';
import { appLogger as logger } from '../utils/logger';
const isBrowser = typeof window !== 'undefined';
const path = !isBrowser ? require('node:path') : {
    join: (...paths) => paths.join('/'),
    dirname: (path) => {
        const parts = path.split('/');
        parts.pop();
        return parts.join('/');
    }
};
export class WorkflowWorkspaceManager {
    constructor(basePath = getWorkspaceDir()) {
        this.basePath = basePath;
        logger.info('Initialized WorkflowWorkspaceManager with base path: %s', basePath);
    }
    setBasePath(basePath) {
        logger.info('Setting new base path: %s', basePath);
        this.basePath = basePath;
    }
    async listWorkspaces() {
        try {
            logger.debug('Listing workspaces');
            if (isBrowser) {
                const apps = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key?.endsWith('app-options.json')) {
                        const content = localStorage.getItem(key);
                        if (content) {
                            try {
                                const app = JSON.parse(content);
                                apps.push(app);
                            }
                            catch (err) {
                                logger.error('Failed to parse app options: %O', err);
                            }
                        }
                    }
                }
                logger.info('Found %d workspaces in browser storage', apps.length);
                return apps;
            }
            const fs = require('node:fs').promises;
            const entries = await fs.readdir(this.basePath, { withFileTypes: true });
            const apps = [];
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const appOptionsPath = path.join(this.basePath, entry.name, 'app-options.json');
                    try {
                        const content = await readFile(appOptionsPath);
                        if (content) {
                            const app = JSON.parse(content);
                            apps.push(app);
                        }
                    }
                    catch (err) {
                        logger.error('Failed to read app options for %s: %O', entry.name, err);
                    }
                }
            }
            logger.info('Found %d workspaces in filesystem', apps.length);
            return apps;
        }
        catch (error) {
            logger.error('Failed to list workspaces: %O', error);
            return [];
        }
    }
    async loadProjectConfig(appCode) {
        try {
            logger.debug('Loading project config for workspace: %s', appCode);
            const configPath = path.join(this.basePath, appCode, 'project-config.json');
            const configContent = await readFile(configPath);
            if (!configContent) {
                logger.warn('No config found for workspace: %s', appCode);
                return null;
            }
            const config = JSON.parse(configContent);
            logger.info('Loaded project config for %s with %d areas', appCode, config.areas.length);
            return config;
        }
        catch (error) {
            logger.error('Failed to load project config: %O', error);
            return null;
        }
    }
    async createWorkspace(code, title, description, status = 'active') {
        try {
            logger.info('Creating new workspace: %s', code);
            if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(code)) {
                logger.warn('Invalid workspace code format: %s', code);
                return {
                    success: false,
                    message: 'Workspace code must start with a letter and can only contain letters, numbers, hyphens and underscores'
                };
            }
            const appPath = path.join(this.basePath, code);
            const exists = await fileExists(appPath);
            if (exists) {
                logger.warn('Workspace already exists: %s', code);
                return {
                    success: false,
                    message: `Workspace '${code}' already exists`
                };
            }
            const dirResult = await ensureDir(appPath);
            if (!dirResult.success) {
                return dirResult;
            }
            const id = uuidv4();
            const appOptionsPath = path.join(appPath, 'app-options.json');
            const appOptions = generateAppOptionsTemplate({
                id,
                code,
                title,
                description,
                status
            });
            const appOptionsResult = await writeFile(appOptionsPath, appOptions);
            if (!appOptionsResult.success) {
                return appOptionsResult;
            }
            const projectConfigPath = path.join(appPath, 'project-config.json');
            const projectConfig = generateProjectConfigTemplate(code, id);
            const projectConfigResult = await writeFile(projectConfigPath, projectConfig);
            if (!projectConfigResult.success) {
                return projectConfigResult;
            }
            logger.info('Successfully created workspace: %s', code);
            return {
                success: true,
                message: `Workflow workspace '${code}' created successfully`,
                path: appPath
            };
        }
        catch (error) {
            logger.error('Failed to create workspace: %O', error);
            return {
                success: false,
                message: `Failed to create workflow workspace: ${error.message}`
            };
        }
    }
    async deleteWorkspace(code) {
        try {
            logger.info('Deleting workspace: %s', code);
            const appPath = path.join(this.basePath, code);
            const exists = await fileExists(appPath);
            if (!exists) {
                logger.warn('Workspace does not exist: %s', code);
                return {
                    success: false,
                    message: `Workspace '${code}' does not exist`
                };
            }
            const result = await remove(appPath);
            if (!result.success) {
                return result;
            }
            logger.info('Successfully deleted workspace: %s', code);
            return {
                success: true,
                message: `Workspace '${code}' deleted successfully`
            };
        }
        catch (error) {
            logger.error('Failed to delete workspace: %O', error);
            return {
                success: false,
                message: `Failed to delete workspace: ${error.message}`
            };
        }
    }
    async updateWorkspaceOptions(code, updates) {
        try {
            logger.info('Updating workspace options for: %s', code);
            const appPath = path.join(this.basePath, code);
            const appOptionsPath = path.join(appPath, 'app-options.json');
            const exists = await fileExists(appOptionsPath);
            if (!exists) {
                logger.warn('Workspace options file does not exist: %s', appOptionsPath);
                return {
                    success: false,
                    message: `Workspace options for '${code}' not found.`
                };
            }
            const currentOptionsContent = await readFile(appOptionsPath);
            if (!currentOptionsContent) {
                logger.error('Failed to read current workspace options: %s', appOptionsPath);
                return {
                    success: false,
                    message: `Failed to read options for workspace '${code}'.`
                };
            }
            const currentOptions = JSON.parse(currentOptionsContent);
            // Merge updates, ensuring 'code' and 'id' are not overwritten
            const updatedOptions = {
                ...currentOptions,
                ...updates,
                code: currentOptions.code, // Ensure code remains unchanged
                id: currentOptions.id, // Ensure id remains unchanged
                updated_at: new Date().toISOString() // Always update the timestamp
            };
            const result = await writeFile(appOptionsPath, JSON.stringify(updatedOptions, null, 2));
            if (!result.success) {
                logger.error('Failed to write updated workspace options: %s', appOptionsPath);
                return result;
            }
            logger.info('Successfully updated workspace options for: %s', code);
            return { success: true, message: `Workspace '${code}' options updated successfully.`, path: appOptionsPath };
        }
        catch (error) {
            logger.error('Failed to update workspace options: %O', error);
            return {
                success: false,
                message: `Failed to update workspace options: ${error.message}`
            };
        }
    }
    // Removed duplicate deleteWorkspace function
    async updateArea(appCode, areaCode, title, description, status) {
        try {
            logger.info('Updating area %s in workspace %s', areaCode, appCode);
            const configPath = path.join(this.basePath, appCode, 'project-config.json');
            const configContent = await readFile(configPath);
            if (!configContent) {
                logger.warn('Project configuration not found for workspace: %s', appCode);
                return {
                    success: false,
                    message: `Failed to read project configuration for '${appCode}'`
                };
            }
            const config = JSON.parse(configContent);
            const areaIndex = config.areas.findIndex(area => area.code === areaCode);
            if (areaIndex === -1) {
                logger.warn('Area not found: %s', areaCode);
                return {
                    success: false,
                    message: `Area '${areaCode}' not found`
                };
            }
            config.areas[areaIndex].title = title;
            config.areas[areaIndex].description = description;
            config.areas[areaIndex].status = status;
            config.updatedAt = new Date().toISOString();
            const updateResult = await writeFile(configPath, JSON.stringify(config, null, 2));
            if (updateResult.success) {
                logger.info('Successfully updated area %s', areaCode);
            }
            return updateResult;
        }
        catch (error) {
            logger.error('Failed to update area: %O', error);
            return {
                success: false,
                message: `Failed to update area: ${error.message}`
            };
        }
    }
    async updateSubArea(appCode, areaCode, subareaCode, title, description, status) {
        try {
            logger.info('Updating subarea %s in area %s of workspace %s', subareaCode, areaCode, appCode);
            const configPath = path.join(this.basePath, appCode, 'project-config.json');
            const configContent = await readFile(configPath);
            if (!configContent) {
                logger.warn('Project configuration not found for workspace: %s', appCode);
                return {
                    success: false,
                    message: `Failed to read project configuration for '${appCode}'`
                };
            }
            const config = JSON.parse(configContent);
            const areaIndex = config.areas.findIndex(area => area.code === areaCode);
            if (areaIndex === -1) {
                logger.warn('Area not found: %s', areaCode);
                return {
                    success: false,
                    message: `Area '${areaCode}' not found`
                };
            }
            const subareaIndex = config.areas[areaIndex].subareas.findIndex(subarea => subarea.code === subareaCode);
            if (subareaIndex === -1) {
                logger.warn('SubArea not found: %s', subareaCode);
                return {
                    success: false,
                    message: `SubArea '${subareaCode}' not found in area '${areaCode}'`
                };
            }
            config.areas[areaIndex].subareas[subareaIndex].title = title;
            config.areas[areaIndex].subareas[subareaIndex].description = description;
            config.areas[areaIndex].subareas[subareaIndex].status = status;
            config.updatedAt = new Date().toISOString();
            const updateResult = await writeFile(configPath, JSON.stringify(config, null, 2));
            if (updateResult.success) {
                logger.info('Successfully updated subarea %s', subareaCode);
            }
            return updateResult;
        }
        catch (error) {
            logger.error('Failed to update subarea: %O', error);
            return {
                success: false,
                message: `Failed to update subarea: ${error.message}`
            };
        }
    }
    async updateProcess(appCode, areaCode, processCode, title, description, status, subareaCode) {
        try {
            logger.info('Updating process %s in workspace %s', processCode, appCode);
            const configPath = path.join(this.basePath, appCode, 'project-config.json');
            const configContent = await readFile(configPath);
            if (!configContent) {
                logger.warn('Project configuration not found for workspace: %s', appCode);
                return {
                    success: false,
                    message: `Failed to read project configuration for '${appCode}'`
                };
            }
            const config = JSON.parse(configContent);
            const areaIndex = config.areas.findIndex(area => area.code === areaCode);
            if (areaIndex === -1) {
                logger.warn('Area not found: %s', areaCode);
                return {
                    success: false,
                    message: `Area '${areaCode}' not found`
                };
            }
            let processIndex = -1;
            let subareaIndex = -1;
            if (subareaCode) {
                subareaIndex = config.areas[areaIndex].subareas.findIndex(subarea => subarea.code === subareaCode);
                if (subareaIndex === -1) {
                    logger.warn('SubArea not found: %s', subareaCode);
                    return {
                        success: false,
                        message: `SubArea '${subareaCode}' not found in area '${areaCode}'`
                    };
                }
                processIndex = config.areas[areaIndex].subareas[subareaIndex].processes.findIndex(process => process.code === processCode);
            }
            else {
                processIndex = config.areas[areaIndex].processes.findIndex(process => process.code === processCode);
            }
            if (processIndex === -1) {
                logger.warn('Process not found: %s', processCode);
                return {
                    success: false,
                    message: `Process '${processCode}' not found`
                };
            }
            const process = subareaCode
                ? config.areas[areaIndex].subareas[subareaIndex].processes[processIndex]
                : config.areas[areaIndex].processes[processIndex];
            process.title = title;
            process.description = description;
            process.status = status;
            config.updatedAt = new Date().toISOString();
            const updateResult = await writeFile(configPath, JSON.stringify(config, null, 2));
            if (updateResult.success) {
                logger.info('Successfully updated process %s', processCode);
            }
            return updateResult;
        }
        catch (error) {
            logger.error('Failed to update process: %O', error);
            return {
                success: false,
                message: `Failed to update process: ${error.message}`
            };
        }
    }
    async addArea(appCode, areaCode, title, description, status = 'active') {
        try {
            logger.info('Adding new area %s to workspace %s', areaCode, appCode);
            const configPath = path.join(this.basePath, appCode, 'project-config.json');
            const configContent = await readFile(configPath);
            if (!configContent) {
                logger.warn('Project configuration not found for workspace: %s', appCode);
                return {
                    success: false,
                    message: `Failed to read project configuration for '${appCode}'`
                };
            }
            const config = JSON.parse(configContent);
            // Check if area already exists
            if (config.areas.some(area => area.code === areaCode)) {
                logger.warn('Area already exists: %s', areaCode);
                return {
                    success: false,
                    message: `Area '${areaCode}' already exists`
                };
            }
            // Add new area
            config.areas.push({
                id: uuidv4(),
                code: areaCode,
                title,
                description,
                status,
                subareas: [],
                processes: []
            });
            config.updatedAt = new Date().toISOString();
            const updateResult = await writeFile(configPath, JSON.stringify(config, null, 2));
            if (updateResult.success) {
                logger.info('Successfully added area %s', areaCode);
            }
            return updateResult;
        }
        catch (error) {
            logger.error('Failed to add area: %O', error);
            return {
                success: false,
                message: `Failed to add area: ${error.message}`
            };
        }
    }
    async addSubArea(appCode, areaCode, subareaCode, title, description, status = 'active') {
        try {
            logger.info('Adding new subarea %s to area %s in workspace %s', subareaCode, areaCode, appCode);
            const configPath = path.join(this.basePath, appCode, 'project-config.json');
            const configContent = await readFile(configPath);
            if (!configContent) {
                logger.warn('Project configuration not found for workspace: %s', appCode);
                return {
                    success: false,
                    message: `Failed to read project configuration for '${appCode}'`
                };
            }
            const config = JSON.parse(configContent);
            const areaIndex = config.areas.findIndex(area => area.code === areaCode);
            if (areaIndex === -1) {
                logger.warn('Area not found: %s', areaCode);
                return {
                    success: false,
                    message: `Area '${areaCode}' not found`
                };
            }
            // Check if subarea already exists
            if (config.areas[areaIndex].subareas.some(subarea => subarea.code === subareaCode)) {
                logger.warn('SubArea already exists: %s', subareaCode);
                return {
                    success: false,
                    message: `SubArea '${subareaCode}' already exists in area '${areaCode}'`
                };
            }
            // Add new subarea
            config.areas[areaIndex].subareas.push({
                id: uuidv4(),
                code: subareaCode,
                title,
                description,
                status,
                processes: []
            });
            config.updatedAt = new Date().toISOString();
            const updateResult = await writeFile(configPath, JSON.stringify(config, null, 2));
            if (updateResult.success) {
                logger.info('Successfully added subarea %s', subareaCode);
            }
            return updateResult;
        }
        catch (error) {
            logger.error('Failed to add subarea: %O', error);
            return {
                success: false,
                message: `Failed to add subarea: ${error.message}`
            };
        }
    }
    async addProcessDefinition(appCode, areaCode, processCode, title, description, subareaCode, status = 'active') {
        try {
            logger.info('Adding new process %s to workspace %s', processCode, appCode);
            const configPath = path.join(this.basePath, appCode, 'project-config.json');
            const configContent = await readFile(configPath);
            if (!configContent) {
                logger.warn('Project configuration not found for workspace: %s', appCode);
                return {
                    success: false,
                    message: `Failed to read project configuration for '${appCode}'`
                };
            }
            const config = JSON.parse(configContent);
            const areaIndex = config.areas.findIndex(area => area.code === areaCode);
            if (areaIndex === -1) {
                logger.warn('Area not found: %s', areaCode);
                return {
                    success: false,
                    message: `Area '${areaCode}' not found`
                };
            }
            let targetProcesses;
            if (subareaCode) {
                const subareaIndex = config.areas[areaIndex].subareas.findIndex(subarea => subarea.code === subareaCode);
                if (subareaIndex === -1) {
                    logger.warn('SubArea not found: %s', subareaCode);
                    return {
                        success: false,
                        message: `SubArea '${subareaCode}' not found in area '${areaCode}'`
                    };
                }
                targetProcesses = config.areas[areaIndex].subareas[subareaIndex].processes;
            }
            else {
                targetProcesses = config.areas[areaIndex].processes;
            }
            // Check if process already exists
            if (targetProcesses.some(process => process.code === processCode)) {
                logger.warn('Process already exists: %s', processCode);
                return {
                    success: false,
                    message: `Process '${processCode}' already exists`
                };
            }
            // Add new process
            const processId = uuidv4();
            targetProcesses.push({
                id: processId,
                code: processCode,
                title,
                description,
                status,
                bpmnPath: `${processCode}.bpmn`
            });
            config.updatedAt = new Date().toISOString();
            // Create empty BPMN file
            const bpmnContent = generateEmptyBpmnTemplate(processCode, title);
            const bpmnPath = path.join(this.basePath, appCode, areaCode, subareaCode || '', `${processCode}.bpmn`);
            const bpmnResult = await writeFile(bpmnPath, bpmnContent);
            if (!bpmnResult.success) {
                return bpmnResult;
            }
            const updateResult = await writeFile(configPath, JSON.stringify(config, null, 2));
            if (updateResult.success) {
                logger.info('Successfully added process %s', processCode);
            }
            return updateResult;
        }
        catch (error) {
            logger.error('Failed to add process: %O', error);
            return {
                success: false,
                message: `Failed to add process: ${error.message}`
            };
        }
    }
    async deleteArea(appCode, areaCode) {
        try {
            logger.info('Deleting area %s from workspace %s', areaCode, appCode);
            const configPath = path.join(this.basePath, appCode, 'project-config.json');
            const configContent = await readFile(configPath);
            if (!configContent) {
                logger.warn('Project configuration not found for workspace: %s', appCode);
                return {
                    success: false,
                    message: `Failed to read project configuration for '${appCode}'`
                };
            }
            const config = JSON.parse(configContent);
            const areaIndex = config.areas.findIndex(area => area.code === areaCode);
            if (areaIndex === -1) {
                logger.warn('Area not found: %s', areaCode);
                return {
                    success: false,
                    message: `Area '${areaCode}' not found`
                };
            }
            // Remove area directory and all its contents
            const areaPath = path.join(this.basePath, appCode, areaCode);
            const removeResult = await remove(areaPath);
            if (!removeResult.success) {
                return removeResult;
            }
            // Remove area from config
            config.areas.splice(areaIndex, 1);
            config.updatedAt = new Date().toISOString();
            const updateResult = await writeFile(configPath, JSON.stringify(config, null, 2));
            if (updateResult.success) {
                logger.info('Successfully deleted area %s', areaCode);
            }
            return updateResult;
        }
        catch (error) {
            logger.error('Failed to delete area: %O', error);
            return {
                success: false,
                message: `Failed to delete area: ${error.message}`
            };
        }
    }
    async deleteSubArea(appCode, areaCode, subareaCode) {
        try {
            logger.info('Deleting subarea %s from area %s in workspace %s', subareaCode, areaCode, appCode);
            const configPath = path.join(this.basePath, appCode, 'project-config.json');
            const configContent = await readFile(configPath);
            if (!configContent) {
                logger.warn('Project configuration not found for workspace: %s', appCode);
                return {
                    success: false,
                    message: `Failed to read project configuration for '${appCode}'`
                };
            }
            const config = JSON.parse(configContent);
            const areaIndex = config.areas.findIndex(area => area.code === areaCode);
            if (areaIndex === -1) {
                logger.warn('Area not found: %s', areaCode);
                return {
                    success: false,
                    message: `Area '${areaCode}' not found`
                };
            }
            const subareaIndex = config.areas[areaIndex].subareas.findIndex(subarea => subarea.code === subareaCode);
            if (subareaIndex === -1) {
                logger.warn('SubArea not found: %s', subareaCode);
                return {
                    success: false,
                    message: `SubArea '${subareaCode}' not found in area '${areaCode}'`
                };
            }
            // Remove subarea directory and all its contents
            const subareaPath = path.join(this.basePath, appCode, areaCode, subareaCode);
            const removeResult = await remove(subareaPath);
            if (!removeResult.success) {
                return removeResult;
            }
            // Remove subarea from config
            config.areas[areaIndex].subareas.splice(subareaIndex, 1);
            config.updatedAt = new Date().toISOString();
            const updateResult = await writeFile(configPath, JSON.stringify(config, null, 2));
            if (updateResult.success) {
                logger.info('Successfully deleted subarea %s', subareaCode);
            }
            return updateResult;
        }
        catch (error) {
            logger.error('Failed to delete subarea: %O', error);
            return {
                success: false,
                message: `Failed to delete subarea: ${error.message}`
            };
        }
    }
    async deleteProcess(appCode, areaCode, processCode, subareaCode) {
        try {
            logger.info('Deleting process %s from workspace %s', processCode, appCode);
            const configPath = path.join(this.basePath, appCode, 'project-config.json');
            const configContent = await readFile(configPath);
            if (!configContent) {
                logger.warn('Project configuration not found for workspace: %s', appCode);
                return {
                    success: false,
                    message: `Failed to read project configuration for '${appCode}'`
                };
            }
            const config = JSON.parse(configContent);
            const areaIndex = config.areas.findIndex(area => area.code === areaCode);
            if (areaIndex === -1) {
                logger.warn('Area not found: %s', areaCode);
                return {
                    success: false,
                    message: `Area '${areaCode}' not found`
                };
            }
            let processIndex = -1;
            let subareaIndex = -1;
            if (subareaCode) {
                subareaIndex = config.areas[areaIndex].subareas.findIndex(subarea => subarea.code === subareaCode);
                if (subareaIndex === -1) {
                    logger.warn('SubArea not found: %s', subareaCode);
                    return {
                        success: false,
                        message: `SubArea '${subareaCode}' not found in area '${areaCode}'`
                    };
                }
                processIndex = config.areas[areaIndex].subareas[subareaIndex].processes.findIndex(process => process.code === processCode);
            }
            else {
                processIndex = config.areas[areaIndex].processes.findIndex(process => process.code === processCode);
            }
            if (processIndex === -1) {
                logger.warn('Process not found: %s', processCode);
                return {
                    success: false,
                    message: `Process '${processCode}' not found`
                };
            }
            // Remove process BPMN file
            const bpmnPath = path.join(this.basePath, appCode, areaCode, subareaCode || '', `${processCode}.bpmn`);
            const removeResult = await remove(bpmnPath);
            if (!removeResult.success) {
                return removeResult;
            }
            // Remove process from config
            if (subareaCode) {
                config.areas[areaIndex].subareas[subareaIndex].processes.splice(processIndex, 1);
            }
            else {
                config.areas[areaIndex].processes.splice(processIndex, 1);
            }
            config.updatedAt = new Date().toISOString();
            const updateResult = await writeFile(configPath, JSON.stringify(config, null, 2));
            if (updateResult.success) {
                logger.info('Successfully deleted process %s', processCode);
            }
            return updateResult;
        }
        catch (error) {
            logger.error('Failed to delete process: %O', error);
            return {
                success: false,
                message: `Failed to delete process: ${error.message}`
            };
        }
    }
}
