"""The vision loop: screenshot -> model -> structured action -> validate -> execute -> fresh screenshot -> verify.
The screenshot is the only source of truth. Model confidence is never treated as proof of success."""
from __future__ import annotations
import asyncio, json, re, time
from dataclasses import dataclass, field
from typing import Awaitable, Callable
from ..actions import ActionRejected, Done, Fail, NeedHuman, Wait, parse_action, validate_action
from ..computer_use.adapter import ComputerUseAdapter
from ..openrouter.client import OpenRouterClient, image_part

SYSTEM = """You operate a Linux desktop ONLY by looking at screenshots. You get one fresh screenshot per turn.
Coordinates are pixels in that screenshot. Never reuse coordinates from an earlier screenshot: after scrolling,
opening a dropdown or any page change, positions move.
Reply with ONE JSON object: {"action": {...}, "expected": "what the screen should show after this action"}.
Action types: click|double_click|right_click {x,y}; move {x,y}; drag {x,y,to_x,to_y}; mouse_down|mouse_up {x,y};
type {text}; key {keys}; scroll {x,y,direction:up|down|left|right,amount}; wait {seconds};
need_human {} for OTP/MFA/CAPTCHA/login walls/access denied (never try to bypass them);
done {result} only when the goal is visibly complete; fail {reason}.
Every action may carry "reason" and "risk": "low" (navigation), "data_entry", or "high" (submit/save/create/delete/pay).
Dropdowns: click it, look at the NEW screenshot, scroll inside the list if needed, pick the option, then confirm the shown value.
Off-screen fields: scroll with the pointer over the right panel, then look again before clicking."""

VERIFY = """You are an independent verifier. Compare BEFORE and AFTER screenshots with the intended action and expectation.
Reply JSON only: {"verified": true|false, "confidence": 0..1, "evidence": "what you literally see"}.
verified=true only if the expected visible result is clearly present. If unsure, verified=false."""


def extract_json(text: str) -> dict:
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        raise ValueError("no JSON object in model reply")
    return json.loads(m.group(0))


@dataclass
class Control:
    paused: bool = False
    stopped: bool = False

    async def checkpoint(self):
        while self.paused and not self.stopped:
            await asyncio.sleep(0.2)


@dataclass
class StepRecord:
    ts: float
    action: dict
    expected: str
    verified: bool | None
    confidence: float | None
    evidence: str
    before_png: bytes = field(repr=False, default=b"")
    after_png: bytes = field(repr=False, default=b"")
    note: str = ""


@dataclass
class LoopResult:
    status: str  # done | failed | needs_human | needs_review | stopped | max_steps
    detail: str = ""
    steps: list[StepRecord] = field(default_factory=list)


ApproveFn = Callable[[dict], Awaitable[bool]]


async def run_goal(adapter: ComputerUseAdapter, client: OpenRouterClient, goal: str, *, scope: dict | None = None,
                   control: Control | None = None, approve_high_risk: ApproveFn | None = None,
                   max_steps: int = 40, settle: float = 0.8, max_rejections: int = 3) -> LoopResult:
    control = control or Control()
    res = LoopResult("max_steps")
    history: list[str] = []
    feedback = ""
    rejections = 0
    w, h = await adapter.screen_size()
    for _ in range(max_steps):
        await control.checkpoint()
        if control.stopped:
            res.status = "stopped"; return res
        before = await adapter.screenshot()
        user = [{"type": "text", "text": f"GOAL: {goal}\nScreen: {w}x{h}\nRecent steps:\n" + "\n".join(history[-8:]) +
                 (f"\nNOTE: {feedback}" if feedback else "")}, image_part(before)]
        feedback = ""
        raw = await client.chat("computer_use", [{"role": "system", "content": SYSTEM}, {"role": "user", "content": user}],
                                scope=scope, json_mode=True)
        try:
            obj = extract_json(raw)
            action = validate_action(parse_action(obj["action"]), w, h)
        except (ActionRejected, ValueError, KeyError) as e:
            rejections += 1
            feedback = f"Your last reply was rejected: {e}. Reply with one valid JSON action."
            if rejections >= max_rejections:
                res.status, res.detail = "needs_review", f"model kept returning invalid actions: {e}"; return res
            continue
        rejections = 0
        expected = str(obj.get("expected", ""))
        ad = action.model_dump()
        if isinstance(action, NeedHuman):
            res.steps.append(StepRecord(time.time(), ad, expected, None, None, "", before, b"", "paused for human"))
            res.status, res.detail = "needs_human", action.reason; return res
        if isinstance(action, Fail):
            res.status, res.detail = "failed", action.reason; return res
        if isinstance(action, Done):
            # never trust "done": confirm on a fresh screenshot
            v = await _verify(client, scope, goal, f"claimed done: {action.result}", before, before)
            res.steps.append(StepRecord(time.time(), ad, expected, v["verified"], v["confidence"], v["evidence"], before, before))
            if v["verified"]:
                res.status, res.detail = "done", action.result; return res
            feedback = f"Verifier disagrees that the goal is complete: {v['evidence']}"
            continue
        if action.risk == "high" and approve_high_risk is not None and not await approve_high_risk(ad):
            res.status, res.detail = "needs_human", "high-risk action not approved"; return res
        await adapter.execute(action)
        if not isinstance(action, Wait):
            await asyncio.sleep(settle)
        after = await adapter.screenshot()
        verified = conf = None
        evidence = ""
        if action.risk != "low" or action.type in ("scroll", "mouse_up", "drag"):
            v = await _verify(client, scope, goal, f"action={ad} expected={expected}", before, after)
            verified, conf, evidence = v["verified"], v["confidence"], v["evidence"]
            if not verified:
                feedback = f"Verifier could not confirm the last action ({action.type}): {evidence}. Look again and retry or adjust."
        res.steps.append(StepRecord(time.time(), ad, expected, verified, conf, evidence, before, after))
        history.append(f"{action.type} {ad.get('x', '')},{ad.get('y', '')} {ad.get('text', ad.get('keys', ''))} -> "
                       f"{'verified' if verified else 'unverified' if verified is False else 'unchecked'}")
    return res


async def _verify(client, scope, goal, what, before, after) -> dict:
    user = [{"type": "text", "text": f"Goal: {goal}\n{what}\nFirst image = BEFORE, second = AFTER."},
            image_part(before), image_part(after)]
    try:
        raw = await client.chat("verification", [{"role": "system", "content": VERIFY}, {"role": "user", "content": user}],
                                scope=scope, json_mode=True)
        o = extract_json(raw)
        return {"verified": bool(o.get("verified")), "confidence": float(o.get("confidence", 0)), "evidence": str(o.get("evidence", ""))}
    except Exception as e:  # ambiguity or failure is never success
        return {"verified": False, "confidence": 0.0, "evidence": f"verification error: {e}"}
