import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
// import Header from "./Header"; // Remove Header import
import { Toaster } from 'react-hot-toast';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { cn } from "@/lib/utils"; // Ensure cn is imported if not already

const COLLAPSED_SIZE_PERCENT = 4; // Percentage size when collapsed
const DEFAULT_EXPANDED_SIZE_PERCENT = 16; // Percentage size when expanded

const MainLayout: React.FC = () => {
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false); // For mobile/off-canvas
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Replaced by isOffCanvasOpen
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Store size in percentage or relative units if preferred, using rem units here for consistency
  const [sidebarSize, setSidebarSize] = useState(DEFAULT_EXPANDED_SIZE_PERCENT);

  const toggleMobileMenu = () => {
    // setIsMobileMenuOpen(!isMobileMenuOpen); // Replaced by toggleOffCanvas
    setIsOffCanvasOpen(!isOffCanvasOpen);
  };

  const closeMobileMenu = () => {
    // setIsMobileMenuOpen(false); // Replaced by closeOffCanvas
    setIsOffCanvasOpen(false);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    // Optionally reset size on expand, or keep the last known size
    if (isSidebarCollapsed) {
      // If expanding, restore the last known size or default
      // setSidebarSize(prevSize => prevSize === COLLAPSED_SIZE ? DEFAULT_EXPANDED_SIZE : prevSize);
    } else {
      // If collapsing, store the current size before collapsing (optional)
    }
  };

  const handleLayout = (sizes: number[]) => {
    // sizes are usually percentages, convert if necessary or store as percentage
    // Assuming the first panel is the sidebar
    // Only update the stored size if the sidebar is not collapsed
    if (!isSidebarCollapsed) {
       // Convert percentage to rem if needed, or adjust logic based on PanelGroup units
       // For simplicity, let's assume sizes[0] is the percentage and we convert it
       // This part needs careful adjustment based on how PanelGroup reports sizes
       // Let's stick to managing size directly for now and update on resize
       // setSidebarSize(sizes[0]); // If sizes are percentages
    }
  };

  // Use effect to manage panel size based on collapse state
  // This approach might be simpler than trying to control size directly via props
  // Alternatively, pass size prop to Panel conditionally

  return (
    <div className="min-h-screen bg-gray-50 flex relative"> {/* Added relative for off-canvas positioning */}
      {/* Toaster component for notifications */}
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          style: {
            background: 'green',
            color: '#fff',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: 'red',
            color: '#fff',
          },
        },
      }} />
      
      {/* Overlay for Off-canvas Sidebar */}
      {isOffCanvasOpen && (
        <div 
          className="fixed inset-0 z-15 bg-gray-900/50 lg:hidden"
          onClick={closeMobileMenu} 
        />
      )}

      {/* Sidebar - Conditionally render as Panel or fixed off-canvas */}
      {/* For larger screens, use PanelGroup */}
      <div className="hidden lg:flex h-screen">
        <PanelGroup direction="horizontal" onLayout={handleLayout}>
          <Panel
            defaultSize={DEFAULT_EXPANDED_SIZE_PERCENT} 
            minSize={COLLAPSED_SIZE_PERCENT} 
            maxSize={50} 
            collapsible={true}
            onCollapse={() => setIsSidebarCollapsed(true)}
            onExpand={() => setIsSidebarCollapsed(false)}
            order={1}
            // Remove width classes as size is controlled by react-resizable-panels
            className={cn("transition-all duration-300 ease-in-out")}
          >
            <Sidebar
              isMobileOpen={false} // Not used in this context
              onCloseMobile={closeMobileMenu} // Keep for consistency, though not directly used here
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={toggleSidebarCollapse}
            />
          </Panel>
          <PanelResizeHandle className={cn(
            "w-1 bg-gray-300 hover:bg-primary-500 transition-colors duration-200",
            isSidebarCollapsed && "hidden" 
          )} />
        </PanelGroup>
      </div>

      {/* Off-canvas Sidebar for smaller screens (lg and below) */}
      <div className={cn(
        "fixed top-0 left-0 z-20 h-screen transition-transform lg:hidden",
        isOffCanvasOpen ? "translate-x-0" : "-translate-x-full",
        "bg-white w-64 shadow-lg border-r border-gray-200" // Added styles for off-canvas
      )}>
        <Sidebar
          isMobileOpen={isOffCanvasOpen} // Controls visibility/state for off-canvas
          onCloseMobile={closeMobileMenu} // Function to close off-canvas
          isCollapsed={false} // Off-canvas is never in 'collapsed' icon-only mode
          onToggleCollapse={() => {}} // Not used for off-canvas, but prop is required
        />
      </div>

      {/* Main Content Area - needs to be separate from PanelGroup for off-canvas to work correctly */}
      {/* The PanelGroup below is now only for the main content area when sidebar is part of the group (larger screens) */}
      {/* We need a structure that allows the main content to be always present */}
      <div className="flex flex-col flex-1 min-h-screen lg:ml-0"> {/* lg:ml-0 ensures no double margin */}
        {/* Header needs to be outside the potential PanelGroup of main content if we want it full width */}
        {/*<Header onMobileMenuClick={toggleMobileMenu} />*/}
        <main className="flex-1 overflow-y-auto">
          <div>
            <div className=" mx-auto px-4 py-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
