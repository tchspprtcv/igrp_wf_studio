"use client";

import React, { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updateWorkspaceItemAction } from '@/app/actions'; // Ajustar caminho
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EditItemModalProps {
  isOpen: boolean; // Control visibility from parent
  type: 'area' | 'subarea' | 'process';
  workspaceCode: string; // appCode
  itemCode: string;      // code of the item being edited
  parentCode?: string;   // areaCode if item is subarea/process
  grandParentCode?: string; // areaCode if item is process within subarea (parentCode would be subAreaCode)
  currentTitle: string;
  currentDescription: string;
  currentStatus: 'active' | 'inactive' | 'draft';
  onClose: () => void;
  onUpdated: () => void; // Callback after successful update
}

const initialState: { message: string; success: boolean; errors?: any } = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  type,
  workspaceCode,
  itemCode,
  parentCode,
  grandParentCode,
  currentTitle,
  currentDescription,
  currentStatus,
  onClose,
  onUpdated
}) => {
  const [formState, formAction] = useFormState(updateWorkspaceItemAction, initialState);

  // Use local state for form fields, initialized by props, so they can be edited.
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [status, setStatus] = useState(currentStatus);

  useEffect(() => {
    // Reset form fields if the item being edited changes (e.g., modal is reused)
    setTitle(currentTitle);
    setDescription(currentDescription);
    setStatus(currentStatus);
  }, [isOpen, itemCode, currentTitle, currentDescription, currentStatus]);

  useEffect(() => {
    if (formState.success) {
      toast.success(formState.message || "Item updated successfully!");
      onUpdated();
      onClose();
    } else if (formState.message && !formState.success && formState.message !== initialState.message) {
      toast.error(formState.message);
    }
  }, [formState, onUpdated, onClose]);

  if (!isOpen) {
    return null;
  }

  const getModalTitle = () => {
    switch (type) {
      case 'area': return `Edit Area: ${itemCode}`;
      case 'subarea': return `Edit SubArea: ${itemCode}`;
      case 'process': return `Edit Process: ${itemCode}`;
      default: return 'Edit Item';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{getModalTitle()}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="p-4 space-y-4">
          <input type="hidden" name="appCode" value={workspaceCode} />
          <input type="hidden" name="itemType" value={type} />
          <input type="hidden" name="itemCode" value={itemCode} />
          {parentCode && <input type="hidden" name="parentCode" value={parentCode} />}
          {grandParentCode && <input type="hidden" name="grandParentCode" value={grandParentCode} />}

          {/* Note: Editing 'code' (itemCode) itself is complex and not handled here.
              If 'code' needs to be editable, the Server Action and SDK would need specific support for renaming.
              For now, 'code' is treated as a fixed identifier for the update.
          */}

          <FormInput
            label="Title"
            name="title"
            id="item-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            required
            error={'errors' in formState && typeof formState.errors === 'object' && formState.errors !== null && 'title' in formState.errors && Array.isArray(formState.errors.title) && formState.errors.title.length > 0 ? formState.errors.title[0] : undefined}
          />
          {'errors' in formState && typeof formState.errors === 'object' && formState.errors !== null && 'title' in formState.errors && Array.isArray(formState.errors.title) && formState.errors.title.length > 0 && <p className="text-red-500 text-xs">{formState.errors.title[0]}</p>}

          <div>
            <label htmlFor="editItemDescription" className="form-label">Description</label>
            <textarea
              name="description"
              id="editItemDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Enter description"
            />
            {'errors' in formState && typeof formState.errors === 'object' && formState.errors !== null && 'description' in formState.errors && Array.isArray(formState.errors.description) && formState.errors.description.length > 0 && <p className="text-red-500 text-xs">{formState.errors.description[0]}</p>}
          </div>

          <div>
            <label htmlFor="editItemStatus" className="form-label">Status</label>
            <select
              name="status"
              id="editItemStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'draft')}
              className="input-field"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
            {'errors' in formState && typeof formState.errors === 'object' && formState.errors !== null && 'status' in formState.errors && Array.isArray(formState.errors.status) && formState.errors.status.length > 0 && <p className="text-red-500 text-xs">{formState.errors.status[0]}</p>}
          </div>

          {formState.message && !formState.success && formState.message !== initialState.message && (
             <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">{formState.message}</div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
