import EditorService from '../EditorService';
import * as workspaceManager from '@/igrpwfstudio/utils/workspaceManager';
import { FileOperationResult } from '@igrp/wf-engine';

// Mock o workspaceManager
jest.mock('@/igrpwfstudio/utils/workspaceManager', () => ({
  saveStudioProcessDefinition: jest.fn(),
  readStudioProcessDefinition: jest.fn(),
}));

// Tipagem para os mocks
const mockedWorkspaceManager = workspaceManager as jest.Mocked<typeof workspaceManager>;

describe('EditorService', () => {
  beforeEach(() => {
    // Limpa todas as instâncias e chamadas de construtores e métodos antes de cada teste
    mockedWorkspaceManager.saveStudioProcessDefinition.mockClear();
    mockedWorkspaceManager.readStudioProcessDefinition.mockClear();
  });

  describe('saveBpmnContent', () => {
    const params = {
      workspaceCode: 'ws1',
      areaCode: 'area1',
      processCode: 'proc1',
      bpmnXml: '<bpmn></bpmn>',
    };

    it('should call workspaceManager.saveStudioProcessDefinition with correct parameters', async () => {
      const mockSuccessResult: FileOperationResult = { success: true, message: 'Saved' };
      mockedWorkspaceManager.saveStudioProcessDefinition.mockResolvedValue(mockSuccessResult);

      const result = await EditorService.saveBpmnContent(params);

      expect(mockedWorkspaceManager.saveStudioProcessDefinition).toHaveBeenCalledTimes(1);
      expect(mockedWorkspaceManager.saveStudioProcessDefinition).toHaveBeenCalledWith(
        params.workspaceCode,
        params.areaCode,
        params.processCode,
        params.bpmnXml,
        undefined // subAreaCode é undefined neste caso
      );
      expect(result).toEqual(mockSuccessResult);
    });

    it('should call workspaceManager.saveStudioProcessDefinition with subAreaCode if provided', async () => {
      const paramsWithSubArea = { ...params, subAreaCode: 'sub1' };
      const mockSuccessResult: FileOperationResult = { success: true, message: 'Saved' };
      mockedWorkspaceManager.saveStudioProcessDefinition.mockResolvedValue(mockSuccessResult);

      await EditorService.saveBpmnContent(paramsWithSubArea);

      expect(mockedWorkspaceManager.saveStudioProcessDefinition).toHaveBeenCalledWith(
        paramsWithSubArea.workspaceCode,
        paramsWithSubArea.areaCode,
        paramsWithSubArea.processCode,
        paramsWithSubArea.bpmnXml,
        paramsWithSubArea.subAreaCode
      );
    });

    it('should return error result if workspaceManager.saveStudioProcessDefinition fails', async () => {
      const mockErrorResult: FileOperationResult = { success: false, message: 'Failed to save' };
      mockedWorkspaceManager.saveStudioProcessDefinition.mockResolvedValue(mockErrorResult);

      const result = await EditorService.saveBpmnContent(params);
      expect(result).toEqual(mockErrorResult);
    });

    it('should return error result on exception from workspaceManager.saveStudioProcessDefinition', async () => {
      const errorMessage = 'Unexpected error';
      mockedWorkspaceManager.saveStudioProcessDefinition.mockRejectedValue(new Error(errorMessage));

      const result = await EditorService.saveBpmnContent(params);
      expect(result).toEqual({ success: false, message: errorMessage });
    });
  });

  describe('loadBpmnContent', () => {
    const params = {
      workspaceCode: 'ws1',
      areaCode: 'area1',
      processCode: 'proc1',
    };

    it('should call workspaceManager.readStudioProcessDefinition with correct parameters', async () => {
      const mockBpmnData = { bpmnXml: '<bpmn></bpmn>', fileName: 'proc1.bpmn' };
      mockedWorkspaceManager.readStudioProcessDefinition.mockResolvedValue(mockBpmnData);

      const result = await EditorService.loadBpmnContent(params);

      expect(mockedWorkspaceManager.readStudioProcessDefinition).toHaveBeenCalledTimes(1);
      expect(mockedWorkspaceManager.readStudioProcessDefinition).toHaveBeenCalledWith(
        params.workspaceCode,
        params.areaCode,
        params.processCode,
        undefined // subAreaCode
      );
      expect(result).toEqual(mockBpmnData.bpmnXml);
    });

    it('should call workspaceManager.readStudioProcessDefinition with subAreaCode if provided', async () => {
      const paramsWithSubArea = { ...params, subAreaCode: 'sub1' };
      const mockBpmnData = { bpmnXml: '<bpmn></bpmn>', fileName: 'proc1.bpmn' };
      mockedWorkspaceManager.readStudioProcessDefinition.mockResolvedValue(mockBpmnData);

      await EditorService.loadBpmnContent(paramsWithSubArea);

      expect(mockedWorkspaceManager.readStudioProcessDefinition).toHaveBeenCalledWith(
        paramsWithSubArea.workspaceCode,
        paramsWithSubArea.areaCode,
        paramsWithSubArea.processCode,
        paramsWithSubArea.subAreaCode
      );
    });

    it('should return null if workspaceManager.readStudioProcessDefinition returns null', async () => {
      mockedWorkspaceManager.readStudioProcessDefinition.mockResolvedValue(null);
      const result = await EditorService.loadBpmnContent(params);
      expect(result).toBeNull();
    });

    it('should return null if workspaceManager.readStudioProcessDefinition returns data without bpmnXml', async () => {
      // @ts-ignore : Testing invalid return shape
      mockedWorkspaceManager.readStudioProcessDefinition.mockResolvedValue({ fileName: 'proc1.bpmn' });
      const result = await EditorService.loadBpmnContent(params);
      expect(result).toBeNull();
    });

    it('should return null on exception from workspaceManager.readStudioProcessDefinition', async () => {
      mockedWorkspaceManager.readStudioProcessDefinition.mockRejectedValue(new Error('Unexpected error'));
      const result = await EditorService.loadBpmnContent(params);
      expect(result).toBeNull();
    });
  });

  describe('validateContent', () => {
    it('should return { valid: true } and log a message', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const result = EditorService.validateContent('<bpmn></bpmn>', 'bpmn');
      expect(result).toEqual({ valid: true });
      expect(consoleSpy).toHaveBeenCalledWith('[EditorService] Validating bpmn content (placeholder).');
      consoleSpy.mockRestore();
    });
  });
});
