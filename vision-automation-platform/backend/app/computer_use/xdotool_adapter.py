"""X11 desktop adapter for a per-session Linux container (Xvfb/XFCE).
Input = real X input events via xdotool; screenshots = real framebuffer capture via ImageMagick `import`.
Runs commands with DISPLAY set to the session's own display, which is the isolation boundary."""
from __future__ import annotations
import asyncio, os
from .adapter import ComputerUseAdapter
from .. import actions as A

SCROLL_BUTTON = {"up": 4, "down": 5, "left": 6, "right": 7}


class XdotoolAdapter(ComputerUseAdapter):
    def __init__(self, display: str = ":1"):
        self.env = {**os.environ, "DISPLAY": display}

    async def _run(self, *args: str) -> bytes:
        p = await asyncio.create_subprocess_exec(*args, env=self.env, stdout=asyncio.subprocess.PIPE,
                                                 stderr=asyncio.subprocess.PIPE)
        out, err = await p.communicate()
        if p.returncode != 0:
            raise RuntimeError(f"{args[0]} failed: {err.decode()[:200]}")
        return out

    async def screenshot(self) -> bytes:
        return await self._run("import", "-window", "root", "png:-")

    async def screen_size(self) -> tuple[int, int]:
        out = (await self._run("xdotool", "getdisplaygeometry")).decode().split()
        return int(out[0]), int(out[1])

    async def execute(self, a: A.Action) -> None:
        x = self._run
        if isinstance(a, A.Click):
            btn = {"click": "1", "double_click": "1", "right_click": "3"}[a.type]
            rep = ["--repeat", "2", "--delay", "80"] if a.type == "double_click" else []
            await x("xdotool", "mousemove", str(a.x), str(a.y))
            await x("xdotool", "click", *rep, btn)
        elif isinstance(a, A.Move):
            await x("xdotool", "mousemove", str(a.x), str(a.y))
        elif isinstance(a, A.MouseButton):
            await x("xdotool", "mousemove", str(a.x), str(a.y))
            await x("xdotool", "mousedown" if a.type == "mouse_down" else "mouseup", "1")
        elif isinstance(a, A.Drag):
            await x("xdotool", "mousemove", str(a.x), str(a.y), "mousedown", "1")
            await x("xdotool", "mousemove", str(a.to_x), str(a.to_y))
            await x("xdotool", "mouseup", "1")
        elif isinstance(a, A.TypeText):
            await x("xdotool", "type", "--delay", "20", "--", a.text)
        elif isinstance(a, A.Key):
            await x("xdotool", "key", *a.keys.split())
        elif isinstance(a, A.Scroll):
            await x("xdotool", "mousemove", str(a.x), str(a.y))  # wheel goes to the panel under the pointer
            await x("xdotool", "click", "--repeat", str(a.amount), "--delay", "40", str(SCROLL_BUTTON[a.direction]))
        elif isinstance(a, A.Wait):
            await asyncio.sleep(a.seconds)
