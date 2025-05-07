import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { WorkflowEngineSDK } from 'igrp-wf-engine';
import PageHeader from '@/components/layout/PageHeader';
import TreeMenu from '@/components/workspaces/TreeMenu';
import CreateArea from './CreateArea';
import CreateSubArea from './CreateSubArea';
import CreateProcess from './CreateProcess';
import EditItemModal from '@/components/workspaces/EditItemModal';

const WorkspaceDetails: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [config, setConfig] = useState<any>(null);
  const [showCreateArea, setShowCreateArea] = useState(false);
  const [showCreateSubArea, setShowCreateSubArea] = useState(false);
  const [showCreateProcess, setShowCreateProcess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedSubArea, setSelectedSubArea] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<{
    type: 'area' | 'subarea' | 'process';
    code: string;
    parentCode?: string;
  } | null>(null);
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
    <div className="space-y-6">
      <PageHeader
        title={config?.project || code}
        description="Manage workspace areas and processes"
      />

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