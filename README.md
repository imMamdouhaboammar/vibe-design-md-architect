<div align="center">

# Vibe Design MD Architect

### Stop AI coding agents from shipping generic, fragile frontend work.

**23 hard design gates plus AI-agent readiness, taste calibration, placeholder detection, and AGENTS.md guidance before implementation starts.**

[![Socket Badge](https://badge.socket.dev/npm/package/vibe-design-md-architect/1.9.3)](https://badge.socket.dev/npm/package/vibe-design-md-architect/1.9.3)
[![npm](https://img.shields.io/npm/v/vibe-design-md-architect?style=flat-square&color=5B21B6&label=npm)](https://www.npmjs.com/package/vibe-design-md-architect)
[![skills.sh](https://img.shields.io/badge/skills.sh-install-5B21B6?style=flat-square)](https://skills.sh/imMamdouhaboammar/vibe-design-md-architect)
[![Gates](https://img.shields.io/badge/gates-23-F59E0B?style=flat-square)](./SKILL.md)
[![Version](https://img.shields.io/badge/version-1.9.3-3B82F6?style=flat-square)](./CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-22C55E?style=flat-square)](./LICENSE)

```bash
npx vibe-design-md-architect autopilot
```

One command creates or repairs `PRODUCT.md`, `DESIGN.md`, and `AGENTS.md`, runs the gates, scores readiness, writes a fix list, and blocks implementation until the design artifacts are strong enough for an AI coding agent.

[Autopilot](#autopilot) · [Quick Start](#quick-start) · [Readiness](#readiness-bands) · [Taste Calibration](#taste-calibration) · [CLI](#cli-reference) · [Gates](#23-hard-gates) · [Changelog](./CHANGELOG.md)

</div>

---

## What this is

Vibe Design MD Architect is a pre-implementation quality gate for AI-assisted frontend work.

It does not replace your coding agent. It prepares the project before the coding agent writes UI code. The system forces the agent to work from product truth, design intent, accessibility rules, responsive rules, privacy rules, and implementation handoff instructions instead of inventing a generic SaaS interface from a short prompt.

The current system supports:

- `PRODUCT.md` strategy context
- `DESIGN.md` design contract
- `AGENTS.md` instructions for AI coding agents
- hard blockers for accessibility, RTL/LTR, viewport, modals, overlays, tokens, sensitive data, and popup positioning
- taste calibration rules inspired by strong design-brief workflows
- placeholder detection so `[audience]`, `TODO`, `TBD`, and template leftovers do not reach implementation
- readiness bands and category breakdowns, not just a raw score
- safe repair and agent-readable fix lists

## The problem

AI coding agents usually skip design decisions.

They choose purple gradients, default fonts, equal feature cards, fake data, hardcoded colors, weak modals, fragile dropdowns, and scroll hacks. They often produce something that looks acceptable in a screenshot but breaks with real users, small screens, keyboard navigation, RTL, or sensitive data.

Vibe Design MD Architect blocks that before code starts.

## When to use it

Use it when you are building or reviewing:

- SaaS dashboards and admin panels
- landing pages and product pages
- Arabic RTL or bilingual RTL/LTR products
- AI-assisted UI builds in Claude Code, Cursor, Codex, Windsurf, Cline, Amp, or similar tools
- design systems before frontend implementation
- product specs that need to become implementation-ready UI instructions
- weak or old `DESIGN.md` files that need a controlled repair

Do not use it for backend-only work, database-only tasks, non-UI scripts, or projects with a mature design system that does not need `PRODUCT.md`, `DESIGN.md`, or `AGENTS.md`.

## What's new in v1.9.3

This release adds the AI-agent readiness layer:

- `AGENTS.md` is now the primary agent guidance file.
- `init`, `audit`, `repair`, reports, templates, and package publishing all understand `AGENTS.md`.
- Readiness bands explain whether the project is blocked, needs spec work, is agent-ready with fixes, or is agent-ready.
- Category breakdowns show where the risk lives: product clarity, taste calibration, placeholders, accessibility, security, responsive behavior, and more.
- Taste rules require a Design Read, Taste Controls, Design System Decision, Anti-AI-Slop rules, Agent Handoff, and Pre-flight Check.
- Placeholder gates block raw templates and vague placeholders before a coding agent starts.

Read the full technical note in [`docs/AI_AGENT_READINESS.md`](./docs/AI_AGENT_READINESS.md).

## How it works

```text
Your prompt or repository
   ↓
PRODUCT.md
   Product strategy, users, job, risks, brand traits, accessibility, localization
   ↓
DESIGN.md
   Design Read, Taste Controls, design system decision, tokens, components, rules
   ↓
AGENTS.md
   Project-specific instructions for AI coding agents
   ↓
Audit
   23 hard gates plus readiness, taste, placeholder, accessibility, security, and UX checks
   ↓
Repair
   Safe missing sections are added, risky source fixes are written to a fix list
   ↓
Readiness decision
   blocked, needs-spec-work, agent-ready-with-fix-list, or agent-ready
   ↓
Implementation allowed only when the artifacts are specific enough
```

## Quick Start

### Option A: run with npx

```bash
npx vibe-design-md-architect autopilot
```

### Option B: initialize artifacts first

```bash
npx vibe-design-md-architect init
npx vibe-design-md-architect audit
npx vibe-design-md-architect repair --dry-run --report
```

### Option C: install in a project

```bash
npm install --save-dev vibe-design-md-architect
npx vdma autopilot
```

### Option D: install globally

```bash
npm install -g vibe-design-md-architect
vdma autopilot
```

### Option E: install as a skill

```bash
npx skills add https://github.com/imMamdouhaboammar/vibe-design-md-architect --skill vibe-design-md-architect
```

Shorthand:

```bash
npx skills add imMamdouhaboammar/vibe-design-md-architect
```

## Autopilot

```bash
npx vdma autopilot
```

Autopilot runs the full loop:

1. Attempts required setup checks.
2. Creates missing `PRODUCT.md`, `DESIGN.md`, and `AGENTS.md`.
3. Repairs safe missing sections.
4. Runs the rules engine.
5. Scans frontend source when present.
6. Writes `.vibe-design/report.md`, `.vibe-design/report.json`, and agent-readable fix instructions.
7. Repeats until it reaches the pass limit or the project is ready.

Useful options:

```bash
npx vdma autopilot --max-passes=5
npx vdma autopilot --no-source-scan
npx vdma autopilot --no-impeccable
npx vdma autopilot --dry-run
```

## Readiness bands

The audit result now gives a practical decision instead of only a score.

| Band | Meaning | Action |
|------|---------|--------|
| `blocked` | Critical artifact, safety, placeholder, accessibility, or security issue | Do not implement yet |
| `needs-spec-work` | The docs exist but are still too vague for an AI agent | Repair or rewrite the weak sections |
| `agent-ready-with-fix-list` | The docs are mostly usable, but source or design fixes remain | Apply the generated fix list, then rerun audit |
| `agent-ready` | The artifacts are specific enough for implementation | Proceed with the coding agent |

Category breakdowns make the score easier to act on. A low score now points to the exact class of risk instead of leaving the user with a single unexplained number.

## Taste calibration

The taste system adds design judgment before implementation.

`DESIGN.md` should now include:

- **Design Read**: the agent's interpretation of the product, user, tension, and visual direction.
- **Taste Controls**: `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY`, each from 1 to 10.
- **Design System Decision**: the baseline system and the reason it fits.
- **Anti-AI-Slop Guidelines**: specific patterns to avoid for this product.
- **Agent Handoff**: what the coding agent must preserve.
- **Pre-flight Check**: final proof that the design is ready before code starts.

This is the difference between "make it modern" and a useful UI direction a coding agent can follow.

## Placeholder gates

The audit blocks unresolved placeholders in `PRODUCT.md` and `DESIGN.md`, including patterns such as:

- `[audience]`
- `[Feature 1]`
- `TODO`
- `TBD`
- `...`
- template-only filler

A placeholder can be useful in a starter template. It is dangerous in an implementation handoff. VDMA treats unresolved placeholders as a blocker before UI work starts.

## CLI Reference

```bash
npx vibe-design-md-architect <command> [args]
```

Short alias:

```bash
npx vdma <command> [args]
```

| Command | What it does |
|---------|--------------|
| `autopilot` | Runs init, audit, safe repair, scans, reports, and fix-list generation |
| `init` | Creates missing `PRODUCT.md`, `DESIGN.md`, and `AGENTS.md` |
| `audit` | Runs artifact gates and prints score, readiness, and category breakdown |
| `repair` | Adds safe missing sections and prepares agent-readable fixes |
| `report` | Writes `.vibe-design/report.md` and `.vibe-design/report.json` |
| `doctor` | Checks runtime and project assumptions |
| `update` | Updates the CLI package |

Common usage:

```bash
npx vdma init
npx vdma audit --verbose
npx vdma repair --dry-run --report
npx vdma autopilot
```

## 23 hard gates

Implementation stays blocked until the relevant gates pass.

| # | Gate | What it enforces |
|---|------|------------------|
| 1 | Design System Baseline | Select a baseline before design work |
| 2 | Intake Session | Capture product, user, job, localization, and risk context |
| 3 | Standards Search | Check current WCAG, MDN, web.dev, and framework guidance when possible |
| 4 | Impeccable Install | Record or run `npx impeccable skills install` before UI work |
| 5 | PRODUCT.md | Strategy artifact exists and passes contract |
| 6 | DESIGN.md Contract | Required design sections and decisions exist |
| 7 | Rules Engine | All artifact gates run consistently |
| 8 | Accessibility and Directionality | Focus, contrast, ARIA, LTR by default, RTL when required |
| 9 | UX-CRX Logic | Primary action, secondary action, recovery path, and decision point per screen |
| 10 | Mobile and Responsive | Mobile is designed deliberately, not stacked from desktop |
| 11 | Popup and Feedback System | No native `alert()` or `confirm()` for product flows |
| 12 | Implementation Scan | Source blockers are detected before handoff |
| 13 | Amplify Preservation | Strong existing decisions are kept during repair |
| 14 | Semantic HTML and Interaction | No clickable divs, broken keyboard behavior, or missing landmarks |
| 15 | Realistic Content | No lorem ipsum, fake people, or sample-only records |
| 16 | Design Tokens | No hardcoded hex, magic numbers, or token drift |
| 17 | Drift Control | Single source of truth and gates rerun per merge |
| 18 | Viewport Governance | Scroll ownership, `dvh` fallback, and no root overflow hacks |
| 19 | Modal and Dialog | Focus trap, scroll lock, safe sizing, inert background |
| 20 | Dashboard Shell | Declared grid, scroll ownership, auth hierarchy, form quality |
| 21 | Overlay Stack | Centralized overlays, toast rules, collision handling |
| 22 | Sensitive Data Display | Mask tokens, secure creation flow, destructive confirmations |
| 23 | Popup and Floating Positioning | Strategy A/B/C, flip/shift/size, portal mounting, z-index tokens |

## What it blocks

### Visual defaults

| Pattern | Why it is blocked |
|---------|-------------------|
| Purple to blue gradient | Default AI identity choice |
| Gradient text headings | Common AI visual tell |
| Generic glass cards | Decoration without hierarchy |
| Equal feature-card grids | No product-specific emphasis |
| Sparkle and magic wand icons | Lazy AI metaphor |
| Default `Inter` everywhere | Uncurated type decision |
| Dark cyber SaaS look | Generic product skin |

### Functional failures

| Failure | Impact |
|---------|--------|
| Clickable `<div>` | Keyboard and screen reader failure |
| Missing visible label | Forms become unclear after typing |
| `height: 100vh` on auth screens | Mobile keyboard and small viewport breakage |
| Root `overflow: hidden` | Scroll, zoom, and keyboard traps |
| Modal without focus trap | Tab escapes to background |
| Dropdown inside overflow parent | Options get clipped |
| API token visible in a table | Security UX failure |

## Scanners

```bash
npx vdma scan src/
npx vdma scan:a11y src/
npx vdma scan:a11y src/ --strict
npx vdma scan:viewport http://localhost:3000
```

The scanners detect source-level issues that the artifact rules cannot safely auto-patch. Those issues are written into fix-list output for the coding agent.

## Generated artifacts

After a healthy run, a project can contain:

```text
PRODUCT.md                  product strategy and constraints
DESIGN.md                   design contract and implementation rules
AGENTS.md                   instructions for AI coding agents
.vibe-design/report.md      human-readable audit report
.vibe-design/report.json    machine-readable audit result
.vibe-design/fix-list.md    agent-readable fix list when source issues exist
VDMA-FIXES.md               source fix handoff from autopilot scans
```

## Documentation map

| File | Purpose |
|------|---------|
| [`SKILL.md`](./SKILL.md) | Full skill behavior for agent runtimes |
| [`AGENTS.md`](./AGENTS.md) | Repository-level guidance for AI coding agents |
| [`CHANGELOG.md`](./CHANGELOG.md) | Release history |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Gate, scanner, template, and docs update workflow |
| [`docs/AI_AGENT_READINESS.md`](./docs/AI_AGENT_READINESS.md) | Readiness, taste, placeholder, and report behavior |
| [`references/`](./references/) | Detailed rule references |
| [`assets/`](./assets/) | Templates used to generate project artifacts |

## Repository structure

```text
vibe-design-md-architect/
├── bin/                         CLI entrypoint
├── src/
│   ├── commands/                init, audit, repair, report, autopilot
│   ├── core/                    auditor, templates, reporter, filesystem helpers
│   └── rules/                   product, design, taste, placeholder, agent, UX rules
├── scripts/                     standalone scanners and validators
├── assets/                      generated artifact templates
├── references/                  detailed rule references
├── docs/                        documentation for system behavior
├── tests/                       Node test runner coverage
├── AGENTS.md                    agent guidance for this repository
├── SKILL.md                     skill runtime instructions
├── CHANGELOG.md                 release history
└── package.json
```

## Recommended workflow

```bash
npx vdma autopilot
# read the readiness band and fix list
# apply required fixes
npx vdma autopilot
# proceed only when readiness is agent-ready or intentionally accepted by the team
```

## Contributing

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before adding a gate, scanner, template, or documentation update. Any behavior change should update the docs in the same pull request.

## Current version

**v1.9.3**

- AGENTS.md support across init, audit, repair, reports, and package publishing
- readiness bands and category scoring
- taste calibration rules
- placeholder gates for product and design artifacts
- updated generated templates with Design Read, Taste Controls, Design System Decision, Agent Handoff, and Pre-flight Check

<div align="center">

**Built for AI-first frontend workflows that need judgment before code.**

[GitHub](https://github.com/imMamdouhaboammar/vibe-design-md-architect) · [npm](https://www.npmjs.com/package/vibe-design-md-architect) · [skills.sh](https://skills.sh/imMamdouhaboammar/vibe-design-md-architect/vibe-design-md-architect) · [Issues](https://github.com/imMamdouhaboammar/vibe-design-md-architect/issues)

</div>
