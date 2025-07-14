-- Replace the generate_ha_api_key function with a simpler implementation
CREATE OR REPLACE FUNCTION public.generate_ha_api_key()
RETURNS text
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN 'nns_' || replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
END;
$function$;