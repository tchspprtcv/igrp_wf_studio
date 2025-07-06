"use client";

import React, { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addSubAreaToAction } from '@/app/actions'; // Ajustar caminho
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generateNextCode } from '@/lib/utils'; // Import the generator

interface CreateSubAreaProps {
  workspaceCode: string; // Still needed for the form action
  areaCode: string;      // Parent code for generation
  existingSubAreaCodes: string[]; // Prop to pass existing codes for this area
  onClose: () => void;
  onCreated: () => void;
}

const initialState: { message: string; success: boolean; errors?: any } = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      Create SubArea
    </Button>
  );
}

const CreateSubAreaModal: React.FC<CreateSubAreaProps> = ({
  workspaceCode,
  areaCode,
  existingSubAreaCodes,
  onClose,
  onCreated
}) => {
  const [formState, formAction] = useFormState(addSubAreaToAction, initialState);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    // Generate code when the modal is opened or parentAreaCode/existingSubAreaCodes change
    if (areaCode) {
      // projectCode (workspaceCode) is not directly used by generateNextCode for subareas,
      // but it's good practice to ensure parentCode (areaCode) is present.
      const nextCode = generateNextCode('subarea', workspaceCode, areaCode, existingSubAreaCodes);
      setGeneratedCode(nextCode);
    }
  }, [workspaceCode, areaCode, existingSubAreaCodes]);

  useEffect(() => {
    if (formState.success) {
      toast.success(formState.message || "SubArea created successfully!");
      onCreated();
      onClose();
    } else if (formState.message && !formState.success && formState.message !== initialState.message) {
      toast.error(formState.message);
    }
  }, [formState, onCreated, onClose]);

  // Removida a lógica de auto-geração de código e validação de workspace/area do cliente.
  // O usuário deve fornecer o código da subárea.

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create New SubArea</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="p-4 space-y-4">
          <input type="hidden" name="appCode" value={workspaceCode} />
          <input type="hidden" name="areaCode" value={areaCode} />

          <div className="mb-2">
            <label className="form-label text-sm text-gray-500">Workspace</label>
            <p className="font-medium">{workspaceCode}</p>
          </div>
          <div className="mb-4">
            <label className="form-label text-sm text-gray-500">Parent Area</label>
            <p className="font-medium">{areaCode}</p>
          </div>

          <Input
            label="SubArea Code"
            name="code"
            id="subAreaCode"
            placeholder="e.g., reports"
            defaultValue={generatedCode} // Use generated code as default
            required
            error={'errors' in formState ? formState.errors?.code?.[0] : undefined}
          />
          {'errors' in formState && formState.errors?.code && <p className="text-red-500 text-xs">{formState.errors.code[0]}</p>}

          <Input
            label="Title"
            name="title"
            id="subAreaTitle"
            placeholder="Enter subarea title"
            required
            error={'errors' in formState ? formState.errors?.title?.[0] : undefined}
          />
          {'errors' in formState && formState.errors?.title && <p className="text-red-500 text-xs">{formState.errors.title[0]}</p>}

          <div>
            <label htmlFor="subAreaDescription" className="form-label">Description</label>
            <textarea
              name="description"
              id="subAreaDescription"
              className="input-field"
              rows={3}
              placeholder="Enter subarea description"
            />
             {'errors' in formState && formState.errors?.description && <p className="text-red-500 text-xs">{formState.errors.description[0]}</p>}
          </div>

          {/* Status é 'active' por padrão na action */}

          {'errors' in formState && formState.message && !formState.success && formState.message !== initialState.message && (
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

export default CreateSubAreaModal;