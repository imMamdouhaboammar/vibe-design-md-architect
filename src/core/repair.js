import { appendText, exists, writeText, readText } from './filesystem.js';
import { templateFor } from './templates.js';

const AGENT_INSTRUCTION_TARGET = '__AGENT_INSTRUCTIONS__';

const autoSections = {
  'missing-target-users': ['PRODUCT.md', `## Target Users\n- Primary user:\n- Secondary user:`],
  'missing-acceptance-criteria': ['PRODUCT.md', `## Acceptance Criteria\n- Given..., when..., then...`],
  'missing-non-goals': ['PRODUCT.md', `## Non-Goals\n- The MVP will not...`],
  
  'deterministic-mobile-behavior': ['DESIGN.md', `## Responsive Behavior\n- Mobile (<768px): Use \`flex-col\`, \`w-full\`, and \`p-4\` as defaults. Avoid \`height: 100vh\`.`],
  'deterministic-tablet-behavior': ['DESIGN.md', `## Tablet Behavior\n- Tablet (\`md\`: 768px): Use \`md:grid-cols-2\`, \`md:flex-row\`, and \`md:p-6\`.`],
  'missing-responsive-warning': ['DESIGN.md', `## Responsive Viewport Safety\n- Ensure proper viewport meta tag is used and test layouts on mobile widths.`],
  
  'deterministic-interaction-states': ['DESIGN.md', `## Interaction States (Deterministic)\n- Loading: MUST use \`animate-pulse\` or an SVG spinner.\n- Disabled: MUST use \`opacity-50 cursor-not-allowed pointer-events-none\`.`],
  'missing-form-validation': ['DESIGN.md', `## Form Behavior\n- Validation: Validate on blur/submit.\n- Error copy: Place directly under the input (\`text-sm text-red-500\`).`],
  
  'missing-keyboard-navigation': ['DESIGN.md', `## Keyboard Navigation\n- All interactive elements must be reachable by keyboard.\n- Focus states must be visible.`],
  'deterministic-focus-management': ['DESIGN.md', `## Focus Management\n- MUST use \`focus-visible:ring-2 focus-visible:ring-offset-2\`. NEVER use \`outline-none\` without a replacement.`],
  'modal-without-focus-trap': ['DESIGN.md', `## Modal Accessibility\n- Trap focus while the modal is open.\n- Close with Escape.\n- Restore focus to the trigger on close.`],
  'deterministic-contrast-math': ['DESIGN.md', `## Accessibility & Contrast (Deterministic Math)\n- AI models cannot visually calculate WCAG contrast. Follow mathematical lightness deltas.\n- **Light Backgrounds (50-200)**: Text MUST be 800-950.\n- **Dark Backgrounds (700-950)**: Text MUST be 50-200 or white.\n- **Mid-tones (300-600)**: AVOID placing text on mid-tones. Use black or white if necessary.\n- **Buttons**: Never use white text on backgrounds lighter than 600.`],
  
  'no-sparkle-icons': ['DESIGN.md', `## Anti-AI-Slop Guidelines\n- Never use "sparkle" icons; they are known AI slop patterns. Replace them with standard UI icons.`],
  'no-brain-icons': ['DESIGN.md', `## Anti-AI-Slop Guidelines\n- Never use "brain" icons; they are known AI slop patterns. Replace them with standard UI icons.`],
  'no-emojis': ['DESIGN.md', `## Anti-AI-Slop Guidelines\n- Emojis are strictly forbidden in the UI. Use standard vector icons (e.g., Lucide, Heroicons) instead.`],
  
  'height-100vh-mobile-risk': ['DESIGN.md', `## Mobile Viewport Safety\n- Avoid raw height: 100vh on mobile. Prefer min-height: 100dvh or documented safe viewport handling.`],
  
  'api-key-masking': ['DESIGN.md', `## Security and Privacy Display\n- Never show full API keys, tokens, or secrets in UI. Mask or redact values by default.`],
  'auth-state-handling': ['DESIGN.md', `## Auth State Handling\n- Define UI for logged-out vs logged-in states.\n- Handle expired sessions gracefully.`],
  
  'missing-do-not-break': [AGENT_INSTRUCTION_TARGET, `## Do-Not-Break Rules\n- Preserve existing behavior.\n- Do not delete routes, state, styles, tests, or data flows unless explicitly requested.`],
  'missing-verification-checklist': [AGENT_INSTRUCTION_TARGET, `## Verification Checklist\n- [ ] Build passes.\n- [ ] Tests pass.\n- [ ] Main flows checked.\n- [ ] Mobile behavior checked.\n- [ ] Accessibility basics checked.`],
  'missing-agent-handoff': ['DESIGN.md', `## Agent Handoff Instructions\n- Inspect before coding.\n- Summarize planned edits.\n- Verify responsive and accessibility behavior after changes.`]
};

function activeAgentInstructionFile(cwd) {
  if (exists(cwd, 'AGENTS.md')) return 'AGENTS.md';
  if (exists(cwd, 'AGENT.md')) return 'AGENT.md';
  return 'AGENTS.md';
}

function resolveSectionFile(cwd, file) {
  return file === AGENT_INSTRUCTION_TARGET ? activeAgentInstructionFile(cwd) : file;
}

export function applyRepairs(cwd, issues, flags = {}) {
  const generated = []; 
  const changed = []; 
  const repairs = [];
  
  for (const file of ['PRODUCT.md', 'DESIGN.md']) {
    if (!exists(cwd, file)) { 
      writeText(cwd, file, templateFor(file), flags); 
      generated.push(file); 
      repairs.push({ file, action: 'created template' }); 
    }
  }

  const agentInstructionFile = activeAgentInstructionFile(cwd);
  if (!exists(cwd, agentInstructionFile)) {
    writeText(cwd, agentInstructionFile, templateFor(agentInstructionFile), flags);
    generated.push(agentInstructionFile);
    repairs.push({ file: agentInstructionFile, action: 'created template' });
  }
  
  for (const issue of issues) {
    if (issue.repairability !== 'auto' || issue.id.endsWith('-missing')) continue;
    const section = autoSections[issue.id]; 
    if (!section) continue;

    const targetFile = resolveSectionFile(cwd, section[0]);
    const fileContent = readText(cwd, targetFile) || '';
    const startMarker = `<!-- vibe-design-md-architect:start ${issue.id} -->`;
    const endMarker = `<!-- vibe-design-md-architect:end ${issue.id} -->`;
    
    if (fileContent.includes(startMarker)) {
      continue; // Skip if already injected
    }
    
    const contentToInject = `\n${startMarker}\n${section[1]}\n${endMarker}\n`;
    appendText(cwd, targetFile, contentToInject, flags);
    
    if (!changed.includes(targetFile)) changed.push(targetFile);
    repairs.push({ file: targetFile, rule: issue.id, action: 'appended safe section' });
  }
  
  return { generated, changed, repairs };
}
