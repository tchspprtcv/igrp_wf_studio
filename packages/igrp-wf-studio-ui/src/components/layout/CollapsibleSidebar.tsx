import React, { useState, useEffect, ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';

/**
 * Interface for menu item objects
 */
interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  path?: string;
  children?: MenuItem[];
}

/**
 * Props for the CollapsibleSidebar component
 */
interface CollapsibleSidebarProps {
  /** Array of menu items to display in the sidebar */
  menuItems: MenuItem[];
  /** Optional logo component to display at the top of the sidebar */
  logo?: ReactNode;
  /** Optional header text to display when sidebar is expanded */
  headerText?: string;
  /** Optional callback function triggered when sidebar collapse state changes */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Optional default collapsed state */
  defaultCollapsed?: boolean;
}

/**
 * CollapsibleSidebar - A responsive sidebar component with collapsible functionality
 * 
 * This component provides a sidebar that can be toggled between expanded and collapsed states.
 * It supports nested menu items, shows icons-only in collapsed state, and uses Tailwind CSS
 * for styling and smooth transitions.
 */
const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  menuItems,
  logo,
  headerText = 'IGRP Workflow',
  onCollapseChange,
  defaultCollapsed = false,
}) => {
  // State for tracking if the sidebar is collapsed
  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);
  
  // State for tracking which menu items are expanded (for nested menus)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  
  // Get current location to highlight active menu item
  const location = useLocation();
  
  // Effect to call the onCollapseChange callback when collapsed state changes
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(collapsed);
    }
  }, [collapsed, onCollapseChange]);

  /**
   * Toggle the collapsed state of the sidebar
   */
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  /**
   * Toggle the expanded state of a menu item with children
   */
  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  /**
   * Check if a menu item is active based on the current path
   */
  const isActive = (path?: string): boolean => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  /**
   * Render a menu item and its children recursively
   */
  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isMenuExpanded = expandedMenus[item.id];
    const active = isActive(item.path);
    
    // Base classes for all menu items
    const baseClasses = `
      flex items-center w-full px-4 py-2 text-sm transition-all duration-300 ease-in-out
      ${active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}
      ${level > 0 ? 'pl-' + (level * 4 + 4) : ''}
    `;
    
    // Content to render inside the menu item
    const menuContent = (
      <>
        <div className="flex items-center">
          <span className={`${!collapsed ? 'mr-3' : ''} text-xl`}>{item.icon}</span>
          {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
        </div>
        
        {/* Show arrow icon for items with children when sidebar is expanded */}
        {!collapsed && hasChildren && (
          <span className={`ml-auto transition-transform duration-300 ${isMenuExpanded ? 'rotate-90' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </>
    );

    return (
      <div key={item.id} className="w-full">
        {/* Render as link if path exists, otherwise as button */}
        {item.path ? (
          <Link
            to={item.path}
            className={`${baseClasses} ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            {menuContent}
          </Link>
        ) : (
          <button
            onClick={() => toggleMenu(item.id)}
            className={`${baseClasses} ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            {menuContent}
          </button>
        )}
        
        {/* Render children if this menu is expanded */}
        {hasChildren && (isMenuExpanded || collapsed) && (
          <div className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isMenuExpanded || collapsed ? 'max-h-96' : 'max-h-0'}
          `}>
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`
        h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
        flex flex-col shadow-lg
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center">
            {logo && <div className="mr-2">{logo}</div>}
            <h1 className="text-lg font-semibold text-gray-800">{headerText}</h1>
          </div>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`
            p-1 rounded-md hover:bg-gray-200 focus:outline-none
            ${collapsed ? 'mx-auto' : 'ml-auto'}
          `}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7M19 19l-7-7 7-7'}
            />
          </svg>
        </button>
      </div>
      
      {/* Sidebar Content - Menu Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="flex flex-col space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </div>
    </div>
  );
};

export default CollapsibleSidebar;
