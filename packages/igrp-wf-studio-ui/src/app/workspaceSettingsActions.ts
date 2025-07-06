"use server";

import { z } from 'zod';
import {
  getBaseWorkspacePath,
  setBaseWorkspacePath as setBaseWorkspacePathCore
} from '@/igrpwfstudio/config/workspace';
import { revalidateTag } from 'next/cache';

// Schema para validação do caminho
const pathSchema = z.string().min(1, "O caminho não pode estar vazio.");

export interface FormState {
  message: string;
  success: boolean;
  path?: string;
  errors?: {
    path?: string[];
    _form?: string[];
  };
}

export async function getBaseWorkspacePathAction(): Promise<string> {
  return getBaseWorkspacePath();
}

export async function setBaseWorkspacePathAction(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  try {
    const newPath = formData.get('basePath');

    const validationResult = pathSchema.safeParse(newPath);
    if (!validationResult.success) {
      return {
        success: false,
        message: "Validação falhou.",
        errors: validationResult.error.flatten().fieldErrors
      };
    }

    const result = await setBaseWorkspacePathCore(validationResult.data);

    if (result.success) {
      // Revalidar tags que dependem da lista de workspaces,
      // pois o caminho base mudou e a lista pode ser diferente.
      revalidateTag('workspaces');
      revalidateTag('projects');
      return {
        success: true,
        message: result.message || "Diretório base atualizado com sucesso!",
        path: result.path
      };
    } else {
      return {
        success: false,
        message: result.message || "Falha ao atualizar o diretório base.",
        errors: { _form: [result.message || "Erro desconhecido"] }
      };
    }
  } catch (error: any) {
    console.error("Error in setBaseWorkspacePathAction:", error);
    return {
      success: false,
      message: "Ocorreu um erro inesperado no servidor.",
      errors: { _form: [error.message] }
    };
  }
}
