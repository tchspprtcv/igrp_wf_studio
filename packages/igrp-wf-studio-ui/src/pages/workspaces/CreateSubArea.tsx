import React, { useState, useEffect } from 'react';
import { WorkflowEngineSDK } from '@igrp/wf-engine';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CreateSubAreaProps {
  workspaceCode: string;
  areaCode: string;
  onClose: () => void;
  onCreated: () => void;
}

const CreateSubArea: React.FC<CreateSubAreaProps> = ({
  workspaceCode,
  areaCode,
  onClose,
  onCreated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    status: 'active' as 'active' | 'inactive' | 'draft'
  });
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(true);

  useEffect(() => {
    validateAndGenerateCode();
  }, [workspaceCode, areaCode]);

  const validateAndGenerateCode = async () => {
    setIsValidating(true);
    setIsGeneratingCode(true);
    setError(null);
    console.log(`Iniciando validação e geração de código para subárea no workspace: ${workspaceCode}, área: ${areaCode}`);
    try {
      const sdk = new WorkflowEngineSDK();
      console.log('Carregando configuração do projeto para validar e gerar código');
      const config = await sdk.workspaces.loadProjectConfig(workspaceCode);

      if (!config) {
        console.error(`Workspace '${workspaceCode}' não encontrado`);
        setError(`Workspace '${workspaceCode}' not found`);
        console.log(`Exibindo toast de erro para workspace não encontrado: ${workspaceCode}`);
        toast.error(`Workspace '${workspaceCode}' not found`);
        return;
      }

      const area = config.areas.find((a: { code: string; }) => a.code === areaCode);
      if (!area) {
        console.error(`Área '${areaCode}' não existe no workspace '${workspaceCode}'`);
        setError(`Area '${areaCode}' does not exist in workspace '${workspaceCode}'`);
        console.log(`Exibindo toast de erro para área não encontrada: ${areaCode}`);
        toast.error(`Area '${areaCode}' does not exist in workspace '${workspaceCode}'`);
        return;
      }

      console.log(`Área validada: ${areaCode}`);

      // Generate next subarea code
      const existingSubAreas = area.subareas || [];
      console.log(`Subáreas existentes: ${existingSubAreas.length}`, existingSubAreas.map((s: any) => s.code));
      let nextNum = 1;
      const subAreaCodes = existingSubAreas
        .map((sub: { code: string }) => sub.code)
        .filter((code: string) => code.startsWith(`${areaCode}.`))
        .map((code: string) => parseInt(code.substring(areaCode.length + 1), 10))
        .filter((num: number) => !isNaN(num));

      if (subAreaCodes.length > 0) {
        nextNum = Math.max(...subAreaCodes) + 1;
      }
      const nextCode = `${areaCode}.${nextNum}`;
      console.log(`Código gerado para nova subárea: ${nextCode}`);
      setFormData(prev => ({ ...prev, code: nextCode }));

    } catch (err) {
      console.error('Erro ao validar ou gerar código de subárea:', err);
      setError(`Failed to validate or generate code: ${(err as Error).message}`);
      console.log('Exibindo toast de erro para validação ou geração de código');
      toast.error(`Failed to validate or generate code: ${(err as Error).message}`);
    } finally {
      setIsValidating(false);
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
    console.log(`Iniciando criação de subárea: ${formData.code} na área: ${areaCode}`);

    try {
      // Validate subarea code format (Allowing '.')
      if (!/^[a-zA-Z][a-zA-Z0-9_.-]*$/.test(formData.code)) {
        console.error(`Código de subárea inválido: ${formData.code}`);
        setError('SubArea code must start with a letter and can only contain letters, numbers, hyphens, underscores, and periods');
        console.log('Exibindo toast de erro para código de subárea inválido');
        toast.error('SubArea code must start with a letter and can only contain letters, numbers, hyphens, underscores, and periods');
        setIsLoading(false);
        return;
      }

      console.log(`Chamando SDK para adicionar subárea: ${formData.code}`);
      const sdk = new WorkflowEngineSDK();
      const result = await sdk.workspaces.addSubArea(
        workspaceCode,
        areaCode,
        formData.code,
        formData.title,
        formData.description,
        formData.status
      );

      if (result.success) {
        console.log(`Subárea ${formData.code} criada com sucesso`);
        console.log('Exibindo toast de sucesso para criação de subárea');
        toast.success(`SubArea '${formData.code}' created successfully.`);
        onCreated();
        onClose();
      } else {
        console.error(`Erro ao criar subárea: ${result.message}`);
        setError(result.message);
        console.log('Exibindo toast de erro para criação de subárea');
        toast.error(result.message || 'Failed to create subarea');
      }
    } catch (err) {
      console.error('Exceção ao criar subárea:', err);
      setError((err as Error).message);
      console.log('Exibindo toast de erro para exceção na criação de subárea');
      toast.error(`Error: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="text-lg font-semibold">Create New SubArea</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="mb-4">
            <label className="form-label">Parent Area</label>
            <input
              type="text"
              value={areaCode}
              className="input-field bg-gray-50"
              disabled
            />
          </div>

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
              <Input
                label="SubArea Code" // Allow user modification
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder={isGeneratingCode ? "Generating code..." : "Enter subarea code"}
                disabled={isGeneratingCode}
                required
                pattern="^[a-zA-Z][a-zA-Z0-9_.-]*$"
                title="SubArea code must start with a letter and can only contain letters, numbers, hyphens, underscores, and periods"
              />

              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter subarea title"
                required
              />

              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Enter subarea description"
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
                  Create SubArea
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};



export default CreateSubArea;