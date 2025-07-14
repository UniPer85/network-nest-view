-- Enable pgcrypto extension for gen_random_bytes function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recreate the generate_ha_api_key function to ensure it works
CREATE OR REPLACE FUNCTION public.generate_ha_api_key()
RETURNS text
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN 'nns_' || encode(gen_random_bytes(32), 'hex');
END;
$function$;