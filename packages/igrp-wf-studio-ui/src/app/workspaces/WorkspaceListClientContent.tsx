"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppOptions, ProjectConfig } from '@igrp/wf-engine'; // SDK não é instanciado aqui diretamente para busca inicial
import { FolderOpen, Search, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import CreateWorkspaceModal from "@/components/modals/CreateWorkspaceModal"; // Caminho atualizado
import { deleteWorkspaceAction, getWorkspaceExportDataAction } from "@/app/actions";
import JSZip from 'jszip';
import { toast } from 'react-hot-toast';

// Interface local se precisar de campos específicos além de AppOptions
interface WorkspaceUI extends AppOptions {
  // id: string; // AppOptions já tem id e code
  // title: string;
  // description: string;
  // status: string;
  // updated_at: string; // AppOptions já tem updated_at
}


interface WorkspaceListClientProps {
  initialWorkspaces: AppOptions[];
}

export default function WorkspaceListClientContent({ initialWorkspaces }: WorkspaceListClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'all'>('recent');
  const [workspaces, setWorkspaces] = useState<WorkspaceUI[]>(initialWorkspaces as WorkspaceUI[]);
  const [error, setError] = useState<string | null>(null); // Erros de cliente/ações
  const [exportingWorkspaceCode, setExportingWorkspaceCode] = useState<string | null>(null);

  useEffect(() => {
    setWorkspaces(initialWorkspaces as WorkspaceUI[]);
  }, [initialWorkspaces]);

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this workspace?')) {
      return;
    }
    try {
      const result = await deleteWorkspaceAction(code);
      if (result.success) {
        toast.success(result.message || `Workspace '${code}' deleted.`);
        // router.refresh(); // Server action revalidatePath deve cuidar disso
      } else {
        toast.error(result.message || 'Failed to delete workspace.');
        setError(result.message);
      }
    } catch (err) {
      toast.error(`Client error deleting workspace: ${(err as Error).message}`);
      setError((err as Error).message);
    }
  };

  const handleExport = async (appCode: string) => {
    if (!appCode) {
      toast.error("Workspace code is missing.");
      return;
    }
    setExportingWorkspaceCode(appCode);
    toast.info(`Fetching data for ${appCode} export...`);

    try {
      const result = await getWorkspaceExportDataAction(appCode);
      if (!result.success || !result.data || !result.data.projectConfig) {
        toast.error(result.message || `Could not load configuration for workspace ${appCode}.`);
        setExportingWorkspaceCode(null);
        return;
      }
      const { projectConfig, processes } = result.data;

      toast.info(`Generating ZIP for ${appCode}...`);
      const zip = new JSZip();
      zip.file(`${appCode}/project-config.json`, JSON.stringify(projectConfig, null, 2));
      for (const processFile of processes) {
        zip.file(`${appCode}/${processFile.path}`, processFile.content);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const linkEl = document.createElement('a');
      linkEl.href = downloadUrl;
      linkEl.download = `${appCode}-workspace.zip`;
      document.body.appendChild(linkEl);
      linkEl.click();
      document.body.removeChild(linkEl);
      URL.revokeObjectURL(downloadUrl);
      toast.success(`Workspace '${appCode}' exported.`);
    } catch (err) {
      toast.error(`Failed to export workspace ${appCode}: ${(err as Error).message}`);
    } finally {
      setExportingWorkspaceCode(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        }).format(date);
    } catch (e) {
        return 'Invalid Date';
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredWorkspaces = workspaces.filter(app =>
    (app.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentWorkspaces = [...filteredWorkspaces] // Criar cópia para não mutar o original com sort
    .sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())
    .slice(0, 3);

  const handleWorkspaceCreated = () => {
    setShowCreateModal(false);
    router.refresh(); // Revalida os dados da página
  };

  const renderList = (list: WorkspaceUI[]) => (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {list.length > 0 ? (
          list.map((app) => (
            <li key={app.id || app.code} className="animate-slide-in">
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="sm:flex sm:items-center sm:justify-between w-full">
                    <div className="sm:flex sm:items-center">
                      <div className="flex-shrink-0 mr-4 bg-primary-100 p-2 rounded-lg">
                        <FolderOpen className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-primary-600">
                          <Link href={`/workspaces/${app.code}`} className="hover:underline">
                            {app.title || app.code}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {app.description}
                        </p>
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <span>Updated {formatDate(app.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                        getStatusBadgeClass(app.status)
                      )}>
                        {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'N/A'}
                      </span>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => handleExport(app.code)}
                        icon={<Download className="h-4 w-4" />}
                        disabled={exportingWorkspaceCode === app.code}
                      >
                        {exportingWorkspaceCode === app.code ? 'Exporting...' : 'Export'}
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => handleDelete(app.code)}
                        icon={<Trash2 className="h-4 w-4" />}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                      <Link
                        href={`/workspaces/${app.code}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors px-2 py-1 rounded-md hover:bg-primary-50"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="py-12">
            <div className="text-center">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No workspaces found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? "Try adjusting your search." : "Create a new workflow workspace to get started."}
              </p>
            </div>
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="my-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative flex-grow w-full sm:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                type="text"
                placeholder="Search workspaces..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
                New Workspace
            </Button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('recent')}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'recent'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              Recent Workspaces
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              All Workspaces
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'recent' ? renderList(recentWorkspaces) : renderList(filteredWorkspaces)}

      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleWorkspaceCreated}
        />
      )}
    </>
  );
}
