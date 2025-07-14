import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity3D,
  Wifi3D,
  Shield3D,
  Zap3D
} from "@/components/icons/NetworkIcons3D";
import { MonitoringHistoryDialog } from "./MonitoringHistoryDialog";

// Detailed dashboard items
const dashboardItems = [
  {
    title: "Network Status",
    value: "Online",
    status: "success",
    icon: Wifi3D
  },
  {
    title: "Security Level",
    value: "High",
    status: "success", 
    icon: Shield3D
  },  
  {
    title: "Active Connections",
    value: "24",
    status: "normal",
    icon: Activity3D
  },
  {
    title: "Performance",
    value: "Excellent",
    status: "success",
    icon: Zap3D
  }
];

export const NetworkDashboard = () => {
  const [selectedItem, setSelectedItem] = useState<{
    type: 'component';
    id: string;
    name: string;
    status: string;
  } | null>(null);

  const handleItemClick = (item: typeof dashboardItems[0]) => {
    setSelectedItem({
      type: 'component',
      id: item.title.toLowerCase().replace(/\s+/g, '_'),
      name: item.title,
      status: item.value
    });
  };

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            General
          </h2>
          <Badge variant="outline" className="border-primary text-primary">
            All Systems Normal
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center space-x-4 p-6 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors animate-fade-in cursor-pointer transform hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center justify-center">
                  <Icon 
                    size={40} 
                    color={
                      item.status === 'success' ? 'hsl(var(--success))' :
                      item.status === 'warning' ? 'hsl(var(--warning))' :
                      item.status === 'error' ? 'hsl(var(--destructive))' :
                      'hsl(var(--muted-foreground))'
                    }
                  />
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {item.title}
                  </p>
                  <p className="font-semibold text-foreground">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {selectedItem && (
        <MonitoringHistoryDialog
          open={!!selectedItem}
          onOpenChange={() => setSelectedItem(null)}
          itemType={selectedItem.type}
          itemId={selectedItem.id}
          itemName={selectedItem.name}
          currentStatus={selectedItem.status}
        />
      )}
    </Card>
  );
};