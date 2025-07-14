import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Laptop, 
  Smartphone, 
  Tv, 
  Gamepad, 
  Router, 
  Tablet,
  Speaker,
  Camera
} from "lucide-react";

interface Device {
  id: string;
  name: string;
  type: string;
  ip: string;
  status: 'online' | 'offline' | 'idle';
  bandwidth: string;
  icon: React.ComponentType<{ className?: string }>;
}

const devices: Device[] = [
  {
    id: '1',
    name: 'MacBook Pro',
    type: 'Computer',
    ip: '192.168.1.101',
    status: 'online',
    bandwidth: '45.2 MB/s',
    icon: Laptop
  },
  {
    id: '2',
    name: 'iPhone 15',
    type: 'Mobile',
    ip: '192.168.1.102',
    status: 'online',
    bandwidth: '12.8 MB/s',
    icon: Smartphone
  },
  {
    id: '3',
    name: 'Samsung TV',
    type: 'Smart TV',
    ip: '192.168.1.103',
    status: 'idle',
    bandwidth: '2.1 MB/s',
    icon: Tv
  },
  {
    id: '4',
    name: 'PlayStation 5',
    type: 'Gaming',
    ip: '192.168.1.104',
    status: 'online',
    bandwidth: '78.5 MB/s',
    icon: Gamepad
  },
  {
    id: '5',
    name: 'Router',
    type: 'Network',
    ip: '192.168.1.1',
    status: 'online',
    bandwidth: '0.5 MB/s',
    icon: Router
  },
  {
    id: '6',
    name: 'iPad Air',
    type: 'Tablet',
    ip: '192.168.1.105',
    status: 'offline',
    bandwidth: '0 MB/s',
    icon: Tablet
  },
  {
    id: '7',
    name: 'HomePod',
    type: 'Smart Speaker',
    ip: '192.168.1.106',
    status: 'online',
    bandwidth: '1.2 MB/s',
    icon: Speaker
  },
  {
    id: '8',
    name: 'Security Camera',
    type: 'IoT Device',
    ip: '192.168.1.107',
    status: 'online',
    bandwidth: '5.8 MB/s',
    icon: Camera
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-success text-success-foreground';
    case 'idle':
      return 'bg-warning text-warning-foreground';
    case 'offline':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const DeviceGrid = () => {
  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Connected Devices
          </h2>
          <Badge variant="outline" className="border-primary text-primary">
            {devices.filter(d => d.status === 'online').length} Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          {devices.map((device, index) => {
            const Icon = device.icon;
            return (
              <div
                key={device.id}
                className="flex items-center space-x-4 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-3 rounded-full ${
                  device.status === 'online' ? 'bg-success/20' :
                  device.status === 'idle' ? 'bg-warning/20' :
                  'bg-destructive/20'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    device.status === 'online' ? 'text-success' :
                    device.status === 'idle' ? 'text-warning' :
                    'text-destructive'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-foreground truncate">
                      {device.name}
                    </p>
                    <Badge 
                      className={`text-xs ${getStatusColor(device.status)}`}
                    >
                      {device.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {device.type} • {device.ip}
                  </p>
                  <p className="text-sm text-accent font-medium">
                    {device.bandwidth}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};