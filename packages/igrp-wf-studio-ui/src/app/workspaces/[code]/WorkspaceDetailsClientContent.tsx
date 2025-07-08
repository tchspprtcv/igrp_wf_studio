"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectConfig } from '@igrp/wf-engine';
import { ExtendedProjectConfig } from '@/types'; // ProcessDefinition não é usado diretamente aqui
import TreeMenu from '@/components/workspaces/TreeMenu'; // Manteremos por enquanto
import CreateAreaModal from '@/components/modals/CreateAreaModal';
import CreateSubAreaModal from '@/components/modals/CreateSubAreaModal';
import CreateProcessModal from '@/components/modals/CreateProcessModal';
import EditItemModal from '@/components/workspaces/EditItemModal'; // Presumivelmente usa ShadCN
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'react-hot-toast';
import { Archive, Edit, Settings, Info, ListTree, PackageX, Terminal } from 'lucide-react'; // Ícones
import JSZip from 'jszip';
import { getWorkspaceExportDataAction, deleteWorkspaceItemAction } from '@/app/actions'; // add, update actions não são chamadas diretamente aqui, mas pelos modais
import type { EditItemFormData } from '@/types';
import { formatDate, cn } from '@/lib/utils'; // cn para classes condicionais
import { Badge } from '@/components/ui/badge'; // Para status

// Using ExtendedProjectConfig imported from shared types file

interface WorkspaceDetailsClientProps {
  initialConfig: ExtendedProjectConfig | null; // Pode ser null se não encontrado
  workspaceCode: string;
  initialError?: string | null; // Erro do server-side
}

const WorkspaceDetailsClientContent: React.FC<WorkspaceDetailsClientProps> = ({ initialConfig, workspaceCode, initialError }) => {
  const router = useRouter();
  const [config, setConfig] = useState<ExtendedProjectConfig | null>(initialConfig);
  // Erro específico do cliente (ex: falha em ação não tratada no modal)
  const [clientError, setClientError] = useState<string | null>(null);
  // Erro combinado para exibição (inicial do servidor ou do cliente)
  const displayError = initialError || clientError;


  // Estados dos Modais
  const [showCreateArea, setShowCreateArea] = useState(false);
  const [showCreateSubArea, setShowCreateSubArea] = useState(false);
  const [showCreateProcess, setShowCreateProcess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Para editar workspace, área, subárea ou processo
  const [showEditWorkspaceModal, setShowEditWorkspaceModal] = useState(false);


  const [selectedAreaForModal, setSelectedAreaForModal] = useState<string | null>(null);
  const [selectedSubAreaForModal, setSelectedSubAreaForModal] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<EditItemFormData | null>(null);

  const [exportingZip, setExportingZip] = useState(false);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  // Limpar clientError se initialConfig mudar (ex: após refresh bem sucedido)
  useEffect(() => {
    if (initialConfig) setClientError(null);
  }, [initialConfig]);


  const refreshData = () => {
    router.refresh(); // Revalida os dados do Server Component pai
  };

  // --- Funções para abrir modais ---
  const handleOpenCreateAreaModal = () => setShowCreateArea(true);

  const handleOpenCreateSubAreaModal = (areaCode: string) => {
    setSelectedAreaForModal(areaCode);
    setShowCreateSubArea(true);
  };

  const handleOpenCreateProcessModal = (areaCode: string, subareaCode?: string) => {
    setSelectedAreaForModal(areaCode);
    setSelectedSubAreaForModal(subareaCode || null);
    setShowCreateProcess(true);
  };

  const handleOpenEditWorkspaceModal = () => {
    if (config) {
      setEditItem({
        type: 'workspace', // Tipo especial para o modal de edição do workspace
        workspaceCode: workspaceCode,
        itemCode: workspaceCode, // itemCode é o próprio workspaceCode
        title: config.project || workspaceCode,
        description: config.description || '',
        status: config.status || 'active', // Assumindo que workspaces têm status
      });
      // Usar um estado separado para o modal de edição do workspace se for um componente diferente
      // setShowEditWorkspaceModal(true); // Se for um modal específico
      setShowEditModal(true); // Ou reutilizar o EditItemModal se ele puder lidar com 'workspace'
    }
  };

  const handleOpenEditItemModal = (type: 'area' | 'subarea' | 'process', itemCode: string, parentCode?: string, grandParentCode?: string) => {
    let currentItemData: { title: string; description: string; status: 'active' | 'inactive' | 'draft' } | undefined;

    if (config) {
      if (type === 'area') {
        const area = config.areas.find(a => a.code === itemCode);
        if (area) currentItemData = { title: area.title, description: area.description || '', status: area.status };
      } else if (type === 'subarea' && parentCode) {
        const area = config.areas.find(a => a.code === parentCode);
        const subarea = area?.subareas.find(sa => sa.code === itemCode);
        if (subarea) currentItemData = { title: subarea.title, description: subarea.description || '', status: subarea.status };
      } else if (type === 'process') {
        // grandParentCode é areaCode se processo está em subárea. parentCode é subAreaCode.
        // Se processo está em área, parentCode é areaCode, grandParentCode é undefined.
        const areaToSearch = config.areas.find(a => a.code === (grandParentCode || parentCode));
        if (areaToSearch) {
          let process;
          if (grandParentCode) { // Processo em subárea
            const subarea = areaToSearch.subareas.find(sa => sa.code === parentCode); // parentCode é subAreaCode aqui
            process = subarea?.processes.find(p => p.code === itemCode);
          } else { // Processo em área
            process = areaToSearch.processes.find(p => p.code === itemCode); // parentCode é areaCode aqui
          }
          if (process) currentItemData = { title: process.title, description: process.description || '', status: process.status };
        }
      }
    }

    if (currentItemData) {
      setEditItem({
        type,
        workspaceCode: workspaceCode,
        itemCode: itemCode,
        parentCode,
        grandParentCode,
        title: currentItemData.title,
        description: currentItemData.description,
        status: currentItemData.status
      });
      setShowEditModal(true);
    } else {
      toast.error(`Could not load data for ${type} '${itemCode}'.`);
    }
  };

  // --- Ações (CRUD) ---
  const handleDeleteItem = async (type: 'area' | 'subarea' | 'process', itemCode: string, parentCode?: string, grandParentCode?: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}: ${itemCode}?`)) return;

    const payload = {
      appCode: workspaceCode,
      itemType: type,
      itemCode: itemCode,
      parentCode: parentCode,
      grandParentCode: grandParentCode
    };
    // Lógica de payload já estava correta para deleteWorkspaceItemAction

    const result = await deleteWorkspaceItemAction(payload);

    if (result.success) {
      toast.success(result.message || `${type} '${itemCode}' deleted successfully.`);
      refreshData();
    } else {
      toast.error(result.message || `Failed to delete ${type}.`);
      setClientError(result.message);
    }
  };

  const handleExportWorkspaceZip = async () => {
    if (!workspaceCode || !config) { // config pode ser null se não carregado
      toast.error("Workspace data not available for export.");
      return;
    }
    setExportingZip(true);
    toast(`Fetching data for ${workspaceCode} export...`);
    try {
      const result = await getWorkspaceExportDataAction(workspaceCode);
      if (!result.success || !result.data || !result.data.projectConfig) {
        toast.error(result.message || `Could not load configuration for workspace ${workspaceCode}.`);
        return;
      }
      const { projectConfig, processes } = result.data;

      toast(`Generating ZIP for ${workspaceCode}...`);
      const zip = new JSZip();
      zip.file(`${workspaceCode}/project-config.json`, JSON.stringify(projectConfig, null, 2));
      for (const processFile of processes) {
        zip.file(`${workspaceCode}/${processFile.path}`, processFile.content);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const linkEl = document.createElement('a');
      linkEl.href = downloadUrl;
      linkEl.download = `${workspaceCode}-workspace.zip`;
      document.body.appendChild(linkEl);
      linkEl.click();
      document.body.removeChild(linkEl);
      URL.revokeObjectURL(downloadUrl);
      toast.success(`Workspace '${workspaceCode}' exported successfully.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to export workspace ${workspaceCode}: ${msg}`);
      console.error("Export error:", err);
      setClientError(`Export failed: ${msg}`);
    } finally {
      setExportingZip(false);
    }
  };

  const getStatusBadgeVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "draft": return "outline";
      default: return "secondary";
    }
  };


  // Se initialConfig for null e não houver initialError, significa que o workspace não foi encontrado.
  // O Server Component já logou isso. Aqui, podemos mostrar uma mensagem específica.
  if (!config && !initialError) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center"><PackageX className="mr-2 h-6 w-6 text-destructive"/> Workspace Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The workspace with code <code className="bg-muted px-1 py-0.5 rounded">{workspaceCode}</code> could not be found or you do not have permission to view it.</p>
        </CardContent>
      </Card>
    );
  }

  // Se houve um erro inicial do servidor (e config pode ou não ser null)
  if (initialError && !config) { // Apenas mostra se o config não carregou por causa do erro
      return (
          <Alert variant="destructive" className="mt-6">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Loading Workspace Data</AlertTitle>
              <AlertDescription>{initialError}</AlertDescription>
          </Alert>
      );
  }

  // Se config é null mesmo após a lógica acima (improvável, mas para type safety)
  if (!config) {
    return (
      <Card className="mt-6">
        <CardHeader><CardTitle>Loading...</CardTitle></CardHeader>
        <CardContent><p>Workspace details are currently unavailable.</p></CardContent>
      </Card>
    );
  }


  return (
    <>
      {/* Exibe erro do cliente, se houver */}
      {clientError && (
        <Alert variant="destructive" className="mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Action Error</AlertTitle>
          <AlertDescription>{clientError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end mb-4 space-x-2">
        <Button
            variant="outline"
            onClick={handleOpenEditWorkspaceModal}
            disabled={!config}
          >
            <Settings className="mr-2 h-4 w-4" /> Edit Workspace
          </Button>
        <Button
          variant="secondary"
          onClick={handleExportWorkspaceZip}
          disabled={exportingZip || !config}
        >
          <Archive className="mr-2 h-4 w-4" />
          {exportingZip ? 'Exporting...' : 'Export (ZIP)'}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:max-w-md">
          <TabsTrigger value="overview"><Info className="mr-1 h-4 w-4"/>Overview</TabsTrigger>
          <TabsTrigger value="structure"><ListTree className="mr-1 h-4 w-4"/>Structure</TabsTrigger>
          {/* <TabsTrigger value="settings"><Settings className="mr-1 h-4 w-4"/>Settings</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Overview</CardTitle>
              <CardDescription>General information about the <code className="bg-muted px-1 py-0.5 rounded">{config.project || workspaceCode}</code> workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <span className="text-sm font-medium text-muted-foreground">Workspace Name</span>
                <p>{config.project || "N/A"}</p>
              </div>
              <div className="flex flex-col space-y-1.5">
                <span className="text-sm font-medium text-muted-foreground">Code</span>
                <p><code>{config.appCode || workspaceCode}</code></p>
              </div>
              <div className="flex flex-col space-y-1.5">
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <p>{config.description || <span className="italic text-muted-foreground">No description provided.</span>}</p>
              </div>
              <div className="flex flex-col space-y-1.5">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <p>
                    <Badge variant={getStatusBadgeVariant(config.status)}>
                        {config.status ? config.status.charAt(0).toUpperCase() + config.status.slice(1) : 'N/A'}
                    </Badge>
                </p>
              </div>
              <div className="flex flex-col space-y-1.5">
                <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                <p>{config.updated_at ? formatDate(config.updated_at) : "N/A"}</p>
              </div>
               <div className="flex flex-col space-y-1.5">
                <span className="text-sm font-medium text-muted-foreground">Created At</span>
                <p>{config.created_at ? formatDate(config.created_at) : "N/A"}</p>
              </div>
            </CardContent>
            <CardFooter>
              {/* <Button variant="outline" onClick={handleOpenEditWorkspaceModal}><Edit className="mr-2 h-4 w-4"/> Edit Details</Button> */}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Structure</CardTitle>
              <CardDescription>Manage areas, sub-areas, and processes.</CardDescription>
            </CardHeader>
            <CardContent>
              <TreeMenu
                appCode={workspaceCode}
                areas={config.areas || []}
                onCreateArea={handleOpenCreateAreaModal}
                onCreateSubArea={handleOpenCreateSubAreaModal}
                onCreateProcess={handleOpenCreateProcessModal}
                onEditItem={handleOpenEditItemModal} // Passar para editar area/subarea/processo
                onDeleteItem={handleDeleteItem}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>Configure advanced settings for this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Workspace-specific settings will be available here.</p>
              {/* Exemplo: Botão para editar o workspace (nome, descrição)
              <Button variant="outline" onClick={handleOpenEditWorkspaceModal} className="mt-4">
                <Edit className="mr-2 h-4 w-4"/> Edit Workspace Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent> */}

      </Tabs>

      {/* Modais */}
      {showCreateArea && (
        <CreateAreaModal
          workspaceCode={workspaceCode}
          existingAreaCodes={config?.areas?.map(a => a.code) || []}
          onClose={() => setShowCreateArea(false)}
          onCreated={() => { setShowCreateArea(false); refreshData(); }}
        />
      )}

      {showCreateSubArea && selectedAreaForModal && (
        <CreateSubAreaModal
          workspaceCode={workspaceCode}
          areaCode={selectedAreaForModal}
          existingSubAreaCodes={config?.areas.find(a => a.code === selectedAreaForModal)?.subareas?.map(sa => sa.code) || []}
          onClose={() => { setShowCreateSubArea(false); setSelectedAreaForModal(null); }}
          onCreated={() => { setShowCreateSubArea(false); setSelectedAreaForModal(null); refreshData(); }}
        />
      )}

      {showCreateProcess && selectedAreaForModal && config && ( // Adicionado config para availableAreas
        <CreateProcessModal
          workspaceCode={workspaceCode}
          initialArea={selectedAreaForModal}
          initialSubArea={selectedSubAreaForModal}
          availableAreas={config.areas.map(a => ({
              code: a.code,
              title: a.title,
              subareas: a.subareas?.map(sa => ({ code: sa.code, title: sa.title })) || []
          })) || []}
          existingProcessCodes={(() => { // Lógica para existingProcessCodes
            if (!config || !selectedAreaForModal) return [];
            const area = config.areas.find(a => a.code === selectedAreaForModal);
            if (!area) return [];
            if (selectedSubAreaForModal) {
              const subArea = area.subareas?.find(sa => sa.code === selectedSubAreaForModal);
              return subArea?.processes?.map(p => p.code) || [];
            }
            return area.processes?.map(p => p.code) || [];
          })()}
          onClose={() => { setShowCreateProcess(false); setSelectedAreaForModal(null); setSelectedSubAreaForModal(null); }}
          onCreated={(createdAppCode, _areaCode, _subAreaCode, newProcessCode) => {
            setShowCreateProcess(false);
            setSelectedAreaForModal(null);
            setSelectedSubAreaForModal(null);
            refreshData();
            router.push(`/workspaces/${createdAppCode}/processes/${newProcessCode}`);
          }}
        />
      )}

      {/* Modal de Edição Genérico (ou específico se setShowEditWorkspaceModal for usado) */}
      {showEditModal && editItem && (
        <EditItemModal
          isOpen={showEditModal}
          type={editItem.type}
          workspaceCode={editItem.workspaceCode}
          itemCode={editItem.itemCode}
          parentCode={editItem.parentCode}
          grandParentCode={editItem.grandParentCode}
          currentTitle={editItem.title}
          currentDescription={editItem.description}
          currentStatus={editItem.status}
          onClose={() => { setShowEditModal(false); setEditItem(null); }}
          onUpdated={() => { setShowEditModal(false); setEditItem(null); refreshData(); }}
        />
      )}
    </>
  );
};

export default WorkspaceDetailsClientContent;
