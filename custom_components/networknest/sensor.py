"""NetworkNest sensor platform."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfDataRate, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from . import NetworkNestDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up NetworkNest sensors based on a config entry."""
    coordinator: NetworkNestDataUpdateCoordinator = hass.data[DOMAIN][config_entry.entry_id]
    
    entities = []
    
    if coordinator.data:
        # Create main network sensors
        if "bandwidth" in coordinator.data:
            entities.append(NetworkBandwidthSensor(coordinator, config_entry))
            entities.append(NetworkBandwidthDownSensor(coordinator, config_entry))
            entities.append(NetworkBandwidthUpSensor(coordinator, config_entry))
        
        if "connected_devices" in coordinator.data:
            entities.append(ConnectedDevicesSensor(coordinator, config_entry))
        
        if "network_status" in coordinator.data:
            entities.append(NetworkStatusSensor(coordinator, config_entry))
        
        if "uptime" in coordinator.data:
            entities.append(NetworkUptimeSensor(coordinator, config_entry))
        
        # Create individual device sensors
        if "devices" in coordinator.data and isinstance(coordinator.data["devices"], list):
            for device in coordinator.data["devices"]:
                if isinstance(device, dict) and "id" in device:
                    entities.append(NetworkDeviceSensor(coordinator, config_entry, device))
    
    async_add_entities(entities)


class NetworkNestSensorBase(CoordinatorEntity, SensorEntity):
    """Base class for NetworkNest sensors."""

    def __init__(
        self,
        coordinator: NetworkNestDataUpdateCoordinator,
        config_entry: ConfigEntry,
        sensor_key: str,
        name: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self.sensor_key = sensor_key
        self._attr_name = name
        self._attr_unique_id = f"{config_entry.entry_id}_{sensor_key}"
        
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, config_entry.entry_id)},
            name="NetworkNest Hub",
            manufacturer="NetworkNest",
            model="Network Dashboard",
            sw_version="1.0.0",
        )

    @property
    def native_value(self) -> Any:
        """Return the state of the sensor."""
        if self.coordinator.data and self.sensor_key in self.coordinator.data:
            return self.coordinator.data[self.sensor_key]
        return None


class NetworkBandwidthSensor(NetworkNestSensorBase):
    """Network bandwidth sensor."""

    def __init__(
        self,
        coordinator: NetworkNestDataUpdateCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the bandwidth sensor."""
        super().__init__(coordinator, config_entry, "bandwidth", "Network Bandwidth")
        self._attr_device_class = SensorDeviceClass.DATA_RATE
        self._attr_native_unit_of_measurement = UnitOfDataRate.MEGABITS_PER_SECOND
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:speedometer"


class ConnectedDevicesSensor(NetworkNestSensorBase):
    """Connected devices sensor."""

    def __init__(
        self,
        coordinator: NetworkNestDataUpdateCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the connected devices sensor."""
        super().__init__(coordinator, config_entry, "connected_devices", "Connected Devices")
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:devices"


class NetworkStatusSensor(NetworkNestSensorBase):
    """Network status sensor."""

    def __init__(
        self,
        coordinator: NetworkNestDataUpdateCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the network status sensor."""
        super().__init__(coordinator, config_entry, "network_status", "Network Status")
        self._attr_device_class = SensorDeviceClass.CONNECTIVITY
        self._attr_icon = "mdi:network"


class NetworkUptimeSensor(NetworkNestSensorBase):
    """Network uptime sensor."""

    def __init__(
        self,
        coordinator: NetworkNestDataUpdateCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the uptime sensor."""
        super().__init__(coordinator, config_entry, "uptime", "Network Uptime")
        self._attr_device_class = SensorDeviceClass.DURATION
        self._attr_native_unit_of_measurement = UnitOfTime.HOURS
        self._attr_state_class = SensorStateClass.TOTAL_INCREASING
        self._attr_icon = "mdi:clock-outline"


class NetworkBandwidthDownSensor(NetworkNestSensorBase):
    """Network download bandwidth sensor."""

    def __init__(
        self,
        coordinator: NetworkNestDataUpdateCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the download bandwidth sensor."""
        super().__init__(coordinator, config_entry, "bandwidth_down", "Network Bandwidth Down")
        self._attr_device_class = SensorDeviceClass.DATA_RATE
        self._attr_native_unit_of_measurement = UnitOfDataRate.MEGABITS_PER_SECOND
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:download"

    @property
    def native_value(self) -> Any:
        """Return the download bandwidth."""
        if self.coordinator.data and "bandwidth_down" in self.coordinator.data:
            return self.coordinator.data["bandwidth_down"]
        elif self.coordinator.data and "bandwidth" in self.coordinator.data:
            # Fallback: assume total bandwidth is split 70/30 down/up
            return self.coordinator.data["bandwidth"] * 0.7
        return None


class NetworkBandwidthUpSensor(NetworkNestSensorBase):
    """Network upload bandwidth sensor."""

    def __init__(
        self,
        coordinator: NetworkNestDataUpdateCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the upload bandwidth sensor."""
        super().__init__(coordinator, config_entry, "bandwidth_up", "Network Bandwidth Up")
        self._attr_device_class = SensorDeviceClass.DATA_RATE
        self._attr_native_unit_of_measurement = UnitOfDataRate.MEGABITS_PER_SECOND
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_icon = "mdi:upload"

    @property
    def native_value(self) -> Any:
        """Return the upload bandwidth."""
        if self.coordinator.data and "bandwidth_up" in self.coordinator.data:
            return self.coordinator.data["bandwidth_up"]
        elif self.coordinator.data and "bandwidth" in self.coordinator.data:
            # Fallback: assume total bandwidth is split 70/30 down/up
            return self.coordinator.data["bandwidth"] * 0.3
        return None


class NetworkDeviceSensor(CoordinatorEntity, SensorEntity):
    """Individual network device sensor."""

    def __init__(
        self,
        coordinator: NetworkNestDataUpdateCoordinator,
        config_entry: ConfigEntry,
        device_data: dict[str, Any],
    ) -> None:
        """Initialize the device sensor."""
        super().__init__(coordinator)
        self.device_data = device_data
        device_id = device_data.get("id", "unknown")
        device_name = device_data.get("name", f"Device {device_id}")
        
        self._attr_name = f"NetworkNest {device_name}"
        self._attr_unique_id = f"{config_entry.entry_id}_device_{device_id}"
        self._attr_icon = self._get_device_icon(device_data.get("type", "generic"))
        
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"{config_entry.entry_id}_device_{device_id}")},
            name=device_name,
            manufacturer="NetworkNest",
            model=device_data.get("type", "Network Device"),
            via_device=(DOMAIN, config_entry.entry_id),
        )

    def _get_device_icon(self, device_type: str) -> str:
        """Get icon based on device type."""
        icons = {
            "Computer": "mdi:laptop",
            "Mobile": "mdi:phone",
            "Smart TV": "mdi:television",
            "Gaming": "mdi:gamepad-variant",
            "Network": "mdi:router-wireless",
            "Tablet": "mdi:tablet",
            "Smart Speaker": "mdi:speaker",
            "IoT Device": "mdi:camera",
            "Router": "mdi:router",
            "Switch": "mdi:switch",
            "Access Point": "mdi:wifi",
        }
        return icons.get(device_type, "mdi:devices")

    @property
    def native_value(self) -> str:
        """Return the device status."""
        if self.coordinator.data and "devices" in self.coordinator.data:
            for device in self.coordinator.data["devices"]:
                if device.get("id") == self.device_data.get("id"):
                    return device.get("status", "unknown")
        return self.device_data.get("status", "unknown")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional device attributes."""
        if self.coordinator.data and "devices" in self.coordinator.data:
            for device in self.coordinator.data["devices"]:
                if device.get("id") == self.device_data.get("id"):
                    return {
                        "device_type": device.get("type", "unknown"),
                        "ip_address": device.get("ip", "unknown"),
                        "bandwidth": device.get("bandwidth", "0 MB/s"),
                        "friendly_name": device.get("name", "Unknown Device"),
                    }
        
        # Fallback to initial device data
        return {
            "device_type": self.device_data.get("type", "unknown"),
            "ip_address": self.device_data.get("ip", "unknown"),
            "bandwidth": self.device_data.get("bandwidth", "0 MB/s"),
            "friendly_name": self.device_data.get("name", "Unknown Device"),
        }