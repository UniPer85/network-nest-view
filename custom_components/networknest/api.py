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
        
        try:
            async with session.get(url, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
        except aiohttp.ClientError as exc:
            _LOGGER.error("Error making request to %s: %s", url, exc)
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