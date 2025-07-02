import React, { useState, useEffect } from 'react';
import { WorkflowEngineSDK } from 'igrp-wf-engine';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X } from 'lucide-react';

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
    try {
      const sdk = new WorkflowEngineSDK();
      const config = await sdk.workspaces.loadProjectConfig(workspaceCode);

      if (!config) {
        setError(`Workspace '${workspaceCode}' not found`);
        return;
      }

      const area = config.areas.find((a: { code: string; }) => a.code === areaCode);
      if (!area) {
        setError(`Area '${areaCode}' does not exist in workspace '${workspaceCode}'`);
        return;
      }

      // Generate next subarea code
      const existingSubAreas = area.subareas || [];
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
      setFormData(prev => ({ ...prev, code: nextCode }));

    } catch (err) {
      setError(`Failed to validate or generate code: ${(err as Error).message}`);
    } finally {
      setIsValidating(false);
      setIsGeneratingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (error) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate subarea code format (Allowing '.')
      if (!/^[a-zA-Z][a-zA-Z0-9_.-]*$/.test(formData.code)) {
        setError('SubArea code must start with a letter and can only contain letters, numbers, hyphens, underscores, and periods');
        setIsLoading(false);
        return;
      }

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
        onCreated();
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError((err as Error).message);
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