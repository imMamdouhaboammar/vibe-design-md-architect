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

function categorySummary(issues) {
  return issues.reduce((acc, issue) => {
    const key = issue.category || 'uncategorized';
    acc[key] ||= { errors: 0, warnings: 0, info: 0, total: 0 };
    acc[key].total += 1;
    if (issue.severity === 'error') acc[key].errors += 1;
    else if (issue.severity === 'warning') acc[key].warnings += 1;
    else acc[key].info += 1;
    return acc;
  }, {});
}

function readinessBand({ score, errors, warnings }) {
  if (errors > 0) return 'blocked';
  if (score < 70 || warnings >= 8) return 'needs-spec-work';
  if (warnings > 0) return 'agent-ready-with-fix-list';
  return 'agent-ready';
}

function readinessMessage(band) {
  if (band === 'blocked') return 'Do not hand this to an AI coding agent yet. Resolve errors first.';
  if (band === 'needs-spec-work') return 'Spec quality is too thin for reliable AI implementation. Tighten the fix list before coding.';
  if (band === 'agent-ready-with-fix-list') return 'Usable for an AI coding agent, but include the fix list in the handoff prompt.';
  return 'Ready for AI-assisted implementation with standard verification.';
}

export function summarize(result) {
  const errors = result.issues.filter((i) => i.severity === 'error').length;
  const warnings = result.issues.filter((i) => i.severity === 'warning').length;
  const info = result.issues.filter((i) => i.severity === 'info').length;
  const score = Math.max(0, 100 - errors * 18 - warnings * 7 - info * 2);
  const band = readinessBand({ score, errors, warnings });
  return {
    ...result,
    summary: {
      score,
      checks: rules.length,
      errors,
      warnings,
      info,
      readiness: band,
      readinessMessage: readinessMessage(band),
      categories: categorySummary(result.issues)
    }
  };
}
