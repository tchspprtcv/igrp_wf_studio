"use client";

import React, { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addAreaToAction } from '@/app/actions';
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

interface CreateAreaProps {
  workspaceCode: string;
  existingAreaCodes: string[];
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
      {pending ? 'Creating...' : 'Create Area'}
    </Button>
  );
}

const CreateAreaModal: React.FC<CreateAreaProps> = ({
  workspaceCode,
  existingAreaCodes,
  onClose,
  onCreated
}) => {
  const [state, formAction] = useFormState(addAreaToAction, initialState);
  const [generatedCode, setGeneratedCode] = useState('');
  const [open, setOpen] = useState(true); // Control Dialog visibility

  useEffect(() => {
    if (workspaceCode) {
      const nextCode = generateNextCode('area', workspaceCode, undefined, existingAreaCodes);
      setGeneratedCode(nextCode);
    }
  }, [workspaceCode, existingAreaCodes]);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Area created successfully!");
      onCreated();
      handleClose();
    } else if (state.message && !state.success && state.message !== initialState.message) {
      // Error message is displayed via Alert component from formState.message
    }
  }, [state, onCreated, onClose]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  // Ensure that the dialog closes when the parent requests it (e.g. clicking outside if Dialog component supports it)
  // This effect handles external close requests.
  // useEffect(() => {
  //  if (!isOpenProp) setOpen(false); // Assuming a prop `isOpenProp` if controlled from outside
  // }, [isOpenProp]);


  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Area</DialogTitle>
          <DialogDescription>
            Add a new area to the workspace <code className="bg-muted px-1 py-0.5 rounded">{workspaceCode}</code>.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="appCode" value={workspaceCode} />

          <div className="space-y-1">
            <Label htmlFor="areaCode">Area Code</Label>
            <Input
              name="code"
              id="areaCode"
              placeholder="e.g., finance"
              defaultValue={generatedCode}
              required
              aria-describedby="code-error"
            />
            {state.errors?.code && (
              <p id="code-error" className="text-sm text-destructive">{state.errors.code[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="areaTitle">Title</Label>
            <Input
              name="title"
              id="areaTitle"
              placeholder="Enter area title"
              required
              aria-describedby="title-error"
            />
            {state.errors?.title && (
              <p id="title-error" className="text-sm text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="areaDescription">Description (Optional)</Label>
            <Textarea
              name="description"
              id="areaDescription"
              placeholder="Enter area description"
              aria-describedby="description-error"
            />
            {state.errors?.description && (
              <p id="description-error" className="text-sm text-destructive">{state.errors.description[0]}</p>
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

export default CreateAreaModal;
