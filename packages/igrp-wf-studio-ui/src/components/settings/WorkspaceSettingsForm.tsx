"use client";

import React, { useState, useEffect, startTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import {
  getBaseWorkspacePathAction,
  setBaseWorkspacePathAction,
  FormState
} from '@/app/workspaceSettingsActions'; // Ajustar caminho se necessário
import Button from '@/components/ui/Button'; // Supondo que existe
import Input from '@/components/ui/Input';   // Supondo que existe
import { toast } from 'react-hot-toast';

const initialState: FormState = {
  message: '',
  success: false,
  path: '',
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="mt-4">
      Salvar Diretório Base
    </Button>
  );
}

const WorkspaceSettingsForm: React.FC = () => {
  const [formState, formAction] = useFormState(setBaseWorkspacePathAction, initialState);
  const [currentBasePath, setCurrentBasePath] = useState<string>('');
  const [isLoadingPath, setIsLoadingPath] = useState<boolean>(true);

  useEffect(() => {
    startTransition(() => {
      setIsLoadingPath(true);
      getBaseWorkspacePathAction()
        .then(path => {
          setCurrentBasePath(path);
          // Também podemos definir o valor inicial do input aqui se ele não estiver ligado ao formState.path
        })
        .catch(err => {
          toast.error("Falha ao carregar o diretório base atual.");
          console.error(err);
        })
        .finally(() => setIsLoadingPath(false));
    });
  }, []);

  useEffect(() => {
    if (formState.success) {
      toast.success(formState.message);
      if (formState.path) {
        setCurrentBasePath(formState.path); // Atualiza o path exibido após salvar
      }
    } else if (formState.message && !formState.success && formState.message !== initialState.message) {
      const errorMessage = formState.errors?._form?.[0] || formState.message;
      toast.error(errorMessage);
    }
  }, [formState]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Configurações do Workspace</h2>
      <p className="text-sm text-gray-600 mb-6">
        Defina o diretório no seu sistema onde os dados dos workspaces (metadados, diagramas BPMN, etc.) serão armazenados.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="basePath" className="block text-sm font-medium text-gray-700 mb-1">
            Diretório Base Atual
          </label>
          {isLoadingPath ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md break-all">
              {currentBasePath || 'Não definido ou usando padrão.'}
            </p>
          )}
        </div>

        <Input
          label="Novo Diretório Base"
          name="basePath"
          id="basePath"
          type="text"
          placeholder="Ex: /home/utilizador/meus_workspaces ou C:\\Utilizadores\\Utilizador\\meus_workspaces"
          defaultValue={formState.path || currentBasePath} // Pode precisar ajustar a lógica de defaultValue
          // Se quiser que o input reflita o currentBasePath ao carregar:
          // value={inputValue} onChange={e => setInputValue(e.target.value)} -> componente controlado
          // ou usar key={currentBasePath} no Input para forçar remount se currentBasePath mudar externamente
          error={formState.errors?.path?.join(', ')}
          className="mt-1 block w-full"
          required
        />
        {formState.errors?.path && (
          <p className="text-xs text-red-500 mt-1">{formState.errors.path.join(', ')}</p>
        )}

        {formState.errors?._form && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{formState.errors._form.join(', ')}</p>
        )}

        <SubmitButton />
      </form>
      <p className="text-xs text-gray-500 mt-4">
        Nota: A alteração deste diretório pode fazer com que workspaces existentes não sejam encontrados se não forem movidos para o novo local.
        O IGRP Studio não moverá os dados automaticamente. Certifique-se de que o caminho é acessível e possui permissões de escrita.
      </p>
    </div>
  );
};

export default WorkspaceSettingsForm;
