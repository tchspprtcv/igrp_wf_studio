"use server";

import { revalidatePath, revalidateTag } from "next/cache"; // Adicionar revalidateTag
import { WorkflowEngineSDK, ProjectConfig, AppOptions } from '@igrp/wf-engine';
import { z } from 'zod';

// Instanciar o SDK. Considerar injetar ou configurar basePath de forma mais robusta.
const sdk = new WorkflowEngineSDK();

// Schema para validação do código do workspace
const workspaceCodeSchema = z.string().min(1, "Workspace code cannot be empty.");

export async function deleteWorkspaceAction(code: string) {
  try {
    // Validar input
    const validatedCode = workspaceCodeSchema.parse(code);

    console.log(`Server Action: Deleting workspace ${validatedCode}`);
    const result = await sdk.workspaces.deleteWorkspace(validatedCode);

    if (result.success) {
      revalidatePath("/");
      revalidatePath("/workspaces");
      revalidateTag('workspaces'); // Tag para getDashboardDataCached (lista de workspaces)
      revalidateTag('projects');   // Tag para getProjectConfigCached (se a exclusão afetar todos os projetos)
      return { success: true, message: result.message || `Workspace '${validatedCode}' deleted.` };
    } else {
      return { success: false, message: result.message || "Failed to delete workspace." };
    }
  } catch (error) {
    console.error("Error in deleteWorkspaceAction:", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid input: " + error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, message: "An unexpected error occurred." };
  }
}

// Schema para validação do código do app para exportação
const exportAppCodeSchema = z.string().min(1, "App code cannot be empty for export.");

export interface ProcessExportData {
  path: string; // ex: areaCode/subAreaCode/processCode.bpmn
  content: string;
}
export interface WorkspaceExportData {
  projectConfig: ProjectConfig | null;
  processes: ProcessExportData[];
}

export async function getWorkspaceExportDataAction(appCode: string): Promise<{ success: boolean; data?: WorkspaceExportData; message?: string }> {
  try {
    const validatedAppCode = exportAppCodeSchema.parse(appCode);

    const projectConfig = await sdk.workspaces.loadProjectConfig(validatedAppCode);
    if (!projectConfig) {
      return { success: false, message: `Could not load configuration for workspace ${validatedAppCode}.` };
    }

    const processes: ProcessExportData[] = [];

    for (const area of projectConfig.areas || []) {
      for (const process of area.processes || []) {
        try {
          const processDefinition = await sdk.processes.readProcessDefinition(
            validatedAppCode,
            area.code,
            process.code
          );
          if (processDefinition?.bpmnXml) {
            processes.push({
              path: `${area.code}/${process.code}.bpmn`,
              content: processDefinition.bpmnXml,
            });
          }
        } catch (e) {
          console.warn(`Could not read process ${process.code} in area ${area.code} for export: ${(e as Error).message}`);
          // Opcional: Adicionar uma mensagem de erro parcial ao resultado
        }
      }

      for (const subArea of area.subareas || []) {
        for (const process of subArea.processes || []) {
          try {
            const processDefinition = await sdk.processes.readProcessDefinition(
              validatedAppCode,
              area.code,
              process.code,
              subArea.code
            );
            if (processDefinition?.bpmnXml) {
              processes.push({
                path: `${area.code}/${subArea.code}/${process.code}.bpmn`,
                content: processDefinition.bpmnXml,
              });
            }
          } catch (e) {
            console.warn(`Could not read process ${process.code} in subarea ${subArea.code} for export: ${(e as Error).message}`);
          }
        }
      }
    }

    return {
      success: true,
      data: { projectConfig, processes }
    };

  } catch (error) {
    console.error(`Error in getWorkspaceExportDataAction for ${appCode}:`, error);
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid app code: " + error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, message: `Failed to get export data for workspace: ${(error as Error).message}` };
  }
}


// --- Schemas de Validação ---
const itemCodeSchema = z.string().min(1, "Code cannot be empty").regex(/^[a-zA-Z0-9_.-]+$/, "Code can only contain letters, numbers, underscores, dots, and hyphens.");
const titleSchema = z.string().min(1, "Title cannot be empty");
const descriptionSchema = z.string().optional();

const appCodeParamSchema = z.string().min(1, "Workspace code is required.");
const areaCodeParamSchema = z.string().min(1, "Area code is required.");
const subAreaCodeParamSchema = z.string().optional();


// Schema para Add Area
const addAreaSchema = z.object({
  appCode: appCodeParamSchema,
  code: itemCodeSchema,
  title: titleSchema,
  description: descriptionSchema,
});

// Schema para Add SubArea
const addSubAreaSchema = z.object({
  appCode: appCodeParamSchema,
  areaCode: areaCodeParamSchema,
  code: itemCodeSchema,
  title: titleSchema,
  description: descriptionSchema,
});

// Schema para Add Process
const addProcessSchema = z.object({
  appCode: appCodeParamSchema,
  areaCode: areaCodeParamSchema,
  subAreaCode: subAreaCodeParamSchema,
  code: itemCodeSchema,
  title: titleSchema,
  description: descriptionSchema,
});


// --- Server Actions ---

export async function addAreaToAction(prevState: any, formData: FormData) {
  const rawData = {
    appCode: formData.get('appCode'),
    code: formData.get('code'),
    title: formData.get('title'),
    description: formData.get('description'),
  };
  const validation = addAreaSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, message: "Validation failed.", errors: validation.error.flatten().fieldErrors };
  }
  const { appCode, code, title, description } = validation.data;
  const result = await sdk.workspaces.addArea(appCode, code, title, description || '', 'active');
  if (result.success) {
    revalidatePath(`/workspaces/${appCode}`);
    revalidateTag('projects');
    // Se a sidebar ou outras partes da UI dependem diretamente da lista de áreas de um workspace específico
    // e usam uma tag como `project-${appCode}-areas`, essa tag também deveria ser revalidada.
    // Por simplicidade, 'projects' pode cobrir isso se os dados forem re-buscados.
  }
  return result;
}

export async function addSubAreaToAction(prevState: any, formData: FormData) {
  const rawData = {
    appCode: formData.get('appCode'),
    areaCode: formData.get('areaCode'),
    code: formData.get('code'),
    title: formData.get('title'),
    description: formData.get('description'),
  };
  const validation = addSubAreaSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, message: "Validation failed.", errors: validation.error.flatten().fieldErrors };
  }
  const { appCode, areaCode, code, title, description } = validation.data;
  const result = await sdk.workspaces.addSubArea(appCode, areaCode, code, title, description || '', 'active');
  if (result.success) {
    revalidatePath(`/workspaces/${appCode}`);
    revalidateTag('projects');
  }
  return result;
}

export async function addProcessToAction(prevState: any, formData: FormData) {
  const rawData = {
    appCode: formData.get('appCode'),
    areaCode: formData.get('areaCode'),
    subAreaCode: formData.get('subAreaCode') || undefined, // Handle optional
    code: formData.get('code'),
    title: formData.get('title'),
    description: formData.get('description'),
  };
  const validation = addProcessSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, message: "Validation failed.", errors: validation.error.flatten().fieldErrors };
  }
  const { appCode, areaCode, subAreaCode, code, title, description } = validation.data;
  const result = await sdk.workspaces.addProcessDefinition(appCode, areaCode, code, title, description || '', subAreaCode, 'active');
  if (result.success) {
    revalidatePath(`/workspaces/${appCode}`);
    revalidateTag('projects');
    // Adicionar revalidação para a lista de processos se houver cache específico para isso
  }
  return result;
}


// --- Schemas para Update e Delete ---
const itemTypeSchema = z.enum(['area', 'subarea', 'process']);
const statusSchema = z.enum(['active', 'inactive', 'draft']);

const deleteItemSchema = z.object({
  appCode: appCodeParamSchema,
  itemType: itemTypeSchema,
  itemCode: itemCodeSchema,
  parentCode: z.string().optional(), // areaCode para subarea/processo
  grandParentCode: z.string().optional(), // areaCode para processo em subarea (parentCode seria subAreaCode)
});

export async function deleteWorkspaceItemAction(payload: z.infer<typeof deleteItemSchema>) {
  const validation = deleteItemSchema.safeParse(payload);
  if (!validation.success) {
    return { success: false, message: "Invalid delete payload.", errors: validation.error.flatten().fieldErrors };
  }
  const { appCode, itemType, itemCode, parentCode, grandParentCode } = validation.data;
  let result;
  try {
    switch (itemType) {
      case 'area':
        result = await sdk.workspaces.deleteArea(appCode, itemCode);
        break;
      case 'subarea':
        if (!parentCode) return { success: false, message: "Area code (parentCode) is required for subarea." };
        result = await sdk.workspaces.deleteSubArea(appCode, parentCode, itemCode);
        break;
      case 'process':
        const areaForProcess = grandParentCode || parentCode; // Se grandParentCode existe, é area; senão parentCode é area
        if (!areaForProcess) return { success: false, message: "Area code is required for process." };
        const subAreaForProcess = grandParentCode ? parentCode : undefined; // Se grandParentCode existe, parentCode é subArea
        result = await sdk.workspaces.deleteProcess(appCode, areaForProcess, itemCode, subAreaForProcess);
        break;
      default:
        return { success: false, message: "Invalid item type for deletion." };
    }
    if (result.success) {
      revalidatePath(`/workspaces/${appCode}`);
      revalidateTag('projects');
      // Se o item deletado for um processo, e houver cache por tag de processo, revalidar também.
    }
    return result;
  } catch (error) {
    return { success: false, message: `Server error deleting item: ${(error as Error).message}` };
  }
}

const updateItemSchema = z.object({
  appCode: appCodeParamSchema,
  itemType: itemTypeSchema,
  itemCode: itemCodeSchema, // Código atual do item
  newCode: itemCodeSchema.optional(), // Novo código, se alterado (requer cuidado com renomeação de arquivos/pastas)
  title: titleSchema,
  description: descriptionSchema,
  status: statusSchema,
  parentCode: z.string().optional(), // areaCode
  grandParentCode: z.string().optional(), // areaCode (se item é processo em subarea)
});


export async function updateWorkspaceItemAction(prevState: any, formData: FormData) {
  const rawData = {
    appCode: formData.get('appCode') as string,
    itemType: formData.get('itemType') as 'area' | 'subarea' | 'process',
    itemCode: formData.get('itemCode') as string, // current code
    newCode: formData.get('newCode') as string || formData.get('itemCode') as string, // Se não houver newCode, usa o itemCode
    title: formData.get('title') as string,
    description: formData.get('description') as string | undefined,
    status: formData.get('status') as 'active' | 'inactive' | 'draft',
    parentCode: formData.get('parentCode') as string | undefined,
    grandParentCode: formData.get('grandParentCode') as string | undefined,
  };

  // Validação mais simples aqui, Zod no SDK ou validação mais robusta seria ideal.
  // Esta é uma simplificação para o exemplo.
  // A validação do `updateItemSchema` não está sendo usada diretamente com `safeParse`
  // porque a renomeação de `code` (itemCode vs newCode) complica.
  // Idealmente, o SDK lidaria com a renomeação de forma atômica ou não permitiria.
  // Por agora, vamos assumir que o `code` não muda ou que o SDK lida com isso internamente se `newCode` for diferente.

  const { appCode, itemType, itemCode, title, description, status, parentCode, grandParentCode, newCode } = rawData;

  // TODO: Adicionar validação com Zod aqui para rawData antes de prosseguir.
  // const validation = updateItemSchema.safeParse(rawData);
  // if (!validation.success) {
  //   return { success: false, message: "Validation failed.", errors: validation.error.flatten().fieldErrors };
  // }
  // const { appCode, itemType, itemCode, title, description, status, parentCode, grandParentCode, newCode } = validation.data;


  let result;
  try {
    // IMPORTANTE: O SDK atual não tem uma função de renomear 'code' diretamente ao atualizar.
    // Se newCode for diferente de itemCode, esta lógica precisaria ser mais complexa (renomear pasta/arquivo + atualizar config).
    // Por simplicidade, vamos assumir que o 'code' (identificador) não muda na atualização via este formulário.
    // Se a mudança de 'code' for um requisito, o SDK precisaria suportar isso ou teríamos que implementar a lógica aqui.
    if (newCode && newCode !== itemCode) {
      return { success: false, message: "Changing 'code' during update is not directly supported by this action. SDK needs rename capability or more complex logic here."};
    }

    switch (itemType) {
      case 'area':
        result = await sdk.workspaces.updateArea(appCode, itemCode, title, description || '', status);
        break;
      case 'subarea':
        if (!parentCode) return { success: false, message: "Area code (parentCode) is required for subarea update." };
        result = await sdk.workspaces.updateSubArea(appCode, parentCode, itemCode, title, description || '', status);
        break;
      case 'process':
        const areaForProcess = grandParentCode || parentCode;
        if (!areaForProcess) return { success: false, message: "Area code is required for process update." };
        const subAreaForProcess = grandParentCode ? parentCode : undefined;
        result = await sdk.workspaces.updateProcess(appCode, areaForProcess, itemCode, title, description || '', status, subAreaForProcess);
        break;
      default:
        return { success: false, message: "Invalid item type for update." };
    }
    if (result.success) {
      revalidatePath(`/workspaces/${appCode}`);
      revalidateTag('projects');
      // Se for um processo, revalidateTag(`process-${appCode}-${itemCode}`) se essa tag for usada no cache.
    }
    return result;
  } catch (error) {
    return { success: false, message: `Server error updating item: ${(error as Error).message}` };
  }
}


// Schema para validação dos dados de criação do workspace
const createWorkspaceFormSchema = z.object({
  code: itemCodeSchema, // Reutilizando itemCodeSchema
  title: titleSchema, // Reutilizando titleSchema
  description: descriptionSchema,
});

// Schema para Save Process
const saveProcessSchema = z.object({
  appCode: appCodeParamSchema,
  areaCode: areaCodeParamSchema,
  subAreaCode: subAreaCodeParamSchema.optional(),
  processCode: itemCodeSchema,
  bpmnXml: z.string().min(1, "BPMN XML cannot be empty."),
});

export async function saveProcessAction(payload: z.infer<typeof saveProcessSchema>) {
  const validation = saveProcessSchema.safeParse(payload);
  if (!validation.success) {
    return { success: false, message: "Invalid data for saving process.", errors: validation.error.flatten().fieldErrors };
  }
  const { appCode, areaCode, subAreaCode, processCode, bpmnXml } = validation.data;
  try {
    const result = await sdk.processes.saveProcessDefinition(appCode, areaCode, processCode, bpmnXml, subAreaCode);
    if (result.success) {
      revalidatePath(`/workspaces/${appCode}/processes/${processCode}`);
      revalidatePath(`/workspaces/${appCode}`);
      revalidateTag('projects');
      // Usar uma tag específica para o processo se a função getProcessDataCached usar uma.
      // Ex: revalidateTag(`process-${appCode}-${processCode}`);
    }
    return result;
  } catch (error) {
    return { success: false, message: `Server error saving process: ${(error as Error).message}` };
  }
}

// Schema para Deploy Process
const deployProcessSchema = z.object({
  processId: itemCodeSchema, // processCode
  bpmnXml: z.string().min(1, "BPMN XML cannot be empty."),
  appCode: appCodeParamSchema, // Para contexto, pode ser útil
  areaCode: areaCodeParamSchema,
  subAreaCode: subAreaCodeParamSchema.optional(),
});

import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';

// Lógica do MinIO Client adaptada para Server Action
// As variáveis de ambiente devem ser definidas no ambiente do servidor Next.js (ex: .env.local)
// Ex: MINIO_ENDPOINT, MINIO_REGION, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET_NAME, MINIO_FORCE_PATH_STYLE

let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
      region: process.env.MINIO_REGION || 'us-east-1', // MinIO não é estrito com região
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin', // Default comum para dev
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin', // Default comum para dev
      },
      forcePathStyle: (process.env.MINIO_FORCE_PATH_STYLE !== 'false'), // true para MinIO geralmente
    });
  }
  return s3ClientInstance;
}

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'igrp-wf-studio';

async function ensureBucketExistsServer(): Promise<void> {
  const client = getS3Client();
  try {
    await client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  } catch (error: any) {
    if (error.name === 'NotFound' || error.name === 'NoSuchBucket') {
      try {
        await client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        console.log(`Bucket ${BUCKET_NAME} created successfully on server.`);
      } catch (createError) {
        console.error(`Error creating bucket ${BUCKET_NAME} on server:`, createError);
        throw createError;
      }
    } else {
      console.error(`Error checking bucket ${BUCKET_NAME} on server:`, error);
      throw error;
    }
  }
}

async function uploadFileToServer(fileName: string, content: string, contentType: string = 'text/xml'): Promise<string> {
  await ensureBucketExistsServer();
  const client = getS3Client();
  const encoder = new TextEncoder();
  const buffer = encoder.encode(content);

  await client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: contentType,
  }));

  const endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
  return `${endpoint}/${BUCKET_NAME}/${fileName}`;
}

export async function deployProcessAction(payload: z.infer<typeof deployProcessSchema>) {
  const validation = deployProcessSchema.safeParse(payload);
  if (!validation.success) {
    return { success: false, message: "Invalid data for deploying process.", errors: validation.error.flatten().fieldErrors };
  }
  const { processId, bpmnXml, appCode, areaCode, subAreaCode } = validation.data;

  try {
    const fileName = `process-definitions/workspace-${appCode}/${processId}.bpmn`; // Estrutura de path sugerida
    const deployUrl = await uploadFileToServer(fileName, bpmnXml, 'application/xml'); // text/xml ou application/xml

    console.log(`Process ${processId} from workspace ${appCode} deployed to ${deployUrl}`);
    return { success: true, message: `Process ${processId} deployed. URL: ${deployUrl}` };
  } catch (error) {
    console.error(`Error in deployProcessAction for ${processId} (app: ${appCode}):`, error);
    return { success: false, message: `Failed to deploy process: ${(error as Error).message}` };
  }
}

// Usar as funções de fileSystem do SDK para consistência, se possível, ou node:fs/promises
import { readFile, writeFile, ensureDir } from '@igrp/wf-engine';
import path from 'node:path'; // Usar node:path no servidor

// --- Form and Decision Table Actions (armazenamento no File System) ---

const formElementIdSchema = z.string().min(1, "Element ID (formKey) cannot be empty.");
const formDefinitionSchema = z.any(); // Idealmente, um schema Zod mais específico

// Helper para construir o path do arquivo de formulário
function getFormPath(appCode: string, elementId: string): string {
  // Ex: data/workspaces/appCode/forms/elementId.form.json
  // O SDK usa './' como basePath padrão. Se os dados dos workspaces estiverem em um subdiretório (ex: 'data/workspaces'),
  // o basePath do SDK precisa ser configurado para isso, ou o path aqui precisa ser ajustado.
  // Assumindo que o basePath do SDK já aponta para o diretório que contém os workspaces.
  return path.join(appCode, '_forms', `${elementId}.form.json`);
}

export async function loadFormAction(payload: { appCode: string; elementId: string }): Promise<{ success: boolean; data?: any; message?: string; errors?: any }> {
  const schema = z.object({ appCode: appCodeParamSchema, elementId: formElementIdSchema });
  const validation = schema.safeParse(payload);
  if (!validation.success) {
    return { success: false, message: "Invalid parameters for loading form.", errors: validation.error.flatten().fieldErrors };
  }
  const { appCode, elementId } = validation.data;
  const formPath = getFormPath(appCode, elementId);

  try {
    const content = await readFile(formPath); // readFile do SDK já usa o basePath
    if (content) {
      return { success: true, data: JSON.parse(content) };
    }
    // Se o arquivo não existir, retornar um formulário vazio (ou erro, dependendo do requisito)
    return { success: true, data: { display: 'form', components: [], title: `New Form for ${elementId}` } };
  } catch (error) {
    // readFile pode lançar erro se o arquivo não existir, dependendo da implementação do SDK.
    // Se o erro for "não encontrado", podemos querer retornar um formulário vazio.
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
        console.log(`Form file not found for ${elementId} in ${appCode}, returning empty form.`);
        return { success: true, data: { display: 'form', components: [], title: `New Form for ${elementId}` } };
    }
    console.error(`Error in loadFormAction for ${elementId} in ${appCode}:`, error);
    return { success: false, message: `Server error loading form: ${(error as Error).message}` };
  }
}

export async function saveFormAction(payload: { appCode: string; elementId: string; definition: any }): Promise<{ success: boolean; message?: string; errors?: any }> {
  const schema = z.object({
    appCode: appCodeParamSchema,
    elementId: formElementIdSchema,
    definition: formDefinitionSchema
  });
  const validation = schema.safeParse(payload);
  if (!validation.success) {
    return { success: false, message: "Invalid data for saving form.", errors: validation.error.flatten().fieldErrors };
  }
  const { appCode, elementId, definition } = validation.data;
  const formPath = getFormPath(appCode, elementId);

  try {
    // Garantir que o diretório _forms exista dentro do workspace
    const formsDir = path.dirname(formPath); // ex: appCode/_forms
    // ensureDir do SDK precisa do path completo relativo ao basePath do SDK.
    // Se o basePath do SDK é './', então formsDir deve ser 'appCode/_forms'.
    // Se o basePath do SDK é 'data/workspaces', então formsDir deve ser 'appCode/_forms'
    // (porque o path.join em getFormPath já começa com appCode).
    // O ensureDir do SDK já deve lidar com o basePath internamente.
    await ensureDir(formsDir);

    const result = await writeFile(formPath, JSON.stringify(definition, null, 2));
    if (result.success) {
      revalidatePath(`/workspaces/${appCode}`); // Revalidar página de detalhes do workspace
      // Poderia ter uma tag específica para formulários se necessário: revalidateTag(`forms-${appCode}`)
      return { success: true, message: `Form '${elementId}' saved.` };
    }
    return { success: false, message: result.message || "Failed to save form to file system." };
  } catch (error) {
    console.error(`Error in saveFormAction for ${elementId} in ${appCode}:`, error);
    return { success: false, message: `Server error saving form: ${(error as Error).message}` };
  }
}

// TODO: Implementar loadDecisionTableAction e saveDecisionTableAction de forma similar,
// usando, por exemplo, getDecisionTablePath(appCode, elementId) que retorna appCode/_decisions/elementId.dmn.xml


export async function createWorkspaceAction(
  prevState: { message: string; success: boolean; errors?: any, workspaceCode?: string } | null,
  formData: FormData
) {
  try {
    const rawData = {
      code: formData.get('code'),
      title: formData.get('title'),
      description: formData.get('description'),
    };

    const validationResult = createWorkspaceFormSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validationResult.error.flatten().fieldErrors
      };
    }

    const { code, title, description } = validationResult.data;

    console.log(`Server Action: Creating workspace ${code}`);
    const result = await sdk.workspaces.createWorkspace(
      code,
      title,
      description || '',
      'active'
    );

    if (result.success) {
      revalidatePath("/");
      revalidatePath("/workspaces");
      revalidateTag('workspaces');
      revalidateTag('projects'); // Novo projeto criado
      return { success: true, message: result.message || `Workspace '${code}' created.`, workspaceCode: code };
    } else {
      return { success: false, message: result.message || "Failed to create workspace." };
    }
  } catch (error) {
    console.error("Error in createWorkspaceAction:", error);
    return { success: false, message: "An unexpected server error occurred." };
  }
}

// Schema para Update Workspace Options
const updateWorkspaceOptionsSchema = z.object({
  workspaceCode: appCodeParamSchema,
  title: titleSchema,
  description: descriptionSchema,
});

export async function updateWorkspaceOptionsAction(prevState: any, formData: FormData) {
  const rawData = {
    workspaceCode: formData.get('workspaceCode'),
    title: formData.get('title'),
    description: formData.get('description'),
  };
  const validation = updateWorkspaceOptionsSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, message: "Validation failed.", errors: validation.error.flatten().fieldErrors };
  }

  const { workspaceCode, title, description } = validation.data;

  try {
    const result = await sdk.workspaces.updateWorkspaceOptions(workspaceCode, { title, description });
    if (result.success) {
      revalidatePath("/");
      revalidatePath("/workspaces");
      revalidatePath(`/workspaces/${workspaceCode}`);
      revalidateTag('workspaces'); // Para atualizar a lista que pode mostrar título/descrição
      revalidateTag('projects');   // Para atualizar o config do projeto se ele for afetado ou a página de detalhes
    }
    return result;
  } catch (error) {
    console.error(`Error in updateWorkspaceOptionsAction for ${workspaceCode}:`, error);
    return { success: false, message: `Server error updating workspace options: ${(error as Error).message}` };
  }
}
