-- Create table for storing monitoring history
CREATE TABLE public.monitoring_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('device', 'service', 'component')),
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  status TEXT NOT NULL,
  response_time INTEGER, -- in milliseconds
  bandwidth_up BIGINT, -- in bytes per second
  bandwidth_down BIGINT, -- in bytes per second
  cpu_usage DECIMAL(5,2), -- percentage
  memory_usage DECIMAL(5,2), -- percentage
  storage_usage DECIMAL(5,2), -- percentage
  additional_metrics JSONB, -- for any extra metrics
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.monitoring_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own monitoring history" 
ON public.monitoring_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own monitoring history" 
ON public.monitoring_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monitoring history" 
ON public.monitoring_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monitoring history" 
ON public.monitoring_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_monitoring_history_user_id ON public.monitoring_history(user_id);
CREATE INDEX idx_monitoring_history_item ON public.monitoring_history(user_id, item_type, item_id);
CREATE INDEX idx_monitoring_history_recorded_at ON public.monitoring_history(recorded_at);
CREATE INDEX idx_monitoring_history_composite ON public.monitoring_history(user_id, item_type, item_id, recorded_at);

-- Create function to clean up old monitoring data (optional, for performance)
CREATE OR REPLACE FUNCTION public.cleanup_old_monitoring_data()
RETURNS void AS $$
BEGIN
  -- Keep only last 1 year of data
  DELETE FROM public.monitoring_history 
  WHERE recorded_at < now() - interval '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;