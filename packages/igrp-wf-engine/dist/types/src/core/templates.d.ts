/**
 * Generates a default app-options.json file
 */
export declare function generateAppOptionsTemplate(config: {
    id: string;
    code: string;
    title: string;
    description?: string;
    status: string;
}): string;
/**
 * Generates an empty BPMN file with basic structure
 */
export declare function generateEmptyBpmnTemplate(processCode: string, title?: string): string;
/**
 * Generates a project configuration template
 */
export declare function generateProjectConfigTemplate(projectCode: string, projectId: string): string;
