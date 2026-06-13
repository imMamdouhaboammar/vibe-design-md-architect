import { rule, has, section } from './utils.js';

const DESIGN_DIALS = ['DESIGN_VARIANCE', 'MOTION_INTENSITY', 'VISUAL_DENSITY'];

function designDoc(ctx) {
  return ctx.files['DESIGN.md'] || '';
}

function hasAllDesignDials(doc) {
  return DESIGN_DIALS.every((dial) => new RegExp(`\\b${dial}\\b\\s*:?\\s*(?:[1-9]|10)\\b`, 'i').test(doc));
}

function extractDialValues(doc) {
  return DESIGN_DIALS.flatMap((dial) => {
    const matches = [...doc.matchAll(new RegExp(`\\b${dial}\\b\\s*:?\\s*(-?\\d+)`, 'gi'))];
    return matches.map((match) => ({ dial, value: Number(match[1]) }));
  });
}

function hasDefaultAiAesthetic(doc) {
  return /\b(ai[-\s]?purple|purple gradient|dark mesh|mesh gradient|glassmorphism on everything|three equal feature cards|generic hero|centered hero over dark)\b/i.test(doc);
}

export const tasteRules = [
  rule(
    'missing-design-read',
    'DESIGN.md needs a brief-inferred Design Read',
    'taste-calibration',
    'warning',
    'DESIGN.md',
    (ctx) => {
      const doc = designDoc(ctx);
      return Boolean(doc) && !has(doc, section(['Design Read', 'Brief Inference'])) && !/Reading this as:/i.test(doc);
    },
    'Add a Design Read that states page kind, audience, visual language, and aesthetic or design-system direction before implementation.',
    'auto'
  ),

  rule(
    'missing-taste-dials',
    'DESIGN.md needs explicit taste controls',
    'taste-calibration',
    'warning',
    'DESIGN.md',
    (ctx) => {
      const doc = designDoc(ctx);
      return Boolean(doc) && !hasAllDesignDials(doc);
    },
    'Add DESIGN_VARIANCE, MOTION_INTENSITY, and VISUAL_DENSITY values from 1 to 10.',
    'auto'
  ),

  rule(
    'invalid-taste-dial-range',
    'Taste control values must stay within 1-10',
    'taste-calibration',
    'error',
    'DESIGN.md',
    (ctx) => {
      const doc = designDoc(ctx);
      if (!doc) return false;
      return extractDialValues(doc).some(({ value }) => value < 1 || value > 10);
    },
    'Keep every taste control value between 1 and 10.',
    'manual'
  ),

  rule(
    'missing-design-system-decision',
    'DESIGN.md needs a design-system decision',
    'design-system-governance',
    'warning',
    'DESIGN.md',
    (ctx) => {
      const doc = designDoc(ctx);
      return Boolean(doc) && !has(doc, section(['Design System Decision', 'Design System Choice', 'Visual System Decision', 'Design Foundation'])) && !/\b(shadcn|radix|tailwind|material|fluent|carbon|polaris|primer|govuk|uswds|bootstrap)\b/i.test(doc);
    },
    'Declare the design foundation: official design system, existing system, or bespoke CSS/Tailwind direction. Avoid mixing systems.',
    'auto'
  ),

  rule(
    'default-ai-aesthetic-risk',
    'DESIGN.md contains default AI-looking aesthetic language',
    'anti-ai-slop',
    'warning',
    'DESIGN.md',
    (ctx) => {
      const doc = designDoc(ctx);
      return Boolean(doc) && hasDefaultAiAesthetic(doc) && !/avoid|ban|do not|forbid|anti-default|anti ai/i.test(doc);
    },
    'Replace generic AI visual defaults with brief-specific layout, typography, material, motion, and density decisions.',
    'manual'
  ),

  rule(
    'missing-preflight-proof',
    'DESIGN.md needs pre-flight proof before implementation',
    'agent-handoff-readiness',
    'info',
    'DESIGN.md',
    (ctx) => {
      const doc = designDoc(ctx);
      return Boolean(doc) && !has(doc, section(['Pre-flight Check', 'Preflight Check', 'Implementation Preflight', 'Pre-flight Proof']));
    },
    'Add a pre-flight checklist that confirms design read, dials, responsive rules, accessibility, states, and security display rules.',
    'auto'
  )
];
