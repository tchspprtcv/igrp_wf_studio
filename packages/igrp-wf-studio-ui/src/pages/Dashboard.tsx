import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { WorkflowEngineSDK, ProjectConfig } from '@igrp/wf-engine'; // Added ProjectConfig
import PageHeader from "@/components/layout/PageHeader";
import { Workflow, Layers, Folder, Clock, Search, Download, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";
import CreateWorkspace from "./workspaces/CreateWorkspace";
import JSZip from 'jszip'; // Added JSZip
import { toast } from 'react-hot-toast'; // Added toast

interface DashboardStats {
  workspaces: number;
  areas: number;
  processes: number;
  active: number;
}

const sdk = new WorkflowEngineSDK();

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    workspaces: 0,
    areas: 0,
    processes: 0,
    active: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingWorkspaceCode, setExportingWorkspaceCode] = useState<string | null>(null); // Added state for export loading

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const apps = await sdk.workspaces.listWorkspaces();
      setWorkspaces(apps);

      const statsData: DashboardStats = {
        workspaces: apps.length,
        areas: 0,
        processes: 0,
        active: apps.filter(app => app.status === 'active').length
      };

      for (const app of apps) {
        const config = await sdk.workspaces.loadProjectConfig(app.code);
        if (config) {
          statsData.areas += config.areas.length;
          for (const area of config.areas) {
            statsData.processes += area.processes.length;
            for (const subarea of area.subareas) {
              statsData.processes += subarea.processes.length;
            }
          }
        }
      }

      setStats(statsData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this workspace?')) {
      return;
    }

    try {
      const result = await sdk.workspaces.deleteWorkspace(code);
      if (result.success) {
        await loadWorkspaces();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleExport = async (appCode: string) => {
    if (!appCode) {
      toast.error("Workspace code is missing.");
      return;
    }

    setExportingWorkspaceCode(appCode);
    console.log('handleExport called with appCode:', appCode); 

    try {
      const projectConfig = await sdk.workspaces.loadProjectConfig(appCode);

      if (!projectConfig) {
        toast.error(`Could not load configuration for workspace ${appCode}.`);
        setExportingWorkspaceCode(null);
        return;
      }

      const zip = new JSZip();

      // 1. Add project-config.json to ZIP
      const projectConfigString = JSON.stringify(projectConfig, null, 2);
      zip.file(`${appCode}/project-config.json`, projectConfigString);

      // 2. Iterate through areas, subareas, and processes to get BPMN XML
      for (const area of projectConfig.areas || []) {
        const areaPath = `${appCode}/${area.code}`;

        for (const process of area.processes || []) {
          try {
            const processDefinition = await sdk.processes.readProcessDefinition(
              appCode,
              area.code,
              process.code
            );
            if (processDefinition?.bpmnXml) {
              zip.file(`${areaPath}/${process.code}.bpmn`, processDefinition.bpmnXml);
            }
          } catch (e) {
            console.warn(`Could not read process ${process.code} in area ${area.code} for workspace ${appCode}: ${(e as Error).message}`);
            toast.error(`Error reading process ${process.code} in ${area.code}`);
          }
        }

        for (const subArea of area.subareas || []) {
          const subAreaPath = `${areaPath}/${subArea.code}`;
          for (const process of subArea.processes || []) {
            try {
              const processDefinition = await sdk.processes.readProcessDefinition(
                appCode,
                area.code,
                process.code,
                subArea.code
              );
              if (processDefinition?.bpmnXml) {
                zip.file(`${subAreaPath}/${process.code}.bpmn`, processDefinition.bpmnXml);
              }
            } catch (e) {
              console.warn(`Could not read process ${process.code} in subarea ${subArea.code} (area ${area.code}) for workspace ${appCode}: ${(e as Error).message}`);
              toast.error(`Error reading process ${process.code} in ${subArea.code}`);
            }
          }
        }
      }

      // 3. Generate and download the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${appCode}-workspace.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      toast.success(`Workspace '${appCode}' exported successfully as ZIP.`);

    } catch (err) {
      toast.error(`Failed to export workspace ${appCode}: ${(err as Error).message}`);
      console.error(`ZIP Export error for workspace ${appCode}:`, err);
    } finally {
      setExportingWorkspaceCode(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredWorkspaces = workspaces.filter(app =>
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statCards = [
    {
      name: "Workspaces",
      count: stats.workspaces,
      icon: Folder,
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "Areas",
      count: stats.areas,
      icon: Layers,
      color: "bg-violet-100 text-violet-600",
    },
    {
      name: "Processes",
      count: stats.processes,
      icon: Workflow,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      name: "Active",
      count: stats.active,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your workflow workspaces"
        onCreateNew={() => setShowCreateModal(true)}
        createNewLabel="New Workspace"
      />
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div 
            key={stat.name} 
            className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-md"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-bold text-gray-900">
                        {stat.count}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="relative max-w-md">
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
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredWorkspaces.length > 0 ? (
            filteredWorkspaces.map((app) => (
              <li key={app.id} className="animate-slide-in">
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="sm:flex sm:items-center sm:justify-between w-full">
                      <div className="sm:flex sm:items-center">
                        <div className="flex-shrink-0 mr-4 bg-primary-100 p-2 rounded-lg">
                          <Folder className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-primary-600">
                            <Link to={`/workspaces/${app.code}`} className="hover:underline">
                              {app.title}
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
                      <div className="mt-4 sm:mt-0 flex items-center">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-medium mr-4",
                          getStatusBadgeClass(app.status)
                        )}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExport(app.code)}
                          icon={<Download className="h-4 w-4" />}
                          className="mr-2"
                          disabled={exportingWorkspaceCode === app.code} // Added disabled state
                        >
                          {exportingWorkspaceCode === app.code ? 'Exporting...' : 'Export'} {/* Added conditional text */}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(app.code)}
                          icon={<Trash2 className="h-4 w-4" />}
                          className="mr-2 text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                        <Link 
                          to={`/workspaces/${app.code}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
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
                <p className="mt-1 text-sm text-gray-500">Create a new workflow workspace to get started.</p>
              </div>
            </li>
          )}
        </ul>
      </div>

      {showCreateModal && (
        <CreateWorkspace 
          onClose={() => setShowCreateModal(false)} 
          onCreated={loadWorkspaces}
        />
      )}
    </div>
  );
};

export default Dashboard;