import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Download3D, 
  Upload3D, 
  Users3D, 
  Clock3D, 
  HardDrive3D, 
  Zap3D 
} from "@/components/icons/NetworkIcons3D";
import { MonitoringHistoryDialog } from "./MonitoringHistoryDialog";

const stats = [
  {
    title: "Total Downloaded",
    value: "2.4 TB",
    change: "+12%",
    icon: Download3D,
    color: "hsl(var(--primary))"
  },
  {
    title: "Total Uploaded", 
    value: "847 GB",
    change: "+8%",
    icon: Upload3D,
    color: "hsl(var(--accent))"
  },
  {
    title: "Active Users",
    value: "6",
    change: "0%",
    icon: Users3D,
    color: "hsl(var(--success))"
  },
  {
    title: "Uptime",
    value: "99.9%",
    change: "+0.1%",
    icon: Clock3D,
    color: "hsl(var(--primary))"
  }
];

export const NetworkStats = () => {
  const [selectedStat, setSelectedStat] = useState<{
    type: 'service';
    id: string;
    name: string;
    status: string;
  } | null>(null);

  const handleStatClick = (stat: typeof stats[0]) => {
    setSelectedStat({
      type: 'service',
      id: stat.title.toLowerCase().replace(/\s+/g, '_'),
      name: stat.title,
      status: 'active'
    });
  };

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Network Statistics
        </h2>

        <div className="space-y-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.title}
                className="flex items-center space-x-4 animate-fade-in cursor-pointer p-2 rounded-lg hover:bg-muted/20 transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleStatClick(stat)}
              >
                <div className="flex items-center justify-center">
                  <Icon size={32} color={stat.color} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <span className="text-xs text-success">{stat.change}</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">CPU Usage</span>
                <span className="text-sm font-medium text-foreground">23%</span>
              </div>
              <Progress value={23} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Memory Usage</span>
                <span className="text-sm font-medium text-foreground">67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Storage</span>
                <span className="text-sm font-medium text-foreground">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </div>
        </div>
      </div>
      
      {selectedStat && (
        <MonitoringHistoryDialog
          open={!!selectedStat}
          onOpenChange={() => setSelectedStat(null)}
          itemType={selectedStat.type}
          itemId={selectedStat.id}
          itemName={selectedStat.name}
          currentStatus={selectedStat.status}
        />
      )}
    </Card>
  );
};