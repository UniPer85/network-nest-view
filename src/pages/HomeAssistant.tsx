import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, RefreshCw, Home, ExternalLink, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
  const [formData, setFormData] = useState({
    ha_instance_name: "",
    ha_instance_url: "",
    enabled: true
  });
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
        setFormData({
          ha_instance_name: data.ha_instance_name,
          ha_instance_url: data.ha_instance_url || "",
          enabled: data.enabled
        });
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const session = await supabase.auth.getSession();
      console.log('Session data:', session.data);
      console.log('Form data before sending:', formData);
      
      // Validate form data before sending
      if (!formData.ha_instance_name || formData.ha_instance_name.trim() === '') {
        throw new Error('Home Assistant Instance Name is required');
      }
      
      const method = config ? 'PUT' : 'POST';
      console.log('Using method:', method);
      
      const requestBody = {
        ha_instance_name: formData.ha_instance_name.trim(),
        ha_instance_url: formData.ha_instance_url?.trim() || null,
        enabled: formData.enabled
      };
      
      console.log('Request body to send:', requestBody);
      console.log('Request body JSON:', JSON.stringify(requestBody));
      
      const response = await supabase.functions.invoke('homeassistant-config', {
        method,
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: requestBody
      });

      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response error:', response.error);

      // Check for function errors (non-2xx responses)
      if (response.error) {
        console.error('Function error details:', response.error);
        throw response.error;
      }

      // Check if data exists and has the expected structure
      if (!response.data) {
        throw new Error('No data received from server');
      }

      const configData = response.data;
      console.log('Config data to set:', configData);
      
      setConfig(configData);
      toast({
        title: "Success",
        description: `Home Assistant integration ${config ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving config:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Full error object:', error);
      
      // Try to extract more details from FunctionsHttpError
      if (error?.context) {
        console.error('Error context:', error.context);
      }
      
      let errorMessage = 'Unknown error occurred';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.toString) {
        errorMessage = error.toString();
      }
      
      toast({
        title: "Error",
        description: `Failed to save Home Assistant configuration: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
      setFormData({
        ha_instance_name: "",
        ha_instance_url: "",
        enabled: true
      });
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Home className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Home Assistant Integration</h1>
        {config && (
          <Badge variant={config.enabled ? "default" : "secondary"}>
            {config.enabled ? "Active" : "Disabled"}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Set up your NetworkNest integration with Home Assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instance-name">Home Assistant Instance Name</Label>
            <Input
              id="instance-name"
              placeholder="My Home Assistant"
              value={formData.ha_instance_name}
              onChange={(e) => setFormData({...formData, ha_instance_name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instance-url">Home Assistant URL (Optional)</Label>
            <Input
              id="instance-url"
              placeholder="http://homeassistant.local:8123"
              value={formData.ha_instance_url}
              onChange={(e) => setFormData({...formData, ha_instance_url: e.target.value})}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({...formData, enabled: checked})}
            />
            <Label htmlFor="enabled">Enable Integration</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving || !formData.ha_instance_name}>
              {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {config ? 'Update' : 'Create'} Integration
            </Button>
            {config && (
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                Delete Integration
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {config && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Use these endpoints and API key in your Home Assistant configuration
              </CardDescription>
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
              <CardTitle>Home Assistant Setup</CardTitle>
              <CardDescription>
                Add this configuration to your Home Assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>Add the following to your <code>configuration.yaml</code>:</p>
                    <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`# NetworkNest Integration
rest:
  - resource: ${baseUrl}/functions/v1/homeassistant-states
    headers:
      x-api-key: "${config.api_key}"
    scan_interval: 30
    sensor:
      - name: "Network Bandwidth"
        value_template: "{{ value_json[0].state }}"
        unit_of_measurement: "Mbps"
        device_class: data_rate
        icon: mdi:speedometer
      - name: "Connected Devices"
        value_template: "{{ value_json[1].state }}"
        icon: mdi:devices
      - name: "Network Uptime"
        value_template: "{{ value_json[3].state }}"
        unit_of_measurement: "h"
        device_class: duration
        icon: mdi:clock-outline
    binary_sensor:
      - name: "Network Status"
        value_template: "{{ value_json[2].state }}"
        device_class: connectivity
        icon: mdi:network`}
                    </pre>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default HomeAssistant;