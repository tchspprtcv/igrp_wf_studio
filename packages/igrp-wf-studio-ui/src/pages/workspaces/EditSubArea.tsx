import React, { useState, useEffect } from 'react';
import { WorkflowEngineSDK } from 'igrp-wf-engine';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Label from '@/components/ui/Label';
import Select from '@/components/ui/Select'; // Add import for Select

interface SubArea {
  code: string;
  title: string;
  description?: string; // Add description
  status: 'active' | 'inactive' | 'draft'; // Add status
}

interface EditSubAreaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  appCode: string;
  areaCode: string;
  subArea: SubArea;
}

const sdk = new WorkflowEngineSDK();

const EditSubArea: React.FC<EditSubAreaProps> = ({ isOpen, onClose, onSave, appCode, areaCode, subArea }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // Add state for description
  const [status, setStatus] = useState<'active' | 'inactive' | 'draft'>('active'); // Add state for status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subArea) {
      setTitle(subArea.title);
      setDescription(subArea.description || ''); // Initialize description
      setStatus(subArea.status || 'active'); // Initialize status
    }
  }, [subArea]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Assuming an updateSubArea method exists or similar logic to update config
      // This might need adjustment based on the actual SDK capabilities
      // Corrected call signature based on search results
      const result = await sdk.workspaces.updateSubArea(appCode, areaCode, subArea.code, title, description, status);
      if (result.success) {
        onSave();
        onClose();
      } else {
        setError(result.message || 'Failed to update subarea.');
      }
    } catch (err) {
      console.error('Failed to update subarea:', err);
      setError((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(subArea?.title || '');
      setDescription(subArea?.description || ''); // Reset description
      setStatus(subArea?.status || 'active'); // Reset status
      setError(null);
      setLoading(false);
    }
  }, [isOpen, subArea]);

  return (
    <Modal onClose={onClose} title={`Edit SubArea: ${subArea?.title}`}> {/* Removed isOpen prop */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="subarea-title">Title</Label>
          <Input
            id="subarea-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter subarea title"
            disabled={loading}
          />
        </div>
        {/* Add description field */}
        <div>
          <Label htmlFor="subarea-description">Description</Label>
          <Input
            id="subarea-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter subarea description"
            disabled={loading}
          />
        </div>
        {/* Add status field */}
        <div>
          <Label htmlFor="subarea-status">Status</Label>
          <Select
            id="subarea-status"
            value={status}
            onValueChange={(value) => setStatus(value as 'active' | 'inactive' | 'draft')}
            disabled={loading}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </Select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <div className="mt-6 flex justify-end space-x-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </Modal>
  );
};

export default EditSubArea;