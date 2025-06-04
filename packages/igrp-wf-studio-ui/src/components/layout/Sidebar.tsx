import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { WorkflowEngineSDK } from '@igrp/wf-engine';
import { cn } from "@/lib/utils";
import {
  Settings,
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
  PanelLeftClose, // Add icon for collapse
  PanelRightClose, // Add icon for expand
  ChevronsRight,
  ChevronsLeft
} from "lucide-react";
import Button from "@/components/ui/Button";
import CreateWorkspace from "@/pages/workspaces/CreateWorkspace";
import CreateArea from "@/pages/workspaces/CreateArea";
import CreateSubArea from "@/pages/workspaces/CreateSubArea";
import CreateProcess from "@/pages/workspaces/CreateProcess";
import EditWorkspace from "@/pages/workspaces/EditWorkspace"; // Import the new component
import EditArea from "@/pages/workspaces/EditArea"; // Import EditArea modal
import EditSubArea from "@/pages/workspaces/EditSubArea"; // Import EditSubArea modal

interface Workspace {
  code: string;
  title: string;
  areas: Area[];
}

interface Area {
  code: string;
  title: string;
  description: string; // Make description required
  status: 'active' | 'inactive' | 'draft'; // Make status required
  processes: Process[];
  subareas: SubArea[];
}

interface SubArea {
  code: string;
  title: string;
  description: string; // Make description required
  status: 'active' | 'inactive' | 'draft'; // Make status required
  processes: Process[];
}

interface Process {
  code: string;
  title: string;
}

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean; // Add prop for collapsed state
  onToggleCollapse: () => void; // Add prop for toggling collapse
}

const sdk = new WorkflowEngineSDK();

const Sidebar: React.FC<SidebarProps> = ({ 
  isMobileOpen, 
  onCloseMobile, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  // const [error, setError] = useState<string | null>(null);
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [showCreateArea, setShowCreateArea] = useState(false);
  const [showCreateSubArea, setShowCreateSubArea] = useState(false);
  const [showCreateProcess, setShowCreateProcess] = useState(false);
  const [showEditWorkspace, setShowEditWorkspace] = useState(false); // State for edit modal
  const [showEditArea, setShowEditArea] = useState(false); // State for EditArea modal
  const [showEditSubArea, setShowEditSubArea] = useState(false); // State for EditSubArea modal
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedSubArea, setSelectedSubArea] = useState<string | null>(null);
  const [editingWorkspaceCode, setEditingWorkspaceCode] = useState<string | null>(null); // State for workspace being edited
  const [editingArea, setEditingArea] = useState<{ appCode: string; area: Area } | null>(null); // State for area being edited
  const [editingSubArea, setEditingSubArea] = useState<{ appCode: string; areaCode: string; subArea: SubArea } | null>(null); // State for subarea being edited

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
      const apps = await sdk.workspaces.listWorkspaces();
      
      const appsWithConfig = await Promise.all(
        apps.map(async (app: {title: string; code: string; description?: string }) => { // Assume app has code and optional description
          const config = await sdk.workspaces.loadProjectConfig(app.code);
          return {
            code: app.code,
            title: app.title || app.description || app.code, 
            areas: (config?.areas || []).map((area: any) => ({
              ...area,
              description: area.description || '', // Default description
              status: area.status || 'active', // Default status
              processes: area.processes || [],
              // Ensure subareas within areas also have required fields
              subareas: (area.subareas || []).map((subarea: any) => ({
                ...subarea,
                description: subarea.description || '', // Default description
                status: subarea.status || 'active', // Default status
                processes: subarea.processes || []
              }))
            }))
          };
        })
      );
      
      setWorkspaces(appsWithConfig);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApp = async (code: string) => {
    if (!confirm('Are you sure you want to delete this workspace?')) {
      return;
    }

    try {
      const result = await sdk.workspaces.deleteWorkspace(code);
      if (result.success) {
        await loadWorkspaces();
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteArea = async (appCode: string, areaCode: string) => {
    if (!confirm('Are you sure you want to delete this area?')) {
      return;
    }

    try {
      const result = await sdk.workspaces.deleteArea(appCode, areaCode);
      if (result.success) {
        await loadWorkspaces();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteSubArea = async (appCode: string, areaCode: string, subareaCode: string) => {
    if (!confirm('Are you sure you want to delete this subarea?')) {
      return;
    }

    try {
      const result = await sdk.workspaces.deleteSubArea(appCode, areaCode, subareaCode);
      if (result.success) {
        await loadWorkspaces();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteProcess = async (appCode: string, areaCode: string, processCode: string, subareaCode?: string) => {
    if (!confirm('Are you sure you want to delete this process?')) {
      return;
    }

    try {
      const result = await sdk.workspaces.deleteProcess(appCode, areaCode, processCode, subareaCode);
      if (result.success) {
        await loadWorkspaces();
        navigate('/workspaces/' + appCode);
      } else {
        setError(result.message);
      }
    } catch (err) {
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
    { name: "Settings", href: "/settings", icon: Settings },
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

  const renderProcess = (appCode: string, areaCode: string, process: Process, isCollapsed: boolean, subareaCode?: string) => {
    const processPath = `/process/${process.code}`;
    // const isActive = location.pathname === processPath; // Commented out unused variable
    const menuId = `process-${process.code}`;

    return (
      <div key={process.code} className="flex items-center pl-12 py-1 text-sm">
        <NavLink
          to={processPath}
          className={({ isActive }) =>
            cn(
              "flex items-center flex-1 rounded-md px-2 py-1",
              isActive
                ? "bg-primary-100 text-primary-700 font-medium" // Use a slightly darker blue for active state
                : "text-gray-600 bg-blue-300 hover:bg-blue-400"
            )}
        >
          <Workflow className="h-4 w-4 mr-2" />
          <span className="truncate">{process.title}</span>
        </NavLink>
        {renderActionMenu(menuId, [
          {
            label: "Edit",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => navigate(processPath)
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

  const renderSubArea = (appCode: string, areaCode: string, subarea: SubArea, isCollapsed: boolean) => {
    const menuId = `subarea-${subarea.code}`;

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

  const renderArea = (appCode: string, area: Area, isCollapsed: boolean) => {
    const isExpanded = expandedAreas.has(area.code);
    const menuId = `area-${area.code}`;

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

  const renderWorkspace = (app: Workspace, isCollapsed: boolean) => {
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
            <NavLink
              key={item.name}
              to={item.href}
              onClick={isMobileOpen ? onCloseMobile : undefined} // Close mobile sidebar on nav click
              className={({ isActive }) =>
                cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isCollapsed && !isMobileOpen ? "justify-center" : "", // Center items if collapsed desktop
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )
              }
              title={isCollapsed && !isMobileOpen ? item.name : undefined} // Tooltip for collapsed desktop items
              end={item.href === "/"}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isCollapsed && !isMobileOpen ? "" : "mr-3", // No margin if collapsed desktop
                )}
                aria-hidden="true"
              />
              {/* Show label if not collapsed desktop */} 
              {!(isCollapsed && !isMobileOpen) && <span>{item.name}</span>}
            </NavLink>
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
              // Icon-only button if collapsed desktop, else normal size
              size={isCollapsed && !isMobileOpen ? "sm" : "sm"}
              onClick={() => {
                setShowCreateApp(true);
                if (isMobileOpen) onCloseMobile(); // Close mobile if opening modal
              }}
              // Icon size slightly larger if collapsed desktop
              icon={<Folder className={cn("h-4 w-4", isCollapsed && !isMobileOpen && "h-5 w-5")} />}
              title="New Workspace"
            >
              {/* Show 'New' text only if not collapsed desktop AND not mobile (sr-only for accessibility) */}
              {!(isCollapsed && !isMobileOpen) && (
                 <span className="sr-only sm:not-sr-only sm:ml-1">New</span>
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
          onCreated={loadWorkspaces}
        />
      )}

      {showCreateArea && selectedApp && (
        <CreateArea
          workspaceCode={selectedApp}
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
          onClose={() => {
            setShowCreateProcess(false);
            setSelectedApp(null);
            setSelectedArea(null);
            setSelectedSubArea(null);
          }}
          onCreated={(newProcessCode) => { // Modified: Receive newProcessCode
            loadWorkspaces(); // Keep reloading workspaces in the background
            navigate(`/process/${newProcessCode}`); // Navigate to the new process
          }}
        />
      )}

      {showEditWorkspace && editingWorkspaceCode && (
        <EditWorkspace
          workspaceCode={editingWorkspaceCode}
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
          area={editingArea.area as Required<Area>}
          onClose={() => {
            setShowEditArea(false);
            setEditingArea(null);
          }}
          onSave={() => {
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
          subArea={editingSubArea?.subArea as SubArea}
          onClose={() => {
            setShowEditSubArea(false);
            setEditingSubArea(null);
          }}
          onSave={() => {
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
