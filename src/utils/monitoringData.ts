import { supabase } from "@/integrations/supabase/client";

interface GenerateDataParams {
  userId: string;
  itemType: 'device' | 'service' | 'component';
  itemId: string;
  itemName: string;
  hoursBack: number;
}

// Generate realistic sample monitoring data
export const generateSampleMonitoringData = async ({
  userId,
  itemType,
  itemId,
  itemName,
  hoursBack
}: GenerateDataParams) => {
  const dataPoints: any[] = [];
  const now = new Date();
  const intervalMinutes = hoursBack <= 1 ? 2 : hoursBack <= 24 ? 15 : hoursBack <= 168 ? 60 : 240; // Adjust interval based on time range
  
  // Generate data points going backwards in time
  for (let i = 0; i < Math.min(100, (hoursBack * 60) / intervalMinutes); i++) {
    const timestamp = new Date(now.getTime() - (i * intervalMinutes * 60 * 1000));
    
    // Generate realistic fluctuating values
    const baseResponseTime = itemType === 'device' ? 50 : itemType === 'service' ? 200 : 100;
    const responseTimeVariation = Math.random() * 50 + Math.sin(i * 0.1) * 20;
    
    const baseBandwidth = itemType === 'device' ? 50 * 1024 * 1024 : 25 * 1024 * 1024; // MB/s in bytes
    const bandwidthVariation = Math.random() * 0.5 + 0.5;
    
    const baseCpuUsage = 25;
    const cpuVariation = Math.random() * 30 + Math.sin(i * 0.05) * 15;
    
    const baseMemoryUsage = 60;
    const memoryVariation = Math.random() * 20 + Math.sin(i * 0.03) * 10;
    
    const baseStorageUsage = 45;
    const storageVariation = Math.random() * 5;
    
    // Determine status based on performance metrics
    const responseTime = Math.max(10, baseResponseTime + responseTimeVariation);
    let status = 'online';
    
    if (responseTime > 500 || Math.random() < 0.05) {
      status = Math.random() < 0.8 ? 'idle' : 'offline';
    }
    
    dataPoints.push({
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      item_name: itemName,
      status: status,
      response_time: Math.round(responseTime),
      bandwidth_up: Math.round(baseBandwidth * bandwidthVariation * 0.3), // Upload typically lower
      bandwidth_down: Math.round(baseBandwidth * bandwidthVariation),
      cpu_usage: Math.max(0, Math.min(100, baseCpuUsage + cpuVariation)),
      memory_usage: Math.max(0, Math.min(100, baseMemoryUsage + memoryVariation)),
      storage_usage: Math.max(0, Math.min(100, baseStorageUsage + storageVariation)),
      additional_metrics: {
        temperature: Math.round(35 + Math.random() * 25), // CPU temperature
        network_errors: Math.floor(Math.random() * 5),
        disk_io: Math.round(Math.random() * 1000)
      },
      recorded_at: timestamp.toISOString()
    });
  }
  
  return dataPoints.reverse(); // Return in chronological order
};

// Insert sample data into the database (for demonstration)
export const seedMonitoringData = async (
  userId: string,
  itemType: 'device' | 'service' | 'component',
  itemId: string,
  itemName: string
) => {
  try {
    // Check if data already exists
    const { data: existing } = await supabase
      .from('monitoring_history')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .limit(1);
    
    // Only seed if no data exists
    if (!existing || existing.length === 0) {
      const sampleData = await generateSampleMonitoringData({
        userId,
        itemType,
        itemId,
        itemName,
        hoursBack: 24 // Generate 24 hours of sample data
      });
      
      // Insert data in batches to avoid timeout
      const batchSize = 20;
      for (let i = 0; i < sampleData.length; i += batchSize) {
        const batch = sampleData.slice(i, i + batchSize);
        const { error } = await supabase
          .from('monitoring_history')
          .insert(batch);
        
        if (error) {
          console.error('Error inserting batch:', error);
        }
      }
      
      console.log(`Seeded ${sampleData.length} monitoring data points for ${itemName}`);
    }
  } catch (error) {
    console.error('Error seeding monitoring data:', error);
  }
};

// Auto-seed data for demonstration when dialog opens
export const ensureMonitoringData = async (
  itemType: 'device' | 'service' | 'component',
  itemId: string,
  itemName: string
) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await seedMonitoringData(user.id, itemType, itemId, itemName);
  } catch (error) {
    console.error('Error ensuring monitoring data:', error);
  }
};