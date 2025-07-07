"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Added for scrollable content
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
  useSidebar, // To get sidebar state if needed for conditional rendering
} from "@/components/ui/sidebar"; // Using the rich sidebar from /ui

import { NavMain } from "./nav-main"; // Main navigation links
import { NavUser } from "./nav-user"; // User-specific navigation or profile
import { Package, Settings, Users, HomeIcon, WorkflowIcon } from "lucide-react"; // Icons

// Define a type for your navigation items if you haven't already
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  // Add other properties like 'subItems' if you plan for nested navigation
}

const mainNavItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: HomeIcon },
  { href: "/dashboard/workspaces", label: "Workspaces", icon: Package },
  { href: "/dashboard/processes", label: "Processes", icon: WorkflowIcon },
  // Add more items as needed
];

const settingsNavItems: NavItem[] = [
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];


export function AppSidebar({ className, variant }: { className?: string, variant?: "sidebar" | "floating" | "inset" }) {
  const pathname = usePathname();
  const { state } = useSidebar(); // Get sidebar state (expanded/collapsed)

  // Helper to determine if a nav item is active
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar
      variant={variant || "sidebar"} // Default to 'sidebar', allow 'inset' from page
      collapsible="icon" // Example: make it icon collapsible
      className={cn("border-r", className)} // Basic styling, can be customized
    >
      <SidebarHeader className="p-4">
        {/* You can put a logo or app name here */}
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* <img src="/logo.svg" alt="Logo" className="h-6 w-auto" /> */}
          <span className={`font-semibold text-lg ${state === 'collapsed' ? 'hidden' : ''}`}>IGRP WF</span>
        </Link>
      </SidebarHeader>

      <ScrollArea className="flex-1"> {/* Allows content to scroll if it overflows */}
        <SidebarContent className="p-2">
          <SidebarGroup>
            <SidebarGroupLabel className={state === 'collapsed' ? 'hidden' : ''}>Main Menu</SidebarGroupLabel>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      asChild={false} // Important: Link is the child, not replacing the button
                      isActive={isActive(item.href)}
                      tooltip={state === 'collapsed' ? item.label : undefined}
                      className="justify-start"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className={state === 'collapsed' ? 'sr-only' : ''}>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {/* Example of another group */}
          <SidebarGroup>
            <SidebarGroupLabel className={state === 'collapsed' ? 'hidden' : ''}>Configuration</SidebarGroupLabel>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                   <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      asChild={false}
                      isActive={isActive(item.href)}
                      tooltip={state === 'collapsed' ? item.label : undefined}
                      className="justify-start"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className={state === 'collapsed' ? 'sr-only' : ''}>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

        </SidebarContent>
      </ScrollArea>

      <SidebarFooter className="p-4 mt-auto border-t">
        {/* NavUser or other footer content */}
        {/* The NavUser component from shadcn block is a dropdown, might be better in SiteHeader */}
        {/* For sidebar, a simple user display or settings link might be more appropriate */}
        { state === 'collapsed' ? (
            <Link href="/dashboard/settings" passHref legacyBehavior>
                 <Button variant="ghost" size="icon" className="w-full">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                </Button>
            </Link>
        ) : (
            <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">User Name</p>
                <p className="text-xs text-muted-foreground">user@example.com</p>
                <Link href="/dashboard/settings" passHref legacyBehavior>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                </Link>
            </div>
        )}
        {/* Or use the NavUser if it's adapted for sidebar footer */}
        {/* <NavUser /> */}
      </SidebarFooter>
    </Sidebar>
  );
}
