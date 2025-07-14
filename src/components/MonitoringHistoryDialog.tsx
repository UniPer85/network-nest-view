import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Clock, TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ensureMonitoringData } from "@/utils/monitoringData";

interface MonitoringHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: 'device' | 'service' | 'component';
  itemId: string;
  itemName: string;
  currentStatus: string;
}

interface HistoryData {
  id: string;
  status: string;
  response_time: number | null;
  bandwidth_up: number | null;
  bandwidth_down: number | null;
  cpu_usage: number | null;
  memory_usage: number | null;
  storage_usage: number | null;
  recorded_at: string;
  additional_metrics: any;
}

type TimeRange = '1h' | '24h' | '7d' | '30d' | '1y';

const timeRangeOptions = [
  { value: '1h' as TimeRange, label: '1 Hour', hours: 1 },
  { value: '24h' as TimeRange, label: '24 Hours', hours: 24 },
  { value: '7d' as TimeRange, label: '7 Days', hours: 24 * 7 },
  { value: '30d' as TimeRange, label: '30 Days', hours: 24 * 30 },
  { value: '1y' as TimeRange, label: '1 Year', hours: 24 * 365 },
];

export const MonitoringHistoryDialog = ({
  open,
  onOpenChange,
  itemType,
  itemId,
  itemName,
  currentStatus
}: MonitoringHistoryDialogProps) => {
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const { toast } = useToast();

  const fetchHistoryData = async (range: TimeRange) => {
    setLoading(true);
    try {
      // Ensure sample data exists for demonstration
      await ensureMonitoringData(itemType, itemId, itemName);
      
      const hoursBack = timeRangeOptions.find(opt => opt.value === range)?.hours || 24;
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - hoursBack);

      const { data, error } = await supabase
        .from('monitoring_history')
        .select('*')
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .gte('recorded_at', startTime.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      setHistoryData(data || []);
    } catch (error) {
      console.error('Error fetching history data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch monitoring history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchHistoryData(timeRange);
    }
  }, [open, timeRange, itemType, itemId]);

  const formatChartData = (data: HistoryData[]) => {
    return data.map(item => ({
      time: new Date(item.recorded_at).toLocaleString(),
      timestamp: new Date(item.recorded_at).getTime(),
      responseTime: item.response_time || 0,
      bandwidthUp: item.bandwidth_up ? Math.round(item.bandwidth_up / 1024 / 1024) : 0, // Convert to MB/s
      bandwidthDown: item.bandwidth_down ? Math.round(item.bandwidth_down / 1024 / 1024) : 0,
      cpuUsage: item.cpu_usage || 0,
      memoryUsage: item.memory_usage || 0,
      storageUsage: item.storage_usage || 0,
      status: item.status
    }));
  };

  const chartData = formatChartData(historyData);
  const lastStateChange = historyData.length > 0 ? new Date(historyData[historyData.length - 1].recorded_at) : null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return 'bg-success text-success-foreground';
      case 'offline': return 'bg-destructive text-destructive-foreground';
      case 'idle': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              <span>{itemName} - Monitoring History</span>
            </div>
            <Badge className={getStatusColor(currentStatus)}>
              {currentStatus}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time Range Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Time Range:</span>
            </div>
            <div className="flex gap-2">
              {timeRangeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={timeRange === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Status Info */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/20">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <p className="font-semibold">{currentStatus}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-accent/20">
                  <Clock className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-semibold">
                    {lastStateChange ? lastStateChange.toLocaleString() : 'No data'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-success/20">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Points</p>
                  <p className="font-semibold">{historyData.length}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Charts */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : chartData.length > 0 ? (
            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="bandwidth">Bandwidth</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Response Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        formatter={(value: number) => [`${value}ms`, 'Response Time']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="responseTime" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>

              <TabsContent value="bandwidth" className="space-y-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Bandwidth Usage</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        formatter={(value: number, name: string) => [
                          `${value} MB/s`, 
                          name === 'bandwidthUp' ? 'Upload' : 'Download'
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="bandwidthDown"
                        stackId="1"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="bandwidthUp"
                        stackId="1"
                        stroke="hsl(var(--accent))"
                        fill="hsl(var(--accent))"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">CPU Usage</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleString()}
                          formatter={(value: number) => [`${value}%`, 'CPU Usage']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cpuUsage" 
                          stroke="hsl(var(--warning))" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleString()}
                          formatter={(value: number) => [`${value}%`, 'Memory Usage']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="memoryUsage" 
                          stroke="hsl(var(--accent))" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Storage Usage</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleString()}
                          formatter={(value: number) => [`${value}%`, 'Storage Usage']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="storageUsage" 
                          stroke="hsl(var(--success))" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="p-8 text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Historical Data</h3>
              <p className="text-muted-foreground">
                No monitoring data available for the selected time range.
              </p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};