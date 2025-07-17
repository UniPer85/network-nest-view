"""API client for NetworkNest."""
from __future__ import annotations

import asyncio
import logging
from typing import Any

import aiohttp

_LOGGER = logging.getLogger(__name__)


class NetworkNestAPI:
    """NetworkNest API client."""

    def __init__(self, api_key: str, base_url: str) -> None:
        """Initialize the API client."""
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create an aiohttp session."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session

    async def _make_request(self, endpoint: str) -> dict[str, Any]:
        """Make a request to the API."""
        session = await self._get_session()
        headers = {"x-api-key": self.api_key}
        url = f"{self.base_url}/functions/v1/{endpoint}"
        
        _LOGGER.debug("Making request to %s with headers: %s", url, {k: v[:10] + "..." if k == "x-api-key" else v for k, v in headers.items()})
        
        try:
            async with session.get(url, headers=headers) as response:
                _LOGGER.debug("Response status: %s", response.status)
                response.raise_for_status()
                data = await response.json()
                _LOGGER.debug("Response data: %s", data)
                return data
        except aiohttp.ClientError as exc:
            _LOGGER.error("Error making request to %s: %s", url, exc)
            raise
        except Exception as exc:
            _LOGGER.error("Unexpected error making request to %s: %s", url, exc)
            raise

    async def async_get_discovery(self) -> dict[str, Any]:
        """Get discovery information."""
        return await self._make_request("homeassistant-discovery")

    async def async_get_states(self) -> dict[str, Any]:
        """Get current states."""
        return await self._make_request("homeassistant-states")

    async def close(self) -> None:
        """Close the session."""
        if self.session and not self.session.closed:
            await self.session.close()