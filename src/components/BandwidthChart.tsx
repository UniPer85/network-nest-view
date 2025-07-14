import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface DataPoint {
  time: string;
  download: number;
  upload: number;
}

export const BandwidthChart = () => {
  const [data, setData] = useState<DataPoint[]>([]);

  // Simulate real-time data updates
  useEffect(() => {
    const generateInitialData = () => {
      const points: DataPoint[] = [];
      const now = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 2000);
        points.push({
          time: time.toLocaleTimeString(),
          download: Math.random() * 100 + 50,
          upload: Math.random() * 30 + 10
        });
      }
      return points;
    };

    setData(generateInitialData());

    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData.slice(1)];
        newData.push({
          time: new Date().toLocaleTimeString(),
          download: Math.random() * 100 + 50,
          upload: Math.random() * 30 + 10
        });
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const maxValue = Math.max(...data.map(d => Math.max(d.download, d.upload)));

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Bandwidth Usage
          </h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">Download</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="text-muted-foreground">Upload</span>
            </div>
          </div>
        </div>

        <div className="h-48 relative">
          <div className="absolute inset-0 flex items-end justify-between space-x-1">
            {data.map((point, index) => (
              <div key={index} className="flex-1 flex flex-col justify-end space-y-1">
                <div
                  className="bg-primary rounded-t transition-all duration-300 min-h-[2px]"
                  style={{
                    height: `${(point.download / maxValue) * 100}%`
                  }}
                />
                <div
                  className="bg-accent rounded-t transition-all duration-300 min-h-[2px]"
                  style={{
                    height: `${(point.upload / maxValue) * 100}%`
                  }}
                />
              </div>
            ))}
          </div>
          
          <div className="absolute left-0 top-0 text-xs text-muted-foreground">
            {maxValue.toFixed(0)} MB/s
          </div>
          <div className="absolute left-0 bottom-0 text-xs text-muted-foreground">
            0 MB/s
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">
              {data.length > 0 ? data[data.length - 1].download.toFixed(1) : '0'}
            </p>
            <p className="text-sm text-muted-foreground">Download MB/s</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">
              {data.length > 0 ? data[data.length - 1].upload.toFixed(1) : '0'}
            </p>
            <p className="text-sm text-muted-foreground">Upload MB/s</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {data.length > 0 ? (data[data.length - 1].download + data[data.length - 1].upload).toFixed(1) : '0'}
            </p>
            <p className="text-sm text-muted-foreground">Total MB/s</p>
          </div>
        </div>
      </div>
    </Card>
  );
};