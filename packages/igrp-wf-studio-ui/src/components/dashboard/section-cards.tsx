import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, Layers, Workflow, Clock, Activity, Users, DollarSign, CreditCard } from "lucide-react"; // Added original icons
import type { DashboardStats } from '@/types'; // Assuming this type is defined

interface SectionCardsProps {
  stats: DashboardStats;
  className?: string;
}

// Mapping internal stat names to display names and icons
const cardDetailsMap: Record<keyof DashboardStats, { title: string; icon: React.ElementType; description?: string }> = {
  workspaces: { title: "Workspaces", icon: Folder, description: "Total managed workspaces" },
  areas: { title: "Areas", icon: Layers, description: "Total functional areas" },
  processes: { title: "Processes", icon: Workflow, description: "Total defined processes" },
  active: { title: "Active Workspaces", icon: Clock, description: "Currently active workspaces" },
  // Removed placeholder entries: totalRevenue, subscriptions, sales, activeNow
};


export function SectionCards({ stats, className }: SectionCardsProps) {
  // Ensure statsToDisplay only includes keys that are actually in DashboardStats and cardDetailsMap
  const statsToDisplay = Object.keys(stats).filter(
    key => key in cardDetailsMap
  ) as (keyof DashboardStats)[];

  // Removed exampleCardData array

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {statsToDisplay.map((key) => {
        // Type assertion to ensure detail is not undefined, as we filtered keys
        const detail = cardDetailsMap[key as keyof DashboardStats];
        const value = stats[key as keyof DashboardStats];

        // Skip rendering if somehow a key is not in cardDetailsMap (defensive check)
        if (!detail) {
          console.warn(`SectionCards: No details found for stat key "${key}". Skipping card.`);
          return null;
        }

        return (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{detail.title}</CardTitle>
              <detail.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              {detail.description && <p className="text-xs text-muted-foreground">{detail.description}</p>}
            </CardContent>
          </Card>
        );
      })}
      {/* Removed the commented-out section for exampleCardData */}
    </div>
  );
}
