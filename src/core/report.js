import { writeText } from './filesystem.js';

function categoryLines(categories = {}) {
  const entries = Object.entries(categories);
  if (!entries.length) return [];

  return [
    '',
    '## Category Breakdown',
    '',
    ...entries
      .sort(([, a], [, b]) => b.total - a.total)
      .map(([name, data]) => `- **${name}**: ${data.total} total (${data.errors} errors, ${data.warnings} warnings, ${data.info} info)`)
  ];
}

export function buildMarkdownReport(result) {
  const summary = result.summary || {};
  const lines = [
    '# Vibe Design MD Architect Report', 
    '', 
    `Score: **${summary.score}/100**`, 
    `Readiness: **${summary.readiness || 'unknown'}**`,
    summary.readinessMessage ? `Decision: ${summary.readinessMessage}` : '',
    `Checks: ${summary.checks} | Errors: ${summary.errors} | Warnings: ${summary.warnings} | Info: ${summary.info}`, 
    ''
  ].filter(Boolean);

  lines.push(...categoryLines(summary.categories));
  
  if (result.issues.length) { 
    lines.push('', '## Issues'); 
    for (const i of result.issues) {
      lines.push(`- **[${i.severity.toUpperCase()}]** ${i.title}`);
      lines.push(`  - *Rule:* \`${i.id}\``);
      lines.push(`  - *Category:* \`${i.category}\``);
      if (i.suggestedFix) lines.push(`  - *Fix:* ${i.suggestedFix}`);
    }
  }
  
  if (result.repairs?.length) { 
    lines.push('', '## Auto Repairs Applied'); 
    for (const r of result.repairs) {
      lines.push(`- **${r.file}**: ${r.action}${r.rule ? ` (\`${r.rule}\`)` : ''}`);
    }
  }
  
  lines.push(
    '', 
    '## Suggested Next Agent Prompt', 
    '', 
    '> Inspect PRODUCT.md, DESIGN.md, AGENTS.md, package.json, routing files, component structure, and existing tests. Read `.vibe-design/fix-list.md` and resolve any listed issues. Implement only the requested scope while preserving existing behavior. Before completion, run `npx vibe-design-md-architect audit`, ensure there are 0 errors, and show the final output score and readiness.'
  );
  
  return lines.join('\n');
}

export function buildFixList(result) {
  const manualFixes = result.issues.filter(i => i.repairability !== 'auto' && !i.id.endsWith('-missing'));
  const summary = result.summary || {};
  
  const lines = [
    'You are an expert AI frontend engineer.',
    'I have run `npx vibe-design-md-architect` on our design documents, and it has flagged the following issues that require human/agent intervention.',
    '',
    `Current readiness: ${summary.readiness || 'unknown'}`,
    summary.readinessMessage ? `Decision: ${summary.readinessMessage}` : '',
    '',
    'Please review PRODUCT.md, DESIGN.md, AGENTS.md, and the files listed below before implementing:',
    ''
  ].filter(Boolean);
  
  if (manualFixes.length === 0) {
    lines.push('No manual fixes required. The design specs look solid!');
  } else {
    for (const i of manualFixes) {
      lines.push(`- [ ] **File**: \`${i.file}\``);
      lines.push(`  - **Issue**: ${i.title}`);
      lines.push(`  - **Category**: \`${i.category}\``);
      if (i.suggestedFix) lines.push(`  - **Required Action**: ${i.suggestedFix}`);
      lines.push('');
    }
    lines.push('When you are done fixing these, run `npx vibe-design-md-architect audit` and confirm the score reaches 100 with readiness `agent-ready`.');
  }
  
  return lines.join('\n');
}

export function writeReports(cwd, result, flags = {}) {
  const md = buildMarkdownReport(result);
  const fixList = buildFixList(result);
  
  writeText(cwd, '.vibe-design/report.md', md, flags);
  writeText(cwd, '.vibe-design/report.json', JSON.stringify(result, null, 2), flags);
  writeText(cwd, '.vibe-design/fix-list.md', fixList, flags);
  
  return ['.vibe-design/report.md', '.vibe-design/report.json', '.vibe-design/fix-list.md'];
}
