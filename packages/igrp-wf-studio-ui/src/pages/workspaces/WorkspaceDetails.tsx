import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkflowEngineSDK, ProjectConfig, ProcessDefinition } from '@igrp/wf-engine';
import PageHeader from '@/components/layout/PageHeader';
import TreeMenu from '@/components/workspaces/TreeMenu';
import CreateArea from './CreateArea';
import CreateSubArea from './CreateSubArea';
import CreateProcess from './CreateProcess';
import EditItemModal from '@/components/workspaces/EditItemModal';
import  Button  from '@/components/ui/Button';
import { toast } from 'react-hot-toast'; // Corrected import
import { Archive } from 'lucide-react'; // Icon for export
import JSZip from 'jszip'; // Would be needed for ZIP functionality

interface WorkspaceDetailsParams extends Record<string, string | undefined> {
  code: string;
}

// Define EditItemType if it's not already defined elsewhere
interface EditItemType {
  type: 'area' | 'subarea' | 'process';
  code: string;
  parentCode?: string;
}

const WorkspaceDetails: React.FC = () => {
  const { code } = useParams<WorkspaceDetailsParams>();
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [showCreateArea, setShowCreateArea] = useState(false);
  const [showCreateSubArea, setShowCreateSubArea] = useState(false);
  const [showCreateProcess, setShowCreateProcess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<EditItemType | null>(null);
  const [exportingZip, setExportingZip] = useState(false); // State for ZIP export loading

  const navigate = useNavigate();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedSubArea, setSelectedSubArea] = useState<string | null>(null);
  // Removed duplicate declaration of editItem
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkspaceConfig();
  }, [code]);

  const loadWorkspaceConfig = async () => {
    try {
      setLoading(true);
      const sdk = new WorkflowEngineSDK();
      const projectConfig = await sdk.workspaces.loadProjectConfig(code!);
      setConfig(projectConfig);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArea = () => {
    setShowCreateArea(true);
  };

  const handleCreateSubArea = (areaCode: string) => {
    setSelectedArea(areaCode);
    setShowCreateSubArea(true);
  };

  const handleCreateProcess = (areaCode: string, subareaCode?: string) => {
    setSelectedArea(areaCode);
    setSelectedSubArea(subareaCode || null);
    setShowCreateProcess(true);
  };

  const handleEditItem = (type: 'area' | 'subarea' | 'process', itemCode: string, parentCode?: string) => {
    setEditItem({ type, code: itemCode, parentCode });
    setShowEditModal(true);
  };

  const handleDeleteItem = async (type: 'area' | 'subarea' | 'process', itemCode: string, parentCode?: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      const sdk = new WorkflowEngineSDK();
      let result;

      switch (type) {
        case 'area':
          result = await sdk.workspaces.deleteArea(code!, itemCode);
          break;
        case 'subarea':
          result = await sdk.workspaces.deleteSubArea(code!, parentCode!, itemCode);
          break;
        case 'process':
          result = await sdk.workspaces.deleteProcess(code!, parentCode!, itemCode);
          break;
      }

      if (result?.success) {
        await loadWorkspaceConfig();
      } else {
        setError(result?.message || 'Failed to delete item');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleExportWorkspaceZip = async () => {
    if (!code || !config) {
      toast.error("Workspace data not loaded yet.");
      return;
    }

    setExportingZip(true);

    try {
      const sdk = new WorkflowEngineSDK();
      const zip = new JSZip(); // Initialize JSZip
      // console.log('JSZip instance created:', zip);

      // 1. Add project-config.json to ZIP
      const projectConfigString = JSON.stringify(config, null, 2);
      zip.file(`${code}/project-config.json`, projectConfigString);
      // console.log(`Simulating: Adding ${code}/project-config.json to ZIP content:`, projectConfigString);

      // 2. Iterate through areas, subareas, and processes to get BPMN XML
      for (const area of config.areas || []) {
        const areaPath = `${code}/${area.code}`;

        for (const process of area.processes || []) {
          try {
            const processDefinition = await sdk.processes.readProcessDefinition(
              code,
              area.code,
              process.code
            );
            if (processDefinition?.bpmnXml) {
              zip.file(`${areaPath}/${process.code}.bpmn`, processDefinition.bpmnXml);
              // console.log(`Simulating: Adding ${areaPath}/${process.code}.bpmn to ZIP`);
            }
          } catch (e) {
            console.warn(`Could not read process ${process.code} in area ${area.code}: ${(e as Error).message}`);
            toast(`Could not read process ${process.code} in area ${area.code}`);
          }
        }

        for (const subArea of area.subareas || []) {
          const subAreaPath = `${areaPath}/${subArea.code}`;
          for (const process of subArea.processes || []) {
            try {
              const processDefinition = await sdk.processes.readProcessDefinition(
                code,
                area.code,
                process.code,
                subArea.code
              );
              if (processDefinition?.bpmnXml) {
                zip.file(`${subAreaPath}/${process.code}.bpmn`, processDefinition.bpmnXml);
                // console.log(`Simulating: Adding ${subAreaPath}/${process.code}.bpmn to ZIP`);
              }
            } catch (e) {
              console.warn(`Could not read process ${process.code} in subarea ${subArea.code} (area ${area.code}): ${(e as Error).message}`);
              toast(`Could not read process ${process.code} in subarea ${subArea.code}`); // Changed from toast.warning
            }
          }
        }
      }

      // 3. Generate and download the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${code}-workspace.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      // toast.success(`Simulation: ZIP for workspace '${code}' would be generated and downloaded. Check console for details.`);
      toast.success(`Workspace '${code}' exported successfully as ZIP.`);

    } catch (err) {
      toast.error(`Failed to export workspace: ${(err as Error).message}`);
      console.error("ZIP Export error:", err);
    } finally {
      setExportingZip(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={config?.project || code || 'Workspace'}
        description={'Manage workspace areas, sub-areas, and processes'} // Removed config?.description
        actions={ // Added actions prop
          <Button
            variant="secondary"
            onClick={handleExportWorkspaceZip}
            disabled={exportingZip || !config || loading}
          >
            <Archive className="mr-2 h-4 w-4" />
            {exportingZip ? 'Exporting...' : 'Export Workspace (ZIP)'}
          </Button>
        }
      />

      {!loading && !error && ( // Corrected condition to show TreeMenu when not loading and no error
        <div className="grid grid-cols-1 gap-6">
          <TreeMenu
            areas={config?.areas || []}
            onCreateArea={handleCreateArea}
            onCreateSubArea={handleCreateSubArea}
            onCreateProcess={handleCreateProcess}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        </div>
      )}

      {showCreateArea && (
        <CreateArea
          workspaceCode={code!}
          onClose={() => setShowCreateArea(false)}
          onCreated={loadWorkspaceConfig}
        />
      )}

      {showCreateSubArea && selectedArea && (
        <CreateSubArea
          workspaceCode={code!}
          areaCode={selectedArea}
          onClose={() => {
            setShowCreateSubArea(false);
            setSelectedArea(null);
          }}
          onCreated={loadWorkspaceConfig}
        />
      )}

      {showCreateProcess && selectedArea && (
        <CreateProcess
          workspaceCode={code!}
          onClose={() => {
            setShowCreateProcess(false);
            setSelectedArea(null);
            setSelectedSubArea(null);
          }}
          onCreated={loadWorkspaceConfig}
          initialArea={selectedArea}
          initialSubArea={selectedSubArea}
        />
      )}

      {showEditModal && editItem && (
        <EditItemModal
          type={editItem.type}
          workspaceCode={code!}
          itemCode={editItem.code}
          parentCode={editItem.parentCode}
          onClose={() => {
            setShowEditModal(false);
            setEditItem(null);
          }}
          onUpdated={loadWorkspaceConfig}
        />
      )}
    </div>
  );
};

export default WorkspaceDetails;