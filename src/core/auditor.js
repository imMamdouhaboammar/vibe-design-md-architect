import { readText } from './filesystem.js';
import { rules } from '../rules/index.js';

export function loadContext(cwd) {
  const files = {
    'PRODUCT.md': readText(cwd, 'PRODUCT.md'),
    'DESIGN.md': readText(cwd, 'DESIGN.md'),
    'AGENTS.md': readText(cwd, 'AGENTS.md'),
    'AGENT.md': readText(cwd, 'AGENT.md')
  };

  const agentInstructionFile = files['AGENTS.md'] ? 'AGENTS.md' : (files['AGENT.md'] ? 'AGENT.md' : null);
  const agentInstructions = agentInstructionFile ? files[agentInstructionFile] : '';
  const all = Object.values(files).filter(Boolean).join('\n\n');

  return { cwd, files, all, agentInstructionFile, agentInstructions };
}

export function runAudit(cwd) {
  const ctx = loadContext(cwd);
  const issues = rules.filter((r) => r.test(ctx)).map(({ test, ...rest }) => rest);
  return summarize({ issues, generated: [], changed: [], repairs: [] });
}

export function summarize(result) {
  const errors = result.issues.filter((i) => i.severity === 'error').length;
  const warnings = result.issues.filter((i) => i.severity === 'warning').length;
  const info = result.issues.filter((i) => i.severity === 'info').length;
  const score = Math.max(0, 100 - errors * 18 - warnings * 7 - info * 2);
  return { ...result, summary: { score, checks: rules.length, errors, warnings, info } };
}
