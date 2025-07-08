// Placeholder for SiteHeader component
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { NavUser } from "./nav-user"; // Assuming NavUser is in the same directory

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header className={`sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          {/* Optional: Logo or site name can go here */}
          <a href="/dashboard" className="mr-6 flex items-center space-x-2">
            {/* <Icons.logo className="h-6 w-6" /> */}
            <span className="hidden font-bold sm:inline-block">
              IGRP WF Studio
            </span>
          </a>
        </div>
        {/* Mobile Menu Trigger can go here if needed */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search workflows..."
                  className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                />
              </div>
            </form>
          </div>
          <nav className="flex items-center">
            <NavUser />
            {/* Add other header items like notifications, theme toggle etc. here */}
          </nav>
        </div>
      </div>
    </header>
  );
}
