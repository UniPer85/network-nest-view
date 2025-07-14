import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NetworkHeader } from "@/components/NetworkHeader";
import { DeviceGrid } from "@/components/DeviceGrid";
import { BandwidthChart } from "@/components/BandwidthChart";
import { NetworkStats } from "@/components/NetworkStats";
import { AlertPanel } from "@/components/AlertPanel";
import { Settings } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <NetworkHeader />
          <Link to="/auth">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Admin Panel
            </Button>
          </Link>
        </div>
        
        <div className="space-y-6">
          {/* Network Statistics at the top, small on the right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Empty space to push NetworkStats to the right */}
            </div>
            <div>
              <NetworkStats />
            </div>
          </div>
          
          {/* Bandwidth Usage and Connected Devices with Alert Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <BandwidthChart />
              <DeviceGrid />
            </div>
            <div>
              <AlertPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
