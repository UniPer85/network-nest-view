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
        # Create sensors based on the data structure
        if "bandwidth" in coordinator.data:
            entities.append(NetworkBandwidthSensor(coordinator, config_entry))
        
        if "connected_devices" in coordinator.data:
            entities.append(ConnectedDevicesSensor(coordinator, config_entry))
        
        if "network_status" in coordinator.data:
            entities.append(NetworkStatusSensor(coordinator, config_entry))
        
        if "uptime" in coordinator.data:
            entities.append(NetworkUptimeSensor(coordinator, config_entry))
    
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