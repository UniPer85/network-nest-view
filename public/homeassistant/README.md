# NetworkNest Home Assistant Integration

This integration allows you to monitor your network statistics from NetworkNest directly in Home Assistant, including custom Lovelace cards for beautiful visualizations.

## Features

### Integration Features
- **Network Bandwidth Monitoring** - Real-time bandwidth usage
- **Connected Devices Count** - Number of devices on your network
- **Network Status** - Online/offline connectivity status
- **Network Uptime** - How long your network has been running

### Custom Lovelace Cards
- **Device Card** - Display individual network device information
- **Bandwidth Card** - Visual bandwidth usage with charts
- **Overview Card** - Comprehensive network status dashboard

## Installation Methods

### Method 1: REST Integration (Recommended)

Add the following to your `configuration.yaml`:

```yaml
# NetworkNest Integration
rest:
  - resource: https://your-networknest-url.com/functions/v1/homeassistant-states
    headers:
      x-api-key: "your_api_key_here"
    scan_interval: 30
    sensor:
      - name: "Network Bandwidth"
        value_template: "{{ value_json[0].state }}"
        unit_of_measurement: "Mbps"
        device_class: data_rate
        icon: mdi:speedometer
        attributes:
          friendly_name: "Network Bandwidth"
      - name: "Connected Devices"
        value_template: "{{ value_json[1].state }}"
        icon: mdi:devices
        attributes:
          friendly_name: "Connected Devices"
      - name: "Network Uptime"
        value_template: "{{ value_json[3].state }}"
        unit_of_measurement: "h"
        device_class: duration
        icon: mdi:clock-outline
        attributes:
          friendly_name: "Network Uptime"
    binary_sensor:
      - name: "Network Status"
        value_template: "{{ value_json[2].state }}"
        device_class: connectivity
        icon: mdi:network
        attributes:
          friendly_name: "Network Status"
```

### Method 2: Custom Integration (Advanced)

For a more integrated experience, you can create a custom component:

1. Create a folder `custom_components/networknest` in your Home Assistant config directory
2. Add the following files:

**`__init__.py`**
```python
"""NetworkNest integration for Home Assistant."""
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

PLATFORMS = [Platform.SENSOR, Platform.BINARY_SENSOR]

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up NetworkNest from a config entry."""
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
```

**`config_flow.py`**
```python
"""Config flow for NetworkNest integration."""
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_API_KEY, CONF_URL

DOMAIN = "networknest"

class NetworkNestConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for NetworkNest."""

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        if user_input is not None:
            return self.async_create_entry(
                title="NetworkNest",
                data=user_input
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required(CONF_URL): str,
                vol.Required(CONF_API_KEY): str,
            })
        )
```

## Setup Instructions

1. **Get your API key**: 
   - Go to your NetworkNest dashboard
   - Navigate to Home Assistant integration page
   - Create or copy your API key

2. **Configure Home Assistant**:
   - Add the configuration to your `configuration.yaml`
   - Replace `your_api_key_here` with your actual API key
   - Replace the URL with your NetworkNest instance URL

3. **Restart Home Assistant**

4. **Verify the integration**:
   - Check Developer Tools > States for the new entities
   - Entities will be named: `sensor.network_bandwidth`, `sensor.connected_devices`, etc.

## Available Entities

| Entity | Type | Description | Unit |
|--------|------|-------------|------|
| `sensor.network_bandwidth` | Sensor | Current network bandwidth usage | Mbps |
| `sensor.connected_devices` | Sensor | Number of connected devices | count |
| `sensor.network_uptime` | Sensor | Network uptime | hours |
| `binary_sensor.network_status` | Binary Sensor | Network connectivity status | on/off |

## Troubleshooting

### Common Issues

1. **Entities not appearing**: 
   - Check your API key is correct
   - Verify the URL is accessible
   - Check Home Assistant logs for errors

2. **Authentication errors**:
   - Ensure your API key is active in NetworkNest
   - Verify the API key has the correct permissions

3. **Connection timeouts**:
   - Check your NetworkNest instance is running
   - Verify network connectivity from Home Assistant to NetworkNest

### Debug Mode

Enable debug logging by adding this to your `configuration.yaml`:

```yaml
logger:
  logs:
    homeassistant.components.rest: debug
```

## Support

For support and issues:
- Check the Home Assistant logs
- Verify your NetworkNest instance is accessible
- Ensure your API key is valid and active

## Custom Lovelace Cards

NetworkNest includes beautiful custom cards for your Home Assistant dashboard:

### Available Cards

#### 1. NetworkNest Device Card
Displays individual network device information with status, bandwidth usage, and device details.

```yaml
type: custom:networknest-device-card
entity: sensor.networknest_device_macbook_pro
```

#### 2. NetworkNest Bandwidth Card
Shows network bandwidth usage with visual bars and historical charts.

```yaml
type: custom:networknest-bandwidth-card
download_entity: sensor.networknest_bandwidth_down
upload_entity: sensor.networknest_bandwidth_up
max_speed: 1000
```

#### 3. NetworkNest Overview Card
Comprehensive network overview with key metrics and status.

```yaml
type: custom:networknest-overview-card
```

### Installing Custom Cards

1. **Copy card files** to your Home Assistant `www` directory:
   ```
   /config/www/networknest/
   ├── networknest-device-card.js
   ├── networknest-bandwidth-card.js
   └── networknest-overview-card.js
   ```

2. **Add resources** to your Lovelace configuration:
   ```yaml
   lovelace:
     resources:
       - url: /local/networknest/networknest-device-card.js
         type: module
       - url: /local/networknest/networknest-bandwidth-card.js
         type: module
       - url: /local/networknest/networknest-overview-card.js
         type: module
   ```

3. **Restart Home Assistant** and add the cards to your dashboard

## Automation Examples

### Network Alert
```yaml
automation:
  - alias: "Network Down Alert"
    trigger:
      platform: state
      entity_id: binary_sensor.network_status
      to: 'off'
    action:
      service: notify.mobile_app_your_phone
      data:
        message: "🚨 Network is down!"
```

### Bandwidth Monitor
```yaml
automation:
  - alias: "High Bandwidth Usage"
    trigger:
      platform: numeric_state
      entity_id: sensor.network_bandwidth
      above: 80
    action:
      service: notify.mobile_app_your_phone
      data:
        message: "⚠️ High bandwidth usage: {{ states('sensor.network_bandwidth') }} Mbps"
```

### Device Offline Alert
```yaml
automation:
  - alias: "Device Offline Alert"
    trigger:
      platform: state
      entity_id: sensor.networknest_device_macbook_pro
      to: 'offline'
      for:
        minutes: 5
    action:
      service: notify.mobile_app_your_phone
      data:
        message: "📱 {{ trigger.to_state.attributes.friendly_name }} has been offline for 5 minutes"
```