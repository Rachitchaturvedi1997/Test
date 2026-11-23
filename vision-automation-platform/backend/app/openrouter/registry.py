"""Configurable model registry. No model id is hardcoded in application logic;
defaults here can be overridden by env (OR_MODEL_<ROLE>) or a JSON file."""
from __future__ import annotations
import json, os
from pydantic import BaseModel

ROLES = ("planning", "computer_use", "verification", "recovery")


class ModelChoice(BaseModel):
    primary: str
    fallbacks: list[str] = []


DEFAULTS: dict[str, ModelChoice] = {
    "planning": ModelChoice(primary="anthropic/claude-haiku-5.5", fallbacks=["anthropic/claude-sonnet-5.5"]),
    "computer_use": ModelChoice(primary="anthropic/claude-haiku-5.5", fallbacks=["anthropic/claude-sonnet-5.5"]),
    "verification": ModelChoice(primary="anthropic/claude-haiku-5.5", fallbacks=["anthropic/claude-sonnet-5.5"]),
    "recovery": ModelChoice(primary="anthropic/claude-haiku-5.5", fallbacks=["anthropic/claude-sonnet-5.5"]),
}


class ModelRegistry:
    def __init__(self, overrides: dict[str, ModelChoice] | None = None):
        self._m = {**DEFAULTS, **(overrides or {})}

    @classmethod
    def load(cls, path: str | None = None) -> "ModelRegistry":
        ov: dict[str, ModelChoice] = {}
        path = path or os.getenv("MODEL_REGISTRY_FILE")
        if path and os.path.exists(path):
            with open(path) as f:
                ov = {k: ModelChoice(**v) for k, v in json.load(f).items()}
        for role in ROLES:
            env = os.getenv(f"OR_MODEL_{role.upper()}")
            if env:
                ids = [x.strip() for x in env.split(",") if x.strip()]
                ov[role] = ModelChoice(primary=ids[0], fallbacks=ids[1:])
        return cls(ov)

    def chain(self, role: str) -> list[str]:
        c = self._m[role]
        return [c.primary, *c.fallbacks]
