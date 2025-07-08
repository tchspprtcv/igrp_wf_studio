"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AppOptions } from '@igrp/wf-engine'; // Mantido
import { Folder, Search, Download, Trash2, Eye, Terminal } from "lucide-react"; // Ícones como no Dashboard
import { cn, formatDate } from "@/lib/utils"; // formatDate do Dashboard
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Input do ShadCN
import { Badge } from "@/components/ui/badge"; // Badge do ShadCN
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Table do ShadCN
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Card do ShadCN
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Alert do ShadCN
import CreateWorkspaceModal from "@/components/modals/CreateWorkspaceModal";
import JSZip from 'jszip';
import { toast } from 'react-hot-toast';
import { deleteWorkspaceAction, getWorkspaceExportDataAction } from "@/app/actions";

interface WorkspaceListClientProps {
  initialWorkspaces: AppOptions[];
  initialError?: string | null; // Adicionado para consistência com Dashboard
}

export default function WorkspaceListClientContent({ initialWorkspaces, initialError }: WorkspaceListClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [workspaces, setWorkspaces] = useState<AppOptions[]>(initialWorkspaces);
  const [error, setError] = useState<string | null>(initialError || null); // Erro do cliente/ações + inicial
  const [exportingWorkspaceCode, setExportingWorkspaceCode] = useState<string | null>(null);

  useEffect(() => {
    setWorkspaces(initialWorkspaces);
  }, [initialWorkspaces]);

  useEffect(() => {
    setError(initialError || null); // Sincronizar com erro inicial do server
  }, [initialError]);

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this workspace?')) {
      return;
    }
    try {
      const result = await deleteWorkspaceAction(code);
      if (result.success) {
        toast.success(result.message || `Workspace '${code}' deleted successfully.`);
        // router.refresh(); // Ação do servidor deve revalidar o path
      } else {
        toast.error(result.message || 'Failed to delete workspace');
        setError(result.message); // Exibe erro na UI se houver local para isso
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Error: ${errorMessage}`);
      setError(errorMessage);
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
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${appCode}-workspace.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      toast.success(`Workspace '${appCode}' exported successfully.`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to export workspace ${appCode}: ${errorMessage}`);
      console.error("Export error:", err);
    } finally {
      setExportingWorkspaceCode(null);
    }
  };

  // Variante do Badge como no DashboardClientContent
  const getStatusBadgeVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "draft": return "outline";
      default: return "secondary";
    }
  };

  const filteredWorkspaces = workspaces.filter(app =>
    (app.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (app.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (app.code?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleWorkspaceCreated = () => {
    setShowCreateModal(false);
    router.refresh(); // Revalida os dados da página
  };

  return (
    <>
      {/* Barra de busca e botão de Novo Workspace, como no DashboardClientContent */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search workspaces..."
            className="w-full pl-8" // Estilo do Input ShadCN
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
          New Workspace
        </Button>
      </div>

      {/* Exibição de erro do cliente, se houver e não for o erro inicial já tratado na page.tsx */}
      {error && !initialError && (
         <Alert variant="destructive" className="mb-4">
           <Terminal className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Workspaces</CardTitle>
          <CardDescription>Browse and manage all your workflow workspaces.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6"> {/* Padding ajustado como no Dashboard */}
          <div className="overflow-x-auto"> {/* Wrapper para scroll horizontal da tabela */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Code</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkspaces.length > 0 ? (
                  filteredWorkspaces.map((app) => (
                    <TableRow key={app.id || app.code}>
                      <TableCell>
                        <Link href={`/workspaces/${app.code}`} className="font-medium text-primary hover:underline">
                          {app.title || app.code}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{app.code}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-xs">
                        {app.description}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {app.updated_at ? formatDate(app.updated_at) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(app.status)}>
                          {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExport(app.code)}
                            disabled={exportingWorkspaceCode === app.code}
                            title="Export Workspace"
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Export</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild // Permite que Link seja o filho direto para navegação
                            title="View Workspace"
                          >
                            <Link href={`/workspaces/${app.code}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(app.code)}
                            className="text-destructive hover:text-destructive/90" // Estilo para botão de exclusão
                            title="Delete Workspace"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Folder className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                      <p className="font-medium">No workspaces found.</p>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? "Try adjusting your search terms." : "Create a new workspace to get started."}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {filteredWorkspaces.length > 0 && (
            <CardFooter className="text-xs text-muted-foreground">
                Showing {filteredWorkspaces.length} of {workspaces.length} workspaces.
            </CardFooter>
        )}
      </Card>

      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleWorkspaceCreated}
        />
      )}
    </>
  );
}
