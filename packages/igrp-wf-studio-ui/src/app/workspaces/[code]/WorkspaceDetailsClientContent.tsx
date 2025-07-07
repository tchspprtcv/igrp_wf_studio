"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectConfig, ProcessDefinition } from '@igrp/wf-engine';

// Extended interface to include additional properties used in the UI
interface ExtendedProjectConfig extends ProjectConfig {
  description?: string;
  appCode?: string;
}
import TreeMenu from '@/components/workspaces/TreeMenu';
import CreateAreaModal from '@/components/modals/CreateAreaModal';
import CreateSubAreaModal from '@/components/modals/CreateSubAreaModal';
import CreateProcessModal from '@/components/modals/CreateProcessModal'; // Caminho atualizado
import EditItemModal from '@/components/workspaces/EditItemModal';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Archive } from 'lucide-react';
import JSZip from 'jszip';
import {
    getWorkspaceExportDataAction,
    addAreaToAction,
    addSubAreaToAction,
    addProcessToAction,
    updateWorkspaceItemAction,
    deleteWorkspaceItemAction
} from '@/app/actions';
import PageHeader from '@/components/layout/PageHeader';
import type { EditItemFormData } from '@/types'; // Importar tipo

interface WorkspaceDetailsClientProps {
  initialConfig: ExtendedProjectConfig;
  workspaceCode: string;
}

const WorkspaceDetailsClientContent: React.FC<WorkspaceDetailsClientProps> = ({ initialConfig, workspaceCode }) => {
  const router = useRouter();
  const [config, setConfig] = useState<ExtendedProjectConfig | null>(initialConfig);
  const [error, setError] = useState<string | null>(null); // Para erros de cliente/ações

  // Estados dos Modais
  const [showCreateArea, setShowCreateArea] = useState(false);
  const [showCreateSubArea, setShowCreateSubArea] = useState(false);
  const [showCreateProcess, setShowCreateProcess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedAreaForModal, setSelectedAreaForModal] = useState<string | null>(null);
  const [selectedSubAreaForModal, setSelectedSubAreaForModal] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<EditItemFormData | null>(null); // Usar tipo centralizado

  const [exportingZip, setExportingZip] = useState(false);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const refreshConfig = () => {
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
        const areaToSearch = grandParentCode ? config.areas.find(a => a.code === grandParentCode) : config.areas.find(a => a.code === parentCode);
        if (areaToSearch) {
          let process;
          if (grandParentCode) { // Processo em subárea
            const subarea = areaToSearch.subareas.find(sa => sa.code === parentCode);
            process = subarea?.processes.find(p => p.code === itemCode);
          } else { // Processo em área
            process = areaToSearch.processes.find(p => p.code === itemCode);
          }
          if (process) currentItemData = { title: process.title, description: process.description || '', status: process.status };
        }
      }
    }

    if (currentItemData) {
      setEditItem({
        type,
        workspaceCode: workspaceCode, // appCode
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
      grandParentCode: grandParentCode // grandParentCode é o areaCode se type='process' e parentCode é subAreaCode
    };

    // Ajuste para payload de processo em subárea
    if (type === 'process' && parentCode && grandParentCode) {
        // No caso de um processo dentro de uma subárea:
        // O 'parentCode' que TreeMenu passa é o código da subárea.
        // O 'grandParentCode' que TreeMenu passa é o código da área.
        // A action deleteProcess espera (appCode, areaCode, processCode, subAreaCode_opcional)
        // Então, para a action:
        // parentCode (para a action) deve ser o areaCode (grandParentCode do TreeMenu)
        // subAreaCode (para a action) deve ser o subAreaCode (parentCode do TreeMenu)
        payload.parentCode = grandParentCode; // areaCode
        payload.grandParentCode = parentCode; // subAreaCode - a action vai interpretar isso corretamente
                                          // Na verdade, a action deleteProcess espera (appCode, areaCode, itemCode, subAreaCode)
                                          // Então, o parentCode da action é o Area, e o subAreaCode é o último param.
                                          // Vamos remapear no lado da action ou aqui.
                                          // A action já faz essa lógica:
                                          // const areaForProcess = grandParentCode || parentCode;
                                          // const subAreaForProcess = grandParentCode ? parentCode : undefined;
                                          // Isso parece correto.
    } else if (type === 'process' && parentCode && !grandParentCode) {
        // Processo diretamente em uma área.
        // parentCode (do TreeMenu) é o areaCode. grandParentCode é undefined.
        // payload.parentCode já é o areaCode.
        // payload.grandParentCode é undefined.
    }


    const result = await deleteWorkspaceItemAction(payload);

    if (result.success) {
      toast.success(result.message || `${type} '${itemCode}' deleted successfully.`);
      refreshConfig(); // Revalida os dados via Server Component pai
    } else {
      toast.error(result.message || `Failed to delete ${type}.`);
      setError(result.message);
    }
  };

  const handleExportWorkspaceZip = async () => {
    if (!workspaceCode || !config) {
      toast.error("Workspace data not loaded yet.");
      return;
    }
    setExportingZip(true);
    toast.success(`Fetching data for ${workspaceCode} export...`);
    try {
      const result = await getWorkspaceExportDataAction(workspaceCode);
      if (!result.success || !result.data || !result.data.projectConfig) {
        toast.error(result.message || `Could not load configuration for workspace ${workspaceCode}.`);
        return;
      }
      const { projectConfig, processes } = result.data;

      toast.success(`Generating ZIP for ${workspaceCode}...`);
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
      toast.error(`Failed to export workspace ${workspaceCode}: ${(err as Error).message}`);
      console.error("Export error:", err);
    } finally {
      setExportingZip(false);
    }
  };

  if (!config) {
    // Este estado pode ocorrer se initialConfig for null e ainda não houve atualização.
    // O Server Component pai já lida com o caso de config não encontrado inicialmente.
    return <div className="p-4">Loading configuration...</div>;
  }

  // Adicionando o PageHeader aqui para que o botão de Exportar possa controlar `exportingZip`
  // O título e descrição virão do `config` que está no estado deste Client Component.
  const pageTitle = config.project || workspaceCode;
  const pageDescription = config.description || 'Manage workspace areas, sub-areas, and processes';

  return (
    <>
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        actions={
          <Button
            variant="secondary"
            onClick={handleExportWorkspaceZip}
            disabled={exportingZip || !config}
            className="inline-flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            {exportingZip ? 'Exporting...' : 'Export Workspace (ZIP)'}
          </Button>
        }
      />

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <TreeMenu
          appCode={workspaceCode} // Passando o appCode para o TreeMenu
          areas={config.areas || []}
          onCreateArea={handleOpenCreateAreaModal}
          onCreateSubArea={handleOpenCreateSubAreaModal}
          onCreateProcess={handleOpenCreateProcessModal}
          onEditItem={handleOpenEditItemModal}
          onDeleteItem={handleDeleteItem}
        />
      </div>

      {/* Modais */}
      {showCreateArea && (
        <CreateAreaModal
          workspaceCode={workspaceCode}
          existingAreaCodes={config?.areas?.map(a => a.code) || []}
          onClose={() => setShowCreateArea(false)}
          onCreated={() => {
            setShowCreateArea(false);
            refreshConfig();
          }}
        />
      )}

      {showCreateSubArea && selectedAreaForModal && (
        <CreateSubAreaModal
          workspaceCode={workspaceCode}
          areaCode={selectedAreaForModal}
          existingSubAreaCodes={
            config?.areas
              .find(a => a.code === selectedAreaForModal)
              ?.subareas?.map(sa => sa.code) || []
          }
          onClose={() => {
            setShowCreateSubArea(false);
            setSelectedAreaForModal(null);
          }}
          onCreated={() => {
            setShowCreateSubArea(false);
            setSelectedAreaForModal(null);
            refreshConfig();
          }}
        />
      )}

      {showCreateProcess && selectedAreaForModal && (
        <CreateProcessModal
          workspaceCode={workspaceCode}
          initialArea={selectedAreaForModal}
          initialSubArea={selectedSubAreaForModal}
          availableAreas={config.areas.map(a => ({ code: a.code, title: a.title, subareas: a.subareas.map(sa => ({ code: sa.code, title: sa.title })) })) || []}
          existingProcessCodes={(() => {
            if (!config || !selectedAreaForModal) return [];
            const area = config.areas.find(a => a.code === selectedAreaForModal);
            if (!area) return [];
            if (selectedSubAreaForModal) {
              const subArea = area.subareas.find(sa => sa.code === selectedSubAreaForModal);
              return subArea?.processes?.map(p => p.code) || [];
            }
            return area.processes?.map(p => p.code) || [];
          })()}
          onClose={() => {
            setShowCreateProcess(false);
            setSelectedAreaForModal(null);
            setSelectedSubAreaForModal(null);
          }}
          onCreated={(appCode, areaCode, subAreaCode, newProcessCode) => { // Callback pode precisar de ajustes
            setShowCreateProcess(false);
            setSelectedAreaForModal(null);
            setSelectedSubAreaForModal(null);
            refreshConfig();
            // Opcional: navegar para o editor do novo processo
            router.push(`/workspaces/${appCode}/processes/${newProcessCode}`);
          }}
        />
      )}

      {showEditModal && editItem && (
        <EditItemModal
          isOpen={showEditModal} // Prop para controlar visibilidade
          type={editItem.type} // 'area', 'subarea', 'process'
          workspaceCode={editItem.workspaceCode}
          itemCode={editItem.itemCode}
          parentCode={editItem.parentCode}
          grandParentCode={editItem.grandParentCode}
          currentTitle={editItem.title} // Passando title de EditItemFormData
          currentDescription={editItem.description} // Passando description
          currentStatus={editItem.status} // Passando status
          onClose={() => {
            setShowEditModal(false);
            setEditItem(null);
          }}
          onUpdated={() => {
            setShowEditModal(false);
            setEditItem(null);
            refreshConfig();
          }}
        />
      )}
    </>
  );
};

export default WorkspaceDetailsClientContent;
