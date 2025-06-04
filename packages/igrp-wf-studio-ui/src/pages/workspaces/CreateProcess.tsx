import React, { useState, useEffect } from 'react';
import { WorkflowEngineSDK } from '@igrp/wf-engine';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CreateProcessProps {
  workspaceCode: string;
  onClose: () => void;
  onCreated: (newProcessCode: string) => void; // Modified: Add parameter
  initialArea?: string | null;
  initialSubArea?: string | null;
}

const CreateProcess: React.FC<CreateProcessProps> = ({
  workspaceCode,
  onClose,
  onCreated,
  initialArea,
  initialSubArea
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [areas, setAreas] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    areaCode: initialArea || '',
    subareaCode: initialSubArea || '',
    status: 'active' as 'active' | 'inactive' | 'draft'
  });
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false); // Start as false until area is selected

  useEffect(() => {
    validateAndLoadAreaData();
  }, [workspaceCode, initialArea, initialSubArea]); // Load initial data

  // Effect to generate code when areaCode changes and is valid
  useEffect(() => {
    if (formData.areaCode && !isValidating && !error) {
      generateNextProcessCode();
    }
  }, [formData.areaCode, isValidating, error]); // Regenerate code if area changes

  const validateAndLoadAreaData = async () => {
    try {
      console.log(`Iniciando validação e carregamento de dados para o workspace: ${workspaceCode}`);
      console.log(`Área inicial: ${initialArea || 'nenhuma'}, Subárea inicial: ${initialSubArea || 'nenhuma'}`);
      
      const sdk = new WorkflowEngineSDK();
      const config = await sdk.workspaces.loadProjectConfig(workspaceCode);
      
      if (!config) {
        console.error(`Workspace '${workspaceCode}' não encontrado`);
        setError(`Workspace '${workspaceCode}' not found`);
        console.log(`Exibindo toast de erro para workspace não encontrado: ${workspaceCode}`);
        toast.error(`Workspace '${workspaceCode}' not found`);
        return;
      }

      console.log(`Configuração do workspace carregada: ${config.areas.length} áreas encontradas`);

      if (initialArea) {
        const area = config.areas.find((a: { code: string; }) => a.code === initialArea);
        if (!area) {
          console.error(`Área '${initialArea}' não existe no workspace '${workspaceCode}'`);
          setError(`Area '${initialArea}' does not exist in workspace '${workspaceCode}'`);
          console.log(`Exibindo toast de erro para área não encontrada: ${initialArea}`);
          toast.error(`Area '${initialArea}' does not exist in workspace '${workspaceCode}'`);
          return;
        }

        console.log(`Área inicial validada: ${initialArea}`);

        if (initialSubArea) {
          const subarea = area.subareas.find((s: any) => s.code === initialSubArea);
          if (!subarea) {
            console.error(`Subárea '${initialSubArea}' não existe na área '${initialArea}'`);
            setError(`SubArea '${initialSubArea}' does not exist in area '${initialArea}'`);
            console.log(`Exibindo toast de erro para subárea não encontrada: ${initialSubArea}`);
            toast.error(`SubArea '${initialSubArea}' does not exist in area '${initialArea}'`);
            return;
          }
          console.log(`Subárea inicial validada: ${initialSubArea}`);
        }
      }

      console.log('Dados de áreas carregados com sucesso');
      setAreas(config.areas);
    } catch (err) {
      console.error('Exceção ao validar e carregar dados de áreas:', err);
      setError((err as Error).message);
      console.log('Exibindo toast de erro para exceção na validação de dados');
      toast.error(`Error: ${(err as Error).message}`);
    } finally {
      setIsValidating(false);
      // Don't generate code here yet, wait for area selection or initial load completion
    }
  };

  const generateNextProcessCode = async () => {
    if (!formData.areaCode) return; // Don't generate if no area selected

    setIsGeneratingCode(true);
    // Keep existing error related to area/subarea validation if any
    // setError(null); 
    console.log(`Iniciando geração de código para novo processo na área: ${formData.areaCode}`);
    try {
      const sdk = new WorkflowEngineSDK();
      console.log('Carregando configuração do projeto para gerar código de processo');
      const config = await sdk.workspaces.loadProjectConfig(workspaceCode);
      if (!config) {
        console.error(`Workspace '${workspaceCode}' não encontrado durante geração de código`);
        // Error should have been set by validateAndLoadAreaData
        return;
      }

      const area = config.areas.find((a: { code: string; }) => a.code === formData.areaCode);
      if (!area) {
        console.error(`Área '${formData.areaCode}' não encontrada durante geração de código`);
        // Error should have been set by validateAndLoadAreaData
        return;
      }

      let allProcessesInArea: { code: string }[] = [];
      // Collect processes directly under the area
      if (area.processes) {
        allProcessesInArea = allProcessesInArea.concat(area.processes);
      }
      // Collect processes under subareas of the area
      if (area.subareas) {
        area.subareas.forEach((sub: { processes: any[]; }) => {
          if (sub.processes) {
            allProcessesInArea = allProcessesInArea.concat(sub.processes);
          }
        });
      }

      console.log(`Processos existentes na área ${formData.areaCode}: ${allProcessesInArea.length}`, 
                 allProcessesInArea.map((p: any) => p.code));

      let nextNum = 1;
      const prefix = `P.${formData.areaCode}.`;
      const processCodes = allProcessesInArea
        .map((proc: { code: string }) => proc.code)
        .filter((code: string) => code.startsWith(prefix))
        .map((code: string) => parseInt(code.substring(prefix.length), 10))
        .filter((num: number) => !isNaN(num));

      if (processCodes.length > 0) {
        nextNum = Math.max(...processCodes) + 1;
      }
      const nextCode = `P.${formData.areaCode}.${nextNum}`;
      console.log(`Código gerado para novo processo: ${nextCode}`);
      setFormData(prev => ({ ...prev, code: nextCode }));

    } catch (err) {
      console.error('Erro ao gerar código de processo:', err);
      // Set a new error specific to code generation
      setError(`Failed to generate process code: ${(err as Error).message}`);
      console.log('Exibindo toast de erro para geração de código de processo');
      toast.error(`Failed to generate process code: ${(err as Error).message}`);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (error) {
      console.log('Formulário com erro, não prosseguindo com o envio');
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log(`Iniciando criação de processo: ${formData.code} na área: ${formData.areaCode}${formData.subareaCode ? ', subárea: ' + formData.subareaCode : ''}`);

    try {
      // Validate process code format (Allowing '.')
      if (!/^[a-zA-Z][a-zA-Z0-9_.-]*$/.test(formData.code)) {
        console.error(`Código de processo inválido: ${formData.code}`);
        setError('Process code must start with a letter and can only contain letters, numbers, hyphens, underscores, and periods');
        console.log('Exibindo toast de erro para código de processo inválido');
        toast.error('Process code must start with a letter and can only contain letters, numbers, hyphens, underscores, and periods');
        setIsLoading(false);
        return;
      }

      console.log(`Chamando SDK para adicionar processo: ${formData.code}`);
      const sdk = new WorkflowEngineSDK();
      const result = await sdk.workspaces.addProcessDefinition(
        workspaceCode,
        formData.areaCode,
        formData.code,
        formData.title,
        formData.description,
        formData.subareaCode || undefined,
        formData.status
      );

      if (result.success) {
        console.log(`Processo ${formData.code} criado com sucesso`);
        console.log('Exibindo toast de sucesso para criação de processo');
        toast.success(`Process '${formData.code}' created successfully.`);
        onCreated(formData.code); // Modified: Pass the new process code
        onClose();
      } else {
        console.error(`Erro ao criar processo: ${result.message}`);
        setError(result.message);
        console.log('Exibindo toast de erro para criação de processo');
        toast.error(result.message || 'Failed to create process');
      }
    } catch (err) {
      console.error('Exceção ao criar processo:', err);
      setError((err as Error).message);
      console.log('Exibindo toast de erro para exceção na criação de processo');
      toast.error(`Error: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedArea = areas.find(area => area.code === formData.areaCode);

  if (isValidating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create New Process</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
              <div className="mt-4">
                <Button
                  variant="secondary"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="form-label">Area</label>
                <select
                  value={formData.areaCode}
                  onChange={(e) => setFormData({ ...formData, areaCode: e.target.value, subareaCode: '' })}
                  className="input-field"
                  required
                  disabled={!!initialArea}
                >
                  <option value="">Select an area</option>
                  {areas.map(area => (
                    <option key={area.code} value={area.code}>
                      {area.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedArea && selectedArea.subareas.length > 0 && (
                <div>
                  <label className="form-label">SubArea (Optional)</label>
                  <select
                    value={formData.subareaCode}
                    onChange={(e) => setFormData({ ...formData, subareaCode: e.target.value })}
                    className="input-field"
                    disabled={!!initialSubArea}
                  >
                    <option value="">None</option>
                    {selectedArea.subareas.map((subarea: any) => (
                      <option key={subarea.code} value={subarea.code}>
                        {subarea.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Input
                label="Process Code" // Allow user modification
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder={isGeneratingCode ? "Generating code..." : "Enter process code"}
                disabled={isGeneratingCode || !formData.areaCode} // Disable if generating or no area selected
                required
                pattern="^[a-zA-Z][a-zA-Z0-9_.-]*$"
                title="Process code must start with a letter and can only contain letters, numbers, hyphens, underscores, and periods"
              />

              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter process title"
                required
              />

              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Enter process description"
                />
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    status: e.target.value as 'active' | 'inactive' | 'draft' 
                  })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                >
                  Create Process
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateProcess;