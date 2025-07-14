#!/usr/bin/with-contenv bashio

# Get configuration
LOG_LEVEL=$(bashio::config 'log_level')
SSL=$(bashio::config 'ssl')

bashio::log.info "Starting NetworkNest..."

# Set log level
bashio::log.level "${LOG_LEVEL}"

# Configure SSL if enabled
if bashio::config.true 'ssl'; then
    CERTFILE=$(bashio::config 'certfile')
    KEYFILE=$(bashio::config 'keyfile')
    
    # Update nginx configuration for SSL
    sed -i "s/listen 3000;/listen 3000 ssl;/" /etc/nginx/http.d/default.conf
    sed -i "/listen 3000 ssl;/a\\    ssl_certificate /ssl/${CERTFILE};" /etc/nginx/http.d/default.conf
    sed -i "/ssl_certificate/a\\    ssl_certificate_key /ssl/${KEYFILE};" /etc/nginx/http.d/default.conf
fi

# Start nginx
bashio::log.info "Starting nginx..."
exec nginx -g "daemon off;"