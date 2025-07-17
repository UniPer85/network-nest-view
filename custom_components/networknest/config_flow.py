"""Config flow for NetworkNest integration."""
from __future__ import annotations

import logging
from typing import Any

import aiohttp
import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.exceptions import HomeAssistantError

from .api import NetworkNestAPI
from .const import DOMAIN, CONF_API_KEY, CONF_BASE_URL, DEFAULT_BASE_URL

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_API_KEY): str,
        vol.Optional(CONF_BASE_URL, default=DEFAULT_BASE_URL): str,
    }
)


async def validate_input(hass: HomeAssistant, data: dict[str, Any]) -> dict[str, Any]:
    """Validate the user input allows us to connect."""
    api = NetworkNestAPI(data[CONF_API_KEY], data[CONF_BASE_URL])
    
    # Try to get discovery info to validate the API key
    try:
        _LOGGER.info("Validating API connection to %s", data[CONF_BASE_URL])
        discovery_data = await api.async_get_discovery()
        _LOGGER.info("API validation successful, discovery data: %s", discovery_data)
        
        # Also try to get states to ensure both endpoints work
        states_data = await api.async_get_states()
        _LOGGER.info("States endpoint validation successful")
        
    except aiohttp.ClientError as exc:
        _LOGGER.error("Connection error during validation: %s", exc)
        raise CannotConnect from exc
    except Exception as exc:
        _LOGGER.error("Authentication error during validation: %s", exc)
        raise InvalidAuth from exc
    finally:
        await api.close()
    
    return {"title": "NetworkNest"}


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for NetworkNest."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}
        
        if user_input is not None:
            try:
                info = await validate_input(self.hass, user_input)
            except CannotConnect:
                errors["base"] = "cannot_connect"
            except InvalidAuth:
                errors["base"] = "invalid_auth"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"
            else:
                # Check if already configured
                await self.async_set_unique_id(user_input[CONF_API_KEY])
                self._abort_if_unique_id_configured()
                
                return self.async_create_entry(title=info["title"], data=user_input)

        return self.async_show_form(
            step_id="user", data_schema=STEP_USER_DATA_SCHEMA, errors=errors
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Create the options flow."""
        return OptionsFlowHandler(config_entry)


class OptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options flow for NetworkNest."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options."""
        errors: dict[str, str] = {}
        
        if user_input is not None:
            try:
                # Validate the input
                await validate_input(self.hass, user_input)
            except CannotConnect:
                errors["base"] = "cannot_connect"
            except InvalidAuth:
                errors["base"] = "invalid_auth"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"
            else:
                return self.async_create_entry(title="", data=user_input)
        
        # Pre-populate with current config
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_API_KEY,
                    default=self.config_entry.data.get(CONF_API_KEY, "")
                ): str,
                vol.Optional(
                    CONF_BASE_URL,
                    default=self.config_entry.data.get(CONF_BASE_URL, DEFAULT_BASE_URL)
                ): str,
            }
        )
        
        return self.async_show_form(
            step_id="init", data_schema=schema, errors=errors
        )


class CannotConnect(HomeAssistantError):
    """Error to indicate we cannot connect."""


class InvalidAuth(HomeAssistantError):
    """Error to indicate there is invalid auth."""