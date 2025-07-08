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
    <div className="menu-container relative"> {/* Considerar usar <DropdownMenu> do ShadCN no futuro */}
      <Button
        variant="ghost"
        size="icon" // Garante padding e tamanho consistentes para botões de ícone
        onClick={(e) => toggleMenu(menuId, e)}
        className="h-7 w-7 data-[state=open]:bg-muted" // Torna o botão um pouco menor e sutil. data-[state=open] para feedback visual
      >
        <MoreVertical className="h-4 w-4 text-muted-foreground" />
        <span className="sr-only">Open menu for {menuId}</span>
      </Button>
      {activeMenu === menuId && (
        // Estilo similar ao DropdownMenuContent do ShadCN
        <div className="absolute right-0 mt-1 w-48 rounded-md shadow-md bg-popover text-popover-foreground border border-border z-50">
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
                  "w-full text-left px-3 py-1.5 text-sm flex items-center rounded-sm transition-colors", // Padding e rounded ajustados
                  "focus:outline-none focus:bg-accent focus:text-accent-foreground",
                  action.className ? action.className : "hover:bg-accent hover:text-accent-foreground", // Aplicar hover se não houver classe de destructive
                  // Se action.className for 'text-destructive', o hover padrão pode ser diferente (ex: hover:bg-destructive/10)
                  // Para simplificar, se className existir, ele controla o hover.
                )}
                role="menuitem"
              >
                {/* Clonar o ícone para adicionar classes comuns */}
                {action.icon && React.cloneElement(action.icon as React.ReactElement, { className: "h-4 w-4 mr-2" })}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProcess = (appCode: string, areaCode: string, process: SidebarProcess, isCollapsed: boolean, subareaCode?: string) => {
    const processPath = `/workspaces/${appCode}/processes/${process.code}`;
    const isActive = pathname === processPath;
    const menuId = `process-${appCode}-${areaCode}-${subareaCode || 'root'}-${process.code}`;


    return (
      <div key={process.code} className={cn(
        "flex items-center py-1 text-sm group", // Adicionado 'group' para hover context
        isCollapsed ? "pl-1 justify-center" : "pl-12" // pl-12 para indentação de processo
      )}>
        <Link
          href={processPath}
          className={cn(
            "flex items-center flex-1 rounded-md px-2 py-1.5 transition-colors", // py-1 -> py-1.5
            isActive
              ? "bg-accent text-accent-foreground font-medium" // Estilo ativo
              : "text-muted-foreground hover:text-foreground hover:bg-muted", // Estilo inativo/hover
            isCollapsed ? "justify-center" : "" // Centralizar conteúdo se colapsado
          )}
          title={isCollapsed ? process.title : undefined} // Tooltip quando colapsado
        >
          <Workflow className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span className="truncate">{process.title}</span>}
        </Link>
        {/* Mostrar menu de ação no hover do 'group' e se não estiver colapsado */}
        {!isCollapsed && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {renderActionMenu(menuId, [
              {
                label: "Edit",
                icon: <Edit />, // Ícone sem classes, serão adicionadas pelo cloneElement
                onClick: () => router.push(processPath)
              },
              {
                label: "Delete",
                icon: <Trash2 />,
                onClick: () => handleDeleteProcess(appCode, areaCode, process.code, subareaCode),
                className: "text-destructive hover:text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10" // Classes específicas para delete
              }
            ])}
          </div>
        )}
      </div>
    );
  };

  const renderSubArea = (appCode: string, areaCode: string, subarea: SidebarSubArea, isCollapsed: boolean) => {
    const menuId = `subarea-${appCode}-${areaCode}-${subarea.code}`;
    // Subáreas não são clicáveis como um todo para navegação, apenas para expandir ou via menu de ações.
    // O clique para expandir/colapsar subáreas (se tivessem filhos visíveis na sidebar) seria no ícone Chevron.
    // Aqui, subáreas não têm filhos expansíveis visíveis na sidebar (processos são o nível final aqui).
    // Então, o comportamento de clique no item de subárea é principalmente para ações via menu.

    return (
      <div key={subarea.code} className={cn(
        "py-1 text-sm group", // Adicionado 'group'
        isCollapsed ? "pl-1" : "pl-8" // pl-8 para indentação de subárea
      )}>
        <div className={cn(
          "flex items-center rounded-md px-2 py-1.5 transition-colors",
           // Não há estado 'ativo' para subárea, apenas hover.
           // Se fosse clicável para expandir, teria um <button> aqui.
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          isCollapsed ? "justify-center" : ""
        )}
          title={isCollapsed ? subarea.title : undefined}
        >
          <Layers className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span className="truncate flex-1">{subarea.title}</span>}
          {!isCollapsed && (
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150">
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
              icon: <Workflow />,
              onClick: () => {
                setSelectedApp(appCode);
                setSelectedArea(areaCode);
                setSelectedSubArea(subarea.code);
                setShowCreateProcess(true);
              }
            },
            {
              label: "Delete",
              icon: <Trash2 />,
              onClick: () => handleDeleteSubArea(appCode, areaCode, subarea.code),
              className: "text-destructive hover:text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
            }
          ])}
            </div>
          )}
        </div>
        {/* Renderizar processos da subárea */}
        {!isCollapsed && subarea.processes.map(process =>
          renderProcess(appCode, areaCode, process, isCollapsed, subarea.code)
        )}
      </div>
    );
  };

  const renderArea = (appCode: string, area: SidebarArea, isCollapsed: boolean) => {
    const isExpanded = expandedAreas.has(area.code);
    const menuId = `area-${appCode}-${area.code}`;

    return (
      <div key={area.code} className={cn("text-sm group", isCollapsed ? "pl-1" : "pl-6")}> {/* pl-6 para indentação de área */}
        <div className={cn("flex items-center rounded-md transition-colors", isCollapsed ? "" : "px-2 py-1.5 hover:bg-muted")}>
          <button
            onClick={() => toggleArea(area.code)}
            className={cn(
              "flex items-center flex-1 text-left", // text-left para o botão
              isCollapsed ? "justify-center px-1 py-1.5 rounded-md hover:bg-muted w-full" : "py-0" // Ajuste de padding para colapsado
            )}
            title={isCollapsed ? area.title : undefined}
          >
            {!isCollapsed && (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 mr-2 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2 shrink-0" />
              )
            )}
            <Layers className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-2")} />
            {!isCollapsed && <span className="truncate text-foreground">{area.title}</span>}
          </button>
          {!isCollapsed && (
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {renderActionMenu(menuId, [
                {
                  label: "Edit",
                  icon: <Edit />,
                  onClick: () => {
                    setEditingArea({ appCode, area: area });
                    setShowEditArea(true);
                  }
                },
                {
                  label: "Add SubArea",
                  icon: <Layers />,
                  onClick: () => {
                    setSelectedApp(appCode);
                    setSelectedArea(area.code);
                    setShowCreateSubArea(true);
                  }
                },
                {
                  label: "Add Process",
                  icon: <Workflow />,
                  onClick: () => {
                    setSelectedApp(appCode);
                    setSelectedArea(area.code);
                    setShowCreateProcess(true); // Processo diretamente sob área
                  }
                },
                {
                  label: "Delete",
                  icon: <Trash2 />,
                  onClick: () => handleDeleteArea(appCode, area.code),
                  className: "text-destructive hover:text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                }
              ])}
            </div>
          )}
        </div>
        {isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-0.5"> {/* Adicionado space-y para leve espaçamento entre filhos */}
            {area.processes?.map(process => renderProcess(appCode, area.code, process, isCollapsed, undefined))}
            {area.subareas?.map(subarea => renderSubArea(appCode, area.code, subarea, isCollapsed))}
          </div>
        )}
      </div>
    );
  };

  const renderWorkspace = (app: SidebarWorkspace, isCollapsed: boolean) => {
    const isExpanded = expandedApps.has(app.code);
    const menuId = `app-${app.code}`;

    return (
      <div key={app.code} className={cn("text-sm group", isCollapsed ? "" : "pl-2")}> {/* pl-2 para workspace, um pouco menos que área */}
        <div className={cn("flex items-center rounded-md transition-colors", isCollapsed ? "" : "px-2 py-1 hover:bg-muted")}>
          <button
            onClick={() => toggleApp(app.code)}
            className={cn(
              "flex items-center flex-1 text-left font-medium", // font-medium para workspaces
              isCollapsed ? "justify-center px-1 py-1.5 rounded-md hover:bg-muted w-full" : "py-0.5" // Ajuste de padding
            )}
            title={isCollapsed ? app.title : undefined}
          >
            {!isCollapsed && (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 mr-2 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2 shrink-0" />
              )
            )}
            <Folder className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-2")} />
            {!isCollapsed && <span className="truncate text-foreground">{app.title}</span>}
          </button>
          {!isCollapsed && (
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {renderActionMenu(menuId, [
                {
                  label: "Edit",
                  icon: <Edit />,
                  onClick: () => {
                    setEditingWorkspaceCode(app.code);
                    setShowEditWorkspace(true);
                  }
                },
                {
                  label: "Add Area",
                  icon: <Layers />,
              onClick: () => {
                setSelectedApp(app.code);
                setShowCreateArea(true);
              }
            },
            {
              label: "Delete",
              icon: <Trash2 />,
              onClick: () => handleDeleteApp(app.code),
              className: "text-destructive hover:text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
            }
          ])}
            </div>
          )}
        </div>
        {isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-0.5"> {/* Adicionado space-y para leve espaçamento entre filhos */}
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
  // bg-background e border-border são aplicados pelo Panel no layout.tsx,
  // mas podemos reafirmar ou adicionar especificidades aqui se necessário.
  const sidebarContainerClasses = cn(
    "flex flex-col h-full bg-background text-foreground", // Usar cores de tema
    // shadow-lg e border-r são geralmente aplicados pelo container pai (Panel) ou aqui se for um design específico.
    // No nosso caso, o Panel em layout.tsx já tem bg-background. A borda é pelo PanelResizeHandle.
    // Vamos remover shadow-lg daqui para evitar duplicação, assumindo que o painel já pode ter sombra.
  );

  return (
    <div className={sidebarContainerClasses}>
      {/* Sidebar Header */}
      <div className={cn(
        "flex items-center justify-between h-16 px-4 border-b border-border shrink-0", // Usar border-border
        isCollapsed && !isMobileOpen && "justify-center"
      )}>
        {/* Title/Logo Area */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="flex items-center">
            <Workflow className="h-7 w-7 text-primary" /> {/* Usar text-primary diretamente */}
            <span className="ml-2 text-lg font-semibold truncate"> {/* text-gray-800 removido, herdará text-foreground */}
              {isMobileOpen ? "Menu" : "IGRP Studio"}
            </span>
          </div>
        )}

        {/* Desktop Collapse/Expand Toggle Button */}
        {!isMobileOpen && (
          <Button
            variant="ghost" // Usar Button do ShadCN para consistência
            size="icon"
            onClick={onToggleCollapse} 
            className={cn(
              // "p-1 rounded-md focus:outline-none", // Classes base do Button ghost size icon
              // "hover:bg-muted", // hover:bg-gray-200 -> hover:bg-muted
              isCollapsed ? "mx-auto" : "ml-2"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />} {/* text-gray-600 removido, herdará */}
          </Button>
        )}

        {/* Mobile Off-canvas Close Button */}
        {isMobileOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseMobile} 
              // className="p-1 rounded-md hover:bg-muted focus:outline-none" // hover:bg-gray-200 -> hover:bg-muted
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" /> {/* text-gray-600 removido */}
            </Button>
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
                  ? "bg-accent text-accent-foreground" //  bg-primary-50 text-primary-600 -> bg-accent text-accent-foreground (ou text-primary)
                  : "text-muted-foreground hover:text-foreground hover:bg-muted" // text-gray-700 hover:bg-gray-100 hover:text-gray-900 -> text-muted-foreground hover:text-foreground hover:bg-muted
              )}
              title={isCollapsed && !isMobileOpen ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5", // Ícones dos links de navegação principal
                  isCollapsed && !isMobileOpen ? "" : "mr-3", // Margem apenas se expandido
                )}
                aria-hidden="true"
              />
              {!(isCollapsed && !isMobileOpen) && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Dynamic Workspaces Section */}
        <div className="pt-6"> {/* Espaçamento acima da seção de workspaces */}
          <div className={cn(
            "mb-2 flex items-center justify-between",
            isCollapsed && !isMobileOpen ? "px-1 justify-center" : "px-2" // Ajustado padding para consistência com itens de navegação
          )}>
            {!(isCollapsed && !isMobileOpen) && (
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"> {/* text-gray-500 -> text-muted-foreground */}
                Workspaces
              </span>
            )}
            <Button
              variant="ghost"
              size={isCollapsed && !isMobileOpen ? "icon" : "sm"} // Usar 'icon' para o modo colapsado se o texto for oculto
              onClick={() => {
                setShowCreateApp(true);
                if (isMobileOpen) onCloseMobile(); // Close mobile if opening modal
              }}
              title="New Workspace"
              className={cn(
                "inline-flex items-center", // Manter items-center
                // Se 'icon', o padding e tamanho são gerenciados pelo Button. Se 'sm', pode precisar de ajuste de padding se o texto 'New' estiver visível.
                // O size="icon" já centraliza o ícone. Se size="sm" e colapsado, o ícone pode não estar centralizado se houver margem no ícone.
              )}
            >
              {/* Ajustar o ícone para não ter margem se o botão for 'icon' e colapsado, ou se o texto estiver oculto. */}
              <Folder className={cn("h-4 w-4", !(isCollapsed && !isMobileOpen) && "mr-1")} />
              {!(isCollapsed && !isMobileOpen) && (
                 // sr-only sm:not-sr-only é bom para acessibilidade, mas com size="icon" o texto não deveria aparecer.
                 // Se size="sm" e colapsado, o texto "New" não deveria estar visível.
                 // Vamos simplificar: mostrar "New" apenas se não colapsado.
                 "New"
              )}
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div> {/* border-primary-600 -> border-primary */}
            </div>
          ) : workspaces.length > 0 ? (
            <div className="space-y-1">
              {workspaces.map((workspace) => renderWorkspace(workspace, isCollapsed && !isMobileOpen))}
            </div>
          ) : (
            !(isCollapsed && !isMobileOpen) && (
              <div className="px-2 py-2 text-sm text-muted-foreground"> {/* px-3 -> px-2, text-gray-500 -> text-muted-foreground */}
                No workspaces found
              </div>
            )
          )}
        </div>
      </div>
      
      {/* Footer / Collapse button for Desktop */}
      {!isMobileOpen && (
        <div className="flex-shrink-0 p-2 border-t border-border"> {/* border-gray-200 -> border-border */}
          <Button
            variant="ghost"
            size="sm" // 'sm' para ter espaço para o texto "Collapse"
            className="w-full flex items-center justify-center text-muted-foreground hover:text-foreground" // text-gray-600 hover:bg-gray-100 -> text-muted-foreground hover:text-foreground
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
