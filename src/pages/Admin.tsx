import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  Server, 
  Router,
  Activity,
  Eye,
  Container,
  Database,
  Globe
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MonitoredDevice {
  id: string;
  user_id: string;
  name: string;
  device_type: 'unifi_controller' | 'unifi_switch' | 'unifi_access_point' | 'unifi_gateway' | 'generic';
  host: string;
  username?: string;
  password?: string;
  api_key?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

interface MonitoredService {
  id: string;
  user_id: string;
  name: string;
  service_type: 'http' | 'https' | 'ping' | 'tcp' | 'dns' | 'udp' | 'docker_server' | 'docker_container' | 'sql' | 'mqtt';
  host: string;
  port?: number;
  path?: string;
  expected_response?: string;
  timeout?: number;
  check_interval?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [devices, setDevices] = useState<MonitoredDevice[]>([]);
  const [services, setServices] = useState<MonitoredService[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<MonitoredDevice | null>(null);
  const [editingService, setEditingService] = useState<MonitoredService | null>(null);
  const [activeTab, setActiveTab] = useState<'devices' | 'services'>('devices');
  
  // Device form state
  const [deviceForm, setDeviceForm] = useState<{
    name: string;
    device_type: 'unifi_controller' | 'unifi_switch' | 'unifi_access_point' | 'unifi_gateway' | 'generic';
    host: string;
    username: string;
    password: string;
    api_key: string;
    is_active: boolean;
  }>({
    name: '',
    device_type: 'generic',
    host: '',
    username: '',
    password: '',
    api_key: '',
    is_active: true
  });

  // Service form state
  const [serviceForm, setServiceForm] = useState<{
    name: string;
    service_type: 'http' | 'https' | 'ping' | 'tcp' | 'dns' | 'udp' | 'docker_server' | 'docker_container' | 'sql' | 'mqtt';
    host: string;
    port: string;
    path: string;
    expected_response: string;
    timeout: string;
    check_interval: string;
    is_active: boolean;
  }>({
    name: '',
    service_type: 'http',
    host: '',
    port: '',
    path: '',
    expected_response: '',
    timeout: '30',
    check_interval: '300',
    is_active: true
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [devicesResult, servicesResult] = await Promise.all([
        supabase.from('monitored_devices').select('*').order('created_at', { ascending: false }),
        supabase.from('monitored_services').select('*').order('created_at', { ascending: false })
      ]);

      if (devicesResult.error) throw devicesResult.error;
      if (servicesResult.error) throw servicesResult.error;

      setDevices(devicesResult.data || []);
      setServices(servicesResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deviceForm.name || !deviceForm.host) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingDevice) {
        const { error } = await supabase
          .from('monitored_devices')
          .update({
            name: deviceForm.name,
            device_type: deviceForm.device_type,
            host: deviceForm.host,
            username: deviceForm.username || null,
            password: deviceForm.password || null,
            api_key: deviceForm.api_key || null,
            is_active: deviceForm.is_active
          })
          .eq('id', editingDevice.id);

        if (error) throw error;
        toast({ title: "Success", description: "Device updated successfully" });
      } else {
        const { error } = await supabase
          .from('monitored_devices')
          .insert({
            name: deviceForm.name,
            device_type: deviceForm.device_type,
            host: deviceForm.host,
            username: deviceForm.username || null,
            password: deviceForm.password || null,
            api_key: deviceForm.api_key || null,
            is_active: deviceForm.is_active,
            user_id: user?.id
          });

        if (error) throw error;
        toast({ title: "Success", description: "Device created successfully" });
      }

      resetDeviceForm();
      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving device:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save device",
        variant: "destructive"
      });
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceForm.name || !serviceForm.host) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const serviceData = {
        name: serviceForm.name,
        service_type: serviceForm.service_type,
        host: serviceForm.host,
        port: serviceForm.port ? parseInt(serviceForm.port) : null,
        path: serviceForm.path || null,
        expected_response: serviceForm.expected_response || null,
        timeout: serviceForm.timeout ? parseInt(serviceForm.timeout) : null,
        check_interval: serviceForm.check_interval ? parseInt(serviceForm.check_interval) : null,
        is_active: serviceForm.is_active
      };

      if (editingService) {
        const { error } = await supabase
          .from('monitored_services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        toast({ title: "Success", description: "Service updated successfully" });
      } else {
        const { error } = await supabase
          .from('monitored_services')
          .insert({ ...serviceData, user_id: user?.id });

        if (error) throw error;
        toast({ title: "Success", description: "Service created successfully" });
      }

      resetServiceForm();
      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save service",
        variant: "destructive"
      });
    }
  };

  const resetDeviceForm = () => {
    setDeviceForm({
      name: '',
      device_type: 'generic',
      host: '',
      username: '',
      password: '',
      api_key: '',
      is_active: true
    });
    setEditingDevice(null);
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      service_type: 'http',
      host: '',
      port: '',
      path: '',
      expected_response: '',
      timeout: '30',
      check_interval: '300',
      is_active: true
    });
    setEditingService(null);
  };

  const handleEditDevice = (device: MonitoredDevice) => {
    setEditingDevice(device);
    setDeviceForm({
      name: device.name,
      device_type: device.device_type,
      host: device.host,
      username: device.username || '',
      password: device.password || '',
      api_key: device.api_key || '',
      is_active: device.is_active ?? true
    });
    setActiveTab('devices');
    setDialogOpen(true);
  };

  const handleEditService = (service: MonitoredService) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      service_type: service.service_type,
      host: service.host,
      port: service.port?.toString() || '',
      path: service.path || '',
      expected_response: service.expected_response || '',
      timeout: service.timeout?.toString() || '30',
      check_interval: service.check_interval?.toString() || '300',
      is_active: service.is_active ?? true
    });
    setActiveTab('services');
    setDialogOpen(true);
  };

  const handleDeleteDevice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return;

    try {
      const { error } = await supabase.from('monitored_devices').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Device deleted successfully" });
      loadData();
    } catch (error: any) {
      console.error('Error deleting device:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete device",
        variant: "destructive"
      });
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase.from('monitored_services').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Service deleted successfully" });
      loadData();
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'destructive';
  };

  const getDeviceTypeIcon = (type: string) => {
    switch (type) {
      case 'unifi_controller': return <Server className="h-4 w-4" />;
      case 'unifi_switch': return <Router className="h-4 w-4" />;
      case 'unifi_gateway': return <Router className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'http':
      case 'https': return <Globe className="h-4 w-4" />;
      case 'docker_server': return <Server className="h-4 w-4" />;
      case 'docker_container': return <Container className="h-4 w-4" />;
      case 'sql': return <Database className="h-4 w-4" />;
      case 'ping':
      case 'tcp':
      case 'udp':
      case 'dns':
      case 'mqtt':
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Network Admin Panel</h1>
            <p className="text-muted-foreground">Manage monitored network components</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Dashboard
            </Button>
            <Button
              variant="destructive"
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'devices' | 'services')}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    if (activeTab === 'devices') {
                      resetDeviceForm();
                    } else {
                      resetServiceForm();
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add {activeTab === 'devices' ? 'Device' : 'Service'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {activeTab === 'devices' 
                      ? (editingDevice ? 'Edit Device' : 'Add New Device')
                      : (editingService ? 'Edit Service' : 'Add New Service')}
                  </DialogTitle>
                </DialogHeader>
                
                {activeTab === 'devices' ? (
                  <form onSubmit={handleDeviceSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={deviceForm.name}
                        onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                        placeholder="UniFi Controller"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="device_type">Device Type</Label>
                      <Select
                        value={deviceForm.device_type}
                        onValueChange={(value: any) => setDeviceForm({ ...deviceForm, device_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unifi_controller">UniFi Controller</SelectItem>
                          <SelectItem value="unifi_switch">UniFi Switch</SelectItem>
                          <SelectItem value="unifi_access_point">UniFi Access Point</SelectItem>
                          <SelectItem value="unifi_gateway">UniFi Gateway</SelectItem>
                          <SelectItem value="generic">Generic Device</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="host">Host *</Label>
                      <Input
                        id="host"
                        value={deviceForm.host}
                        onChange={(e) => setDeviceForm({ ...deviceForm, host: e.target.value })}
                        placeholder="192.168.1.1"
                        required
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingDevice ? 'Update' : 'Create'} Device
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="service_name">Name *</Label>
                      <Input
                        id="service_name"
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                        placeholder="Web Server"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="service_type">Service Type</Label>
                      <Select
                        value={serviceForm.service_type}
                        onValueChange={(value: any) => setServiceForm({ ...serviceForm, service_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="http">HTTP</SelectItem>
                          <SelectItem value="https">HTTPS</SelectItem>
                          <SelectItem value="ping">Ping</SelectItem>
                          <SelectItem value="tcp">TCP</SelectItem>
                          <SelectItem value="udp">UDP</SelectItem>
                          <SelectItem value="dns">DNS</SelectItem>
                          <SelectItem value="docker_server">Docker Server</SelectItem>
                          <SelectItem value="docker_container">Docker Container</SelectItem>
                          <SelectItem value="sql">SQL Database</SelectItem>
                          <SelectItem value="mqtt">MQTT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service_host">Host *</Label>
                      <Input
                        id="service_host"
                        value={serviceForm.host}
                        onChange={(e) => setServiceForm({ ...serviceForm, host: e.target.value })}
                        placeholder="192.168.1.100"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        value={serviceForm.port}
                        onChange={(e) => setServiceForm({ ...serviceForm, port: e.target.value })}
                        placeholder="80"
                        type="number"
                      />
                    </div>

                    {(serviceForm.service_type === 'http' || serviceForm.service_type === 'https') && (
                      <div className="space-y-2">
                        <Label htmlFor="path">Path</Label>
                        <Input
                          id="path"
                          value={serviceForm.path}
                          onChange={(e) => setServiceForm({ ...serviceForm, path: e.target.value })}
                          placeholder="/api/health"
                        />
                      </div>
                    )}

                    {serviceForm.service_type === 'docker_container' && (
                      <div className="space-y-2">
                        <Label htmlFor="expected_response">Container Name</Label>
                        <Input
                          id="expected_response"
                          value={serviceForm.expected_response}
                          onChange={(e) => setServiceForm({ ...serviceForm, expected_response: e.target.value })}
                          placeholder="my-container"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="timeout">Timeout (s)</Label>
                        <Input
                          id="timeout"
                          value={serviceForm.timeout}
                          onChange={(e) => setServiceForm({ ...serviceForm, timeout: e.target.value })}
                          placeholder="30"
                          type="number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="check_interval">Check Interval (s)</Label>
                        <Input
                          id="check_interval"
                          value={serviceForm.check_interval}
                          onChange={(e) => setServiceForm({ ...serviceForm, check_interval: e.target.value })}
                          placeholder="300"
                          type="number"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingService ? 'Update' : 'Create'} Service
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="devices">
            <Card>
              <CardContent className="p-0">
                {devices.length === 0 ? (
                  <div className="p-8 text-center">
                    <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No devices yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first network device to start monitoring
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Host</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devices.map((device) => (
                        <TableRow key={device.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getDeviceTypeIcon(device.device_type)}
                              {device.name}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{device.device_type.replace(/_/g, ' ')}</TableCell>
                          <TableCell className="font-mono">{device.host}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(device.is_active ?? false)}>
                              {device.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDevice(device)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDevice(device.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardContent className="p-0">
                {services.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No services yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first service to start monitoring
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Host</TableHead>
                        <TableHead>port</TableHead>
                        <TableHead>Interval</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getServiceTypeIcon(service.service_type)}
                              {service.name}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{service.service_type.replace(/_/g, ' ')}</TableCell>
                          <TableCell className="font-mono">{service.host}</TableCell>
                          <TableCell>{service.port || '-'}</TableCell>
                          <TableCell>{service.check_interval || 300}s</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(service.is_active ?? false)}>
                              {service.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditService(service)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteService(service.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;