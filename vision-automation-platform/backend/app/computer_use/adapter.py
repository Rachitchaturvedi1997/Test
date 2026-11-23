"""ComputerUseAdapter: the only way the agent touches a desktop. Pixels in, mouse/keyboard out.
No DOM, no selectors, no browser automation APIs anywhere behind this interface."""
from __future__ import annotations
import abc
from ..actions import Action


class ComputerUseAdapter(abc.ABC):
    @abc.abstractmethod
    async def screenshot(self) -> bytes: ...  # PNG
    @abc.abstractmethod
    async def screen_size(self) -> tuple[int, int]: ...
    @abc.abstractmethod
    async def execute(self, action: Action) -> None: ...
