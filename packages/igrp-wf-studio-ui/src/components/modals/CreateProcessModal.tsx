"use client";

import React, { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addProcessToAction } from '@/app/actions'; // Ajustar caminho
import { WorkflowEngineSDK } from '@igrp/wf-engine'; // Para buscar a config para os selects
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CreateProcessProps {
  workspaceCode: string;
  onClose: () => void;
  // Ajustar onCreated para passar todos os identificadores necessários para navegação
  onCreated: (appCode: string, areaCode: string, subAreaCode: string | undefined, newProcessCode: string) => void;
  initialArea?: string | null;
  initialSubArea?: string | null;
  // Passar a lista de áreas do workspace para evitar busca no cliente
  availableAreas: { code: string, title: string, subareas: { code: string, title: string }[] }[];
}

const initialState: { message: string; success: boolean; errors?: any; newProcessCode?: string } = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      Create Process
    </Button>
  );
}

const CreateProcessModal: React.FC<CreateProcessProps> = ({
  workspaceCode,
  onClose,
  onCreated,
  initialArea,
  initialSubArea,
  availableAreas // Recebe as áreas
}) => {
  const [formState, formAction] = useFormState(addProcessToAction, initialState);

  const [selectedAreaCode, setSelectedAreaCode] = useState(initialArea || '');
  const [selectedSubAreaCode, setSelectedSubAreaCode] = useState(initialSubArea || '');

  useEffect(() => {
    if (formState.success && formState.newProcessCode) {
      toast.success(formState.message || "Process created successfully!");
      onCreated(workspaceCode, selectedAreaCode, selectedSubAreaCode || undefined, formState.newProcessCode);
      onClose();
    } else if (formState.message && !formState.success && formState.message !== initialState.message) {
      toast.error(formState.message);
    }
  }, [formState, onCreated, onClose, workspaceCode, selectedAreaCode, selectedSubAreaCode]);

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAreaCode(e.target.value);
    setSelectedSubAreaCode(''); // Reset subarea when area changes
  };

  const currentSelectedArea = availableAreas.find(a => a.code === selectedAreaCode);

  // Não há mais validação/geração de código no cliente.
  // O `isValidating` e `isGeneratingCode` foram removidos.

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create New Process</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="p-4 space-y-4">
          <input type="hidden" name="appCode" value={workspaceCode} />
          <input type="hidden" name="areaCode" value={selectedAreaCode} />
          {/* areaCode e subAreaCode serão passados via select e hidden inputs se necessário, ou a action os infere */}

          <div>
            <label htmlFor="areaCode" className="form-label">Area*</label>
            <select
              name="areaCode"
              id="areaCode"
              value={selectedAreaCode}
              onChange={handleAreaChange}
              className="input-field"
              required
              disabled={!!initialArea} // Desabilita se uma área inicial foi fornecida
            >
              <option value="">Select an area</option>
              {availableAreas.map(area => (
                <option key={area.code} value={area.code}>
                  {area.title}
                </option>
              ))}
            </select>
            {formState.errors?.areaCode && <p className="text-red-500 text-xs">{formState.errors.areaCode[0]}</p>}
          </div>

          {currentSelectedArea && currentSelectedArea.subareas.length > 0 && (
            <div>
              <label htmlFor="subAreaCode" className="form-label">SubArea (Optional)</label>
              <select
                name="subAreaCode"
                id="subAreaCode"
                value={selectedSubAreaCode}
                onChange={(e) => setSelectedSubAreaCode(e.target.value)}
                className="input-field"
                disabled={!!initialSubArea && selectedAreaCode === initialArea} // Desabilita se subárea inicial e área correspondente
              >
                <option value="">None</option>
                {currentSelectedArea.subareas.map(subarea => (
                  <option key={subarea.code} value={subarea.code}>
                    {subarea.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Process Code"
            name="code"
            id="processCode"
            placeholder="Enter process code (e.g., P.area.1)"
            required
            disabled={!selectedAreaCode} // Desabilitar se nenhuma área estiver selecionada
            error={formState.errors?.code?.[0]}
          />
           {formState.errors?.code && <p className="text-red-500 text-xs">{formState.errors.code[0]}</p>}

          <Input
            label="Title"
            name="title"
            id="processTitle"
            placeholder="Enter process title"
            required
            error={formState.errors?.title?.[0]}
          />
          {formState.errors?.title && <p className="text-red-500 text-xs">{formState.errors.title[0]}</p>}

          <div>
            <label htmlFor="processDescription" className="form-label">Description</label>
            <textarea
              name="description"
              id="processDescription"
              className="input-field"
              rows={3}
              placeholder="Enter process description"
            />
            {formState.errors?.description && <p className="text-red-500 text-xs">{formState.errors.description[0]}</p>}
          </div>

          {/* Status é 'active' por padrão na action */}

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

export default CreateProcessModal;