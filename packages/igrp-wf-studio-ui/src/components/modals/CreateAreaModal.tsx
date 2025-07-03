"use client";

import React, { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addAreaToAction } from '@/app/actions'; // Ajustar caminho
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CreateAreaProps {
  workspaceCode: string;
  onClose: () => void;
  onCreated: () => void; // Chamado após criação bem-sucedida para refresh
}

const initialState: { message: string; success: boolean; errors?: any } = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      Create Area
    </Button>
  );
}

const CreateAreaModal: React.FC<CreateAreaProps> = ({
  workspaceCode,
  onClose,
  onCreated
}) => {
  const [formState, formAction] = useFormState(addAreaToAction, initialState);

  useEffect(() => {
    if (formState.success) {
      toast.success(formState.message || "Area created successfully!");
      onCreated(); // Para refresh da lista/árvore
      onClose();   // Fecha o modal
    } else if (formState.message && !formState.success && formState.message !== initialState.message) {
      toast.error(formState.message);
    }
  }, [formState, onCreated, onClose]);

  // Removida a lógica de auto-geração de código do cliente.
  // O usuário deve fornecer o código. A validação de duplicidade é feita pela action/SDK.

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create New Area</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="p-4 space-y-4">
          {/* Campo oculto para workspaceCode */}
          <input type="hidden" name="appCode" value={workspaceCode} />

          <Input
            label="Area Code"
            name="code"
            id="areaCode"
            placeholder="Enter area code (e.g., finance)"
            required
            error={formState.errors?.code?.[0]}
          />
          {formState.errors?.code && <p className="text-red-500 text-xs">{formState.errors.code[0]}</p>}

          <Input
            label="Title"
            name="title"
            id="areaTitle"
            placeholder="Enter area title"
            required
            error={formState.errors?.title?.[0]}
          />
          {formState.errors?.title && <p className="text-red-500 text-xs">{formState.errors.title[0]}</p>}

          <div>
            <label htmlFor="areaDescription" className="form-label">Description</label>
            <textarea
              name="description"
              id="areaDescription"
              className="input-field"
              rows={3}
              placeholder="Enter area description"
            />
            {formState.errors?.description && <p className="text-red-500 text-xs">{formState.errors.description[0]}</p>}
          </div>

          {/* Status é definido como 'active' por padrão na action */}

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

export default CreateAreaModal;