import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Wifi, Search, Plus, X, Router, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NetworkDiscoveryDialogProps {
  onDevicesAdded: () => void;
}

const NetworkDiscoveryDialog = ({ onDevicesAdded }: NetworkDiscoveryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeMethod, setActiveMethod] = useState<'unifi' | 'router' | 'manual'>('unifi');
  const { toast } = useToast();

  // UniFi Controller Settings
  const [unifiSettings, setUnifiSettings] = useState({
    host: '',
    username: '',
    password: '',
    port: '8443',
    site: 'default'
  });

  // Router Settings
  const [routerSettings, setRouterSettings] = useState({
    host: '',
    username: '',
    password: '',
    snmpCommunity: 'public'
  });

  // Manual IP Range Settings
  const [ipRanges, setIpRanges] = useState(['192.168.1.0/24']);
  const [newRange, setNewRange] = useState('');

  const addRange = () => {
    if (newRange && !ipRanges.includes(newRange)) {
      const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
      if (cidrRegex.test(newRange)) {
        setIpRanges([...ipRanges, newRange]);
        setNewRange('');
      } else {
        toast({
          title: "Invalid Format",
          description: "Please enter a valid CIDR notation (e.g., 192.168.1.0/24)",
          variant: "destructive",
        });
      }
    }
  };

  const removeRange = (index: number) => {
    if (ipRanges.length > 1) {
      setIpRanges(ipRanges.filter((_, i) => i !== index));
    }
  };

  const clearDemoDevices = async () => {
    try {
      const { error } = await supabase
        .from('monitoring_history')
        .delete()
        .in('item_id', [
          'device_1', 'device_2', 'device_3', 'device_4', 
          'device_5', 'device_6', 'device_7', 'device_8'
        ]);

      if (error) throw error;
      console.log('Demo devices cleared successfully');
    } catch (error) {
      console.error('Error clearing demo devices:', error);
    }
  };

  const handleUniFiScan = async () => {
    if (!unifiSettings.host || !unifiSettings.username || !unifiSettings.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all UniFi controller details",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('unifi-discovery', {
        method: 'POST',
        body: {
          type: 'unifi',
          settings: unifiSettings
        }
      });

      if (error) throw error;

      await clearDemoDevices();

      toast({
        title: "UniFi Scan Complete",
        description: `Found ${data.devices?.length || 0} devices via UniFi controller`,
      });

      setOpen(false);
      onDevicesAdded();
    } catch (error: any) {
      console.error('UniFi scan error:', error);
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to connect to UniFi controller",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleRouterScan = async () => {
    if (!routerSettings.host) {
      toast({
        title: "Missing Information",
        description: "Please enter router IP address",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('router-discovery', {
        method: 'POST',
        body: {
          type: 'router',
          settings: routerSettings
        }
      });

      if (error) throw error;

      await clearDemoDevices();

      toast({
        title: "Router Scan Complete",
        description: `Found ${data.devices?.length || 0} devices via router`,
      });

      setOpen(false);
      onDevicesAdded();
    } catch (error: any) {
      console.error('Router scan error:', error);
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan router",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualScan = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('network-scan', {
        method: 'POST',
        body: { ipRanges }
      });

      if (error) throw error;

      await clearDemoDevices();

      toast({
        title: "Network Scan Complete",
        description: data.message,
      });

      setOpen(false);
      onDevicesAdded();
    } catch (error: any) {
      console.error('Network scan error:', error);
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan network ranges",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleScan = () => {
    switch (activeMethod) {
      case 'unifi':
        return handleUniFiScan();
      case 'router':
        return handleRouterScan();
      case 'manual':
        return handleManualScan();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Discover Network Devices
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Network Device Discovery</DialogTitle>
          <DialogDescription>
            Automatically discover and add devices to your network monitoring setup
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeMethod} onValueChange={(v) => setActiveMethod(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unifi">UniFi Controller</TabsTrigger>
            <TabsTrigger value="router">Router/SNMP</TabsTrigger>
            <TabsTrigger value="manual">IP Range Scan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="unifi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Router className="h-5 w-5" />
                  UniFi Controller Discovery
                </CardTitle>
                <CardDescription>
                  Connect to your UniFi controller to discover all managed devices with detailed information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Controller IP/Hostname *</Label>
                    <Input
                      value={unifiSettings.host}
                      onChange={(e) => setUnifiSettings({...unifiSettings, host: e.target.value})}
                      placeholder="192.168.1.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Port</Label>
                    <Input
                      value={unifiSettings.port}
                      onChange={(e) => setUnifiSettings({...unifiSettings, port: e.target.value})}
                      placeholder="8443"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Username *</Label>
                    <Input
                      value={unifiSettings.username}
                      onChange={(e) => setUnifiSettings({...unifiSettings, username: e.target.value})}
                      placeholder="admin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={unifiSettings.password}
                      onChange={(e) => setUnifiSettings({...unifiSettings, password: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Site ID</Label>
                  <Input
                    value={unifiSettings.site}
                    onChange={(e) => setUnifiSettings({...unifiSettings, site: e.target.value})}
                    placeholder="default"
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>What we'll discover:</strong> All UniFi devices (APs, switches, gateways), 
                    connected clients with hostnames, device types, connection times, and usage statistics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="router" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Router/SNMP Discovery</CardTitle>
                <CardDescription>
                  Connect to your router via SNMP or web interface to discover connected devices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Router IP *</Label>
                    <Input
                      value={routerSettings.host}
                      onChange={(e) => setRouterSettings({...routerSettings, host: e.target.value})}
                      placeholder="192.168.1.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SNMP Community</Label>
                    <Input
                      value={routerSettings.snmpCommunity}
                      onChange={(e) => setRouterSettings({...routerSettings, snmpCommunity: e.target.value})}
                      placeholder="public"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Admin Username</Label>
                    <Input
                      value={routerSettings.username}
                      onChange={(e) => setRouterSettings({...routerSettings, username: e.target.value})}
                      placeholder="admin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Password</Label>
                    <Input
                      type="password"
                      value={routerSettings.password}
                      onChange={(e) => setRouterSettings({...routerSettings, password: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>What we'll discover:</strong> DHCP lease table, ARP entries, 
                    connected device information via SNMP or router web interface.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manual IP Range Scanning</CardTitle>
                <CardDescription>
                  Scan specific IP ranges to discover devices through port scanning and service detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">IP Ranges to Scan</Label>
                  <div className="mt-2 space-y-2">
                    {ipRanges.map((range, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex-1 justify-between">
                          {range}
                          {ipRanges.length > 1 && (
                            <X 
                              className="w-3 h-3 ml-2 cursor-pointer" 
                              onClick={() => removeRange(index)}
                            />
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 192.168.10.0/24"
                    value={newRange}
                    onChange={(e) => setNewRange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addRange()}
                  />
                  <Button size="sm" onClick={addRange} disabled={!newRange}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <strong>What we'll discover:</strong> Live devices through ping and port scanning, 
                    device types based on open services, basic manufacturer information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleScan} 
            disabled={isScanning}
            className="flex-1"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Discovering Devices...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Start Discovery
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkDiscoveryDialog;