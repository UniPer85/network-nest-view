# NetworkNest HACS Installation Guide

This guide provides step-by-step instructions for installing the NetworkNest Home Assistant integration via HACS (Home Assistant Community Store).

## Prerequisites

1. **Home Assistant**: Version 2023.1.0 or later
2. **HACS**: [Home Assistant Community Store](https://hacs.xyz/) must be installed
3. **NetworkNest Account**: You'll need a NetworkNest API key

## Installation Steps

### 1. Add Custom Repository to HACS

1. **Open HACS** in your Home Assistant instance
2. **Navigate to Integrations** (default view)
3. **Click the three dots** in the top right corner
4. **Select "Custom repositories"**
5. **Add the repository**:
   - **Repository**: `https://github.com/networknest/homeassistant-integration`
   - **Category**: `Integration`
6. **Click "Add"**

### 2. Install NetworkNest Integration

1. **Search for "NetworkNest"** in HACS integrations
2. **Click on the NetworkNest integration**
3. **Click "Download"**
4. **Choose the latest version** (recommended)
5. **Click "Download"** again to confirm
6. **Wait for download to complete**

### 3. Restart Home Assistant

After installation, you **must restart** Home Assistant for the integration to be recognized.

1. **Go to Settings** → **System** → **Restart**
2. **Click "Restart"** and wait for Home Assistant to come back online

### 4. Configure the Integration

1. **Go to Settings** → **Devices & Services**
2. **Click "Add Integration"**
3. **Search for "NetworkNest"**
4. **Click on NetworkNest** in the results
5. **Enter your configuration**:
   - **API Key**: Your NetworkNest API key
   - **Base URL**: Your NetworkNest instance URL (default: `https://jwqmtmapnvncrwixouek.supabase.co`)
6. **Click "Submit"**

### 5. Verify Installation

After successful configuration, you should see:

1. **NetworkNest Hub device** in your devices list
2. **Multiple sensors** created:
   - `sensor.networknest_bandwidth`
   - `sensor.networknest_bandwidth_down`
   - `sensor.networknest_bandwidth_up`
   - `sensor.networknest_connected_devices`
   - `sensor.networknest_network_status`
   - `sensor.networknest_uptime`
3. **Individual device sensors** for each network device

## Using Custom Cards

The integration automatically registers custom Lovelace cards

### Available Cards

1. **NetworkNest Device Card** (`networknest-device-card`)
2. **NetworkNest Bandwidth Card** (`networknest-bandwidth-card`)
3. **NetworkNest Overview Card** (`networknest-overview-card`)

### Adding Cards to Dashboard

1. **Edit your dashboard**
2. **Add a new card**
3. **Select "Custom: NetworkNest [Card Name]"**
4. **Configure the card** with your entity selections

### Example Card Configuration

```yaml
type: custom:networknest-overview-card
entities:
  - sensor.networknest_bandwidth
  - sensor.networknest_connected_devices
  - sensor.networknest_network_status
title: Network Overview
show_header_toggle: false
```

## Troubleshooting

### Common Issues

1. **Integration not found after installation**:
   - Ensure you restarted Home Assistant
   - Check HACS logs for download errors
   - Verify the repository was added correctly

2. **API connection errors**:
   - Verify your API key is correct
   - Check the base URL format
   - Ensure NetworkNest service is accessible

3. **No sensors created**:
   - Check Home Assistant logs for errors
   - Verify API returns data
   - Try refreshing the integration

4. **Custom cards not appearing**:
   - Clear browser cache
   - Restart Home Assistant
   - Check for JavaScript errors in browser console

### Getting Help

If you encounter issues:

1. **Check the logs**: Settings → System → Logs
2. **Review documentation**: [GitHub Repository](https://github.com/networknest/homeassistant-integration)
3. **Report issues**: [Issue Tracker](https://github.com/networknest/homeassistant-integration/issues)
4. **Community support**: [Discussions](https://github.com/networknest/homeassistant-integration/discussions)

## Updating

HACS will automatically notify you of updates. To update:

1. **Go to HACS** → **Integrations**
2. **Find NetworkNest** (will show "Update" if available)
3. **Click "Update"**
4. **Restart Home Assistant**

## Uninstalling

To remove the integration:

1. **Remove the integration**:
   - Settings → Devices & Services
   - Find NetworkNest and click "Delete"
2. **Remove from HACS**:
   - HACS → Integrations
   - Find NetworkNest and click "Remove"
3. **Restart Home Assistant**

## Advanced Configuration

### Multiple Instances

You can configure multiple NetworkNest instances:

1. **Follow the installation steps** for each instance
2. **Use different API keys** for each instance
3. **Configure different base URLs** if needed

### Automation Examples

```yaml
# Network status automation
automation:
  - alias: "Network Down Alert"
    trigger:
      platform: state
      entity_id: sensor.networknest_network_status
      to: "offline"
    action:
      service: notify.mobile_app
      data:
        message: "Network is down!"

# Bandwidth monitoring
automation:
  - alias: "High Bandwidth Usage"
    trigger:
      platform: numeric_state
      entity_id: sensor.networknest_bandwidth
      above: 800
    action:
      service: notify.mobile_app
      data:
        message: "High bandwidth usage detected!"
```

## Support

For support with installation or configuration:

- **Documentation**: [GitHub Wiki](https://github.com/networknest/homeassistant-integration/wiki)
- **Issues**: [GitHub Issues](https://github.com/networknest/homeassistant-integration/issues)
- **Discussions**: [GitHub Discussions](https://github.com/networknest/homeassistant-integration/discussions)