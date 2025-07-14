ARG BUILD_FROM
FROM $BUILD_FROM

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install packages
RUN apk add --no-cache \
    nginx \
    nodejs \
    npm \
    curl

# Copy application files
COPY . /app
WORKDIR /app

# Install dependencies and build
RUN npm install && npm run build

# Copy built files to nginx
RUN cp -r /app/dist/* /var/lib/nginx/html/

# Copy nginx configuration
COPY addon/nginx.conf /etc/nginx/http.d/default.conf

# Copy run script
COPY addon/run.sh /
RUN chmod a+x /run.sh

CMD ["/run.sh"]