"""Structured action schema + validation. The model proposes; this layer decides."""
from __future__ import annotations
from typing import Annotated, Literal, Union
from pydantic import BaseModel, Field, TypeAdapter

Risk = Literal["low", "data_entry", "high"]  # high = submit/create/delete/pay


class _Base(BaseModel):
    reason: str = ""
    risk: Risk = "low"


class Click(_Base):
    type: Literal["click", "double_click", "right_click"]
    x: int
    y: int


class Move(_Base):
    type: Literal["move"]
    x: int
    y: int


class Drag(_Base):
    type: Literal["drag"]
    x: int
    y: int
    to_x: int
    to_y: int


class MouseButton(_Base):
    type: Literal["mouse_down", "mouse_up"]
    x: int
    y: int


class TypeText(_Base):
    type: Literal["type"]
    text: str


class Key(_Base):
    type: Literal["key"]
    keys: str  # xdotool-style combo, e.g. "ctrl+a", "Return", "Tab"


class Scroll(_Base):
    type: Literal["scroll"]
    x: int  # pointer position decides WHICH panel scrolls
    y: int
    direction: Literal["up", "down", "left", "right"]
    amount: int = 3


class Wait(_Base):
    type: Literal["wait"]
    seconds: float = 1.0


class NeedHuman(_Base):
    type: Literal["need_human"]  # OTP / MFA / CAPTCHA / unexpected login / access denied


class Done(_Base):
    type: Literal["done"]
    result: str = ""


class Fail(_Base):
    type: Literal["fail"]


Action = Annotated[Union[Click, Move, Drag, MouseButton, TypeText, Key, Scroll, Wait, NeedHuman, Done, Fail],
                   Field(discriminator="type")]
_adapter = TypeAdapter(Action)

ALLOWED_KEYS = {"Return", "Tab", "Escape", "BackSpace", "Delete", "Up", "Down", "Left", "Right", "Home", "End",
                "Page_Up", "Page_Down", "space", "ctrl+a", "ctrl+c", "ctrl+v", "ctrl+x", "ctrl+z", "ctrl+f",
                "shift+Tab", "alt+Left", "alt+Right", "F5", "ctrl+l"}
MAX_TYPE_LEN = 500
MAX_SCROLL = 30
MAX_WAIT = 30.0


class ActionRejected(ValueError):
    pass


def parse_action(obj: dict) -> Action:
    try:
        return _adapter.validate_python(obj)
    except Exception as e:  # pydantic ValidationError
        raise ActionRejected(f"malformed action: {e}") from e


def validate_action(a: Action, width: int, height: int) -> Action:
    def inb(x, y):
        if not (0 <= x < width and 0 <= y < height):
            raise ActionRejected(f"coordinates ({x},{y}) outside screen {width}x{height}")
    if isinstance(a, (Click, Move, MouseButton, Scroll)):
        inb(a.x, a.y)
    if isinstance(a, Drag):
        inb(a.x, a.y); inb(a.to_x, a.to_y)
    if isinstance(a, TypeText) and (not a.text or len(a.text) > MAX_TYPE_LEN):
        raise ActionRejected("type text empty or too long")
    if isinstance(a, Key):
        for part in a.keys.split():
            if part not in ALLOWED_KEYS:
                raise ActionRejected(f"key combo not allowed: {part}")
    if isinstance(a, Scroll) and not (1 <= a.amount <= MAX_SCROLL):
        raise ActionRejected("scroll amount out of range")
    if isinstance(a, Wait) and not (0 < a.seconds <= MAX_WAIT):
        raise ActionRejected("wait out of range")
    return a
