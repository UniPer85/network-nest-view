# NetworkNest Home Assistant Integration

A comprehensive Home Assistant integration for NetworkNest network monitoring with beautiful custom Lovelace cards.

## Features

### Integration Features
- **Real-time Network Monitoring**: Bandwidth, device count, status, and uptime sensors
- **Individual Device Tracking**: Each network device becomes a separate sensor entity
- **Automatic Discovery**: Devices are automatically discovered and registered
- **Custom Lovelace Cards**: Beautiful, responsive cards for network visualization
- **Device Management**: Track device status, bandwidth usage, and connection details

### Custom Lovelace Cards Included
- **Device Card**: Display individual network device information with status badges
- **Bandwidth Card**: Real-time bandwidth visualization with charts and progress bars
- **Overview Card**: Comprehensive network dashboard with modern design

## Installation

### Method 1: HACS (Recommended)

1. **Add Custom Repository**:
   - Open HACS in Home Assistant
   - Go to "Integrations" 
   - Click the 3-dot menu and select "Custom repositories"
   - Add repository URL: `https://github.com/your-repo/networknest`
   - Category: "Integration"

2. **Install Integration**:
   - Search for "NetworkNest" in HACS
   - Click "Install"
   - Restart Home Assistant

3. **Setup Integration**:
   - Go to Settings → Devices & Services
   - Click "Add Integration"
   - Search for "NetworkNest"
   - Enter your NetworkNest URL and API key

### Method 2: Manual Installation

1. **Download Integration**:
   ```bash
   cd /config/custom_components/
   git clone https://github.com/your-repo/networknest.git networknest
   ```

2. **Restart Home Assistant**

3. **Setup Integration**:
   - Go to Settings → Devices & Services
   - Click "Add Integration"
   - Search for "NetworkNest"
   - Configure with your NetworkNest details

## Configuration

### Required Information
- **NetworkNest URL**: Your NetworkNest instance URL (e.g., `https://your-domain.com`)
- **API Key**: Generated from your NetworkNest Home Assistant integration page

### Getting Your API Key
1. Open your NetworkNest dashboard
2. Navigate to the Home Assistant integration page
3. Generate or copy your API key
4. Use this key during Home Assistant setup

## Entities Created

The integration creates the following entities:

### Main Network Sensors
| Entity ID | Description | Unit | Device Class |
|-----------|-------------|------|--------------|
| `sensor.network_bandwidth` | Total network bandwidth | Mbps | Data Rate |
| `sensor.network_bandwidth_down` | Download bandwidth | Mbps | Data Rate |
| `sensor.network_bandwidth_up` | Upload bandwidth | Mbps | Data Rate |
| `sensor.connected_devices` | Number of connected devices | count | - |
| `sensor.network_status` | Network connectivity status | - | Connectivity |
| `sensor.network_uptime` | Network uptime | hours | Duration |

### Individual Device Sensors
Each discovered device creates a sensor:
- **Entity ID**: `sensor.networknest_[device_name]`
- **State**: Device status (online/offline/idle)
- **Attributes**:
  - `device_type`: Type of device (Computer, Mobile, etc.)
  - `ip_address`: Device IP address
  - `bandwidth`: Current bandwidth usage
  - `friendly_name`: Device display name

## Custom Lovelace Cards

The integration automatically registers three custom cards:

### 1. NetworkNest Device Card

Display individual device information:

```yaml
type: custom:networknest-device-card
entity: sensor.networknest_macbook_pro
```

**Features**:
- Status badges with color coding
- Real-time bandwidth display
- Device type icons
- IP address information
- Modern gradient design

### 2. NetworkNest Bandwidth Card

Visualize network bandwidth usage:

```yaml
type: custom:networknest-bandwidth-card
download_entity: sensor.network_bandwidth_down
upload_entity: sensor.network_bandwidth_up
max_speed: 1000  # Optional: maximum speed in Mbps
```

**Features**:
- Download/upload progress bars
- Real-time bandwidth chart
- Configurable maximum speed
- Visual bandwidth indicators

### 3. NetworkNest Overview Card

Comprehensive network overview:

```yaml
type: custom:networknest-overview-card
```

**Features**:
- Automatic entity detection
- Network status indicator
- Key metrics display
- Modern glass-morphism design
- No configuration required

## Complete Dashboard Example

```yaml
title: Network Monitoring
cards:
  # Network overview
  - type: custom:networknest-overview-card
    
  # Bandwidth monitoring
  - type: custom:networknest-bandwidth-card
    download_entity: sensor.network_bandwidth_down
    upload_entity: sensor.network_bandwidth_up
    max_speed: 1000
    
  # Individual devices
  - type: horizontal-stack
    cards:
      - type: custom:networknest-device-card
        entity: sensor.networknest_macbook_pro
      - type: custom:networknest-device-card
        entity: sensor.networknest_iphone_15
        
  # Additional device grid
  - type: grid
    columns: 3
    cards:
      - type: custom:networknest-device-card
        entity: sensor.networknest_samsung_tv
      - type: custom:networknest-device-card
        entity: sensor.networknest_playstation_5
      - type: custom:networknest-device-card
        entity: sensor.networknest_router
```

## Automation Examples

### Network Down Alert
```yaml
automation:
  - alias: "Network Down Alert"
    trigger:
      platform: state
      entity_id: sensor.network_status
      to: 'offline'
    action:
      service: notify.mobile_app_your_phone
      data:
        message: "🚨 Network is down!"
        title: "NetworkNest Alert"
```

### High Bandwidth Usage
```yaml
automation:
  - alias: "High Bandwidth Usage"
    trigger:
      platform: numeric_state
      entity_id: sensor.network_bandwidth
      above: 800
    action:
      service: notify.mobile_app_your_phone
      data:
        message: "⚠️ High bandwidth usage: {{ states('sensor.network_bandwidth') }} Mbps"
        title: "Bandwidth Alert"
```

### Device Offline Notification
```yaml
automation:
  - alias: "Important Device Offline"
    trigger:
      platform: state
      entity_id: sensor.networknest_macbook_pro
      to: 'offline'
      for:
        minutes: 5
    action:
      service: notify.mobile_app_your_phone
      data:
        message: "📱 {{ trigger.to_state.attributes.friendly_name }} has been offline for 5 minutes"
        title: "Device Alert"
```

### Bandwidth Usage Report
```yaml
automation:
  - alias: "Daily Bandwidth Report"
    trigger:
      platform: time
      at: "08:00:00"
    action:
      service: notify.mobile_app_your_phone
      data:
        message: |
          📊 Daily Network Report:
          🔗 Status: {{ states('sensor.network_status') }}
          📱 Devices: {{ states('sensor.connected_devices') }}
          ⚡ Current: {{ states('sensor.network_bandwidth') }} Mbps
          ⏱️ Uptime: {{ states('sensor.network_uptime') }} hours
        title: "NetworkNest Daily Report"
```

## Troubleshooting

### Cards Not Appearing
1. **Check Integration Status**: Ensure NetworkNest integration is properly installed and configured
2. **Restart Home Assistant**: Cards are registered during integration setup
3. **Clear Browser Cache**: Force refresh your browser cache
4. **Check Console**: Open browser developer tools and check for JavaScript errors

### Entity Not Found Errors
1. **Verify API Connection**: Check that your NetworkNest API is accessible
2. **Check API Key**: Ensure your API key is valid and active
3. **Review Logs**: Check Home Assistant logs for integration errors
4. **Device Discovery**: Ensure devices are detected in your NetworkNest dashboard

### Sensor Data Issues
1. **API Response**: Verify NetworkNest API returns expected data format
2. **Network Connectivity**: Check connection between Home Assistant and NetworkNest
3. **Data Format**: Ensure API responses match expected sensor structure
4. **Polling Interval**: Default update interval is 30 seconds

### Card Configuration Problems
1. **Entity Names**: Verify entity IDs match your actual NetworkNest entities
2. **Card Configuration**: Check YAML syntax for custom card configurations
3. **Resource Loading**: Ensure custom card resources are properly loaded
4. **Theme Compatibility**: Some themes may affect card styling

## Debug Mode

Enable debug logging:

```yaml
logger:
  logs:
    custom_components.networknest: debug
```

## API Requirements

NetworkNest API should return data in this format:

```json
{
  "bandwidth": 247.5,
  "bandwidth_down": 173.25,
  "bandwidth_up": 74.25,
  "connected_devices": 8,
  "network_status": "online",
  "uptime": 99.9,
  "devices": [
    {
      "id": "macbook_pro",
      "name": "MacBook Pro",
      "type": "Computer",
      "ip": "192.168.1.101",
      "status": "online",
      "bandwidth": "45.2 MB/s"
    }
  ]
}
```

## Support

- **GitHub Issues**: Report bugs and feature requests
- **Home Assistant Community**: Get help from the community
- **Documentation**: Check NetworkNest project documentation
- **Debug Logs**: Always include debug logs when reporting issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This integration is part of the NetworkNest project and follows the same MIT license.