"use client";

import React, { useState } from 'react'; // useEffect não é mais necessário para activeMenu
import { ChevronRight, ChevronDown, Layers, Workflow, MoreVertical, Trash2, Edit, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
// import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"; // Para melhoria futura

interface TreeNode {
  id: string; // Usado como key e para controle de expansão
  code: string;
  title: string;
  status: string; // Pode ser usado para estilização condicional
  processes?: TreeNode[];
  subareas?: TreeNode[];
}

interface TreeMenuProps {
  appCode: string;
  areas: TreeNode[];
  onCreateArea?: () => void;
  onCreateSubArea?: (areaCode: string) => void;
  onCreateProcess?: (areaCode: string, subareaCode?: string) => void;
  onEditItem?: (type: 'area' | 'subarea' | 'process', itemCode: string, parentCode?: string, grandParentCode?: string) => void;
  onDeleteItem?: (type: 'area' | 'subarea' | 'process', itemCode: string, parentCode?: string, grandParentCode?: string) => void;
}

const TreeMenu: React.FC<TreeMenuProps> = ({
  appCode,
  areas,
  onCreateArea,
  onCreateSubArea,
  onCreateProcess,
  onEditItem,
  onDeleteItem
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  type ActionItem = {
    label: string;
    icon: React.ReactNode;
    onClick: () => void; // Removido (e: React.MouseEvent) pois DropdownMenuItem não passa evento
    className?: string;
    isSeparator?: boolean;
  };

  const renderActionDropdown = (actions: ActionItem[]) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto"> {/* Botão de ícone menor */}
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48"> {/* Alinhar à direita, largura fixa */}
        {actions.map((action, index) =>
          action.isSeparator ? (
            <DropdownMenuSeparator key={`sep-${index}`} />
          ) : (
            <DropdownMenuItem
              key={action.label}
              onClick={action.onClick}
              className={cn("flex items-center gap-2 text-sm", action.className)} // Adicionado gap e text-sm
            >
              {action.icon}
              <span>{action.label}</span>
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderProcessNode = (process: TreeNode, areaCode: string, subAreaCode?: string) => {
    const processPath = `/workspaces/${appCode}/processes/${process.code}`;
    const editParentCode = subAreaCode || areaCode;
    const editGrandParentCode = subAreaCode ? areaCode : undefined;

    const actions: ActionItem[] = [
      {
        label: "Edit Process",
        icon: <Edit className="h-4 w-4" />,
        onClick: () => onEditItem?.('process', process.code, editParentCode, editGrandParentCode)
      },
      { isSeparator: true },
      {
        label: "Delete Process",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => onDeleteItem?.('process', process.code, editParentCode, editGrandParentCode),
        className: "text-destructive focus:text-destructive focus:bg-destructive/10"
      }
    ];

    return (
      <div key={process.id} className="flex items-center py-1.5 pl-10 pr-2 rounded-md hover:bg-muted/50 group"> {/* Aumentado pl, adicionado pr e group */}
        <Workflow className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
        <Link href={processPath} className="flex-1 text-sm text-foreground hover:text-primary truncate">
          {process.title}
        </Link>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity"> {/* Mostrar ações no hover do item */}
          {renderActionDropdown(actions)}
        </div>
      </div>
    );
  };

  const renderSubAreaNode = (subarea: TreeNode, areaCode: string) => {
    const isExpanded = expandedNodes.has(subarea.id);
    const actions: ActionItem[] = [
      {
        label: "Edit SubArea",
        icon: <Edit className="h-4 w-4" />,
        onClick: () => onEditItem?.('subarea', subarea.code, areaCode)
      },
      {
        label: "Add Process",
        icon: <PlusCircle className="h-4 w-4" />, // Usar PlusCircle para "Add"
        onClick: () => onCreateProcess?.(areaCode, subarea.code)
      },
      { isSeparator: true },
      {
        label: "Delete SubArea",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => onDeleteItem?.('subarea', subarea.code, areaCode),
        className: "text-destructive focus:text-destructive focus:bg-destructive/10"
      }
    ];

    return (
      // Futuramente, isto poderia ser um <Collapsible>
      <div key={subarea.id} className="ml-4 my-1">
        <div className="flex items-center py-1.5 pl-2 pr-2 rounded-md hover:bg-muted/50 group"> {/* Adicionado pr e group */}
          <Button variant="ghost" size="icon" onClick={() => toggleNode(subarea.id)} className="h-7 w-7 mr-1">
            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Layers className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
          <span className="text-sm text-foreground flex-1 truncate">{subarea.title}</span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {renderActionDropdown(actions)}
          </div>
        </div>
        {isExpanded && (
          <div className="mt-1"> {/* Espaçamento para filhos */}
            {subarea.processes?.map(process => renderProcessNode(process, areaCode, subarea.code))}
            {/* Adicionar botão para "Add Process" se não houver processos */}
            {(!subarea.processes || subarea.processes.length === 0) && onCreateProcess && (
                 <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-primary mt-1 pl-10" onClick={() => onCreateProcess?.(areaCode, subarea.code)}>
                    <PlusCircle className="h-4 w-4 mr-2 " /> Add Process
                </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAreaNode = (area: TreeNode) => {
    const isExpanded = expandedNodes.has(area.id);
    const actions: ActionItem[] = [
      {
        label: "Edit Area",
        icon: <Edit className="h-4 w-4" />,
        onClick: () => onEditItem?.('area', area.code)
      },
      {
        label: "Add SubArea",
        icon: <PlusCircle className="h-4 w-4" />, // Usar PlusCircle para "Add"
        onClick: () => onCreateSubArea?.(area.code)
      },
      {
        label: "Add Process",
        icon: <PlusCircle className="h-4 w-4" />, // Usar PlusCircle para "Add"
        onClick: () => onCreateProcess?.(area.code)
      },
      { isSeparator: true },
      {
        label: "Delete Area",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => onDeleteItem?.('area', area.code),
        className: "text-destructive focus:text-destructive focus:bg-destructive/10"
      }
    ];

    return (
      // Futuramente, isto poderia ser um <Collapsible>
      <div key={area.id} className="border-b border-border last:border-0 py-1">
        <div className="flex items-center py-1.5 pl-2 pr-2 rounded-md hover:bg-muted/50 group">
          <Button variant="ghost" size="icon" onClick={() => toggleNode(area.id)} className="h-7 w-7 mr-1">
            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Layers className="h-4 w-4 text-primary mr-2 flex-shrink-0" /> {/* Ícone de área com cor primária */}
          <span className="text-sm font-medium text-foreground flex-1 truncate">{area.title}</span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {renderActionDropdown(actions)}
          </div>
        </div>
        {isExpanded && (
          <div className="mt-1">
            {area.subareas?.map(subarea => renderSubAreaNode(subarea, area.code))}
            {area.processes?.map(process => renderProcessNode(process, area.code))}
             {/* Adicionar botões para "Add SubArea / Process" se não houverem */}
            {(!area.subareas || area.subareas.length === 0) && onCreateSubArea && (
                 <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-primary mt-1 pl-10" onClick={() => onCreateSubArea?.(area.code)}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Add SubArea
                </Button>
            )}
            {(!area.processes || area.processes.length === 0) && (!area.subareas || area.subareas.length === 0) && onCreateProcess && (
                 <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-primary mt-1 pl-10" onClick={() => onCreateProcess?.(area.code)}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Process to Area
                </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  // O Card que envolve o TreeMenu foi movido para WorkspaceDetailsClientContent.tsx
  // O TreeMenu agora foca apenas na renderização da árvore em si.
  return (
    <div> {/* Div container simples, estilização principal vem do Card pai */}
        {areas.length > 0 ? (
            areas.map(renderAreaNode)
        ) : (
            <div className="text-center py-8 text-muted-foreground">
                <Layers className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p className="mb-2">This workspace has no areas yet.</p>
                {onCreateArea && (
                    <Button variant="outline" size="sm" onClick={onCreateArea}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create First Area
                    </Button>
                )}
            </div>
        )}
         {areas.length > 0 && onCreateArea && (
             <Button variant="outline" size="sm" onClick={onCreateArea} className="mt-4 w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Another Area
            </Button>
        )}
    </div>
  );
};

export default TreeMenu;
