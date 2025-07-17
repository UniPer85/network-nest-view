"""NetworkNest Home Assistant Integration."""
from __future__ import annotations

import logging
import os
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.exceptions import HomeAssistantError

from .const import DOMAIN, UPDATE_INTERVAL
from .api import NetworkNestAPI

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up NetworkNest from a config entry."""
    _LOGGER.info("Setting up NetworkNest integration for entry %s", entry.entry_id)
    
    try:
        api = NetworkNestAPI(entry.data["api_key"], entry.data["base_url"])
        _LOGGER.info("Created API client with base URL: %s", entry.data["base_url"])
        
        coordinator = NetworkNestDataUpdateCoordinator(hass, api)
        _LOGGER.info("Created data coordinator")
        
        # Try to fetch initial data
        _LOGGER.info("Attempting first data refresh...")
        await coordinator.async_config_entry_first_refresh()
        _LOGGER.info("First data refresh completed successfully")
        
        hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator
        
        # Register frontend resources
        _LOGGER.info("Registering frontend resources...")
        await _register_frontend_resources(hass)
        
        # Register services
        _LOGGER.info("Registering services...")
        await _register_services(hass)
        
        # Set up platforms
        _LOGGER.info("Setting up platforms...")
        await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
        
        _LOGGER.info("NetworkNest integration setup completed successfully")
        return True
        
    except Exception as exc:
        _LOGGER.error("Failed to set up NetworkNest integration: %s", exc, exc_info=True)
        # Clean up the API client if it was created
        if 'api' in locals():
            await api.close()
        raise


async def _register_frontend_resources(hass: HomeAssistant) -> None:
    """Register frontend resources for custom cards."""
    integration_dir = os.path.dirname(__file__)
    frontend_dir = os.path.join(integration_dir, "frontend")
    
    # Register static files
    hass.http.register_static_path(
        f"/{DOMAIN}",
        frontend_dir,
        cache_headers=False,
    )
    
    # Register custom cards
    cards = [
        "networknest-device-card.js",
        "networknest-bandwidth-card.js", 
        "networknest-overview-card.js"
    ]
    
    for card in cards:
        add_extra_js_url(hass, f"/{DOMAIN}/{card}")
        _LOGGER.info("Registered NetworkNest card: %s", card)


async def _register_services(hass: HomeAssistant) -> None:
    """Register integration services."""
    
    async def refresh_data_service(call: ServiceCall) -> None:
        """Handle refresh data service call."""
        config_entry_id = call.data.get("config_entry_id")
        
        if config_entry_id:
            # Refresh specific entry
            if config_entry_id in hass.data[DOMAIN]:
                coordinator = hass.data[DOMAIN][config_entry_id]
                await coordinator.async_request_refresh()
            else:
                raise HomeAssistantError(f"Configuration entry {config_entry_id} not found")
        else:
            # Refresh all entries
            for coordinator in hass.data[DOMAIN].values():
                await coordinator.async_request_refresh()
    
    async def update_device_service(call: ServiceCall) -> None:
        """Handle update device service call."""
        device_id = call.data.get("device_id")
        name = call.data.get("name")
        device_type = call.data.get("device_type")
        
        if not device_id:
            raise HomeAssistantError("Device ID is required")
        
        _LOGGER.info("Updating device %s: name=%s, type=%s", device_id, name, device_type)
        
        # Update device information in all coordinators
        for coordinator in hass.data[DOMAIN].values():
            if coordinator.data and "devices" in coordinator.data:
                for device in coordinator.data["devices"]:
                    if device.get("id") == device_id:
                        if name:
                            device["name"] = name
                        if device_type:
                            device["type"] = device_type
                        await coordinator.async_request_refresh()
                        break
    
    hass.services.async_register(
        DOMAIN,
        "refresh_data",
        refresh_data_service,
    )
    
    hass.services.async_register(
        DOMAIN,
        "update_device",
        update_device_service,
    )


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)
    
    return unload_ok


class NetworkNestDataUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching data from the NetworkNest API."""

    def __init__(self, hass: HomeAssistant, api: NetworkNestAPI) -> None:
        """Initialize."""
        self.api = api
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=UPDATE_INTERVAL),
        )

    async def _async_update_data(self):
        """Update data via library."""
        _LOGGER.debug("Fetching data from NetworkNest API...")
        try:
            data = await self.api.async_get_states()
            _LOGGER.debug("Successfully fetched data: %s", data)
            return data
        except Exception as exc:
            _LOGGER.error("Failed to fetch data from NetworkNest API: %s", exc, exc_info=True)
            raise