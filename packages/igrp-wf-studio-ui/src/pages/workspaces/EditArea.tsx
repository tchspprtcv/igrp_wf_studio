import React, { useState, useEffect } from 'react';
import { WorkflowEngineSDK } from 'igrp-wf-engine';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Label from '@/components/ui/Label';
import Select from '@/components/ui/Select'; // Add import for Select

interface Area {
  code: string;
  title: string;
  description?: string; // Add description
  status: 'active' | 'inactive' | 'draft'; // Add status
}

interface EditAreaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  appCode: string;
  area: Area;
}

const sdk = new WorkflowEngineSDK();

const EditArea: React.FC<EditAreaProps> = ({ isOpen, onClose, onSave, appCode, area }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // Add state for description
  const [status, setStatus] = useState<'active' | 'inactive' | 'draft'>('active'); // Add state for status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (area) {
      setTitle(area.title);
      setDescription(area.description || ''); // Initialize description
      setStatus(area.status || 'active'); // Initialize status
    }
  }, [area]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Assuming an updateArea method exists or similar logic to update config
      // This might need adjustment based on the actual SDK capabilities
      // Corrected call signature based on search results
      const result = await sdk.workspaces.updateArea(appCode, area.code, title, description, status);
      if (result.success) {
        onSave();
        onClose();
      } else {
        setError(result.message || 'Failed to update area.');
      }
    } catch (err) {
      console.error('Failed to update area:', err);
      setError((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(area?.title || '');
      setDescription(area?.description || ''); // Reset description
      setStatus(area?.status || 'active'); // Reset status
      setError(null);
      setLoading(false);
    } 
  }, [isOpen, area]);

  return (
    <Modal onClose={onClose} title={`Edit Area: ${area?.title}`}> {/* Removed isOpen prop */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="area-title">Title</Label>
          <Input
            id="area-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter area title"
            disabled={loading}
          />
        </div>
        {/* Add description field */}
        <div>
          <Label htmlFor="area-description">Description</Label>
          <Input
            id="area-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter area description"
            disabled={loading}
          />
        </div>
        {/* Add status field */}
        <div>
          <Label htmlFor="area-status">Status</Label>
          <Select
            id="area-status"
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
        <Button variant="secondary" onClick={onClose} disabled={loading}> {/* Changed variant to outline */}
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </Modal>
  );
};

export default EditArea;