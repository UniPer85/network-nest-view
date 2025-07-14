import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi3D, Shield3D, Activity3D, Globe3D } from "@/components/icons/NetworkIcons3D";

export const NetworkHeader = () => {
  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Network Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitoring your home network in real-time
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-success text-success-foreground animate-pulse-glow">
              <div className="w-2 h-2 bg-success-foreground rounded-full mr-2"></div>
              Online
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center">
              <Wifi3D size={32} color="hsl(var(--primary))" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connection</p>
              <p className="font-semibold text-foreground">Excellent</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center">
              <Shield3D size={32} color="hsl(var(--success))" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Security</p>
              <p className="font-semibold text-foreground">Protected</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center">
              <Activity3D size={32} color="hsl(var(--accent))" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Speed</p>
              <p className="font-semibold text-foreground">247 Mbps</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center">
              <Globe3D size={32} color="hsl(var(--primary))" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Public IP</p>
              <p className="font-semibold text-foreground">192.168.1.1</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};