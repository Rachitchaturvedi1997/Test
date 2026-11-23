"""Central OpenRouter client: the ONLY place the app talks to an AI provider.
Handles auth (key from env, never logged), timeouts, retries, model fallback,
and token/cost accounting per tenant/session/task."""
from __future__ import annotations
import asyncio, base64, os
from collections import defaultdict
from dataclasses import dataclass, field
import httpx
from .registry import ModelRegistry

BASE_URL = "https://openrouter.ai/api/v1"


class OpenRouterError(Exception):
    pass


@dataclass
class Usage:
    requests: int = 0
    prompt_tokens: int = 0
    completion_tokens: int = 0
    cost_usd: float = 0.0


@dataclass
class UsageTracker:
    by_key: dict[tuple, Usage] = field(default_factory=lambda: defaultdict(Usage))

    def add(self, scope: dict, usage: dict):
        for k in (("tenant", scope.get("tenant")), ("session", scope.get("session")), ("task", scope.get("task"))):
            if k[1] is None:
                continue
            u = self.by_key[k]
            u.requests += 1
            u.prompt_tokens += usage.get("prompt_tokens", 0) or 0
            u.completion_tokens += usage.get("completion_tokens", 0) or 0
            u.cost_usd += float(usage.get("cost", 0) or 0)

    def get(self, kind: str, ident: str) -> Usage:
        return self.by_key[(kind, ident)]


def image_part(png_bytes: bytes) -> dict:
    b64 = base64.b64encode(png_bytes).decode()
    return {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}}


class OpenRouterClient:
    def __init__(self, registry: ModelRegistry | None = None, api_key: str | None = None,
                 timeout: float = 60, retries: int = 2, transport: httpx.AsyncBaseTransport | None = None):
        self.registry = registry or ModelRegistry.load()
        self._key = api_key or os.getenv("OPENROUTER_API_KEY", "")
        self.timeout, self.retries = timeout, retries
        self.usage = UsageTracker()
        self._http = httpx.AsyncClient(base_url=BASE_URL, timeout=timeout, transport=transport)

    async def chat(self, role: str, messages: list[dict], scope: dict | None = None,
                   max_tokens: int = 1024, json_mode: bool = False) -> str:
        last: Exception | None = None
        for model in self.registry.chain(role):
            for attempt in range(self.retries + 1):
                try:
                    body = {"model": model, "messages": messages, "max_tokens": max_tokens,
                            "usage": {"include": True}}
                    if json_mode:
                        body["response_format"] = {"type": "json_object"}
                    r = await self._http.post("/chat/completions", json=body,
                                              headers={"Authorization": f"Bearer {self._key}"})
                    if r.status_code in (408, 429) or r.status_code >= 500:
                        raise OpenRouterError(f"{model}: HTTP {r.status_code}")
                    if r.status_code >= 400:
                        # auth / bad request: retrying or falling back will not help
                        raise OpenRouterError(f"HTTP {r.status_code}: {r.text[:200]}") from None
                    data = r.json()
                    self.usage.add(scope or {}, data.get("usage") or {})
                    return data["choices"][0]["message"]["content"] or ""
                except (httpx.TimeoutException, httpx.TransportError) as e:
                    last = e
                except OpenRouterError as e:
                    last = e
                    if "HTTP 4" in str(e) and "HTTP 408" not in str(e) and "HTTP 429" not in str(e):
                        raise
                await asyncio.sleep(min(0.5 * 2 ** attempt, 4))
        raise OpenRouterError(f"all models failed: {last}")

    async def aclose(self):
        await self._http.aclose()
