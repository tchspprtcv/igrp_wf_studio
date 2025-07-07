"use client"; // Adicionado para Next.js App Router

import React, { useState, useEffect } from "react";
import Link from "next/link"; // Alterado de NavLink
import { useRouter, usePathname } from "next/navigation"; // Alterado de useNavigate
import type { AppOptions, ProjectConfig } from '@igrp/wf-engine';
import { cn } from "@/lib/utils";
import { deleteWorkspaceAction, deleteWorkspaceItemAction } from "@/app/actions"; // Import server actions
import { toast } from 'react-hot-toast';
import {
  Home,
  X,
  ChevronDown,
  ChevronRight,
  Folder,
  Layers,
  Workflow,
  Trash2,
  MoreVertical,
  Edit,
  ChevronsRight,
  ChevronsLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
// As importações de páginas de modais podem precisar de ajuste de caminho se as páginas forem movidas
// ou se os modais forem extraídos para componentes dedicados.
// Por agora, mantendo os caminhos originais relativos a 'src'.
import CreateWorkspace from "@/components/modals/CreateWorkspaceModal"; // Atualizado
import CreateArea from "@/components/modals/CreateAreaModal";
import CreateSubArea from "@/components/modals/CreateSubAreaModal";
import CreateProcess from "@/components/modals/CreateProcessModal";
import EditWorkspace from "@/components/modals/EditWorkspaceModal"; // Atualizado
import EditArea from "@/components/modals/EditAreaModal";           // Atualizado
import EditSubArea from "@/components/modals/EditSubAreaModal";         // Atualizado
import type {
  SidebarWorkspace,
  SidebarArea,
  SidebarSubArea,
  SidebarProcess
} from '@/types'; // Importar tipos centralizados

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean; // Add prop for collapsed state
  onToggleCollapse: () => void; // Add prop for toggling collapse
}

// SDK is now used via server actions

const Sidebar: React.FC<SidebarProps> = ({ 
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [workspaces, setWorkspaces] = useState<SidebarWorkspace[]>([]); // Usar tipo centralizado
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [showCreateArea, setShowCreateArea] = useState(false);
  const [showCreateSubArea, setShowCreateSubArea] = useState(false);
  const [showCreateProcess, setShowCreateProcess] = useState(false);
  const [showEditWorkspace, setShowEditWorkspace] = useState(false);
  const [showEditArea, setShowEditArea] = useState(false);
  const [showEditSubArea, setShowEditSubArea] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedSubArea, setSelectedSubArea] = useState<string | null>(null);
  const [editingWorkspaceCode, setEditingWorkspaceCode] = useState<string | null>(null);
  const [editingArea, setEditingArea] = useState<{ appCode: string; area: SidebarArea } | null>(null); // Usar SidebarArea
  const [editingSubArea, setEditingSubArea] = useState<{ appCode: string; areaCode: string; subArea: SidebarSubArea } | null>(null); // Usar SidebarSubArea

  const handleWorkspaceCreated = async () => {
    await loadWorkspaces();
    setShowCreateApp(false); // Close the modal after creation
  };

  // Menu states
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu && !(event.target as Element).closest('.menu-container')) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenu]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      
      // Fetch workspaces data from the server
      const response = await fetch('/api/workspaces');
      if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
      }
      
      const data = await response.json();
      setWorkspaces(data.workspaces || []);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      setError((error as Error).message);
      toast.error(`Failed to load workspaces: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApp = async (code: string) => {
    if (!confirm('Are you sure you want to delete this workspace?')) {
      return;
    }

    try {
      const result = await deleteWorkspaceAction(code);
      if (result.success) {
        toast.success(result.message || `Workspace '${code}' deleted successfully.`);
        await loadWorkspaces();
        router.push('/'); // Alterado de navigate('/')
      } else {
        toast.error(result.message || 'Failed to delete workspace');
        setError(result.message);
      }
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
      setError((err as Error).message);
    }
  };

  const handleDeleteArea = async (appCode: string, areaCode: string) => {
    if (!confirm('Are you sure you want to delete this area?')) {
      return;
    }

    try {
      const result = await deleteWorkspaceItemAction({
        appCode,
        itemType: 'area',
        itemCode: areaCode
      });
      
      if (result.success) {
        toast.success(result.message || `Area '${areaCode}' deleted successfully.`);
        await loadWorkspaces();
      } else {
        toast.error(result.message || 'Failed to delete area');
        setError(result.message);
      }
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
      setError((err as Error).message);
    }
  };

  const handleDeleteSubArea = async (appCode: string, areaCode: string, subareaCode: string) => {
    if (!confirm('Are you sure you want to delete this subarea?')) {
      return;
    }

    try {
      const result = await deleteWorkspaceItemAction({
        appCode,
        itemType: 'subarea',
        itemCode: subareaCode,
        parentCode: areaCode
      });
      
      if (result.success) {
        toast.success(result.message || `Subarea '${subareaCode}' deleted successfully.`);
        await loadWorkspaces();
      } else {
        toast.error(result.message || 'Failed to delete subarea');
        setError(result.message);
      }
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
      setError((err as Error).message);
    }
  };

  const handleDeleteProcess = async (appCode: string, areaCode: string, processCode: string, subareaCode?: string) => {
    if (!confirm('Are you sure you want to delete this process?')) {
      return;
    }

    try {
      const result = await deleteWorkspaceItemAction({
        appCode,
        itemType: 'process',
        itemCode: processCode,
        parentCode: subareaCode || areaCode,
        grandParentCode: subareaCode ? areaCode : undefined
      });
      
      if (result.success) {
        toast.success(result.message || `Process '${processCode}' deleted successfully.`);
        await loadWorkspaces();
        router.push('/workspaces/' + appCode); // Alterado de navigate
      } else {
        toast.error(result.message || 'Failed to delete process');
        setError(result.message);
      }
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
      setError((err as Error).message);
    }
  };

  const toggleApp = (code: string) => {
    const newExpanded = new Set(expandedApps);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedApps(newExpanded);
  };

  const toggleArea = (code: string) => {
    const newExpanded = new Set(expandedAreas);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedAreas(newExpanded);
  };

  const toggleMenu = (menuId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
  ];

  const renderActionMenu = (
    menuId: string,
    actions: Array<{
      label: string;
      icon: React.ReactNode;
      onClick: (e: React.MouseEvent) => void;
      className?: string;
    }>
  ) => (
    <div className="menu-container relative">
      <button
        onClick={(e) => toggleMenu(menuId, e)}
        className="p-1 rounded-md hover:bg-gray-100"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>
      {activeMenu === menuId && (
        <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(e);
                  setActiveMenu(null);
                }}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm flex items-center hover:bg-gray-100",
                  action.className
                )}
                role="menuitem"
              >
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProcess = (appCode: string, areaCode: string, process: SidebarProcess, isCollapsed: boolean, subareaCode?: string) => { // Usar SidebarProcess
    // Ajustar o path do processo para a nova estrutura de rotas
    const processPath = `/workspaces/${appCode}/processes/${process.code}`;
    const isActive = pathname === processPath;
    const menuId = `process-${appCode}-${areaCode}-${subareaCode || 'root'}-${process.code}`;


    return (
      <div key={process.code} className="flex items-center pl-12 py-1 text-sm">
        <Link
          href={processPath}
          className={cn(
            "flex items-center flex-1 rounded-md px-2 py-1",
            isActive
              ? "bg-primary-100 text-primary-700 font-medium"
              : "text-gray-600 bg-blue-300 hover:bg-blue-400" // Mantido estilo original para consistência visual inicial
          )}
        >
          <Workflow className="h-4 w-4 mr-2" />
          <span className="truncate">{process.title}</span>
        </Link>
        {!isCollapsed && renderActionMenu(menuId, [
          {
            label: "Edit",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => router.push(processPath) // Alterado de navigate
          },
          {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => handleDeleteProcess(appCode, areaCode, process.code, subareaCode),
            className: "text-red-600 hover:text-red-700"
          }
        ])}
      </div>
    );
  };

  const renderSubArea = (appCode: string, areaCode: string, subarea: SidebarSubArea, isCollapsed: boolean) => { // Usar SidebarSubArea
    const menuId = `subarea-${appCode}-${areaCode}-${subarea.code}`; // MenuId mais específico

    return (
      <div key={subarea.code} className="pl-8">
        <div className="flex items-center py-1 text-sm text-gray-600 bg-blue-200 hover:bg-blue-300 rounded-md px-2">
          <Layers className="h-4 w-4 mr-2" />
          <span className="truncate flex-1 py-1">{subarea.title}</span>
          {renderActionMenu(menuId, [
            {
              label: "Edit",
              icon: <Edit className="h-4 w-4" />,
              onClick: () => {
                setEditingSubArea({ appCode, areaCode, subArea: subarea });
                setShowEditSubArea(true);
              }
            },
            {
              label: "Add Process",
              icon: <Workflow className="h-4 w-4" />,
              onClick: () => {
                setSelectedApp(appCode);
                setSelectedArea(areaCode);
                setSelectedSubArea(subarea.code);
                setShowCreateProcess(true);
              }
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => handleDeleteSubArea(appCode, areaCode, subarea.code),
              className: "text-red-600 hover:text-red-700"
            }
          ])}
        </div>
        {subarea.processes.map(process => 
          renderProcess(appCode, areaCode, process, isCollapsed, subarea.code)
        )}
      </div>
    );
  };

  const renderArea = (appCode: string, area: SidebarArea, isCollapsed: boolean) => { // Usar SidebarArea
    const isExpanded = expandedAreas.has(area.code);
    const menuId = `area-${appCode}-${area.code}`; // MenuId mais específico

    return (
      <div key={area.code}>
        <div className={cn("flex items-center py-1", isCollapsed ? "pl-1 justify-center" : "pl-6")}>
          <button
            onClick={() => toggleArea(area.code)}
            className={cn(
              "flex items-center flex-1 text-sm text-gray-700 hover:bg-blue-200 rounded-md py-1",
              isCollapsed ? "px-1 justify-center bg-blue-100" : "px-2 bg-blue-100"
            )}
            title={isCollapsed ? area.title : undefined}
          >
            {!isCollapsed && (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
              )
            )}
            <Layers className={cn("h-4 w-4 flex-shrink-0", !isCollapsed && "mr-2")} />
            {!isCollapsed && <span className="truncate">{area.title}</span>}
          </button>
          {!isCollapsed && renderActionMenu(menuId, [
            {
              label: "Edit",
              icon: <Edit className="h-4 w-4" />,
              onClick: () => {
                setEditingArea({ appCode, area: area });
                setShowEditArea(true);
              }
            },
            {
              label: "Add SubArea",
              icon: <Layers className="h-4 w-4" />,
              onClick: () => {
                setSelectedApp(appCode);
                setSelectedArea(area.code);
                setShowCreateSubArea(true);
              }
            },
            {
              label: "Add Process",
              icon: <Workflow className="h-4 w-4" />,
              onClick: () => {
                setSelectedApp(appCode);
                setSelectedArea(area.code);
                setShowCreateProcess(true);
              }
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => handleDeleteArea(appCode, area.code),
              className: "text-red-600 hover:text-red-700"
            }
          ])}
        </div>
        {isExpanded && !isCollapsed && (
          <div className="mt-1">
            {area.processes?.map(process => renderProcess(appCode, area.code, process, isCollapsed, undefined))}
            {area.subareas?.map(subarea => renderSubArea(appCode, area.code, subarea, isCollapsed))}
          </div>
        )}
      </div>
    );
  };

  const renderWorkspace = (app: SidebarWorkspace, isCollapsed: boolean) => { // Usar SidebarWorkspace
    const isExpanded = expandedApps.has(app.code);
    const menuId = `app-${app.code}`;

    return (
      <div key={app.code} className="py-1">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "pl-4")}>
          <button
            onClick={() => toggleApp(app.code)}
            className={cn(
              "flex items-center flex-1 text-sm font-medium text-gray-800 hover:bg-blue-100 rounded-md py-1",
              isCollapsed ? "px-1 justify-center" : "px-2"
            )}
            title={isCollapsed ? app.title : undefined} // Show title on hover when collapsed
          >
            {!isCollapsed && (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
              )
            )}
            <Folder className={cn("h-4 w-4 flex-shrink-0", !isCollapsed && "mr-2")} />
            {!isCollapsed && <span className="truncate">{app.title}</span>}
          </button>
          {!isCollapsed && renderActionMenu(menuId, [
            {
              label: "Edit",
              icon: <Edit className="h-4 w-4" />,
              onClick: () => {
                setEditingWorkspaceCode(app.code); // Set the workspace to edit
                setShowEditWorkspace(true); // Show the edit modal
              }
            },
            {
              label: "Add Area",
              icon: <Layers className="h-4 w-4" />,
              onClick: () => {
                setSelectedApp(app.code);
                setShowCreateArea(true);
              }
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => handleDeleteApp(app.code),
              className: "text-red-600 hover:text-red-700"
            }
          ])}
        </div>
        {isExpanded && !isCollapsed && (
          <div className="mt-1">
            {/* Pass isCollapsed down */}
            {app.areas.map(area => renderArea(app.code, area, isCollapsed))}
          </div>
        )}
      </div>
    );
  };

    // Unified sidebar structure. MainLayout will handle how this is placed (fixed, panel, etc.)
  // The `isMobileOpen` prop dictates if it's in off-canvas mode (typically for small screens)
  // The `isCollapsed` prop dictates if the desktop sidebar is in icon-only mode.
  // For mobile/off-canvas, `isCollapsed` should ideally be false.

  // Determine root classes for the sidebar container based on its state
  // Note: Width and positioning (fixed, absolute) are now primarily handled by MainLayout
  // This component focuses on its internal layout and appearance.
  const sidebarContainerClasses = cn(
    "flex flex-col h-full bg-white border-r border-gray-200 shadow-lg",
    // If it's mobile off-canvas, it will have specific width from MainLayout's wrapper
    // If it's desktop, MainLayout's Panel will control its width (e.g., w-16 or w-64)
  );

  return (
    <div className={sidebarContainerClasses}>
      {/* Sidebar Header */}
      <div className={cn(
        "flex items-center justify-between h-16 px-4 border-b border-gray-200 shrink-0",
        // When desktop collapsed and NOT mobile, center the toggle button
        isCollapsed && !isMobileOpen && "justify-center"
      )}>
        {/* Title/Logo Area - Shown when desktop expanded OR when in mobile off-canvas mode */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="flex items-center">
            <Workflow className="h-7 w-7 text-primary-600" />
            <span className="ml-2 text-lg font-semibold text-gray-800 truncate">
              {isMobileOpen ? "Menu" : "IGRP Studio"} {/* Different title for mobile */} 
            </span>
          </div>
        )}

        {/* Desktop Collapse/Expand Toggle Button - Only shown if NOT in mobile mode */}
        {!isMobileOpen && (
          <button
            onClick={onToggleCollapse} 
            className={cn(
              "p-1 rounded-md hover:bg-gray-200 focus:outline-none",
              isCollapsed ? "mx-auto" : "ml-2" // Centered if collapsed, else margin left
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronsRight className="h-5 w-5 text-gray-600" /> : <ChevronsLeft className="h-5 w-5 text-gray-600" />}
          </button>
        )}

        {/* Mobile Off-canvas Close Button - Only shown if in mobile mode */}
        {isMobileOpen && (
            <button
              onClick={onCloseMobile} 
              className="p-1 rounded-md hover:bg-gray-200 focus:outline-none"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
        )}
      </div>

      {/* Sidebar Content - Scrollable Area */}
      <div className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden py-4",
        // Padding: px-1 if desktop collapsed, otherwise px-2. Mobile always gets px-2 essentially.
        isCollapsed && !isMobileOpen ? "px-1" : "px-2"
      )}>
        <nav className="space-y-1">
          {/* Static Navigation Links */}
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={isMobileOpen ? onCloseMobile : undefined}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isCollapsed && !isMobileOpen ? "justify-center" : "",
                pathname === item.href
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
              title={isCollapsed && !isMobileOpen ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isCollapsed && !isMobileOpen ? "" : "mr-3",
                )}
                aria-hidden="true"
              />
              {!(isCollapsed && !isMobileOpen) && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Dynamic Workspaces Section */}
        <div className="pt-6">
          <div className={cn(
            "mb-2 flex items-center justify-between",
            // If collapsed desktop, center the add button, else normal padding
            isCollapsed && !isMobileOpen ? "px-0 justify-center" : "px-3" 
          )}>
            {/* Show 'Workspaces' title only if not collapsed desktop */} 
            {!(isCollapsed && !isMobileOpen) && (
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Workspaces
              </span>
            )}
            <Button
              variant="ghost"
              size={isCollapsed && !isMobileOpen ? "sm" : "sm"}
              onClick={() => {
                setShowCreateApp(true);
                if (isMobileOpen) onCloseMobile(); // Close mobile if opening modal
              }}
              title="New Workspace"
              className="inline-flex items-center"
            >
              <Folder className={cn("h-4 w-4 mr-1", isCollapsed && !isMobileOpen && "h-5 w-5")} />
              {!(isCollapsed && !isMobileOpen) && (
                 <span className="sr-only sm:not-sr-only">New</span>
              )}
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            </div>
          ) : workspaces.length > 0 ? (
            <div className="space-y-1">
              {/* Pass isCollapsed state to renderWorkspace only if not in mobile view */}
              {workspaces.map((workspace) => renderWorkspace(workspace, isCollapsed && !isMobileOpen))}
            </div>
          ) : (
            // Show 'No workspaces' only if not collapsed desktop
            !(isCollapsed && !isMobileOpen) && (
              <div className="px-3 py-2 text-sm text-gray-500">
                No workspaces found
              </div>
            )
          )}
        </div>
      </div>
      
      {/* Footer / Collapse button for Desktop - Not shown in mobile off-canvas mode */}
      {!isMobileOpen && (
        <div className="flex-shrink-0 p-2 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? 
              <ChevronsRight className="h-5 w-5" /> : 
              <ChevronsLeft className="h-5 w-5" />
            }
            {!isCollapsed && <span className="ml-2 text-sm">Collapse</span>}
          </Button>
        </div>
      )}

      {/* Modals: These should ideally be outside the Sidebar component, 
          perhaps at the MainLayout or App level to avoid re-rendering with sidebar state changes.
          Keeping them here to match original structure for now. 
      */}
      {showCreateApp && (
        <CreateWorkspace 
          onClose={() => setShowCreateApp(false)} 
          onCreated={handleWorkspaceCreated} 
        />
      )}

      {showCreateArea && selectedApp && (
        <CreateArea
          workspaceCode={selectedApp}
          existingAreaCodes={workspaces.find(w => w.code === selectedApp)?.areas.map(a => a.code) || []}
          onClose={() => {
            setShowCreateArea(false);
            setSelectedApp(null);
          }}
          onCreated={loadWorkspaces} // Added: Pass loadWorkspaces to refresh sidebar
        />
      )}

      {showCreateSubArea && selectedApp && selectedArea && (
        <CreateSubArea
          workspaceCode={selectedApp}
          areaCode={selectedArea}
          existingSubAreaCodes={workspaces.find(w => w.code === selectedApp)?.areas
            .find(a => a.code === selectedArea)?.subareas?.map(sa => sa.code) || []}
          onClose={() => {
            setShowCreateSubArea(false);
            setSelectedApp(null);
            setSelectedArea(null);
          }}
          onCreated={loadWorkspaces} // Added: Pass loadWorkspaces to refresh sidebar
        />
      )}

      {showCreateProcess && selectedApp && selectedArea && (
        <CreateProcess
          workspaceCode={selectedApp}
          initialArea={selectedArea}
          initialSubArea={selectedSubArea}
          availableAreas={workspaces.find(w => w.code === selectedApp)?.areas.map(area => ({
            code: area.code,
            title: area.title,
            subareas: area.subareas?.map(subarea => ({
              code: subarea.code,
              title: subarea.title
            })) || []
          })) || []}
          existingProcessCodes={workspaces.find(w => w.code === selectedApp)?.areas
            .flatMap(a => a.processes?.map(p => p.code) || []) || []}
          onClose={() => {
            setShowCreateProcess(false);
            setSelectedApp(null);
            setSelectedArea(null);
            setSelectedSubArea(null);
          }}
          onCreated={(appCode, areaCode, subAreaCode, newProcessCode) => {
            loadWorkspaces();
            // Navegar para a nova rota de processo
            router.push(`/workspaces/${appCode}/processes/${newProcessCode}`);
          }}
        />
      )}

      {showEditWorkspace && editingWorkspaceCode && (
        <EditWorkspace
          workspaceCode={editingWorkspaceCode}
          currentTitle={workspaces.find(w => w.code === editingWorkspaceCode)?.title || ''}
          currentDescription={workspaces.find(w => w.code === editingWorkspaceCode)?.description || ''}
          onClose={() => {
            setShowEditWorkspace(false);
            setEditingWorkspaceCode(null);
          }}
          onUpdated={() => {
            loadWorkspaces(); // Refresh list after update
            setShowEditWorkspace(false);
            setEditingWorkspaceCode(null);
          }}
        />
      )}

      {/* Add EditArea Modal */}
      {showEditArea && editingArea && (
        <EditArea
          isOpen={showEditArea}
          appCode={editingArea.appCode}
          currentCode={editingArea.area.code}
          currentTitle={editingArea.area.title}
          currentDescription={editingArea.area.description || ''}
          currentStatus={editingArea.area.status || 'active'}
          onClose={() => {
            setShowEditArea(false);
            setEditingArea(null);
          }}
          onUpdated={() => { // Changed from onSave to onUpdated to match interface
            loadWorkspaces(); // Refresh list after save
            setShowEditArea(false);
            setEditingArea(null);
          }}
        />
      )}

      {/* Add EditSubArea Modal */}
      {showEditSubArea && editingSubArea && (
        <EditSubArea
          isOpen={showEditSubArea}
          appCode={editingSubArea.appCode}
          areaCode={editingSubArea.areaCode}
          currentCode={editingSubArea.subArea.code}
          currentTitle={editingSubArea.subArea.title}
          currentDescription={editingSubArea.subArea.description || ''}
          currentStatus={editingSubArea.subArea.status || 'active'}
          onClose={() => {
            setShowEditSubArea(false);
            setEditingSubArea(null);
          }}
          onUpdated={() => { // Changed from onSave to onUpdated to match interface
            loadWorkspaces(); // Refresh list after save
            setShowEditSubArea(false);
            setEditingSubArea(null);
          }}
        />
      )}
    </div>
  );
};

export default Sidebar;
