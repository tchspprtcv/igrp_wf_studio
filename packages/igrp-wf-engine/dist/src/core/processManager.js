/**
 * Process definition management functionality
 */
const isBrowser = typeof window !== 'undefined';
const path = !isBrowser ? require('node:path') : {
    join: (...paths) => paths.join('/')
};
import { readFile, writeFile, fileExists } from '../utils/fileSystem';
import { generateEmptyBpmnTemplate } from './templates';
/**
 * ProcessManager class for managing BPMN process definitions
 */
export class ProcessManager {
    constructor(basePath = './') {
        this.basePath = basePath;
    }
    /**
     * Sets the base path for the project
     */
    setBasePath(basePath) {
        this.basePath = basePath;
    }
    /**
     * Reads a process definition BPMN file
     */
    async readProcessDefinition(appCode, areaCode, processCode, subareaCode) {
        try {
            let processBpmnPath;
            if (subareaCode) {
                processBpmnPath = path.join(this.basePath, appCode, areaCode, subareaCode, `${areaCode}${processCode}.bpmn`);
            }
            else {
                processBpmnPath = path.join(this.basePath, appCode, areaCode, `${areaCode}${processCode}.bpmn`);
            }
            // Check if file exists
            const exists = await fileExists(processBpmnPath);
            if (!exists) {
                return null;
            }
            // Read BPMN content
            const bpmnXml = await readFile(processBpmnPath);
            if (!bpmnXml) {
                return null;
            }
            // Create a basic ProcessDefinition object
            return {
                id: `${areaCode}_${processCode}`,
                code: processCode,
                title: processCode,
                description: '',
                status: 'active',
                areaCode,
                subareaCode,
                bpmnXml,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
        catch (error) {
            console.error(`Failed to read process definition: ${error.message}`);
            return null;
        }
    }
    /**
     * Saves a process definition BPMN file
     */
    async saveProcessDefinition(appCode, areaCode, processCode, bpmnXml, subareaCode) {
        try {
            let processBpmnPath;
            if (subareaCode) {
                processBpmnPath = path.join(this.basePath, appCode, areaCode, subareaCode, `${areaCode}${processCode}.bpmn`);
            }
            else {
                processBpmnPath = path.join(this.basePath, appCode, areaCode, `${areaCode}${processCode}.bpmn`);
            }
            const result = await writeFile(processBpmnPath, bpmnXml);
            return result;
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to save process definition: ${error.message}`
            };
        }
    }
    /**
     * Updates a process definition (metadata and content)
     */
    async updateProcessDefinition(appCode, areaCode, processCode, updates, subareaCode) {
        try {
            // For metadata updates, we would need to update the project config
            // This is a simplified implementation focusing on the BPMN content
            // If BPMN content is provided, update the file
            if (updates.bpmnXml) {
                return this.saveProcessDefinition(appCode, areaCode, processCode, updates.bpmnXml, subareaCode);
            }
            return {
                success: true,
                message: 'No BPMN content to update'
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to update process definition: ${error.message}`
            };
        }
    }
    /**
     * Creates a new process definition with empty BPMN content
     */
    async createEmptyProcessDefinition(appCode, areaCode, processCode, title, subareaCode) {
        try {
            const bpmnXml = generateEmptyBpmnTemplate(processCode);
            return this.saveProcessDefinition(appCode, areaCode, processCode, bpmnXml, subareaCode);
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to create empty process definition: ${error.message}`
            };
        }
    }
}
