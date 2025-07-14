import { NetworkHeader } from "@/components/NetworkHeader";
import { DeviceGrid } from "@/components/DeviceGrid";
import { BandwidthChart } from "@/components/BandwidthChart";
import { NetworkStats } from "@/components/NetworkStats";
import { AlertPanel } from "@/components/AlertPanel";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto p-6 space-y-6">
        <NetworkHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BandwidthChart />
            <DeviceGrid />
          </div>
          
          <div className="space-y-6">
            <NetworkStats />
            <AlertPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
