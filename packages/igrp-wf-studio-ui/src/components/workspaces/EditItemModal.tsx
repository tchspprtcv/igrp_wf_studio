import React, { useState, useEffect } from 'react';
import { WorkflowEngineSDK } from 'igrp-wf-engine';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X } from 'lucide-react';

interface EditItemModalProps {
  type: 'area' | 'subarea' | 'process';
  workspaceCode: string;
  itemCode: string;
  parentCode?: string;
  onClose: () => void;
  onUpdated: () => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({
  type,
  workspaceCode,
  itemCode,
  parentCode,
  onClose,
  onUpdated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active' as 'active' | 'inactive' | 'draft'
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItemData();
  }, []);

  const loadItemData = async () => {
    try {
      const sdk = new WorkflowEngineSDK();
      const config = await sdk.workspaces.loadProjectConfig(workspaceCode);
      
      if (!config) {
        setError(`Workspace '${workspaceCode}' not found`);
        return;
      }

      let item;
      if (type === 'area') {
        item = config.areas.find((a: { code: string; }) => a.code === itemCode);
      } else if (type === 'subarea' && parentCode) {
        const area = config.areas.find((a: { code: string; }) => a.code === parentCode);
        item = area?.subareas.find((s: { code: string; }) => s.code === itemCode);
      } else if (type === 'process' && parentCode) {
        const area = config.areas.find((a: { code: string; }) => a.code === parentCode);
        if (area) {
          item = area.processes.find((p: { code: string; }) => p.code === itemCode);
          if (!item && area.subareas) {
            for (const subarea of area.subareas) {
              item = subarea.processes.find((p: { code: string; }) => p.code === itemCode);
              if (item) break;
            }
          }
        }
      }

      if (!item) {
        setError(`Item not found`);
        return;
      }

      setFormData({
        title: item.title,
        description: item.description || '',
        status: item.status
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsValidating(false);
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
      const sdk = new WorkflowEngineSDK();
      let result;

      if (type === 'area') {
        result = await sdk.workspaces.updateArea(
          workspaceCode,
          itemCode,
          formData.title,
          formData.description,
          formData.status
        );
      } else if (type === 'subarea') {
        result = await sdk.workspaces.updateSubArea(
          workspaceCode,
          parentCode!,
          itemCode,
          formData.title,
          formData.description,
          formData.status
        );
      } else {
        result = await sdk.workspaces.updateProcess(
          workspaceCode,
          parentCode!,
          itemCode,
          formData.title,
          formData.description,
          formData.status
        );
      }

      if (result.success) {
        onUpdated();
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

  const getTitle = () => {
    switch (type) {
      case 'area':
        return 'Edit Area';
      case 'subarea':
        return 'Edit SubArea';
      case 'process':
        return 'Edit Process';
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
          <h2 className="text-lg font-semibold">{getTitle()}</h2>
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
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter title"
                required
              />

              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Enter description"
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
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;