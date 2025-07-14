import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  Shield,
  Wifi
} from "lucide-react";

interface Alert {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  resolved: boolean;
}

const alerts: Alert[] = [
  {
    id: '1',
    type: 'success',
    title: 'Security Update',
    message: 'Router firmware updated successfully',
    time: '2 hours ago',
    resolved: true
  },
  {
    id: '2',
    type: 'warning',
    title: 'High Bandwidth Usage',
    message: 'PlayStation 5 using 78.5 MB/s',
    time: '5 minutes ago',
    resolved: false
  },
  {
    id: '3',
    type: 'info',
    title: 'New Device Connected',
    message: 'iPad Air joined the network',
    time: '1 hour ago',
    resolved: false
  },
  {
    id: '4',
    type: 'error',
    title: 'Connection Timeout',
    message: 'Smart TV lost connection briefly',
    time: '3 hours ago',
    resolved: true
  }
];

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'success':
      return CheckCircle;
    case 'warning':
      return AlertTriangle;
    case 'error':
      return X;
    default:
      return Info;
  }
};

const getAlertColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    case 'error':
      return 'text-destructive';
    default:
      return 'text-primary';
  }
};

const getBadgeColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-success text-success-foreground';
    case 'warning':
      return 'bg-warning text-warning-foreground';
    case 'error':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-primary text-primary-foreground';
  }
};

export const AlertPanel = () => {
  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Alerts & Notifications
          </h2>
          <Badge 
            variant="outline" 
            className={`border-warning text-warning ${
              activeAlerts.length > 0 ? 'animate-pulse-glow' : ''
            }`}
          >
            {activeAlerts.length} Active
          </Badge>
        </div>

        <div className="space-y-4">
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-muted-foreground">All systems normal</p>
            </div>
          ) : (
            activeAlerts.map((alert, index) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-muted/20 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-1 rounded-full`}>
                    <Icon className={`w-4 h-4 ${getAlertColor(alert.type)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-foreground text-sm">
                        {alert.title}
                      </p>
                      <Badge className={`text-xs ${getBadgeColor(alert.type)}`}>
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.time}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {resolvedAlerts.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Recently Resolved</p>
              {resolvedAlerts.slice(0, 2).map((alert, index) => {
                const Icon = getAlertIcon(alert.type);
                return (
                  <div
                    key={alert.id}
                    className="flex items-start space-x-3 p-2 rounded-lg opacity-50"
                  >
                    <div className="p-1 rounded-full">
                      <Icon className={`w-3 h-3 ${getAlertColor(alert.type)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-xs">
                        {alert.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};