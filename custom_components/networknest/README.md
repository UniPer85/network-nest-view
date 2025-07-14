# NetworkNest Home Assistant Integration

This is a Home Assistant custom integration for NetworkNest, providing comprehensive network monitoring and device management capabilities.

## Features

- Real-time network monitoring
- Device discovery and tracking
- Bandwidth monitoring
- Network performance analytics
- Custom Home Assistant cards for dashboard integration

## Installation

### HACS (Recommended)

1. Add this repository to HACS as a custom repository
2. Search for "NetworkNest" in HACS
3. Install the integration
4. Restart Home Assistant

### Manual Installation

1. Copy the `custom_components/networknest` directory to your Home Assistant configuration directory
2. Restart Home Assistant

## Configuration

1. Go to Settings → Devices & Services
2. Click "Add Integration"
3. Search for "NetworkNest"
4. Enter your API key and base URL
5. Follow the setup wizard

## Cards

This integration provides custom Lovelace cards:

- **NetworkNest Device Card**: Shows individual device status
- **NetworkNest Bandwidth Card**: Displays bandwidth usage
- **NetworkNest Overview Card**: Provides network overview

## Support

- [Documentation](https://github.com/networknest/homeassistant-integration)
- [Issue Tracker](https://github.com/networknest/homeassistant-integration/issues)