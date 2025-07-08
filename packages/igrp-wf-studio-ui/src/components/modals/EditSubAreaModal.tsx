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

interface EditSubAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  appCode: string;
  areaCode: string; // parentCode
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

const EditSubAreaModal: React.FC<EditSubAreaModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
  appCode,
  areaCode, // Este é o parentCode para a action
  currentCode,
  currentTitle,
  currentDescription,
  currentStatus
}) => {
  const [state, formAction] = useFormState(updateWorkspaceItemAction, initialState);

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
    if (state.success) {
      toast.success(state.message || "SubArea updated successfully!");
      onUpdated();
      onClose();
    } else if (state.message && !state.success && state.message !== initialState.message) {
      // Error is displayed via Alert
    }
  }, [state, onUpdated, onClose]);

  const handleDialogClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => { if (!openStatus) handleDialogClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit SubArea: <code className="bg-muted px-1 py-0.5 rounded">{currentCode}</code></DialogTitle>
          <DialogDescription>
            Modifying subarea within Area <code className="bg-muted px-1 py-0.5 rounded">{areaCode}</code>. The subarea code cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4 pt-2">
          <input type="hidden" name="appCode" value={appCode} />
          <input type="hidden" name="itemType" value="subarea" />
          <input type="hidden" name="itemCode" value={currentCode} />
          <input type="hidden" name="parentCode" value={areaCode} />
          {/* newCode não é editável para subáreas, então enviamos o currentCode */}
          <input type="hidden" name="newCode" value={currentCode} />


          <div className="space-y-1">
            <Label htmlFor="editSubAreaTitle">Title</Label>
            <Input
              id="editSubAreaTitle"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter subarea title"
              required
              aria-describedby="edit-subarea-title-error"
            />
            {state.errors?.title && (
              <p id="edit-subarea-title-error" className="text-sm text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="editSubAreaDescription">Description (Optional)</Label>
            <Textarea
              id="editSubAreaDescription"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter subarea description"
              aria-describedby="edit-subarea-description-error"
            />
            {state.errors?.description && (
              <p id="edit-subarea-description-error" className="text-sm text-destructive">{state.errors.description[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="editSubAreaStatus">Status</Label>
            <Select name="status" value={status} onValueChange={(value) => setStatus(value as 'active' | 'inactive' | 'draft')}>
              <SelectTrigger id="editSubAreaStatus" aria-describedby="edit-subarea-status-error">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.status && (
              <p id="edit-subarea-status-error" className="text-sm text-destructive">{state.errors.status[0]}</p>
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

export default EditSubAreaModal;
