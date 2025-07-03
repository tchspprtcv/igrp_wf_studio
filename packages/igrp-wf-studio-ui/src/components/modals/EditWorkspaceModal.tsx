"use client";

import React, { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updateWorkspaceOptionsAction } from '@/app/actions';
import Modal from '@/components/ui/Modal'; // Supondo que Modal é um componente genérico
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { AppOptions, WorkflowEngineSDK } from '@igrp/wf-engine';

interface EditWorkspaceModalProps {
  workspaceCode: string;
  currentTitle: string; // Passar dados atuais para evitar busca no modal
  currentDescription: string;
  onClose: () => void;
  onUpdated: () => void;
}

const initialState: { message: string; success: boolean; errors?: any } = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      Save Changes
    </Button>
  );
}

const EditWorkspaceModal: React.FC<EditWorkspaceModalProps> = ({
  workspaceCode,
  currentTitle,
  currentDescription,
  onClose,
  onUpdated
}) => {
  const [formState, formAction] = useFormState(updateWorkspaceOptionsAction, initialState);

  // Campos controlados para o formulário, inicializados com props
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);

  useEffect(() => {
    // Resetar campos se as props mudarem (ex: modal reutilizado para outro workspace)
    setTitle(currentTitle);
    setDescription(currentDescription);
  }, [currentTitle, currentDescription, workspaceCode]);

  useEffect(() => {
    if (formState.success) {
      toast.success(formState.message || 'Workspace updated successfully!');
      onUpdated();
      onClose();
    } else if (formState.message && !formState.success && formState.message !== initialState.message) {
      toast.error(formState.message);
    }
  }, [formState, onUpdated, onClose]);

  // A busca de dados inicial foi removida, pois os dados são passados via props.
  // O componente Modal genérico deve ser usado. Se não existir, esta estrutura é um bom começo.

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Edit Workspace: {workspaceCode}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            {/* <X className="h-5 w-5" /> // Supondo que o Modal genérico tem seu próprio botão de fechar */}
          </button>
        </div>
        <form action={formAction} className="p-4 space-y-4">
          <input type="hidden" name="workspaceCode" value={workspaceCode} />

          <Input
            label="Workspace Title"
            name="title"
            id="workspaceTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter workspace title"
            required
            error={formState.errors?.title?.[0]}
          />
          {formState.errors?.title && <p className="text-red-500 text-xs">{formState.errors.title[0]}</p>}

          <div>
            <label htmlFor="workspaceDescription" className="form-label">Description</label>
            <textarea
              name="description"
              id="workspaceDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field" // Usar classe de input-field para consistência
              rows={3}
              placeholder="Enter workspace description"
            />
            {formState.errors?.description && <p className="text-red-500 text-xs">{formState.errors.description[0]}</p>}
          </div>

          {formState.message && !formState.success && formState.message !== initialState.message && (
             <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">{formState.message}</div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWorkspaceModal;