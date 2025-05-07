import React, { useState, useEffect } from 'react';
import { WorkflowEngineSDK } from 'igrp-wf-engine';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { AppOptions } from 'igrp-wf-engine'; // Import AppOptions type

interface EditWorkspaceProps {
  workspaceCode: string;
  onClose: () => void;
  onUpdated: () => void;
}

const sdk = new WorkflowEngineSDK();

const EditWorkspace: React.FC<EditWorkspaceProps> = ({ workspaceCode, onClose, onUpdated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      try {
        setLoading(true);
        // Fetch all workspace options and find the one matching workspaceCode
        const allWorkspaces = await sdk.workspaces.listWorkspaces();
        const currentWorkspace = allWorkspaces.find((ws: { code: string; }) => ws.code === workspaceCode);

        if (currentWorkspace) {
          setTitle(currentWorkspace.title || workspaceCode);
          setDescription(currentWorkspace.description || '');
        } else {
          // Fallback or error handling if workspace options not found
          console.warn(`Workspace options not found for code: ${workspaceCode}`);
          // Attempt to load config as a fallback for title (though it lacks description)
          const config = await sdk.workspaces.loadProjectConfig(workspaceCode);
          setTitle(config?.project || workspaceCode); // Use project name from config or code
          setDescription(''); // No description in config
          toast.error('Could not load full workspace details.');
        }
      } catch (error) {
        console.error('Failed to load workspace details:', error);
        toast.error('Failed to load workspace details.');
        onClose(); // Close modal if loading fails
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaceDetails();
  }, [workspaceCode, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // TODO: Replace with sdk.workspaces.updateWorkspaceOptions once implemented
      // For now, this will likely fail or needs adjustment based on SDK update
      const updatedOptions: Partial<AppOptions> = {
        title: title,
        description: description,
        // updated_at is handled by the SDK method
      };

      // Placeholder for the actual update call - This needs the SDK method
      const result = await sdk.workspaces.updateWorkspaceOptions(workspaceCode, updatedOptions);
      // console.warn("SDK method 'updateWorkspaceOptions' not yet implemented. Simulating success.");
      // const result = { success: true, message: "Workspace updated (simulated)." }; // Simulation

      // --- End of Placeholder ---

      if (result.success) { // Assuming result structure
        toast.success('Workspace updated successfully!');
        onUpdated();
        onClose();
      } else {
        toast.error(result.message || 'Failed to update workspace.');
      }
    } catch (error) {
      console.error('Failed to update workspace:', error);
      toast.error(`Failed to update workspace: ${(error as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit Workspace" onClose={onClose}>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Workspace Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter workspace title"
            required
            disabled // Assuming code/title might not be editable, adjust if needed
          />
          <Input
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter workspace description"
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}> {/* Changed variant to secondary */}
              Cancel
            </Button>
            <Button type="submit" isLoading={saving} disabled={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EditWorkspace;