import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, Layers, Workflow, Clock, Activity, Users, DollarSign, CreditCard } from "lucide-react"; // Added original icons
import type { DashboardStats } from '@/types'; // Assuming this type is defined

interface SectionCardsProps {
  stats: DashboardStats;
  className?: string;
}

// Mapping internal stat names to display names and icons
const cardDetailsMap: Record<keyof DashboardStats | string, { title: string; icon: React.ElementType; description?: string }> = {
  workspaces: { title: "Workspaces", icon: Folder, description: "Total managed workspaces" },
  areas: { title: "Areas", icon: Layers, description: "Total functional areas" },
  processes: { title: "Processes", icon: Workflow, description: "Total defined processes" },
  active: { title: "Active Workspaces", icon: Clock, description: "Currently active workspaces" },
  // Adding placeholders for the other cards from the original template for visual completeness for now
  // These can be replaced with actual data if available or removed.
  totalRevenue: { title: "Total Revenue", icon: DollarSign, description: "+20.1% from last month" },
  subscriptions: { title: "Subscriptions", icon: Users, description: "+180.1% from last month" },
  sales: { title: "Sales", icon: CreditCard, description: "+19% from last month" },
  activeNow: { title: "Active Now", icon: Activity, description: "+201 since last hour" },
};


export function SectionCards({ stats, className }: SectionCardsProps) {
  const statsToDisplay: (keyof DashboardStats)[] = ['workspaces', 'areas', 'processes', 'active'];

  // Data for the example cards from the template (can be removed if not needed)
  const exampleCardData = [
    { key: 'totalRevenue', value: "$45,231.89" },
    { key: 'subscriptions', value: "+2350" },
    { key: 'sales', value: "+12,234" },
    { key: 'activeNow', value: "+573" },
  ];

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {statsToDisplay.map((key) => {
        const detail = cardDetailsMap[key];
        const value = stats[key];
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
      {/* Uncomment or modify this section if you want to keep the placeholder cards from the template */}
      {/* {exampleCardData.map((card) => {
        const detail = cardDetailsMap[card.key];
        return (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{detail.title}</CardTitle>
              <detail.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {detail.description && <p className="text-xs text-muted-foreground">{detail.description}</p>}
            </CardContent>
          </Card>
        );
      })} */}
    </div>
  );
}
