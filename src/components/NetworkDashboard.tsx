import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity,
  Wifi,
  Shield,
  Zap
} from "lucide-react";

// Top summary metrics
const summaryItems = [
  {
    title: "Connection",
    value: "Excellent",
    status: "success",
    icon: Wifi
  },
  {
    title: "Security",
    value: "Protected",
    status: "success", 
    icon: Shield
  },
  {
    title: "Speed",
    value: "247 Mbps",
    status: "success",
    icon: Zap
  },
  {
    title: "Public IP",
    value: "192.168.1.1",
    status: "normal",
    icon: Activity
  }
];

// Detailed dashboard items
const dashboardItems = [
  {
    title: "Network Status",
    value: "Online",
    status: "success",
    icon: Wifi
  },
  {
    title: "Security Level",
    value: "High",
    status: "success", 
    icon: Shield
  },
  {
    title: "Active Connections",
    value: "24",
    status: "normal",
    icon: Activity
  },
  {
    title: "Performance",
    value: "Excellent",
    status: "success",
    icon: Zap
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-success text-success-foreground';
    case 'warning':
      return 'bg-warning text-warning-foreground';
    case 'error':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const NetworkDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Top Summary Section */}
      <Card className="bg-gradient-card border-border shadow-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Network Dashboard
              </h2>
              <p className="text-sm text-muted-foreground">
                Monitoring your home network in real-time
              </p>
            </div>
            <Badge variant="outline" className="border-success text-success">
              Online
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summaryItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-center space-x-3 p-4 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-2 rounded-full ${
                    item.status === 'success' ? 'bg-success/20' :
                    item.status === 'warning' ? 'bg-warning/20' :
                    item.status === 'error' ? 'bg-destructive/20' :
                    'bg-muted/20'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      item.status === 'success' ? 'text-success' :
                      item.status === 'warning' ? 'text-warning' :
                      item.status === 'error' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`} />
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
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
      </Card>

      {/* Detailed Dashboard Section */}
      <Card className="bg-gradient-card border-border shadow-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Network Dashboard
            </h2>
            <Badge variant="outline" className="border-primary text-primary">
              All Systems Normal
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-3 rounded-full ${
                    item.status === 'success' ? 'bg-success/20' :
                    item.status === 'warning' ? 'bg-warning/20' :
                    item.status === 'error' ? 'bg-destructive/20' :
                    'bg-muted/20'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      item.status === 'success' ? 'text-success' :
                      item.status === 'warning' ? 'text-warning' :
                      item.status === 'error' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`} />
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
      </Card>
    </div>
  );
};