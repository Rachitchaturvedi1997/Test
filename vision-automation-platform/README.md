# Vision-Based Desktop Automation Platform (web app)

Status: **early foundation**. Done and unit-tested: OpenRouter client (registry, fallback, retries, cost tracking),
structured action schema + validation, the screenshot→action→verify loop, Excel in/out.
Written but **not yet run**: X11 adapter (`xdotool`), per-session desktop container (`docker/`).
Not started: FastAPI service/DB/queue, React UI, planning/approval flow, row-by-row engine, scheduler, Terraform.

Rules: all AI calls go through OpenRouter (`backend/app/openrouter`); default model `anthropic/claude-haiku-5.5`,
changeable per role without code changes. Websites are driven only by pixels + real mouse/keyboard. No Playwright,
Selenium, Puppeteer, DOM, CDP or JS injection.

Run tests: `cd backend && pip install fastapi uvicorn pydantic httpx openpyxl pytest pillow && pytest`
