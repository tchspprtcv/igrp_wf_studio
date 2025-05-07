import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { WorkflowEngineSDK } from 'igrp-wf-engine';
import PageHeader from "@/components/layout/PageHeader";
// Remove unused MoreVertical import
import { FolderOpen, Search, Download, /*MoreVertical,*/ Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import CreateWorkspace from "./CreateWorkspace";

interface Workspace {
  id: string;
  code: string;
  title: string;
  description: string;
  status: string;
  updated_at: string;
}

const WorkspaceList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'all'>('recent');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const sdk = new WorkflowEngineSDK();
      // Assuming listWorkspaces returns something like { code: string, description?: string, ...otherFields }
      const fetchedApps = await sdk.workspaces.listWorkspaces(); 
      // Map fetched data to the Workspace interface
      const mappedWorkspaces: Workspace[] = fetchedApps.map((app: any) => ({
        id: app.id || app.code, // Use id if available, otherwise fallback to code or generate one
        code: app.code,
        title: app.description || app.code, // Use description as title, fallback to code
        description: app.description || '', // Ensure description is always a string
        status: app.status || 'unknown', // Provide default status if missing
        updated_at: app.updated_at || new Date().toISOString(), // Provide default date if missing
      }));
      setWorkspaces(mappedWorkspaces);
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
      const sdk = new WorkflowEngineSDK();
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

  const filteredWorkspaces = workspaces.filter(app =>
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentWorkspaces = filteredWorkspaces
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  const handleExport = (appCode: string) => {
    // TODO: Implement export functionality
    console.log('Exporting workspace:', appCode);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderWorkspaceList = (apps: Workspace[]) => (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {apps.length > 0 ? (
          apps.map((app) => (
            <li key={app.id} className="animate-slide-in">
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="sm:flex sm:items-center sm:justify-between w-full">
                    <div className="sm:flex sm:items-center">
                      <div className="flex-shrink-0 mr-4 bg-primary-100 p-2 rounded-lg">
                        <FolderOpen className="h-6 w-6 text-primary-600" />
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
                      >
                        Export
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
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No workspaces found</h3>
              <p className="mt-1 text-sm text-gray-500">Create a new workflow workspace to get started.</p>
            </div>
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Workflow Workspaces" 
        description="Manage your workflow workspaces"
        onCreateNew={() => setShowCreateModal(true)}
        createNewLabel="New Workspace"
      />
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div className="mb-6 space-y-4">
        <div className="flex items-center">
          <div className="relative flex-grow max-w-md">
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

      {activeTab === 'recent' ? renderWorkspaceList(recentWorkspaces) : renderWorkspaceList(filteredWorkspaces)}

      {showCreateModal && (
        <CreateWorkspace 
          onClose={() => setShowCreateModal(false)} 
          onCreated={loadWorkspaces}
        />
      )}
    </div>
  );
};

export default WorkspaceList;