import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  Upload, 
  Users, 
  Clock, 
  HardDrive, 
  Zap 
} from "lucide-react";

const stats = [
  {
    title: "Total Downloaded",
    value: "2.4 TB",
    change: "+12%",
    icon: Download,
    color: "text-primary"
  },
  {
    title: "Total Uploaded", 
    value: "847 GB",
    change: "+8%",
    icon: Upload,
    color: "text-accent"
  },
  {
    title: "Active Users",
    value: "6",
    change: "0%",
    icon: Users,
    color: "text-success"
  },
  {
    title: "Uptime",
    value: "99.9%",
    change: "+0.1%",
    icon: Clock,
    color: "text-primary"
  }
];

export const NetworkStats = () => {
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
                className="flex items-center space-x-4 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-2 rounded-full bg-muted/30">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
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
    </Card>
  );
};