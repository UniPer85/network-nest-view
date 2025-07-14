# NetworkNest Integration

Monitor your network infrastructure directly in Home Assistant with beautiful 3D visualizations and real-time data.

## Features

- **Real-time Network Monitoring**: Track bandwidth usage, connected devices, and network status
- **3D Dashboard**: Beautiful web interface with interactive 3D network visualization  
- **Historical Data**: View detailed monitoring history with interactive charts
- **Device Management**: Monitor routers, switches, access points, and custom devices
- **Service Monitoring**: HTTP/HTTPS, TCP/UDP, ping, DNS, Docker, SQL, MQTT protocols
- **Automation Ready**: Use network sensors in your Home Assistant automations

## Sensors

This integration creates the following sensors:

- **Network Bandwidth** (`sensor.network_bandwidth`): Current bandwidth usage in Mbps
- **Connected Devices** (`sensor.connected_devices`): Number of devices connected to your network
- **Network Status** (`sensor.network_status`): Network connectivity status (online/offline)
- **Network Uptime** (`sensor.network_uptime`): Network uptime in hours

## Setup

1. Deploy the NetworkNest web application (included in the repository)
2. Create an account and configure your Home Assistant integration
3. Get your API key from the Home Assistant settings page
4. Add the integration in Home Assistant using your API key and base URL

## Web Dashboard

Access the full NetworkNest dashboard at your deployed URL for:
- 3D network topology visualization
- Detailed device monitoring
- Historical analytics and charts
- Advanced configuration options

## Support

- [GitHub Repository](https://github.com/YOUR_USERNAME/networknest)
- [Documentation](https://github.com/YOUR_USERNAME/networknest/blob/main/HACS_INSTALLATION.md)
- [Report Issues](https://github.com/YOUR_USERNAME/networknest/issues)