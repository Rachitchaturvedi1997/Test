import json, io, asyncio
import httpx, openpyxl, pytest
from PIL import Image
from app.actions import ActionRejected, parse_action, validate_action
from app.computer_use.adapter import ComputerUseAdapter
from app.openrouter.client import OpenRouterClient, OpenRouterError
from app.openrouter.registry import ModelRegistry, ModelChoice
from app.agent.loop import run_goal
from app.excel.parser import read_workbook, write_results, validate_row


def png():
    b = io.BytesIO(); Image.new("RGB", (100, 80), "white").save(b, "PNG"); return b.getvalue()


class FakeDesktop(ComputerUseAdapter):
    def __init__(self): self.log = []
    async def screenshot(self): return png()
    async def screen_size(self): return (100, 80)
    async def execute(self, a): self.log.append(a.type)


def mock_client(handler, registry=None):
    return OpenRouterClient(registry=registry or ModelRegistry(), api_key="k", retries=0,
                            transport=httpx.MockTransport(handler))


def reply(content, cost=0.001):
    return httpx.Response(200, json={"choices": [{"message": {"content": content}}],
                                     "usage": {"prompt_tokens": 10, "completion_tokens": 5, "cost": cost}})


def test_action_validation():
    ok = validate_action(parse_action({"type": "click", "x": 5, "y": 5}), 100, 80)
    assert ok.type == "click"
    with pytest.raises(ActionRejected): validate_action(parse_action({"type": "click", "x": 500, "y": 5}), 100, 80)
    with pytest.raises(ActionRejected): validate_action(parse_action({"type": "key", "keys": "ctrl+alt+Delete"}), 100, 80)
    with pytest.raises(ActionRejected): parse_action({"type": "evaluate_js", "code": "x"})


def test_registry_no_hardcoding(monkeypatch):
    monkeypatch.setenv("OR_MODEL_COMPUTER_USE", "a/b,c/d")
    assert ModelRegistry.load().chain("computer_use") == ["a/b", "c/d"]


def test_fallback_and_cost():
    models = []
    def h(req):
        m = json.loads(req.content)["model"]; models.append(m)
        return httpx.Response(503) if len(models) == 1 else reply("hi")
    reg = ModelRegistry({"planning": ModelChoice(primary="p/one", fallbacks=["p/two"])})
    c = mock_client(h, reg)
    out = asyncio.run(c.chat("planning", [{"role": "user", "content": "x"}], scope={"tenant": "t1", "session": "s1"}))
    assert out == "hi" and models == ["p/one", "p/two"]
    assert c.usage.get("tenant", "t1").cost_usd == pytest.approx(0.001)


def test_auth_error_does_not_retry():
    n = []
    def h(req): n.append(1); return httpx.Response(401, json={"error": "no"})
    with pytest.raises(OpenRouterError): asyncio.run(mock_client(h).chat("planning", []))
    assert len(n) == 1


def scripted(replies):
    it = iter(replies)
    def h(req): return reply(next(it))
    return h


def test_loop_verifies_and_never_trusts_done():
    d = FakeDesktop()
    c = mock_client(scripted([
        json.dumps({"action": {"type": "click", "x": 10, "y": 10, "risk": "data_entry"}, "expected": "field focused"}),
        json.dumps({"verified": True, "confidence": 0.9, "evidence": "cursor in field"}),
        json.dumps({"action": {"type": "done", "result": "filled"}}),
        json.dumps({"verified": False, "confidence": 0.3, "evidence": "form still empty"}),   # verifier rejects done
        json.dumps({"action": {"type": "need_human"}}),
    ]))
    r = asyncio.run(run_goal(d, c, "fill form", settle=0))
    assert r.status == "needs_human" and d.log == ["click"]
    assert [s.verified for s in r.steps][:2] == [True, False]


def test_high_risk_requires_approval():
    d = FakeDesktop()
    c = mock_client(scripted([json.dumps({"action": {"type": "click", "x": 1, "y": 1, "risk": "high"}})]))
    async def deny(a): return False
    r = asyncio.run(run_goal(d, c, "submit", approve_high_risk=deny, settle=0))
    assert r.status == "needs_human" and d.log == []


def test_invalid_actions_escalate():
    d = FakeDesktop()
    bad = json.dumps({"action": {"type": "click", "x": 9999, "y": 1}})
    r = asyncio.run(run_goal(d, mock_client(scripted([bad] * 3)), "x", settle=0))
    assert r.status == "needs_review" and d.log == []


def test_excel_roundtrip_preserves_original(tmp_path):
    p = tmp_path / "in.xlsx"; wb = openpyxl.Workbook(); ws = wb.active
    ws.append(["Customer Name", "Mobile Number", "City"]); ws.append(["A", "9876543210", "Bangalore"]); ws.append(["B", "", "Mumbai"])
    wb.save(p)
    s = read_workbook(p)[0]
    assert [r["_row"] for r in s.rows] == [2, 3]
    assert validate_row(s.rows[1], ["Mobile Number"]) == ["missing Mobile Number"]
    out = tmp_path / "out.xlsx"
    write_results(p, out, s.name, {2: {"status": "success", "detail": "ok"}, 3: {"status": "skipped", "detail": "no mobile"}})
    w2 = openpyxl.load_workbook(out).active
    assert w2["A2"].value == "A" and w2["D1"].value == "AI_Status" and w2["D3"].value == "skipped"
