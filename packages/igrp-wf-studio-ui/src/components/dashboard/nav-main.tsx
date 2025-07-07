// Placeholder for NavMain component
import { Home, Users, Settings, Package } from "lucide-react";
import Link from "next/link";

export function NavMain({ className }: { className?: string }) {
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "#", label: "Workspaces", icon: Package }, // Placeholder link
    { href: "#", label: "Users", icon: Users }, // Placeholder link
    { href: "#", label: "Settings", icon: Settings }, // Placeholder link
  ];

  return (
    <nav className={className}>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="flex items-center space-x-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
