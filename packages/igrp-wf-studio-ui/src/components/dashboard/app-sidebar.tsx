"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction, // Added for Add button
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Package,
  Settings,
  Users,
  HomeIcon,
  WorkflowIcon as ProcessIcon, // Renamed to avoid conflict
  Folder,
  Layers,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  PlusCircle, // For Add button
  Loader2 // For loading state
} from "lucide-react";
import { toast } from 'react-hot-toast';
import { deleteWorkspaceAction, deleteWorkspaceItemAction } from "@/app/actions";

// Modal Imports (assuming they are in the specified locations)
import CreateWorkspaceModal from "@/components/modals/CreateWorkspaceModal";
import CreateAreaModal from "@/components/modals/CreateAreaModal";
import CreateSubAreaModal from "@/components/modals/CreateSubAreaModal";
import CreateProcessModal from "@/components/modals/CreateProcessModal";
import EditWorkspaceModal from "@/components/modals/EditWorkspaceModal";
import EditAreaModal from "@/components/modals/EditAreaModal";
import EditSubAreaModal from "@/components/modals/EditSubAreaModal";

// Types (assuming these are defined in '@/types')
import type {
  SidebarWorkspace,
  SidebarArea,
  SidebarSubArea,
  SidebarProcess
} from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: HomeIcon },
  // "Workspaces" and "Processes" will be handled by the dynamic tree
];

const settingsNavItems: NavItem[] = [
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({ className, variant }: { className?: string, variant?: "sidebar" | "floating" | "inset" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state: sidebarState, isMobile, setOpenMobile } = useSidebar(); // Get sidebar state (expanded/collapsed)
  const isCollapsed = sidebarState === 'collapsed';

  // States from layout/Sidebar.tsx
  const [workspaces, setWorkspaces] = useState<SidebarWorkspace[]>([]);
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Keep error state for potential display

  // Modal states
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showCreateArea, setShowCreateArea] = useState(false);
  const [showCreateSubArea, setShowCreateSubArea] = useState(false);
  const [showCreateProcess, setShowCreateProcess] = useState(false);
  const [showEditWorkspace, setShowEditWorkspace] = useState(false);
  const [showEditArea, setShowEditArea] = useState(false);
  const [showEditSubArea, setShowEditSubArea] = useState(false);

  const [selectedAppCode, setSelectedAppCode] = useState<string | null>(null);
  const [selectedAreaCode, setSelectedAreaCode] = useState<string | null>(null);
  const [selectedSubAreaCode, setSelectedSubAreaCode] = useState<string | null>(null);

  const [editingWorkspace, setEditingWorkspace] = useState<SidebarWorkspace | null>(null);
  const [editingArea, setEditingArea] = useState<{ appCode: string; area: SidebarArea } | null>(null);
  const [editingSubArea, setEditingSubArea] = useState<{ appCode: string; areaCode: string; subArea: SidebarSubArea } | null>(null);

  // Menu states
  const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/workspaces'); // Ensure this API route exists and returns expected data
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch workspaces' }));
        throw new Error(errorData.message || 'Failed to fetch workspaces');
      }
      const data = await response.json();
      setWorkspaces(data.workspaces || []);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast.error(`Failed to load workspaces: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeContextMenu && !(event.target as Element).closest('.context-menu-container')) {
        setActiveContextMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeContextMenu]);


  const handleWorkspaceCreated = () => { loadWorkspaces(); setShowCreateWorkspace(false); };
  const handleAreaCreated = () => { loadWorkspaces(); setShowCreateArea(false); };
  const handleSubAreaCreated = () => { loadWorkspaces(); setShowCreateSubArea(false); };
  const handleProcessCreated = (appCode: string, _areaCode: string, _subAreaCode: string | undefined, newProcessCode: string) => {
    loadWorkspaces();
    setShowCreateProcess(false);
    router.push(`/workspaces/${appCode}/processes/${newProcessCode}`);
  };
  const handleWorkspaceUpdated = () => { loadWorkspaces(); setShowEditWorkspace(false); };
  const handleAreaUpdated = () => { loadWorkspaces(); setShowEditArea(false); };
  const handleSubAreaUpdated = () => { loadWorkspaces(); setShowEditSubArea(false); };


  // --- Action Handlers (Delete) ---
  const handleDeleteApp = async (code: string) => {
    if (!confirm('Are you sure you want to delete this workspace?')) return;
    try {
      const result = await deleteWorkspaceAction(code);
      if (result.success) {
        toast.success(result.message || `Workspace '${code}' deleted successfully.`);
        await loadWorkspaces();
        if (pathname.startsWith(`/workspaces/${code}`)) router.push('/dashboard');
      } else {
        toast.error(result.message || 'Failed to delete workspace.');
      }
    } catch (err) { toast.error(`Error: ${(err as Error).message}`); }
  };

  const handleDeleteArea = async (appCode: string, areaCode: string) => {
    if (!confirm('Are you sure you want to delete this area?')) return;
    try {
      const result = await deleteWorkspaceItemAction({ appCode, itemType: 'area', itemCode: areaCode });
      if (result.success) {
        toast.success(result.message || `Area '${areaCode}' deleted successfully.`);
        await loadWorkspaces();
      } else { toast.error(result.message || 'Failed to delete area.'); }
    } catch (err) { toast.error(`Error: ${(err as Error).message}`); }
  };

  const handleDeleteSubArea = async (appCode: string, areaCode: string, subareaCode: string) => {
     if (!confirm('Are you sure you want to delete this subarea?')) return;
    try {
      const result = await deleteWorkspaceItemAction({ appCode, itemType: 'subarea', itemCode: subareaCode, parentCode: areaCode });
      if (result.success) {
        toast.success(result.message || `Subarea '${subareaCode}' deleted successfully.`);
        await loadWorkspaces();
      } else { toast.error(result.message || 'Failed to delete subarea.'); }
    } catch (err) { toast.error(`Error: ${(err as Error).message}`); }
  };

  const handleDeleteProcess = async (appCode: string, areaCode: string, processCode: string, subareaCode?: string) => {
    if (!confirm('Are you sure you want to delete this process?')) return;
    try {
      const result = await deleteWorkspaceItemAction({ appCode, itemType: 'process', itemCode: processCode, parentCode: subareaCode || areaCode, grandParentCode: subareaCode ? areaCode : undefined });
      if (result.success) {
        toast.success(result.message || `Process '${processCode}' deleted successfully.`);
        await loadWorkspaces();
        if (pathname.startsWith(`/workspaces/${appCode}/processes/${processCode}`)) router.push(`/workspaces/${appCode}`);
      } else { toast.error(result.message || 'Failed to delete process.'); }
    } catch (err) { toast.error(`Error: ${(err as Error).message}`); }
  };

  // --- Toggle Expand/Collapse for Tree Nodes ---
  const toggleApp = (code: string) => setExpandedApps(prev => {
    const newSet = new Set(Array.from(prev));
    if (prev.has(code)) {
      newSet.delete(code);
    } else {
      newSet.add(code);
    }
    return newSet;
  });
  const toggleArea = (code: string) => setExpandedAreas(prev => {
    const newSet = new Set(Array.from(prev));
    if (prev.has(code)) {
      newSet.delete(code);
    } else {
      newSet.add(code);
    }
    return newSet;
  });

  // --- Context Menu ---
  const toggleContextMenu = (menuId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveContextMenu(activeContextMenu === menuId ? null : menuId);
  };

  const renderActionMenu = (
    menuId: string,
    actions: Array<{ label: string; icon: React.ReactNode; onClick: (e: React.MouseEvent) => void; className?: string }>,
    isItemCollapsed: boolean
  ) => {
    if (isItemCollapsed) return null; // Don't render menu if item itself is in a collapsed section of sidebar

    return (
      <div className="context-menu-container relative ml-auto"> {/* Ensure this class is targeted by handleClickOutside */}
        <SidebarMenuButton
            variant="default"
            size="default"
            className="h-7 w-7 data-[active=true]:bg-transparent" // Smaller, ghost for icon
            onClick={(e) => toggleContextMenu(menuId, e)}
            tooltip={isCollapsed ? "Actions" : undefined}
        >
            <MoreVertical className="h-4 w-4 flex-shrink-0" />
        </SidebarMenuButton>
        {activeContextMenu === menuId && (
          <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-card text-card-foreground ring-1 ring-border z-60" style={{ maxWidth: 'calc(100vw - 20px)' }}>
            <div className="py-1" role="menu">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); action.onClick(e); setActiveContextMenu(null); }}
                  className={cn("w-full text-left px-3 py-1.5 text-sm flex items-center hover:bg-muted", action.className)}
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
  };


  // --- Render Tree Nodes ---
  // (Adapted to use SidebarMenuButton for consistency and tooltip handling)
  const renderProcess = (appCode: string, areaCode: string, process: SidebarProcess, subareaCode?: string) => {
    const processPath = `/workspaces/${appCode}/processes/${process.code}`;
    const isActive = pathname === processPath;
    const menuId = `process-${appCode}-${areaCode}-${subareaCode || 'root'}-${process.code}`;

    return (
      <SidebarMenuItem key={process.code} className="pl-8"> {/* Indent processes */}
        <div className="flex items-center w-full">
            <Link href={processPath} passHref legacyBehavior>
                <SidebarMenuButton
                    isActive={isActive}
                    tooltip={isCollapsed ? process.title : undefined}
                    className="justify-start flex-grow"
                    onClick={isMobile ? () => setOpenMobile(false) : undefined}
                >
                    <ProcessIcon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span className="ml-2 truncate">{process.title}</span>}
                </SidebarMenuButton>
            </Link>
            {!isCollapsed && renderActionMenu(menuId, [
                { label: "Edit", icon: <Edit className="h-4 w-4" />, onClick: () => router.push(processPath) },
                { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => handleDeleteProcess(appCode, areaCode, process.code, subareaCode), className: "text-destructive" }
            ], isCollapsed)}
        </div>
      </SidebarMenuItem>
    );
  };

  const renderSubArea = (appCode: string, areaCode: string, subarea: SidebarSubArea) => {
    const isExpanded = expandedAreas.has(`${appCode}-${areaCode}-${subarea.code}`); // More specific key
    const menuId = `subarea-${appCode}-${areaCode}-${subarea.code}`;
    const itemKey = `${appCode}-${areaCode}-${subarea.code}`;

    return (
      <SidebarMenuItem key={itemKey} className="pl-4"> {/* Indent subareas */}
        <div className="flex items-center w-full">
            <SidebarMenuButton
                onClick={() => toggleArea(itemKey)}
                tooltip={isCollapsed ? subarea.title : undefined}
                className="justify-start flex-grow"
            >
                {isExpanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                <Layers className="h-4 w-4 ml-1 flex-shrink-0" /> {/* Adjusted margin for chevron */}
                {!isCollapsed && <span className="ml-2 truncate">{subarea.title}</span>}
            </SidebarMenuButton>
             {!isCollapsed && renderActionMenu(menuId, [
                { label: "Edit", icon: <Edit className="h-4 w-4" />, onClick: () => { setEditingSubArea({ appCode, areaCode, subArea: subarea }); setShowEditSubArea(true); if(isMobile) setOpenMobile(false); }},
                { label: "Add Process", icon: <ProcessIcon className="h-4 w-4" />, onClick: () => { setSelectedAppCode(appCode); setSelectedAreaCode(areaCode); setSelectedSubAreaCode(subarea.code); setShowCreateProcess(true); if(isMobile) setOpenMobile(false); } },
                { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => handleDeleteSubArea(appCode, areaCode, subarea.code), className: "text-destructive" }
            ], isCollapsed)}
        </div>
        {isExpanded && !isCollapsed && (
          <SidebarMenu className="pl-4 py-1"> {/* Indent processes under subarea */}
            {subarea.processes.map(p => renderProcess(appCode, areaCode, p, subarea.code))}
          </SidebarMenu>
        )}
      </SidebarMenuItem>
    );
  };

  const renderArea = (appCode: string, area: SidebarArea) => {
    const isExpanded = expandedAreas.has(`${appCode}-${area.code}`);
    const menuId = `area-${appCode}-${area.code}`;
    const itemKey = `${appCode}-${area.code}`;

    return (
      <SidebarMenuItem key={itemKey} className="pl-2"> {/* Indent areas */}
        <div className="flex items-center w-full">
            <SidebarMenuButton
                onClick={() => toggleArea(itemKey)}
                tooltip={isCollapsed ? area.title : undefined}
                className="justify-start flex-grow"
            >
                {isExpanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                <Layers className="h-4 w-4 ml-1 flex-shrink-0" />
                {!isCollapsed && <span className="ml-2 truncate">{area.title}</span>}
            </SidebarMenuButton>
            {!isCollapsed && renderActionMenu(menuId, [
                { label: "Edit", icon: <Edit className="h-4 w-4" />, onClick: () => { setEditingArea({ appCode, area }); setShowEditArea(true); if(isMobile) setOpenMobile(false); } },
                { label: "Add SubArea", icon: <Layers className="h-4 w-4" />, onClick: () => { setSelectedAppCode(appCode); setSelectedAreaCode(area.code); setShowCreateSubArea(true); if(isMobile) setOpenMobile(false); } },
                { label: "Add Process", icon: <ProcessIcon className="h-4 w-4" />, onClick: () => { setSelectedAppCode(appCode); setSelectedAreaCode(area.code); setSelectedSubAreaCode(null); setShowCreateProcess(true); if(isMobile) setOpenMobile(false); } },
                { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => handleDeleteArea(appCode, area.code), className: "text-destructive" }
            ], isCollapsed)}
        </div>
        {isExpanded && !isCollapsed && (
          <SidebarMenu className="pl-4 py-1"> {/* Indent subareas/processes under area */}
            {area.subareas?.map(sa => renderSubArea(appCode, area.code, sa))}
            {area.processes?.map(p => renderProcess(appCode, area.code, p))}
          </SidebarMenu>
        )}
      </SidebarMenuItem>
    );
  };

  const renderWorkspace = (workspace: SidebarWorkspace) => {
    const isExpanded = expandedApps.has(workspace.code);
    const menuId = `workspace-${workspace.code}`;

    return (
      <SidebarMenuItem key={workspace.code}>
        <div className="flex items-center w-full">
            <SidebarMenuButton
                onClick={() => toggleApp(workspace.code)}
                tooltip={isCollapsed ? workspace.title : undefined}
                className="justify-start flex-grow font-medium" // Make workspace title slightly more prominent
            >
                {isExpanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                <Folder className="h-4 w-4 ml-1 flex-shrink-0" />
                {!isCollapsed && <span className="ml-2 truncate">{workspace.title}</span>}
            </SidebarMenuButton>
            {!isCollapsed && renderActionMenu(menuId, [
                { label: "Edit", icon: <Edit className="h-4 w-4" />, onClick: () => { setEditingWorkspace(workspace); setShowEditWorkspace(true); if(isMobile) setOpenMobile(false); } },
                { label: "Add Area", icon: <Layers className="h-4 w-4" />, onClick: () => { setSelectedAppCode(workspace.code); setShowCreateArea(true); if(isMobile) setOpenMobile(false); } },
                { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => handleDeleteApp(workspace.code), className: "text-destructive" }
            ], isCollapsed)}
        </div>
        {isExpanded && !isCollapsed && (
          <SidebarMenu className="pl-2 py-1"> {/* Indent areas under workspace */}
            {workspace.areas.map(area => renderArea(workspace.code, area))}
          </SidebarMenu>
        )}
      </SidebarMenuItem>
    );
  };

  // Helper to determine if a nav item is active
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
    <Sidebar
      variant={variant || "sidebar"}
      collapsible="icon"
      className={cn("border-r", className)}
    >
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ProcessIcon className="h-7 w-7 text-primary flex-shrink-0" /> {/* Using ProcessIcon as main logo temporarily */}
          {!isCollapsed && <span className="font-semibold text-lg truncate">IGRP WF Studio</span>}
        </Link>
      </SidebarHeader>

      <ScrollArea className="flex-1">
        <SidebarContent className="p-2">
          {/* Static Main Menu */}
          <SidebarGroup>
            <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>Main Menu</SidebarGroupLabel>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={isActive(item.href)}
                      tooltip={isCollapsed ? item.label : undefined}
                      className="justify-start"
                      onClick={isMobile ? () => setOpenMobile(false) : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-2 truncate">{item.label}</span>}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {/* Dynamic Workspaces Section */}
          <SidebarGroup>
            <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
              Workspaces
            </SidebarGroupLabel>
            <div className="flex justify-between items-center">
                {!isCollapsed && (
                    <SidebarGroupAction onClick={() => {setShowCreateWorkspace(true); if(isMobile) setOpenMobile(false);}} title="New Workspace">
                        <PlusCircle className="h-5 w-5 flex-shrink-0" />
                    </SidebarGroupAction>
                )}
                {isCollapsed && ( // Show a dedicated Add button when collapsed
                    <SidebarMenuButton onClick={() => {setShowCreateWorkspace(true); if(isMobile) setOpenMobile(false);}} tooltip="New Workspace" className="justify-center h-7 w-7">
                        <PlusCircle className="h-5 w-5 flex-shrink-0" />
                    </SidebarMenuButton>
                )}
            </div>
            {loading ? (
              <div className="flex flex-col justify-center items-center p-4 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground flex-shrink-0" />
                {!isCollapsed && <span className="text-xs text-muted-foreground">Loading workspaces...</span>}
              </div>
            ) : error ? (
                <div className="p-2 flex flex-col gap-2">
                    <span className="text-xs text-destructive">{error}</span>
                    {!isCollapsed && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-center" 
                            onClick={loadWorkspaces}
                        >
                            <Loader2 className={cn("mr-2 h-4 w-4 flex-shrink-0", loading && "animate-spin")} />
                            Try Again
                        </Button>
                    )}
                </div>
            ) : workspaces.length > 0 ? (
              <SidebarMenu>
                {workspaces.map((ws) => renderWorkspace(ws))}
              </SidebarMenu>
            ) : (
              !isCollapsed ? (
                <div className="p-2 flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">No workspaces yet.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-center" 
                    onClick={() => {setShowCreateWorkspace(true); if(isMobile) setOpenMobile(false);}}
                  >
                    <PlusCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                    Create Workspace
                  </Button>
                </div>
              ) : null
            )}
          </SidebarGroup>

          {/* Static Configuration Menu */}
          <SidebarGroup>
            <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>Configuration</SidebarGroupLabel>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                   <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={isActive(item.href)}
                      tooltip={isCollapsed ? item.label : undefined}
                      className="justify-start"
                      onClick={isMobile ? () => setOpenMobile(false) : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-2 truncate">{item.label}</span>}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

        </SidebarContent>
      </ScrollArea>

      <SidebarFooter className="p-4 mt-auto border-t">
        { isCollapsed ? (
            <Link href="/dashboard/settings" passHref legacyBehavior>
                 <Button variant="ghost" size="icon" className="w-full flex justify-center" title="Settings" onClick={isMobile ? () => setOpenMobile(false) : undefined}>
                    <Settings className="h-5 w-5 flex-shrink-0" />
                </Button>
            </Link>
        ) : (
            <div className="flex flex-col gap-2">
                {/* Simplified footer, user info can be in SiteHeader */}
                <Link href="/dashboard/settings" passHref legacyBehavior>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={isMobile ? () => setOpenMobile(false) : undefined}>
                        <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Settings</span>
                    </Button>
                </Link>
            </div>
        )}
      </SidebarFooter>
    </Sidebar>

    {/* Modals */}
    {showCreateWorkspace && <CreateWorkspaceModal onClose={() => setShowCreateWorkspace(false)} onCreated={handleWorkspaceCreated} />}

    {showCreateArea && selectedAppCode && (
      <CreateAreaModal
        workspaceCode={selectedAppCode}
        existingAreaCodes={workspaces.find(w => w.code === selectedAppCode)?.areas.map(a => a.code) || []}
        onClose={() => { setShowCreateArea(false); setSelectedAppCode(null); }}
        onCreated={handleAreaCreated}
      />
    )}

    {showCreateSubArea && selectedAppCode && selectedAreaCode && (
      <CreateSubAreaModal
        workspaceCode={selectedAppCode}
        areaCode={selectedAreaCode}
        existingSubAreaCodes={workspaces.find(w => w.code === selectedAppCode)?.areas.find(a => a.code === selectedAreaCode)?.subareas?.map(sa => sa.code) || []}
        onClose={() => { setShowCreateSubArea(false); setSelectedAppCode(null); setSelectedAreaCode(null); }}
        onCreated={handleSubAreaCreated}
      />
    )}

    {showCreateProcess && selectedAppCode && selectedAreaCode && (
      <CreateProcessModal
        workspaceCode={selectedAppCode}
        initialArea={selectedAreaCode}
        initialSubArea={selectedSubAreaCode} // Can be null
        availableAreas={workspaces.find(w => w.code === selectedAppCode)?.areas.map(area => ({
          code: area.code,
          title: area.title,
          subareas: area.subareas?.map(subarea => ({ code: subarea.code, title: subarea.title })) || []
        })) || []}
        existingProcessCodes={
            workspaces.find(w => w.code === selectedAppCode)?.areas
            .flatMap(a => [
                ...(a.processes?.map(p => p.code) || []),
                ...(a.subareas?.flatMap(sa => sa.processes?.map(p => p.code) || []) || [])
            ]) || []
        }
        onClose={() => { setShowCreateProcess(false); setSelectedAppCode(null); setSelectedAreaCode(null); setSelectedSubAreaCode(null);}}
        onCreated={handleProcessCreated}
      />
    )}

    {showEditWorkspace && editingWorkspace && (
      <EditWorkspaceModal
        workspaceCode={editingWorkspace.code}
        currentTitle={editingWorkspace.title}
        currentDescription={editingWorkspace.description || ''}
        onClose={() => { setShowEditWorkspace(false); setEditingWorkspace(null); }}
        onUpdated={handleWorkspaceUpdated}
      />
    )}

    {showEditArea && editingArea && (
      <EditAreaModal
        isOpen={showEditArea} // Modals usually take isOpen
        appCode={editingArea.appCode}
        currentCode={editingArea.area.code}
        currentTitle={editingArea.area.title}
        currentDescription={editingArea.area.description || ''}
        currentStatus={editingArea.area.status || 'active'}
        onClose={() => { setShowEditArea(false); setEditingArea(null); }}
        onUpdated={handleAreaUpdated}
      />
    )}

    {showEditSubArea && editingSubArea && (
      <EditSubAreaModal
        isOpen={showEditSubArea} // Modals usually take isOpen
        appCode={editingSubArea.appCode}
        areaCode={editingSubArea.areaCode}
        currentCode={editingSubArea.subArea.code}
        currentTitle={editingSubArea.subArea.title}
        currentDescription={editingSubArea.subArea.description || ''}
        currentStatus={editingSubArea.subArea.status || 'active'}
        onClose={() => { setShowEditSubArea(false); setEditingSubArea(null); }}
        onUpdated={handleSubAreaUpdated}
      />
    )}
    </>
  );
}
