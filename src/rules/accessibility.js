import { rule, has } from './utils.js';

export const accessibilityRules = [
  rule('missing-keyboard-navigation', 'DESIGN.md needs keyboard navigation rules', 'accessibility', 'error', 'DESIGN.md', (ctx) => {
    return ctx.files['DESIGN.md'] && !has(ctx.files['DESIGN.md'], /(keyboard|tab order|focus)/i);
  }, 'Add keyboard and focus requirements.', 'auto'),

  rule('deterministic-focus-management', 'DESIGN.md must use deterministic focus rings', 'accessibility', 'error', 'DESIGN.md', (ctx) => {
    const d = ctx.files['DESIGN.md'];
    if (!d) return false;
    return /focus/i.test(d) && !/(focus-visible|ring-|outline-none)/i.test(d);
  }, 'Replace generic focus rules with deterministic tokens (e.g., focus-visible:ring-2).', 'auto'),

  rule('modal-without-focus-trap', 'Modal is mentioned without focus-trap behavior', 'accessibility', 'error', 'DESIGN.md', (ctx) => {
    return has(ctx.files['DESIGN.md'], /modal|dialog|popover/i) && !has(ctx.files['DESIGN.md'], /focus\s*trap|trap\s*focus/i);
  }, 'Specify modal focus trap, Escape close, and focus restore.', 'auto'),

  rule('deterministic-contrast-math', 'DESIGN.md must use deterministic contrast math for AI', 'accessibility', 'error', 'DESIGN.md', (ctx) => {
    const d = ctx.files['DESIGN.md'];
    if (!d) return false;
    return !/(delta|math|deterministic|50-200|800-950|lighter than 600)/i.test(d);
  }, 'Replace generic WCAG guidance with explicit deterministic math deltas.', 'auto')
];
