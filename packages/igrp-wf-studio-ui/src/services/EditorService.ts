// Mark this file as server-only to prevent it from being imported in client components
import 'server-only';
import * as workspaceManager from '@/igrpwfstudio/utils/workspaceManager'; // Ajustado o path se necessário
import { FileOperationResult } from '@igrp/wf-engine';

interface SaveContentParams {
  workspaceCode: string;
  areaCode: string;
  processCode: string;
  bpmnXml: string;
  subAreaCode?: string;
}

interface LoadContentParams {
  workspaceCode: string;
  areaCode: string;
  processCode: string;
  subAreaCode?: string;
}

/**
 * EditorService - Service for handling editor-related operations
 * This service provides functionality for BPMN and DMN editors (currently focused on BPMN)
 */
class EditorService {
  /**
   * Save BPMN editor content.
   */
  async saveBpmnContent(params: SaveContentParams): Promise<FileOperationResult> {
    try {
      console.log(`[EditorService] Saving BPMN content for workspace: ${params.workspaceCode}, area: ${params.areaCode}, process: ${params.processCode}`);
      const result = await workspaceManager.saveStudioProcessDefinition(
        params.workspaceCode,
        params.areaCode,
        params.processCode,
        params.bpmnXml,
        params.subAreaCode
      );
      if (!result.success) {
        console.error('[EditorService] Error saving BPMN content via workspaceManager:', result.message);
      }
      return result;
    } catch (error: any) {
      console.error('[EditorService] Exception while saving BPMN content:', error);
      return { success: false, message: error.message || 'An unexpected error occurred during save.' };
    }
  }

  /**
   * Load BPMN editor content.
   * Returns the BPMN XML string or null if not found or an error occurs.
   */
  async loadBpmnContent(params: LoadContentParams): Promise<string | null> {
    try {
      console.log(`[EditorService] Loading BPMN content for workspace: ${params.workspaceCode}, area: ${params.areaCode}, process: ${params.processCode}`);
      const result = await workspaceManager.readStudioProcessDefinition(
        params.workspaceCode,
        params.areaCode,
        params.processCode,
        params.subAreaCode
      );

      if (result && result.bpmnXml) {
        return result.bpmnXml;
      } else {
        console.warn('[EditorService] BPMN content not found or result is invalid for:', params);
        return null;
      }
    } catch (error: any) {
      console.error('[EditorService] Exception while loading BPMN content:', error);
      return null;
    }
  }

  /**
   * Validate editor content (placeholder)
   * @param content - The content to validate
   * @param type - The type of content to validate (bpmn, dmn)
   */
  validateContent(content: string, type: 'bpmn' | 'dmn' = 'bpmn'): { valid: boolean; errors?: string[] } {
    // Implementation would validate the content
    // For BPMN, could try to import into a bpmn-js instance and catch errors
    console.log(`[EditorService] Validating ${type} content (placeholder).`);
    return { valid: true };
  }
}

// Export as singleton
export default new EditorService();
