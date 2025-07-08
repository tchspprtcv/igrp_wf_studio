"use client";

import React, { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addProcessToAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { generateNextCode } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';

interface CreateProcessProps {
  workspaceCode: string;
  onClose: () => void;
  onCreated: (appCode: string, areaCode: string, subAreaCode: string | undefined, newProcessCode: string) => void;
  initialArea?: string | null;
  initialSubArea?: string | null;
  availableAreas: { code: string, title: string, subareas: { code: string, title: string }[] }[];
  existingProcessCodes: string[]; // Para gerar código único no contexto do pai (área ou subárea)
}

const initialState: { message: string; success: boolean; errors?: Record<string, string[]>; newProcessCode?: string } = {
  message: '',
  success: false,
  errors: {},
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
  const [state, formAction] = useFormState(addProcessToAction, initialState);
  const [open, setOpen] = useState(true);

  const [selectedAreaCode, setSelectedAreaCode] = useState(initialArea || '');
  const [selectedSubAreaCode, setSelectedSubAreaCode] = useState(initialSubArea || '');
  const [generatedCode, setGeneratedCode] = useState('');

  // Efeito para gerar código quando a área/subárea selecionada muda
  useEffect(() => {
    const parentCodeForProcess = selectedSubAreaCode || selectedAreaCode;
    if (parentCodeForProcess) {
      // Nota: existingProcessCodes deve ser atualizado dinamicamente se o usuário mudar a área/subárea
      // e se a lista de códigos existentes depender do pai selecionado.
      // Por simplicidade, assumimos que `existingProcessCodes` é passado corretamente para o contexto atual.
      const nextCode = generateNextCode('process', workspaceCode, parentCodeForProcess, existingProcessCodes);
      setGeneratedCode(nextCode);
    } else {
      setGeneratedCode('');
    }
  }, [workspaceCode, selectedAreaCode, selectedSubAreaCode, existingProcessCodes]);

  useEffect(() => {
    if (state.success && state.newProcessCode) {
      toast.success(state.message || "Process created successfully!");
      onCreated(workspaceCode, selectedAreaCode, selectedSubAreaCode || undefined, state.newProcessCode);
      handleClose();
    } else if (state.message && !state.success && state.message !== initialState.message) {
      // Error message is displayed via Alert component
    }
  }, [state, onCreated, onClose, workspaceCode, selectedAreaCode, selectedSubAreaCode]);

  const handleAreaChange = (value: string) => {
    setSelectedAreaCode(value);
    setSelectedSubAreaCode('');
  };

  const handleSubAreaChange = (value: string) => {
    setSelectedSubAreaCode(value);
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const currentSelectedArea = availableAreas.find(a => a.code === selectedAreaCode);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Process</DialogTitle>
          <DialogDescription>
            Define the details for your new process in Workspace <code className="bg-muted px-1 py-0.5 rounded">{workspaceCode}</code>.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4 pt-2">
          <input type="hidden" name="appCode" value={workspaceCode} />
          {/* Os valores selecionados de areaCode e subAreaCode serão submetidos pelos Selects */}

          <div className="space-y-1">
            <Label htmlFor="processAreaCode">Area*</Label>
            <Select
              name="areaCode"
              value={selectedAreaCode}
              onValueChange={handleAreaChange}
              required
              disabled={!!initialArea}
            >
              <SelectTrigger id="processAreaCode" aria-describedby="process-area-error">
                <SelectValue placeholder="Select an area" />
              </SelectTrigger>
              <SelectContent>
                {availableAreas.map(area => (
                  <SelectItem key={area.code} value={area.code}>
                    {area.title} ({area.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.areaCode && (
              <p id="process-area-error" className="text-sm text-destructive">{state.errors.areaCode[0]}</p>
            )}
          </div>

          {currentSelectedArea && currentSelectedArea.subareas.length > 0 && (
            <div className="space-y-1">
              <Label htmlFor="processSubAreaCode">SubArea (Optional)</Label>
              <Select
                name="subAreaCode"
                value={selectedSubAreaCode}
                onValueChange={handleSubAreaChange}
                disabled={!!initialSubArea && selectedAreaCode === initialArea}
              >
                <SelectTrigger id="processSubAreaCode">
                  <SelectValue placeholder="None (process in selected Area)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (process in selected Area)</SelectItem>
                  {currentSelectedArea.subareas.map(subarea => (
                    <SelectItem key={subarea.code} value={subarea.code}>
                      {subarea.title} ({subarea.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Erro para subAreaCode não é explicitamente tratado aqui, mas pode ser adicionado se necessário */}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="processCode">Process Code</Label>
            <Input
              name="code"
              id="processCode"
              placeholder="e.g., P.01 or SUB.01"
              value={generatedCode} // Controlado pelo estado para refletir a geração dinâmica
              onChange={(e) => setGeneratedCode(e.target.value)} // Permitir override manual
              required
              disabled={!selectedAreaCode}
              aria-describedby="process-code-error"
            />
            {state.errors?.code && (
              <p id="process-code-error" className="text-sm text-destructive">{state.errors.code[0]}</p>
            )}
          </div>
 
          <div className="space-y-1">
            <Label htmlFor="processTitle">Title</Label>
            <Input
              name="title"
              id="processTitle"
              placeholder="Enter process title"
              required
              aria-describedby="process-title-error"
            />
            {state.errors?.title && (
              <p id="process-title-error" className="text-sm text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="processDescription">Description (Optional)</Label>
            <Textarea
              name="description"
              id="processDescription"
              placeholder="Enter process description"
              aria-describedby="process-description-error"
            />
            {state.errors?.description && (
              <p id="process-description-error" className="text-sm text-destructive">{state.errors.description[0]}</p>
            )}
          </div>

          {/* Status is handled by the action, defaults to 'active' */}

          {state.message && !state.success && state.message !== initialState.message && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Creation Failed</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={handleClose} type="button">Cancel</Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProcessModal;
