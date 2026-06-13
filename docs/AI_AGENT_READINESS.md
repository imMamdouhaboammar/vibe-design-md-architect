# AI Agent Readiness System

This document explains the readiness layer added to Vibe Design MD Architect.

The goal is simple: do not hand a vague product brief or weak design file to an AI coding agent.

VDMA now checks whether the project has enough product truth, design judgment, implementation guidance, and safety constraints before code starts.

## What changed

The system now goes beyond the original 23 hard gates.

It adds four cross-cutting checks:

1. `AGENTS.md` support
2. readiness bands
3. taste calibration
4. placeholder blocking

These checks sit above the numbered gates. They are not a replacement for accessibility, responsive, modal, overlay, token, or sensitive-data checks. They make the audit result easier to act on.

## Active agent guidance file

New projects should use:

```text
AGENTS.md
```

Older projects that already have this file remain supported:

```text
AGENT.md
```

Resolution rule:

1. If `AGENTS.md` exists, use it.
2. If only `AGENT.md` exists, use it for compatibility.
3. If neither exists, create `AGENTS.md`.

The active agent guidance file should tell the coding agent which files to read, how large changes should be, which commands to run, and which design constraints must not be invented or ignored.

## Readiness bands

The audit result should produce a decision band.

| Band | Meaning | Action |
|------|---------|--------|
| `blocked` | Critical blockers remain | Do not implement yet |
| `needs-spec-work` | Docs exist, but they are too vague or incomplete | Repair product/design/agent docs first |
| `agent-ready-with-fix-list` | The handoff is mostly usable, but fixes remain | Apply the fix list, rerun audit |
| `agent-ready` | The artifacts are specific enough for implementation | Proceed with the coding agent |

The readiness band matters more than the raw score. A score can look acceptable while a single unresolved placeholder or security issue still blocks implementation.

## Category breakdown

Reports should group issues into practical categories.

Useful categories include:

- product clarity
- design contract
- taste calibration
- placeholders
- agent guidance
- accessibility
- responsive behavior
- viewport governance
- modal and overlay governance
- popup positioning
- sensitive data display
- security and privacy
- implementation scan

The category breakdown answers this question:

```text
What should I fix first?
```

## Taste calibration

Taste calibration prevents the coding agent from defaulting to generic AI UI.

A strong `DESIGN.md` should include these sections.

### Design Read

The Design Read is the agent's short interpretation of the product before it starts designing.

Recommended shape:

```text
Reading this as: [specific product] for [specific user] who needs [specific job] under [specific constraint]. The interface should feel [specific direction], not [anti-reference].
```

This makes weak prompts visible. If the agent cannot write a specific Design Read, the brief is probably not ready.

### Taste Controls

Use three dials from 1 to 10.

| Dial | Meaning |
|------|---------|
| `DESIGN_VARIANCE` | How far the UI can move from default component-system patterns |
| `MOTION_INTENSITY` | How much motion is appropriate for the product and risk level |
| `VISUAL_DENSITY` | How much information the screen can carry |

Examples:

```text
DESIGN_VARIANCE: 3
MOTION_INTENSITY: 2
VISUAL_DENSITY: 8
```

A dense finance dashboard might use high visual density and low motion. A marketing landing page might allow higher variance and more expressive motion.

### Design System Decision

The system should record the baseline:

- Atlassian
- Salesforce Lightning
- Shopify Polaris
- Material Design
- Apple Human Interface
- Custom or hybrid

The decision should explain why the baseline fits. It should not copy another brand's skin.

### Anti-AI-Slop Guidelines

These rules should be product-specific, not generic.

Weak:

```text
Make it premium and modern.
```

Stronger:

```text
Avoid purple-blue gradients, glass cards, sparkle icons, and generic three-card feature grids. Use a quieter institutional dashboard feel with dense but readable tables, clear action hierarchy, and restrained motion.
```

### Agent Handoff

The handoff tells the coding agent what to preserve.

It should include:

- files to read first
- design system baseline
- taste dials
- responsive rules
- accessibility rules
- modal and overlay rules
- sensitive-data rules
- forbidden inventions

### Pre-flight Check

Before implementation, confirm:

- `PRODUCT.md` exists and is specific
- `DESIGN.md` exists and is specific
- `AGENTS.md` or compatible `AGENT.md` exists
- no unresolved placeholders remain
- readiness is not `blocked`
- fix-list items are known

## Placeholder blocking

Placeholders are allowed in starter templates. They are not allowed in implementation handoffs.

Blocked examples:

```text
[audience]
[Feature 1]
[product name]
TODO
TBD
...
```

Why this matters:

- The coding agent will otherwise invent missing product decisions.
- Placeholder text often reaches UI copy, labels, or fake data.
- Placeholder-driven implementation creates false confidence because the app appears complete while the product brief is empty.

## Report behavior

A useful report should show:

```text
Score: 82
Readiness: agent-ready-with-fix-list
Decision: The project can move toward implementation after the listed source fixes are applied.
Top categories:
- placeholders: 1 blocker
- accessibility: 2 warnings
- taste calibration: 1 warning
```

The report should not merely say pass or fail. It should tell the user what to do next.

## Fix-list behavior

When source code has risky issues, the system should not blindly patch everything.

Instead, it should write a fix list for the coding agent:

```text
Read PRODUCT.md, DESIGN.md, and AGENTS.md. Apply every item below. Do not invent design decisions outside the artifacts. Rerun npx vdma audit after applying fixes.
```

This keeps the repair loop safe.

## Compatibility notes

- `AGENTS.md` is preferred.
- `AGENT.md` remains compatible.
- Existing projects should not break only because they use the older filename.
- New generated files should use the new readiness sections.

## Recommended user flow

```bash
npx vdma autopilot
# read score, readiness, categories, and fix list
# repair PRODUCT.md, DESIGN.md, AGENTS.md, or source as needed
npx vdma autopilot
# proceed only when readiness is agent-ready or intentionally accepted by the team
```

## Documentation sync checklist

When the readiness system changes, update:

- `README.md`
- `CHANGELOG.md`
- `SKILL.md`
- `AGENTS.md`
- `CONTRIBUTING.md`
- this file
- package metadata if published files change
