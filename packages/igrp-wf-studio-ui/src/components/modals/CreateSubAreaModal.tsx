"use client";

import React, { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addSubAreaToAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface CreateSubAreaProps {
  workspaceCode: string;
  areaCode: string;
  existingSubAreaCodes: string[];
  onClose: () => void;
  onCreated: () => void;
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
      {pending ? 'Creating...' : 'Create SubArea'}
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
  const [state, formAction] = useFormState(addSubAreaToAction, initialState);
  const [generatedCode, setGeneratedCode] = useState('');
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (areaCode) {
      const nextCode = generateNextCode('subarea', workspaceCode, areaCode, existingSubAreaCodes);
      setGeneratedCode(nextCode);
    }
  }, [workspaceCode, areaCode, existingSubAreaCodes]);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "SubArea created successfully!");
      onCreated();
      handleClose();
    } else if (state.message && !state.success && state.message !== initialState.message) {
      // Error message is displayed via Alert component
    }
  }, [state, onCreated, onClose]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New SubArea</DialogTitle>
          <DialogDescription>
            Adding a subarea to Area <code className="bg-muted px-1 py-0.5 rounded">{areaCode}</code> in Workspace <code className="bg-muted px-1 py-0.5 rounded">{workspaceCode}</code>.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4 pt-2">
          <input type="hidden" name="appCode" value={workspaceCode} />
          <input type="hidden" name="areaCode" value={areaCode} />

          {/* Context Information (Readonly) - Optional, as it's in DialogDescription */}
          {/*
          <div className="space-y-1">
            <Label>Workspace</Label>
            <p className="text-sm text-muted-foreground">{workspaceCode}</p>
          </div>
          <div className="space-y-1">
            <Label>Parent Area</Label>
            <p className="text-sm text-muted-foreground">{areaCode}</p>
          </div>
          */}

          <div className="space-y-1">
            <Label htmlFor="subAreaCode">SubArea Code</Label>
            <Input
              name="code"
              id="subAreaCode"
              placeholder="e.g., reports"
              defaultValue={generatedCode}
              required
              aria-describedby="subarea-code-error"
            />
            {state.errors?.code && (
              <p id="subarea-code-error" className="text-sm text-destructive">{state.errors.code[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="subAreaTitle">Title</Label>
            <Input
              name="title"
              id="subAreaTitle"
              placeholder="Enter subarea title"
              required
              aria-describedby="subarea-title-error"
            />
            {state.errors?.title && (
              <p id="subarea-title-error" className="text-sm text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="subAreaDescription">Description (Optional)</Label>
            <Textarea
              name="description"
              id="subAreaDescription"
              placeholder="Enter subarea description"
              aria-describedby="subarea-description-error"
            />
            {state.errors?.description && (
              <p id="subarea-description-error" className="text-sm text-destructive">{state.errors.description[0]}</p>
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

export default CreateSubAreaModal;
