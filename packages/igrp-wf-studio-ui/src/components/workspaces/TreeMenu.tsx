"use client"; // TreeMenu é interativo

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Layers, Workflow, MoreVertical, Trash2, Edit } from 'lucide-react';
import Link from 'next/link'; // Alterado de react-router-dom
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TreeNode {
  id: string;
  code: string;
  title: string;
  status: string;
  processes?: TreeNode[];
  subareas?: TreeNode[];
}

interface TreeMenuProps {
  appCode: string; // Adicionado para construir URLs corretas
  areas: TreeNode[];
  onCreateArea?: () => void;
  onCreateSubArea?: (areaCode: string) => void;
  onCreateProcess?: (areaCode: string, subareaCode?: string) => void;
  // Ajustado para incluir grandParentCode para processos em subáreas, para consistência com WorkspaceDetailsClientContent
  onEditItem?: (type: 'area' | 'subarea' | 'process', itemCode: string, parentCode?: string, grandParentCode?: string) => void;
  onDeleteItem?: (type: 'area' | 'subarea' | 'process', itemCode: string, parentCode?: string, grandParentCode?: string) => void;
}

const TreeMenu: React.FC<TreeMenuProps> = ({
  appCode, // Receber appCode
  areas,
  onCreateArea,
  onCreateSubArea,
  onCreateProcess,
  onEditItem,
  onDeleteItem
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleMenu = (menuId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

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

  const renderProcessNode = (process: TreeNode, areaCode: string, subAreaCode?: string) => { // Adicionado subAreaCode
    const menuId = `process-${appCode}-${areaCode}${subAreaCode ? '-' + subAreaCode : ''}-${process.code}`;
    // Construir a URL correta para o editor de processos
    const processPath = `/workspaces/${appCode}/processes/${process.code}`;
    // Para onEditItem e onDeleteItem, precisamos passar o contexto correto
    // Se subAreaCode existir, ele é o parentCode para a action, e areaCode é o grandParentCode
    const editParentCode = subAreaCode || areaCode;
    const editGrandParentCode = subAreaCode ? areaCode : undefined;

    return (
      <div key={process.id} className="flex items-center py-1 pl-8">
        <Link href={processPath} className="flex items-center flex-1 text-sm text-gray-700 hover:text-primary-600">
          <Workflow className="h-4 w-4 text-gray-400 mr-2" />
          <span className="truncate">{process.title}</span>
        </Link>
        {renderActionMenu(menuId, [
          {
            label: "Edit",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => onEditItem?.('process', process.code, editParentCode, editGrandParentCode)
          },
          {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => onDeleteItem?.('process', process.code, editParentCode, editGrandParentCode),
            className: "text-red-600 hover:text-red-700"
          }
        ])}
      </div>
    );
  };

  const renderSubArea = (subarea: TreeNode, areaCode: string) => {
    const isExpanded = expandedNodes.has(subarea.id);
    const menuId = `subarea-${appCode}-${areaCode}-${subarea.code}`; // MenuId mais específico

    return (
      <div key={subarea.id}>
        <div className="flex items-center py-1 pl-4">
          <button
            onClick={() => toggleNode(subarea.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>
          <Layers className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-700 flex-1">{subarea.title}</span>
          {renderActionMenu(menuId, [
            {
              label: "Edit",
              icon: <Edit className="h-4 w-4" />,
              onClick: () => onEditItem?.('subarea', subarea.code, areaCode) // parentCode é areaCode
            },
            {
              label: "Add Process",
              icon: <Workflow className="h-4 w-4" />,
              onClick: () => onCreateProcess?.(areaCode, subarea.code)
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => onDeleteItem?.('subarea', subarea.code, areaCode), // parentCode é areaCode
              className: "text-red-600 hover:text-red-700"
            }
          ])}
        </div>
        {isExpanded && subarea.processes && (
          <div className="ml-4">
            {subarea.processes.map(process => renderProcessNode(process, areaCode, subarea.code))} {/* Passar subarea.code */}
          </div>
        )}
      </div>
    );
  };

  const renderArea = (area: TreeNode) => {
    const isExpanded = expandedNodes.has(area.id);
    const menuId = `area-${appCode}-${area.code}`; // MenuId mais específico

    return (
      <div key={area.id} className="border-b border-gray-200 last:border-0">
        <div className="flex items-center py-2">
          <button
            onClick={() => toggleNode(area.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>
          <Layers className="h-4 w-4 text-primary-600 mr-2" />
          <span className="text-sm font-medium text-gray-900 flex-1">{area.title}</span>
          {renderActionMenu(menuId, [
            {
              label: "Edit",
              icon: <Edit className="h-4 w-4" />,
              onClick: () => onEditItem?.('area', area.code) // Não tem parentCode
            },
            {
              label: "Add SubArea",
              icon: <Layers className="h-4 w-4" />,
              onClick: () => onCreateSubArea?.(area.code)
            },
            {
              label: "Add Process",
              icon: <Workflow className="h-4 w-4" />,
              onClick: () => onCreateProcess?.(area.code)
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => onDeleteItem?.('area', area.code),
              className: "text-red-600 hover:text-red-700"
            }
          ])}
        </div>
        {isExpanded && (
          <div className="ml-4">
            {area.processes?.map(process => renderProcessNode(process, area.code))}
            {area.subareas?.map(subarea => renderSubArea(subarea, area.code))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Application Structure</h3>
        {onCreateArea && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateArea}
          >
            <Layers className="h-4 w-4 mr-2" />
            Add Area
          </Button>
        )}
      </div>
      <div className="p-2">
        {areas.map(renderArea)}
      </div>
    </div>
  );
};

export default TreeMenu;
