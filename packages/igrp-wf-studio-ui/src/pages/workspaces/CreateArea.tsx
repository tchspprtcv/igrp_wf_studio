import React, { useState, useEffect } from 'react';
import { WorkflowEngineSDK } from 'igrp-wf-engine';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X } from 'lucide-react';

interface CreateAreaProps {
  workspaceCode: string;
  onClose: () => void;
  onCreated: () => void;
}

const CreateArea: React.FC<CreateAreaProps> = ({
  workspaceCode,
  onClose,
  onCreated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    status: 'active' as 'active' | 'inactive' | 'draft'
  });
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(true);

  useEffect(() => {
    generateNextAreaCode();
  }, [workspaceCode]);

  const generateNextAreaCode = async () => {
    setIsGeneratingCode(true);
    setError(null);
    try {
      const sdk = new WorkflowEngineSDK();
      const config = await sdk.workspaces.loadProjectConfig(workspaceCode);
      const existingAreas = config?.areas || [];
      let nextNum = 1;
      const areaCodes = existingAreas.map((area: { code: string }) => area.code)
                                   .filter((code: string) => code.startsWith('area'))
                                   .map((code: string) => parseInt(code.replace('area', ''), 10))
                                   .filter((num: number) => !isNaN(num));

      if (areaCodes.length > 0) {
        nextNum = Math.max(...areaCodes) + 1;
      }
      const nextCode = `area${nextNum}`;
      setFormData(prev => ({ ...prev, code: nextCode }));
    } catch (err) {
      setError(`Failed to generate area code: ${(err as Error).message}`);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate area code format (Allowing '.')
      if (!/^[a-zA-Z][a-zA-Z0-9_.-]*$/.test(formData.code)) {
        setError('Area code must start with a letter and can only contain letters, numbers, hyphens, underscores, and periods');
        setIsLoading(false);
        return;
      }

      const sdk = new WorkflowEngineSDK();
      const result = await sdk.workspaces.addArea(
        workspaceCode,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create New Area</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <Input
            label="Area Code" // Allow user modification
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder={isGeneratingCode ? "Generating code..." : "Enter area code"}
            disabled={isGeneratingCode}
            required
            pattern="^[a-zA-Z][a-zA-Z0-9_.-]*$"
            title="Area code must start with a letter and can only contain letters, numbers, hyphens, underscores, and periods"
          />

          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter area title"
            required
          />

          <div>
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Enter area description"
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

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

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
              Create Area
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArea;