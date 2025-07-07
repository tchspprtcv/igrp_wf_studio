"use client";

import React, { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addProcessToAction } from '@/app/actions'; // Ajustar caminho
// import { WorkflowEngineSDK } from '@igrp/wf-engine'; // Não é mais usado para config aqui
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generateNextCode } from '@/lib/utils'; // Import the generator

interface CreateProcessProps {
  workspaceCode: string;
  onClose: () => void;
  onCreated: (appCode: string, areaCode: string, subAreaCode: string | undefined, newProcessCode: string) => void;
  initialArea?: string | null;
  initialSubArea?: string | null;
  availableAreas: { code: string, title: string, subareas: { code: string, title: string }[] }[];
  existingProcessCodes: string[]; // Prop to pass existing codes for the selected parent (area or subarea)
}

const initialState: { message: string; success: boolean; errors?: any; newProcessCode?: string } = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Process'}
    </Button>
  );
}

const CreateProcessModal: React.FC<CreateProcessProps> = ({
  workspaceCode,
  onClose,
  onCreated,
  initialArea,
  initialSubArea,
  availableAreas,
  existingProcessCodes
}) => {
  const [formState, formAction] = useFormState(addProcessToAction, initialState);

  const [selectedAreaCode, setSelectedAreaCode] = useState(initialArea || '');
  const [selectedSubAreaCode, setSelectedSubAreaCode] = useState(initialSubArea || '');
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    // Determine parent code for process code generation
    const parentCodeForProcess = selectedSubAreaCode || selectedAreaCode;
    if (parentCodeForProcess) {
      const nextCode = generateNextCode('process', workspaceCode, parentCodeForProcess, existingProcessCodes);
      setGeneratedCode(nextCode);
    } else {
      setGeneratedCode(''); // Clear if no parent is selected
    }
  }, [workspaceCode, selectedAreaCode, selectedSubAreaCode, existingProcessCodes]);


  useEffect(() => {
    if (formState.success && 'newProcessCode' in formState && formState.newProcessCode) {
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
          {/* Ensure subAreaCode is submitted if selected, especially when dropdown might be disabled */}
          {selectedSubAreaCode && (
            <input type="hidden" name="subAreaCode" value={selectedSubAreaCode} />
          )}

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
            {'errors' in formState && formState.errors?.areaCode && <p className="text-red-500 text-xs">{formState.errors.areaCode[0]}</p>}
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

          <FormInput
            label="Process Code"
            name="code"
            id="processCode"
            placeholder="e.g., P.01 or SUB.01"
            defaultValue={generatedCode} // Use generated code as default
            required
            disabled={!selectedAreaCode} // Desabilitar se nenhuma área estiver selecionada (ou no parent if no area selected)
            error={'errors' in formState ? formState.errors?.code?.[0] : undefined}
          />
 

          <FormInput
            label="Title"
            name="title"
            id="processTitle"
            placeholder="Enter process title"
            required
            error={'errors' in formState ? formState.errors?.title?.[0] : undefined}
          />


          <div>
            <label htmlFor="processDescription" className="form-label">Description</label>
            <textarea
              name="description"
              id="processDescription"
              className="input-field"
              rows={3}
              placeholder="Enter process description"
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

export default CreateProcessModal;
