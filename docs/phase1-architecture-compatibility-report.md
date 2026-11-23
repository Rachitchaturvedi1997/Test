# Phase 1 — Repository Inspection & Compatibility Report

Status: **inspection only, nothing built or executed.** Findings come from reading the READMEs, setup scripts, requirements files, `pyproject.toml` files and license docs of shallow clones (AutoCua `123cc40`, CUA `main`). Nothing here has been run on a desktop yet; every "works" claim below is the repos' own claim until Phase 2 proves it.

## 1. AutoCua (ComputerUseAgent/AutoCua)

| Item | Finding |
|---|---|
| License | MIT (Ashish Yadav). Third-party notices shipped separately. |
| Shape | Single agent product, `pip install AutoCua`. Entry point `run_agent(mode, provider, model, task)`. Python + a Rust extension (browser/Android/coder agents). |
| OpenRouter | Supported provider (`provider="openrouter"`, `OPENROUTER_API_KEY`). Model names come from `model_list.txt`; unknown names pass through to the provider. |
| Linux | **GNOME desktop required**, "tested on Ubuntu with Wayland, X11 not tested yet". Reads the screen via AT-SPI + GTK, injects input through the **XDG RemoteDesktop portal**. Needs distro packages (`python3-gi`, `gir1.2-atspi-2.0`, `xdg-desktop-portal-gnome`, PipeWire/GStreamer, …). |
| Input | Portal only. `pyautogui`/`pynput` are deliberately excluded because XTEST does nothing on Wayland-native apps. |
| Scale | Python 3.10–3.14, x86_64 wheel only. |

### Conflicts with the spec — need decisions

1. **It is not purely screenshot-and-coordinate.** The model "never sees a coordinate"; it picks a *numbered element* from a view that **fuses the AT-SPI accessibility tree with OCR**. The spec says "the screenshot is the source of truth" and bans DOM/selector-style inspection. AT-SPI is an OS accessibility tree, not a DOM, but it is structured UI introspection, and for GTK/Qt apps it is far richer than what a human sees. Whether it is acceptable is a **product decision for you**. If not, we use AutoCua only for its input-injection and screenshot layers and write our own screenshot→coordinate action loop.
2. **AutoCua owns the agent loop.** `run_agent()` makes its own LLM calls, so our independent verification layer, per-action approval policy, pause/resume, checkpointing and per-tenant cost tracking cannot sit between steps without wrapping or replacing its loop. Realistically we reuse its *controller/scanner/portal* pieces and drive them from our own LangGraph loop, rather than calling `run_agent` as a black box.
3. **`"browser"` mode and the `web` tool are out of bounds.** Browser mode uses a Chrome extension and a debugging port, which the spec excludes. Only `mode="computer use"` is usable, and the built-in `web` tool and "browser skills" must be disabled and confirmed absent.
4. **First-run consent dialog.** The portal shows a GNOME "share your screen / allow remote control" dialog (persistable via a restore token). Unattended cloud workers need that pre-granted per image or per session. This is the biggest unproven risk for 20 isolated sessions.
5. **Telemetry/cost.** README claims no telemetry. Usage/cost tracking per task/tenant is not something I found a hook for; we will have to meter at our own OpenRouter client.
6. **Maturity.** Classified "Development Status :: 4 - Beta", Wayland-only on Linux, 2.5k+ lines in the shared Python layer plus a Rust crate. Not assumed production-ready.

## 2. CUA (trycua/cua)

License is **per component**, per `legal/LICENSING.md`:

| Component | License | Relevance |
|---|---|---|
| Repo default, `cua` SDK/CLI/daemon, Cua Driver, Lume, `libs/python/{core,agent,cua-sandbox}`, `libs/kasm`, `libs/cua-bench` | MIT | Usable. |
| Cua Spaces apps, `cua-spacesd`, Keyvault, teleport, streaming/media crates, `cua-volume`, Cua Driver Bench | **FSL-1.1-MIT** (source-available; converts to MIT later; competing-use restrictions) | **Avoid for a hosted multi-tenant product** without legal review. |

Relevant pieces:
- `libs/python/cua-sandbox` (MIT, Python 3.11–3.13): ephemeral/persistent sandboxed computers, VNC/SSH based. Candidate for session lifecycle.
- `libs/kasm` and `libs/xfce`, `libs/xfce-cua`: **Linux container images with XFCE desktop in Docker/Kasm**. These are likely the most practical isolation unit, but they are **XFCE/X11, not GNOME/Wayland**, which does not match AutoCua's Linux requirement.
- `libs/qemu-docker`, `libs/lume`: QEMU / Apple-Silicon VMs; Lume is macOS-host only and not useful on AWS.

### AutoCua ⇄ CUA compatibility verdict (provisional)

**Not directly compatible.** CUA's ready-made Linux desktops are XFCE/X11 containers; AutoCua's Linux driver needs a real GNOME/Wayland session with the xdg-desktop-portal RemoteDesktop backend. Options:

| Option | Pros | Cons |
|---|---|---|
| A. One EC2 VM (or microVM) per session running Ubuntu GNOME/Wayland + AutoCua controller | Matches AutoCua's tested path; strong isolation | Heavy: 20 GNOME VMs (cost, boot time, consent dialog, GPU-less Mutter in headless mode unproven) |
| B. CUA XFCE/Kasm containers + **our own** screenshot/xdotool-style input adapter, AutoCua dropped to a reference | Light, mature, remote viewing built in (VNC/Kasm), easy human takeover for OTP/CAPTCHA | Gives up AutoCua's driver; X11 input is easy and well-understood |
| C. Headless GNOME (`gnome-shell --headless`/gnome-remote-desktop) in containers + AutoCua | Reuses AutoCua | Highest risk; portal consent and PipeWire in containers unproven |

My recommendation to benchmark first: **B as primary candidate, A as fallback**, and decide in Phase 2 from measurements. This inverts the spec's "AutoCua as primary" assumption, so I want your sign-off before committing.

## 3. OpenRouter

Documented support in AutoCua. Our own platform requirement (central client, model registry, fallbacks, usage/cost, per-tenant tracking) is independent of AutoCua and will be a custom `backend/openrouter/` module. OpenRouter returns usage and cost fields on responses; to be verified against live API docs in Phase 3 (I have not fetched them yet).

## 4. Environment limits right now

This cloud sandbox has Python 3.13, Docker CLI and Xvfb, but **no GNOME Shell, no GUI session, no OpenRouter key, and an egress proxy**. So the Phase 2 desktop PoC (real GNOME/Wayland, 1→20 session benchmarks, EC2/Terraform) **cannot be proven here**. What can be done here: build and unit-test the backend, Excel pipeline, planner, action schemas, verification layer, OpenRouter client (mocked) and an XFCE/Xvfb-based PoC if Docker works. Real benchmarks need your AWS/desktop environment.

## 5. Repository note

`/home/user/Test` already contains an unrelated **Vite + React site ("Moholla")**. The platform should not be mixed into it. Proposal: put everything in a new top-level `vision-automation-platform/` directory (or a fresh repo) and leave the Moholla files untouched.

## 6. Decisions needed before Phase 2

1. Is AT-SPI + OCR element indexing acceptable as "vision-based", or must the model act on raw screenshots only?
2. Primary desktop strategy: A (GNOME VMs), B (XFCE containers + own adapter), or C?
3. Where should the project live (`vision-automation-platform/` inside this repo vs a new repo)?
4. Do you have an OpenRouter key and an AWS account available for real benchmarks? (Secrets must go through the credential flow, never chat.)
