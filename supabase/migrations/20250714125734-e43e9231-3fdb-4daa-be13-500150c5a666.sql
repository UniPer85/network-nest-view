-- Create table for Home Assistant integration configuration
CREATE TABLE public.homeassistant_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  ha_instance_name TEXT NOT NULL,
  ha_instance_url TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.homeassistant_config ENABLE ROW LEVEL SECURITY;

-- Create policies for Home Assistant config
CREATE POLICY "Users can view their own HA config" 
ON public.homeassistant_config 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own HA config" 
ON public.homeassistant_config 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own HA config" 
ON public.homeassistant_config 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own HA config" 
ON public.homeassistant_config 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_homeassistant_config_updated_at
BEFORE UPDATE ON public.homeassistant_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for Home Assistant device registry
CREATE TABLE public.ha_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_id TEXT NOT NULL UNIQUE,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  manufacturer TEXT DEFAULT 'NetworkNest',
  model TEXT,
  sw_version TEXT,
  hw_version TEXT,
  configuration_url TEXT,
  identifiers JSONB NOT NULL,
  connections JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ha_devices ENABLE ROW LEVEL SECURITY;

-- Create policies for HA devices
CREATE POLICY "Users can view their own HA devices" 
ON public.ha_devices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own HA devices" 
ON public.ha_devices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own HA devices" 
ON public.ha_devices 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own HA devices" 
ON public.ha_devices 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ha_devices_updated_at
BEFORE UPDATE ON public.ha_devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for Home Assistant entities/sensors
CREATE TABLE public.ha_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_id UUID NOT NULL REFERENCES public.ha_devices(id) ON DELETE CASCADE,
  entity_id TEXT NOT NULL UNIQUE,
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'sensor',
  icon TEXT,
  unit_of_measurement TEXT,
  device_class TEXT,
  state_class TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ha_entities ENABLE ROW LEVEL SECURITY;

-- Create policies for HA entities
CREATE POLICY "Users can view their own HA entities" 
ON public.ha_entities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own HA entities" 
ON public.ha_entities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own HA entities" 
ON public.ha_entities 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own HA entities" 
ON public.ha_entities 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ha_entities_updated_at
BEFORE UPDATE ON public.ha_entities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_ha_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'nns_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;