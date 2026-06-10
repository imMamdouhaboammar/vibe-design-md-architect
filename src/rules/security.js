import { rule, has } from './utils.js';

export const securityRules = [
  rule('api-key-masking', 'Secrets/API keys must be masked in UI', 'security-and-privacy', 'error', 'DESIGN.md', (ctx) => {
    return ctx.files['DESIGN.md'] && /api\s*key|token|secret|password/i.test(ctx.files['DESIGN.md']) && !/mask|redact|hidden|••••|never display/i.test(ctx.files['DESIGN.md']);
  }, 'Add masking/redaction rule for tokens and secrets.', 'auto'),

  rule('auth-state-handling', 'Missing auth state handling', 'security-and-privacy', 'error', 'DESIGN.md', (ctx) => {
    return ctx.files['DESIGN.md'] && /auth|login|sign in|sign up/i.test(ctx.files['DESIGN.md']) && !has(ctx.files['DESIGN.md'], /auth state|session|logged in/i);
  }, 'Add auth state handling rules.', 'auto')
];
