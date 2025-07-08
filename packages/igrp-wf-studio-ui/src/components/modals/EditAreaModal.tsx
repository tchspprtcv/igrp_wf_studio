"use client";

import React, { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updateWorkspaceItemAction } from '@/app/actions';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';

interface EditAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  appCode: string;
  currentCode: string;
  currentTitle: string;
  currentDescription: string;
  currentStatus: 'active' | 'inactive' | 'draft';
}

const initialState: { message: string; success: boolean; errors?: Record<string, string[]> } = {
  message: '',
  success: false,
  errors: {},
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
  const [state, formAction] = useFormState(updateWorkspaceItemAction, initialState);

  // O estado do Dialog é controlado pela prop `isOpen`
  // Não precisamos de um `open` local se `Dialog` for usado corretamente com `onOpenChange`

  // Campos controlados para o formulário, inicializados com props
  // Estes são necessários porque os inputs do ShadCN podem ser controlados ou não controlados.
  // Para refletir as props iniciais e permitir edição, usamos estado local.
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [status, setStatus] = useState(currentStatus);

  // Atualizar estado local quando as props mudarem (se o modal for reutilizado para itens diferentes)
  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
      setDescription(currentDescription);
      setStatus(currentStatus);
    }
  }, [isOpen, currentTitle, currentDescription, currentStatus]);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Area updated successfully!");
      onUpdated();
      onClose(); // A prop onClose deve fechar o Dialog externamente
    } else if (state.message && !state.success && state.message !== initialState.message) {
      // Erro é exibido pelo Alert
    }
  }, [state, onUpdated, onClose]);

  const handleDialogClose = () => {
    // Resetar estado do formulário se necessário, ou apenas chamar onClose
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => { if (!openStatus) handleDialogClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Area: <code className="bg-muted px-1 py-0.5 rounded">{currentCode}</code></DialogTitle>
          <DialogDescription>
            Modify the details for this area. The area code cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="appCode" value={appCode} />
          <input type="hidden" name="itemType" value="area" />
          <input type="hidden" name="itemCode" value={currentCode} />
          {/* O novo código (newCode) não é editável para áreas, então não é enviado ou é o mesmo que itemCode.
              A action updateWorkspaceItemAction deve lidar com isso. Se newCode for obrigatório,
              devemos enviar itemCode como newCode.
          */}
           <input type="hidden" name="newCode" value={currentCode} />


          <div className="space-y-1">
            <Label htmlFor="areaTitle">Title</Label>
            <Input
              id="areaTitle"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter area title"
              required
              aria-describedby="edit-title-error"
            />
            {state.errors?.title && (
              <p id="edit-title-error" className="text-sm text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="areaDescription">Description (Optional)</Label>
            <Textarea
              id="areaDescription"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter area description"
              aria-describedby="edit-description-error"
            />
            {state.errors?.description && (
              <p id="edit-description-error" className="text-sm text-destructive">{state.errors.description[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="areaStatus">Status</Label>
            <Select name="status" value={status} onValueChange={(value) => setStatus(value as 'active' | 'inactive' | 'draft')}>
              <SelectTrigger id="areaStatus" aria-describedby="edit-status-error">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.status && (
              <p id="edit-status-error" className="text-sm text-destructive">{state.errors.status[0]}</p>
            )}
          </div>

          {state.message && !state.success && state.message !== initialState.message && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Update Failed</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" onClick={handleDialogClose}>Cancel</Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAreaModal;
