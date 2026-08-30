from fastapi import Request, WebSocket
import pytest

from app.core.config import get_settings
from app.core.rate_limit import client_ip


def http_connection(peer: str, forwarded: str = "") -> Request:
    headers = []
    if forwarded:
        headers.append((b"x-forwarded-for", forwarded.encode("ascii")))
    return Request({"type": "http", "headers": headers, "client": (peer, 1234)})


def websocket_connection(peer: str, forwarded: str = "") -> WebSocket:
    headers = []
    if forwarded:
        headers.append((b"x-forwarded-for", forwarded.encode("ascii")))
    return WebSocket(
        {"type": "websocket", "headers": headers, "client": (peer, 1234)},
        receive=lambda: None,
        send=lambda message: None,
    )


@pytest.fixture
def trusted_proxies():
    settings = get_settings()
    original = settings.TRUSTED_PROXY_CIDRS

    def configure(value: str) -> None:
        settings.TRUSTED_PROXY_CIDRS = value

    yield configure
    settings.TRUSTED_PROXY_CIDRS = original


def test_forwarded_header_from_untrusted_peer_is_ignored(trusted_proxies):
    trusted_proxies("10.0.0.0/8")
    request = http_connection("198.51.100.10", "203.0.113.99")

    assert client_ip(request) == "198.51.100.10"


def test_trusted_proxy_can_supply_client_ip(trusted_proxies):
    trusted_proxies("10.0.0.0/8")
    request = http_connection("10.0.0.5", "203.0.113.20")

    assert client_ip(request) == "203.0.113.20"


def test_spoofed_leftmost_address_does_not_control_rate_limit_key(trusted_proxies):
    trusted_proxies("10.0.0.0/8")
    request = http_connection(
        "10.0.0.5",
        "192.0.2.200, 198.51.100.42",
    )

    assert client_ip(request) == "198.51.100.42"


def test_multiple_trusted_proxy_hops_are_skipped(trusted_proxies):
    trusted_proxies("10.0.0.0/8,fd00::/8")
    request = http_connection(
        "10.0.0.5",
        "203.0.113.20, 10.0.0.4, fd00::2",
    )

    assert client_ip(request) == "203.0.113.20"


@pytest.mark.parametrize(
    "forwarded",
    ["not-an-ip", "203.0.113.20,,10.0.0.4", "1.1.1.1," * 21],
)
def test_invalid_forwarded_chain_falls_back_to_socket_peer(
    trusted_proxies, forwarded
):
    trusted_proxies("10.0.0.0/8")
    request = http_connection("10.0.0.5", forwarded)

    assert client_ip(request) == "10.0.0.5"


def test_websocket_uses_the_same_trusted_proxy_rules(trusted_proxies):
    trusted_proxies("10.0.0.0/8")
    websocket = websocket_connection("10.0.0.5", "203.0.113.20")

    assert client_ip(websocket) == "203.0.113.20"
