"""Live presence: other visitors' cursors, an online count and a small chat box.

State lives in memory on a single process, so it resets on every deploy and would
need a shared broker (e.g. Redis) to run on more than one instance. That trade-off
is fine for a personal site.
"""

import asyncio
import itertools
import json
import time
from collections import deque
from urllib.parse import urlparse

from fastapi import WebSocket, WebSocketDisconnect

MAX_CLIENTS = 200
MAX_FRAME = 1000  # bytes; anything bigger is dropped
CHAT_HISTORY = 50
CHAT_MAX_LEN = 280
NAME_MAX_LEN = 24
CHAT_COOLDOWN = 1.5  # seconds between chat messages per connection
CURSOR_INTERVAL = 0.04  # seconds between relayed cursor updates per connection

COLORS = ["#ff77a8", "#7fdbff", "#ffd36e", "#a6ff8f", "#c3a6ff", "#ff9e5e", "#6effe0", "#ff6e6e"]

_ids = itertools.count(1)


class Client:
    def __init__(self, ws: WebSocket):
        self.ws = ws
        self.id = next(_ids)
        self.color = COLORS[self.id % len(COLORS)]
        self.last_chat = 0.0
        self.last_cursor = 0.0


class Hub:
    def __init__(self) -> None:
        self.clients: dict[int, Client] = {}
        self.history: deque[dict] = deque(maxlen=CHAT_HISTORY)

    async def broadcast(self, payload: dict, skip: int | None = None) -> None:
        text = json.dumps(payload)
        targets = [c for c in self.clients.values() if c.id != skip]
        results = await asyncio.gather(*(c.ws.send_text(text) for c in targets), return_exceptions=True)
        for c, r in zip(targets, results):
            if isinstance(r, Exception):
                self.clients.pop(c.id, None)

    def clear_chat(self) -> None:
        self.history.clear()


hub = Hub()


def _origin_allowed(ws: WebSocket, allowed: list[str]) -> bool:
    origin = ws.headers.get("origin")
    if not origin:  # non-browser client; browsers always send Origin
        return True
    if origin in allowed or "*" in allowed:
        return True
    return urlparse(origin).netloc == ws.headers.get("host")


def _clean(text: object, limit: int) -> str:
    if not isinstance(text, str):
        return ""
    return " ".join(text.split())[:limit]


def _number(v: object, lo: float, hi: float) -> float | None:
    if isinstance(v, bool) or not isinstance(v, (int, float)):
        return None
    return max(lo, min(hi, float(v)))


async def endpoint(ws: WebSocket, allowed_origins: list[str]) -> None:
    if not _origin_allowed(ws, allowed_origins) or len(hub.clients) >= MAX_CLIENTS:
        await ws.close(code=1008)
        return
    await ws.accept()
    me = Client(ws)
    hub.clients[me.id] = me
    await ws.send_json({"t": "hello", "id": me.id, "color": me.color, "history": list(hub.history)})
    await hub.broadcast({"t": "online", "n": len(hub.clients)})
    try:
        while True:
            raw = await ws.receive_text()
            if len(raw) > MAX_FRAME:
                continue
            try:
                msg = json.loads(raw)
            except ValueError:
                continue
            if not isinstance(msg, dict):
                continue
            now = time.monotonic()
            kind = msg.get("t")

            if kind == "cursor":
                if now - me.last_cursor < CURSOR_INTERVAL:
                    continue
                x = _number(msg.get("x"), -4000, 4000)
                y = _number(msg.get("y"), 0, 100_000)
                if x is None or y is None:
                    continue
                me.last_cursor = now
                path = _clean(msg.get("path"), 120) or "/"
                await hub.broadcast(
                    {"t": "cursor", "id": me.id, "color": me.color, "x": round(x), "y": round(y), "path": path},
                    skip=me.id,
                )

            elif kind == "hide":
                await hub.broadcast({"t": "leave", "id": me.id}, skip=me.id)

            elif kind == "chat":
                text = _clean(msg.get("text"), CHAT_MAX_LEN)
                if not text:
                    continue
                if now - me.last_chat < CHAT_COOLDOWN:
                    await ws.send_json({"t": "error", "text": "Slow down a little."})
                    continue
                me.last_chat = now
                name = _clean(msg.get("name"), NAME_MAX_LEN) or f"guest{me.id}"
                entry = {"t": "chat", "name": name, "text": text, "color": me.color, "at": int(time.time() * 1000)}
                hub.history.append(entry)
                await hub.broadcast(entry)
    except WebSocketDisconnect:
        pass
    finally:
        hub.clients.pop(me.id, None)
        await hub.broadcast({"t": "leave", "id": me.id})
        await hub.broadcast({"t": "online", "n": len(hub.clients)})
