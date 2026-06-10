import { rule, has } from './utils.js';

export const uxRules = [
  rule('deterministic-interaction-states', 'DESIGN.md must use deterministic state tokens', 'ux-completeness', 'error', 'DESIGN.md', (ctx) => {
    const d = ctx.files['DESIGN.md'];
    if (!d) return false;
    return /loading/i.test(d) && !/(animate-pulse|spinner|opacity-50|cursor-not-allowed|disabled)/i.test(d);
  }, 'Replace generic loading/disabled states with explicit tokens (e.g., animate-pulse, opacity-50).', 'auto'),
  
  rule('missing-form-validation', 'DESIGN.md needs form validation behavior', 'ux-completeness', 'error', 'DESIGN.md', (ctx) => {
    const d = ctx.files['DESIGN.md'];
    return d && has(d, /form|input|submit/i) && !has(d, /validation|error copy|submission state/i);
  }, 'Add form validation behavior rules.', 'auto')
];
