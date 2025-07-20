import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, RefreshCw, Home, ExternalLink, CheckCircle, Wifi, Key, ArrowLeft, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import NetworkScanDialog from "@/components/NetworkScanDialog";

interface HAConfig {
  id: string;
  api_key: string;
  ha_instance_name: string;
  ha_instance_url: string | null;
  enabled: boolean;
  created_at: string;
}

const HomeAssistant = () => {
  const [config, setConfig] = useState<HAConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConfig();
    }
  }, [user]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('homeassistant-config', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast({
        title: "Error",
        description: "Failed to load Home Assistant configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAPIKey = async () => {
    setGenerating(true);
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      const response = await supabase.functions.invoke('homeassistant-config', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: {
          ha_instance_name: "NetworkNest Integration",
          enabled: true
        }
      });

      if (response.error) {
        throw response.error;
      }

      if (!response.data) {
        throw new Error('No data received from server');
      }

      setConfig(response.data);
      toast({
        title: "Success",
        description: "API key generated successfully",
      });
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the Home Assistant integration?')) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke('homeassistant-config', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      setConfig(null);
      toast({
        title: "Success",
        description: "Home Assistant integration deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting config:', error);
      toast({
        title: "Error",
        description: "Failed to delete Home Assistant configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const baseUrl = window.location.origin;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto p-6 space-y-6">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Home Assistant Integration</h1>
            {config && (
              <Badge variant={config.enabled ? "default" : "secondary"}>
                {config.enabled ? "Active" : "Disabled"}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>

      {!config && (
        <Card>
          <CardHeader>
            <CardTitle>Setup NetworkNest Integration</CardTitle>
            <CardDescription>
              Generate an API key and optionally scan your network for devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={generateAPIKey} 
              disabled={generating}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {generating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
              Generate API Key
            </Button>
            
            <NetworkScanDialog onScanComplete={fetchConfig} />
            
            <p className="text-sm text-muted-foreground">
              The network scan will replace demo devices with your actual network devices.
            </p>
          </CardContent>
        </Card>
      )}

      {config && (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>
                    Use these endpoints and API key in your Home Assistant configuration
                  </CardDescription>
                </div>
                <NetworkScanDialog onScanComplete={fetchConfig} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input value={config.api_key} readOnly className="font-mono text-sm" />
                  <Button size="sm" onClick={() => copyToClipboard(config.api_key)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>API Endpoints</Label>
                
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Discovery</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={`${baseUrl}/functions/v1/homeassistant-discovery`} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button size="sm" onClick={() => copyToClipboard(`${baseUrl}/functions/v1/homeassistant-discovery`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">States</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={`${baseUrl}/functions/v1/homeassistant-states`} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button size="sm" onClick={() => copyToClipboard(`${baseUrl}/functions/v1/homeassistant-states`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Home Assistant Setup Instructions</CardTitle>
              <CardDescription>
                Follow these steps to integrate NetworkNest with your Home Assistant instance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">📋 Setup Steps:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Copy the API key above</li>
                        <li>Add the configuration below to your Home Assistant <code>configuration.yaml</code></li>
                        <li>Restart Home Assistant</li>
                        <li>The NetworkNest sensors will appear in your Home Assistant</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">🔗 Connection Method:</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Your Home Assistant connects to NetworkNest using the API key (not the other way around). 
                        This works with both local Home Assistant installations and Home Assistant Cloud.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">📄 Configuration:</h4>
                      <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`# NetworkNest Integration
rest:
  - resource: https://jwqmtmapnvncrwixouek.supabase.co/functions/v1/homeassistant-states
    headers:
      x-api-key: "${config.api_key}"
    scan_interval: 30
    sensor:
      - name: "NetworkNest Bandwidth Down"
        value_template: "{{ value_json.bandwidth_down | default(0) }}"
        unit_of_measurement: "Mbps"
        device_class: data_rate
        icon: mdi:download
      - name: "NetworkNest Bandwidth Up"
        value_template: "{{ value_json.bandwidth_up | default(0) }}"
        unit_of_measurement: "Mbps"
        device_class: data_rate
        icon: mdi:upload
      - name: "NetworkNest Connected Devices"
        value_template: "{{ value_json.connected_devices | default(0) }}"
        icon: mdi:devices
      - name: "NetworkNest Network Uptime"
        value_template: "{{ value_json.uptime_hours | default(0) }}"
        unit_of_measurement: "h"
        device_class: duration
        icon: mdi:clock-outline
    binary_sensor:
      - name: "NetworkNest Status"
        value_template: "{{ value_json.status == 'online' }}"
        device_class: connectivity
        icon: mdi:network`}
                      </pre>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </>
      )}
      </div>
    </div>
  );
};

export default HomeAssistant;