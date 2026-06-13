export const productTemplate = `# PRODUCT.md

## Product Summary
[Describe the product in plain language. What is the core value proposition?]

## Target Users & Roles
- **Admin**: [Can manage users, configure settings]
- **Editor**: [Can create and edit content]
- **Viewer**: [Read-only access]

## Jobs To Be Done
- When I [context], I want to [action], so I can [benefit].

## Main Use Cases
- [Use case 1]
- [Use case 2]

## Non-Goals
- The MVP will explicitly NOT [Feature out of scope]
- We will NOT support [Platform/browser] yet.

## Data Boundaries & State Behavior
- What data is cached locally vs fetched?
- What data is strictly server-authoritative?
- Global states vs local component states:

## Core User Flows
1. [Step 1 of core flow]
2. [Step 2]

## Feature List
- [Feature 1]
- [Feature 2]

## Functional Requirements
- The system must [Requirement 1]
- The system must not [Constraint 1]

## Acceptance Criteria (Examples)
- **Given** I am logged out, **when** I visit \`/dashboard\`, **then** I am redirected to \`/login\`.
- **Given** I am an admin, **when** I click 'Delete', **then** a confirmation modal appears before deletion.

## Constraints
- [Technical constraint e.g., Must work without JS?]
- [Resource constraint e.g., API rate limits]

## Risk Notes
- [Known risks and mitigation strategy]

## AI-Agent Implementation Boundaries
- Inspect existing files before editing.
- Change one feature area at a time.
- Preserve existing behavior unless explicitly instructed.
- Ask for confirmation before modifying database schemas or authentication logic.
`;

export const designTemplate = `# DESIGN.md

## Design Principles
- Clear before clever.
- Mobile behavior must be explicit.
- Every interactive component needs loading, empty, error, disabled, hover, focus, and success states.

## Information Architecture & Routes
- \`/\` -> Landing Page (Public)
- \`/login\` -> Auth flow (Public)
- \`/dashboard\` -> Main app (Protected, User role)
- \`/admin\` -> Management (Protected, Admin role)

## Main Screens
- **Dashboard**: [Displays key metrics, recent activity]
- **Settings**: [User profile, notification preferences]

## Component Inventory
- [Layout] Container, Sidebar, Header
- [UI] Button, Modal, Card, Input, Toast

## Responsive Behavior (Deterministic)
- Mobile (<768px): Use `flex-col`, `w-full`, and `p-4` as defaults. Avoid `height: 100vh` (use `min-h-[100dvh]`).
- Tablet (\`md\`: 768px): Use \`md:grid-cols-2\`, \`md:flex-row\`, and \`md:p-6\`.
- Desktop (\`lg\`: 1024px): Use \`lg:grid-cols-3\` and max-width containers (e.g., \`max-w-7xl mx-auto\`).

## Accessibility & Contrast (Deterministic)
AI models cannot visually calculate WCAG contrast. You MUST follow mathematical lightness deltas in Tailwind/CSS:
- **Light Backgrounds (50-200)**: Text MUST be 800-950 (e.g., \`bg-blue-50 text-blue-900\`).
- **Dark Backgrounds (700-950)**: Text MUST be 50-200 or white (e.g., \`bg-gray-900 text-gray-50\`).
- **Mid-tones (300-600)**: AVOID placing text on mid-tones. If necessary, use black or white and mathematically verify contrast.
- **Buttons**: Never use white text on backgrounds lighter than 600. Always explicitly define button text color.
- **Focus Management**: MUST use \`focus-visible:ring-2 focus-visible:ring-offset-2\`. NEVER use \`outline-none\` without a replacement.
- **Modals**: Must strictly trap focus, restore focus on close, and bind close to Escape key.

## Security and Privacy Display
- Never display API keys, raw tokens, or secrets in the UI. Always mask them (e.g., \`••••••••\`).
- Ensure sensitive data is handled properly before rendering.

## Interaction States (Deterministic)
- Loading: MUST use \`animate-pulse\` or an SVG spinner. Never leave the user hanging.
- Disabled: MUST use \`opacity-50 cursor-not-allowed pointer-events-none\`.
- Empty: Must display a clear message and a call-to-action button.
- Error: Must display a red warning text (\`text-red-600\`) and a retry action.

## Form Behavior
- Validation: Validate on blur/submit.
- Error copy: Place directly under the input (\`text-sm text-red-500\`).
- Submission: Disable the submit button and show a loader.

## Visual Consistency Rules
- Reuse existing components before creating new ones.
- Adhere to the established color palette and typography.

## Layout Rules
- Avoid \`overflow: hidden\` as a layout bug mask; use it intentionally for clipping.
- Prefer CSS Grid and Flexbox for structural layout.

## Anti-AI-Slop Guidelines
- Never use "sparkle" icons or "brain" icons; they are known AI slop patterns. Replace them with standard, meaningful UI icons.
- Emojis are strictly forbidden in the UI. Use standard vector icons (e.g., Lucide, Heroicons) instead.

## Content Tone
- Clear, direct, useful.
`;

export const agentTemplate = `# Agent Instructions

## Read This First
Before coding, inspect \`PRODUCT.md\`, \`DESIGN.md\`, \`package.json\`, routing files, component structure, and any existing tests. Do not rush to implementation without understanding the existing architecture.

## What Not To Change
- Do not delete existing features.
- Do not rename public routes or exported APIs without explicit approval.
- Do not replace the design system with unrelated styling.

## Security & API Key Guidelines
- Never expose API keys or secrets in client-facing code.
- If handling tokens, ensure they are masked in UI and not logged to the console.

## Regression Guard
- Preserve existing behavior.
- Limit changes to the requested scope.
- Check git diff before finalizing.
- Add or update tests when behavior changes.

## Verification Checklist (MANDATORY)
You MUST complete these steps and provide proof before considering the task done.
- [ ] App builds successfully.
- [ ] Main flows still work.
- [ ] Mobile layout checked (no horizontal overflow, proper dVHs used).
- [ ] Keyboard navigation checked (Tab, Enter, Space, Escape).
- [ ] Loading, empty, and error states implemented.
- [ ] **CRITICAL**: You MUST run \`npx vibe-design-md-architect audit\` in the terminal.
- [ ] **CRITICAL**: You MUST paste the final score and ensure there are 0 Errors before you complete the task. Do NOT skip this step.

## When To Stop
Stop and ask for review when a change requires:
- Deleting core features.
- Changing data models or schemas.
- Altering auth/security behavior.
- Making broad redesign decisions.

## Visual & Mobile QA Checklist
- [ ] No horizontal scrolling on mobile (\`overflow-x-hidden\` checked).
- [ ] Tap targets are at least \`44x44px\` for touch devices.
- [ ] Color contrast passes mathematical deltas.
- [ ] All forms have explicit validation boundaries and error messages.
`;

export function templateFor(file) {
  if (file === 'PRODUCT.md') return productTemplate;
  if (file === 'DESIGN.md') return designTemplate;
  if (file === 'AGENT.md' || file === 'AGENTS.md') return agentTemplate;
  return '';
}