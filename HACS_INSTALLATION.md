# NetworkNest Home Assistant Integration

A comprehensive network monitoring integration for Home Assistant that provides real-time insights into your network infrastructure.

## Features

- **Network Bandwidth Monitoring**: Track real-time upload/download speeds
- **Connected Device Count**: Monitor how many devices are connected to your network
- **Network Status**: Get connectivity status updates
- **Network Uptime**: Track how long your network has been running
- **Beautiful 3D Dashboard**: Modern web interface for network visualization

## Installation via HACS

### Method 1: Add as Custom Repository

1. Open HACS in your Home Assistant instance
2. Click on "Integrations"
3. Click the three dots menu (⋮) in the top right corner
4. Select "Custom repositories"
5. Add this repository URL: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`
6. Select "Integration" as the category
7. Click "Add"
8. Find "NetworkNest" in the HACS store and install it
9. Restart Home Assistant

### Method 2: Manual Installation

1. Download the latest release from GitHub
2. Extract the `custom_components/networknest` folder to your Home Assistant `custom_components` directory
3. Restart Home Assistant

## Configuration

### Step 1: Set up NetworkNest Web App

1. Deploy the NetworkNest web application (included in this repository)
2. Create an account and configure your Home Assistant integration
3. Note down your API key and base URL

### Step 2: Add Integration in Home Assistant

1. Go to Settings → Devices & Services
2. Click "Add Integration"
3. Search for "NetworkNest"
4. Enter your API key and base URL when prompted
5. Complete the setup

## Usage

Once configured, NetworkNest will create several sensors:

- `sensor.network_bandwidth` - Current network bandwidth usage (Mbps)
- `sensor.connected_devices` - Number of connected devices
- `sensor.network_status` - Network connectivity status
- `sensor.network_uptime` - Network uptime in hours

### Creating Automations

You can use these sensors in automations. For example:

```yaml
# Alert when network is down
automation:
  - alias: "Network Down Alert"
    trigger:
      - platform: state
        entity_id: sensor.network_status
        to: "offline"
    action:
      - service: notify.mobile_app_your_phone
        data:
          message: "Network is down!"
```

### Dashboard Cards

Add network monitoring cards to your dashboard:

```yaml
# Bandwidth gauge
type: gauge
entity: sensor.network_bandwidth
name: Network Speed
unit: Mbps
min: 0
max: 1000

# Connected devices
type: entity
entity: sensor.connected_devices
name: Connected Devices
icon: mdi:devices
```

## Web Dashboard

Access the full NetworkNest web dashboard at your deployed URL for:

- Real-time 3D network visualization
- Detailed monitoring history
- Device management
- Advanced configuration options

## Troubleshooting

### Integration Not Loading

1. Check that the API key is correct
2. Verify the base URL is accessible
3. Check Home Assistant logs for error messages

### No Data Showing

1. Ensure your NetworkNest web app is properly configured
2. Verify that monitoring is enabled in the web interface
3. Check that your devices are properly configured for monitoring

### API Connection Issues

1. Verify the base URL format: `https://your-project.supabase.co`
2. Check that CORS is properly configured
3. Ensure the API key has the correct permissions

## Support

- 📖 [Documentation](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME)
- 🐛 [Report Issues](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/issues)
- 💬 [Discussions](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/discussions)

## License

This project is licensed under the MIT License - see the LICENSE file for details.