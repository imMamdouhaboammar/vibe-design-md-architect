import { rule, has, section } from './utils.js';

export const agentRules = [
  rule('missing-do-not-break', 'Missing do-not-break regression rules', 'regression-protection', 'error', 'AGENT.md', (ctx) => {
    return ctx.files['AGENT.md'] && !has(ctx.files['AGENT.md'], /(do not break|regression|preserve existing)/i);
  }, 'Add regression guard and do-not-break rules.', 'auto'),

  rule('missing-verification-checklist', 'AGENT.md needs a verification checklist', 'agent-handoff-readiness', 'error', 'AGENT.md', (ctx) => {
    return ctx.files['AGENT.md'] && !has(ctx.files['AGENT.md'], section(['Verification Checklist', 'QA Checklist']));
  }, 'Add verification checklist.', 'auto'),

  rule('missing-agent-handoff', 'DESIGN.md missing agent handoff instructions', 'agent-handoff-readiness', 'info', 'DESIGN.md', (ctx) => {
    return ctx.files['DESIGN.md'] && !has(ctx.files['DESIGN.md'], /agent|handoff/i);
  }, 'Add agent handoff instructions.', 'auto')
];
