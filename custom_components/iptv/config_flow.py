"""Config flow for the IPTV integration (Xtream Codes or Stalker portal)."""

from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

import voluptuous as vol

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.const import CONF_PASSWORD, CONF_URL, CONF_USERNAME
from homeassistant.core import callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

from .api import (
    StalkerClient,
    IptvAuthError,
    XtreamClient,
    IptvError,
    normalize_mac,
    normalize_url,
    valid_mac,
)
from .const import (
    CONF_MAC,
    CONF_PROVIDER,
    CONF_NOTIFY_DAYS,
    CONF_SCAN_INTERVAL,
    DEFAULT_NOTIFY_DAYS,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    MIN_SCAN_INTERVAL,
    PROVIDER_STALKER,
    PROVIDER_XTREAM,
)
from .migrate import async_migrate_legacy

XTREAM_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_URL): TextSelector(TextSelectorConfig(type=TextSelectorType.URL)),
        vol.Required(CONF_USERNAME): TextSelector(),
        vol.Required(CONF_PASSWORD): TextSelector(
            TextSelectorConfig(type=TextSelectorType.PASSWORD)
        ),
    }
)
STALKER_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_URL): TextSelector(TextSelectorConfig(type=TextSelectorType.URL)),
        vol.Required(CONF_MAC): TextSelector(),
    }
)


def _host(url: str) -> str:
    return urlparse(url).hostname or url


class IptvConfigFlow(ConfigFlow, domain=DOMAIN):
    """Pick a provider, ask for its credentials, and check them."""

    VERSION = 1

    # ── credential checks ──

    async def _check_xtream(self, data: dict[str, Any]) -> dict[str, str]:
        client = XtreamClient(
            async_get_clientsession(self.hass),
            data[CONF_URL],
            data[CONF_USERNAME],
            data[CONF_PASSWORD],
        )
        return await self._check(client)

    async def _check_stalker(self, data: dict[str, Any]) -> dict[str, str]:
        client = StalkerClient(
            async_get_clientsession(self.hass), data[CONF_URL], data[CONF_MAC]
        )
        return await self._check(client)

    async def _check(self, client: XtreamClient | StalkerClient) -> dict[str, str]:
        try:
            await client.async_get_user_info()
        except IptvAuthError:
            return {"base": "invalid_auth"}
        except IptvError:
            return {"base": "cannot_connect"}
        return {}

    # ── migration from the former iptv_xtream domain ──

    async def async_step_import(self, import_data: dict[str, Any]) -> ConfigFlowResult:
        """Re-create a legacy account as is, without checking the server."""
        await self.async_set_unique_id(import_data["unique_id"])
        self._abort_if_unique_id_configured()
        return self.async_create_entry(
            title=import_data["title"],
            data=import_data["data"],
            options=import_data["options"],
        )

    # ── new entry ──

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        # Upgrading from iptv_xtream (< 3.0): move the existing accounts instead
        if count := await async_migrate_legacy(self.hass):
            return self.async_abort(
                reason="migrated", description_placeholders={"count": str(count)}
            )
        return self.async_show_menu(
            step_id="user", menu_options=[PROVIDER_XTREAM, PROVIDER_STALKER]
        )

    async def async_step_xtream(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            user_input[CONF_URL] = normalize_url(user_input[CONF_URL])
            user_input[CONF_PROVIDER] = PROVIDER_XTREAM
            await self.async_set_unique_id(
                f"{user_input[CONF_URL]}|{user_input[CONF_USERNAME]}".lower()
            )
            self._abort_if_unique_id_configured()
            errors = await self._check_xtream(user_input)
            if not errors:
                return self.async_create_entry(
                    title=f"{user_input[CONF_USERNAME]} @ {_host(user_input[CONF_URL])}",
                    data=user_input,
                )
        return self.async_show_form(
            step_id="xtream",
            data_schema=self.add_suggested_values_to_schema(XTREAM_SCHEMA, user_input),
            errors=errors,
        )

    async def async_step_stalker(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            user_input[CONF_URL] = normalize_url(user_input[CONF_URL])
            user_input[CONF_MAC] = normalize_mac(user_input[CONF_MAC])
            user_input[CONF_PROVIDER] = PROVIDER_STALKER
            if not valid_mac(user_input[CONF_MAC]):
                errors = {"base": "invalid_mac"}
            else:
                await self.async_set_unique_id(
                    f"{user_input[CONF_URL]}|{user_input[CONF_MAC]}".lower()
                )
                self._abort_if_unique_id_configured()
                errors = await self._check_stalker(user_input)
                if not errors:
                    return self.async_create_entry(
                        title=f"{user_input[CONF_MAC]} @ {_host(user_input[CONF_URL])}",
                        data=user_input,
                    )
        return self.async_show_form(
            step_id="stalker",
            data_schema=self.add_suggested_values_to_schema(STALKER_SCHEMA, user_input),
            errors=errors,
        )

    # ── reconfigure (same provider as the entry) ──

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        stalker = entry.data.get(CONF_PROVIDER) == PROVIDER_STALKER
        schema = STALKER_SCHEMA if stalker else XTREAM_SCHEMA
        errors: dict[str, str] = {}
        if user_input is not None:
            user_input[CONF_URL] = normalize_url(user_input[CONF_URL])
            user_input[CONF_PROVIDER] = entry.data.get(CONF_PROVIDER, PROVIDER_XTREAM)
            if stalker:
                user_input[CONF_MAC] = normalize_mac(user_input[CONF_MAC])
                if not valid_mac(user_input[CONF_MAC]):
                    errors = {"base": "invalid_mac"}
                else:
                    errors = await self._check_stalker(user_input)
            else:
                errors = await self._check_xtream(user_input)
            if not errors:
                return self.async_update_reload_and_abort(entry, data=user_input)
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=self.add_suggested_values_to_schema(schema, user_input or entry.data),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return IptvOptionsFlow()


class IptvOptionsFlow(OptionsFlow):
    """Polling interval and expiration notification."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_SCAN_INTERVAL,
                        default=self.config_entry.options.get(
                            CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL
                        ),
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=MIN_SCAN_INTERVAL,
                            max=1440,
                            step=1,
                            unit_of_measurement="min",
                            mode=NumberSelectorMode.BOX,
                        )
                    ),
                    vol.Required(
                        CONF_NOTIFY_DAYS,
                        default=self.config_entry.options.get(
                            CONF_NOTIFY_DAYS, DEFAULT_NOTIFY_DAYS
                        ),
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=0,
                            max=60,
                            step=1,
                            unit_of_measurement="d",
                            mode=NumberSelectorMode.BOX,
                        )
                    ),
                }
            ),
        )
