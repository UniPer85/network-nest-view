import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Wifi, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NetworkScanDialogProps {
  onScanComplete: () => void;
  disabled?: boolean;
}

const NetworkScanDialog = ({ onScanComplete, disabled }: NetworkScanDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [ipRanges, setIpRanges] = useState(['192.168.1.0/24']);
  const [newRange, setNewRange] = useState('');
  const { toast } = useToast();

  // Auto-detect local IP range
  const detectLocalRange = () => {
    // This is a simplified detection - in a real app you might use WebRTC or other methods
    const commonRanges = [
      '192.168.1.0/24',
      '192.168.0.0/24', 
      '10.0.0.0/24',
      '172.16.0.0/24'
    ];
    
    // Default to most common home network range
    if (!ipRanges.includes('192.168.1.0/24')) {
      setIpRanges(['192.168.1.0/24', ...ipRanges]);
    }
  };

  const addRange = () => {
    if (newRange && !ipRanges.includes(newRange)) {
      // Validate CIDR format
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

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('network-scan', {
        method: 'POST',
        body: { ipRanges }
      });

      if (error) throw error;

      toast({
        title: "Network Scan Complete",
        description: data.message,
      });

      setOpen(false);
      onScanComplete();
    } catch (error: any) {
      console.error('Network scan error:', error);
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan network. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          disabled={disabled || isScanning}
          variant="outline"
          className="w-full"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Scanning Network...
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 mr-2" />
              Scan My Network
            </>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Network Scan Configuration</DialogTitle>
          <DialogDescription>
            Configure IP ranges to scan for devices on your network. The scanner will discover device types, manufacturers, uptime, and more.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
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
              placeholder="e.g., 192.168.2.0/24"
              value={newRange}
              onChange={(e) => setNewRange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRange()}
            />
            <Button size="sm" onClick={addRange} disabled={!newRange}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={detectLocalRange}
            className="w-full"
          >
            Auto-detect Local Network
          </Button>
          
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium mb-1">What will be scanned:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Device types (Router, PC, Phone, IoT, etc.)</li>
              <li>• Manufacturer information</li>
              <li>• Device uptime and availability</li>
              <li>• Open ports and services</li>
              <li>• Response times</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleScan} 
            disabled={isScanning}
            className="w-full"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Scanning {ipRanges.length} Range{ipRanges.length > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 mr-2" />
                Start Network Scan
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkScanDialog;