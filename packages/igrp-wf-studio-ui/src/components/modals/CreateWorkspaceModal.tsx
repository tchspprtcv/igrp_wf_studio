"use client";

import React, { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createWorkspaceAction } from '@/app/actions'; // Ajustar caminho se necessário
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation'; // Para navegação opcional pós-criação

interface CreateWorkspaceProps {
  onClose: () => void;
  onCreated?: (newWorkspaceCode?: string) => void; // Modificado para passar o código do workspace
}

const initialState: { message: string; success: boolean; errors?: any, workspaceCode?: string } = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <span className="inline-block animate-spin mr-2">⟳</span>
      ) : null}
      Create Workspace
    </Button>
  );
}

const CreateWorkspace: React.FC<CreateWorkspaceProps> = ({ onClose, onCreated }) => {
  const [formState, formAction] = useFormState(createWorkspaceAction, initialState);
  const [code, setCode] = useState(''); // Para navegação opcional
  const router = useRouter();

  useEffect(() => {
    if (formState.success) {
      toast.success(formState.message || "Workspace created successfully!");
      onCreated?.(formState.workspaceCode); // Chama onCreated (que faz router.refresh())
      // A navegação para a página do novo workspace é opcional aqui.
      // O Dashboard será atualizado pelo router.refresh().
      // Se a navegação for desejada:
      // if (formState.workspaceCode) {
      //   router.push(`/workspaces/${formState.workspaceCode}`);
      // } else {
      //   onClose(); // Fecha o modal se não houver código para navegar
      // }
      onClose(); // Simplesmente fecha o modal e deixa o Dashboard atualizar.
    } else if (formState.message && !formState.success && formState.message !== initialState.message) {
      // Mostra erro apenas se houver uma mensagem e não for sucesso (e não for a inicial)
      toast.error(formState.message);
    }
  }, [formState, onCreated, onClose, router]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create New Workspace</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              name="code"
              id="code"
              placeholder="Enter workspace code (e.g., my-project)"
              required
              defaultValue={code}
              onChange={(e) => setCode(e.target.value)}
              className={formState.errors?.code ? "border-red-500" : ""}
            />
            {formState.errors?.code && <p className="text-red-500 text-xs">{formState.errors.code[0]}</p>}
          </div>


          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              name="title"
              id="title"
              placeholder="Enter workspace title"
              required
              className={formState.errors?.title ? "border-red-500" : ""}
            />
            {formState.errors?.title && <p className="text-red-500 text-xs">{formState.errors.title[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              name="description"
              id="description"
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${formState.errors?.description ? "border-red-500" : ""}`}
              rows={3}
              placeholder="Enter workspace description"
            />
            {formState.errors?.description && <p className="text-red-500 text-xs">{formState.errors.description[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="basePath">Diretório Base do Workspace (Caminho Absoluto)</Label>
            <Input
              name="basePath"
              id="basePath"
              placeholder="Ex: /utilizadores/nome/meus_workspaces/este_workspace ou C:\\Workspaces\\este_workspace"
              required
              className={formState.errors?.basePath ? "border-red-500" : ""}
            />
            {formState.errors?.basePath && <p className="text-red-500 text-xs">{formState.errors.basePath[0]}</p>}
          </div>


          {/* O campo status foi removido do formulário pois a action define como 'active' por padrão */}
          {/* Se precisar dele, adicionar de volta e no schema da action */}

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

export default CreateWorkspace;