"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Para revalidação ou navegação programática
import type { AppOptions } from '@igrp/wf-engine';
import { Workflow, Layers, Folder, Clock, Search, Download, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";
import CreateWorkspaceModal from "@/components/modals/CreateWorkspaceModal"; // Caminho atualizado
import JSZip from 'jszip';
import { toast } from 'react-hot-toast';
import { deleteWorkspaceAction, getWorkspaceExportDataAction } from "./actions"; // Importar as Server Actions

interface DashboardClientContentProps {
  initialWorkspaces: AppOptions[]; // AppOptions é o tipo retornado por listWorkspaces
  initialError?: string | null;
}

export default function DashboardClientContent({ initialWorkspaces, initialError }: DashboardClientContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [workspaces, setWorkspaces] = useState<AppOptions[]>(initialWorkspaces);
  const [error, setError] = useState<string | null>(initialError || null);
  const [exportingWorkspaceCode, setExportingWorkspaceCode] = useState<string | null>(null);

  // Se initialWorkspaces mudar (ex: após router.refresh()), atualize o estado.
  useEffect(() => {
    setWorkspaces(initialWorkspaces);
  }, [initialWorkspaces]);

  useEffect(() => {
    setError(initialError || null);
  }, [initialError]);

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this workspace?')) {
      return;
    }
    try {
      const result = await deleteWorkspaceAction(code);
      if (result.success) {
        toast.success(result.message || `Workspace '${code}' deleted successfully.`);
        // router.refresh(); // revalidatePath na action deve ser suficiente
                         // mas router.refresh() pode ser usado se a revalidação não for imediata.
                         // Por ora, vamos confiar no revalidatePath.
      } else {
        toast.error(result.message || 'Failed to delete workspace');
        setError(result.message);
      }
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
      setError((err as Error).message); // Pode ser um erro de rede ou da action não ter sido pega pelo try/catch interno dela
    }
  };

  const handleExport = async (appCode: string) => {
    if (!appCode) {
      toast.error("Workspace code is missing.");
      return;
    }
    setExportingWorkspaceCode(appCode);
    toast.success(`Fetching data for ${appCode} export...`);

    try {
      const result = await getWorkspaceExportDataAction(appCode);

      if (!result.success || !result.data || !result.data.projectConfig) {
        toast.error(result.message || `Could not load configuration for workspace ${appCode}.`);
        setExportingWorkspaceCode(null);
        return;
      }

      const { projectConfig, processes } = result.data;

      toast.success(`Generating ZIP for ${appCode}...`);
      const zip = new JSZip();
      // Adiciona o project-config.json na raiz da pasta do appCode dentro do ZIP
      zip.file(`${appCode}/project-config.json`, JSON.stringify(projectConfig, null, 2));

      // Adiciona cada arquivo de processo no seu respectivo caminho dentro da pasta do appCode
      for (const processFile of processes) {
        // processFile.path já é relativo à raiz do workspace (ex: area/processo.bpmn)
        zip.file(`${appCode}/${processFile.path}`, processFile.content);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${appCode}-workspace.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      toast.success(`Workspace '${appCode}' exported successfully.`);

    } catch (err) {
      toast.error(`Failed to export workspace ${appCode}: ${(err as Error).message}`);
      console.error("Export error:", err);
    } finally {
      setExportingWorkspaceCode(null);
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
    (app.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (app.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleWorkspaceCreated = () => {
    setShowCreateModal(false);
    // Revalida os dados da página para buscar a nova lista de workspaces
    router.refresh();
  };

  return (
    <>
      {/* Botão "New Workspace" e barra de pesquisa */}
      <div className="mt-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-md">
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

      {error && !initialError && ( // Mostrar erro apenas se não for o erro inicial já mostrado pelo Server Component
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredWorkspaces.length > 0 ? (
            filteredWorkspaces.map((app) => (
              <li key={app.id || app.code} className="animate-slide-in">
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="sm:flex sm:items-center sm:justify-between w-full">
                      <div className="sm:flex sm:items-center">
                        <div className="flex-shrink-0 mr-4 bg-primary-100 p-2 rounded-lg">
                          <Folder className="h-6 w-6 text-primary-600" />
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
                          {app.updated_at && (
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <span>Updated {formatDate(app.updated_at)}</span>
                            </div>
                          )}
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
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExport(app.code)}
                          icon={<Download className="h-4 w-4" />}
                          disabled={exportingWorkspaceCode === app.code}
                        >
                          {exportingWorkspaceCode === app.code ? 'Exporting...' : 'Export'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
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
                <Folder className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No workspaces found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? "Try adjusting your search." : "Create a new workflow workspace to get started."}
                </p>
              </div>
            </li>
          )}
        </ul>
      </div>

      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleWorkspaceCreated} // router.refresh() será chamado aqui
        />
      )}
    </>
  );
}
