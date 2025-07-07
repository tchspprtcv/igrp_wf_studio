"use client";

import React, { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updateWorkspaceItemAction } from '@/app/actions';
// import Modal from '@/components/ui/Modal'; // Supondo que Modal é um componente genérico
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input'; // Usar htmlFor em label padrão
// import Select from '@/components/ui/Select'; // Usar select padrão
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react'; // Para o botão de fechar do modal, se não for genérico

// Este tipo pode vir de @/types se for o mesmo que EditItemFormData (parcialmente)
interface EditAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void; // Renomeado de onSave para consistência
  appCode: string;
  // Passar os dados atuais da área
  currentCode: string;
  currentTitle: string;
  currentDescription: string;
  currentStatus: 'active' | 'inactive' | 'draft';
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

const EditAreaModal: React.FC<EditAreaModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
  appCode,
  currentCode,
  currentTitle,
  currentDescription,
  currentStatus
}) => {
  const [formState, formAction] = useFormState(updateWorkspaceItemAction, initialState);

  // Campos controlados para o formulário, inicializados com props
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [status, setStatus] = useState(currentStatus);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
      setDescription(currentDescription);
      setStatus(currentStatus);
    }
  }, [isOpen, currentTitle, currentDescription, currentStatus]);

  useEffect(() => {
    if (formState.success) {
      toast.success(formState.message || "Area updated successfully!");
      onUpdated();
      onClose();
    } else if (formState.message && !formState.success && formState.message !== initialState.message) {
      toast.error(formState.message);
    }
  }, [formState, onUpdated, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    // Simulação da estrutura de um Modal, idealmente usaria um componente Modal genérico
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Edit Area: {currentCode}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="p-4 space-y-4">
          <input type="hidden" name="appCode" value={appCode} />
          <input type="hidden" name="itemType" value="area" />
          <input type="hidden" name="itemCode" value={currentCode} />
          {/* newCode não é editável aqui, então não é enviado ou é igual a itemCode */}

          <div>
            <FormInput
              id="areaTitle"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter area title"
              required
              error={'errors' in formState && typeof formState.errors === 'object' && formState.errors !== null && 'title' in formState.errors && Array.isArray(formState.errors.title) && formState.errors.title.length > 0 ? formState.errors.title[0] : undefined}
              label="Title"
            />
          </div>

          <div>
            <label htmlFor="area-description" className="form-label">Description</label>
            <textarea
              id="area-description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Enter area description"
            />
            {'errors' in formState && typeof formState.errors === 'object' && formState.errors !== null && 'description' in formState.errors && Array.isArray(formState.errors.description) && formState.errors.description.length > 0 && <p className="text-red-500 text-xs">{formState.errors.description[0]}</p>}
          </div>

          <div>
            <label htmlFor="area-status" className="form-label">Status</label>
            <select
              id="area-status"
              name="status"
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

          <div className="mt-6 flex justify-end space-x-2">
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

export default EditAreaModal;
