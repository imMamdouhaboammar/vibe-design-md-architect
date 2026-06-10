import { rule, has } from './utils.js';

export const designRules = [
  rule('overflow-hidden-risk', 'overflow: hidden may mask layout bugs', 'risk-control', 'error', 'DESIGN.md', (ctx) => {
    return ctx.files['DESIGN.md'] && /overflow\s*:\s*hidden/i.test(ctx.files['DESIGN.md']) && !/intentional|mask|clip|layout bug/i.test(ctx.files['DESIGN.md']);
  }, 'Document why overflow hidden is needed or remove it.', 'suggested'),

  rule('vague-modern', 'Vague design language needs concrete criteria', 'content-quality', 'info', 'DESIGN.md', (ctx) => {
    return ctx.files['DESIGN.md'] && /make it modern|clean and modern|beautiful UI/i.test(ctx.files['DESIGN.md']);
  }, 'Replace vague adjectives with layout, component, state, and interaction requirements.', 'manual'),

  rule('no-sparkle-icons', 'Sparkle icons are considered AI slop', 'anti-ai-slop', 'error', 'DESIGN.md', (ctx) => {
    return ctx.files['DESIGN.md'] && /sparkle|✨/i.test(ctx.files['DESIGN.md']);
  }, 'Remove sparkle icons and replace with standard icons.', 'auto'),

  rule('no-brain-icons', 'Brain icons are considered AI slop', 'anti-ai-slop', 'error', 'DESIGN.md', (ctx) => {
    return ctx.files['DESIGN.md'] && /brain|🧠/i.test(ctx.files['DESIGN.md']);
  }, 'Remove brain icons and replace with standard icons.', 'auto'),

  rule('no-emojis', 'Emojis are strictly forbidden in the UI', 'anti-ai-slop', 'error', 'DESIGN.md', (ctx) => {
    const d = ctx.files['DESIGN.md'];
    if (!d) return false;
    return /emoji/i.test(d) || /(?![\u00A9\u00AE\u2122])[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(d);
  }, 'Remove emojis from the design and use proper vector icons instead.', 'auto')
];
