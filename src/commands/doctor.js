import { existsSync, accessSync, constants } from 'node:fs';
import { resolve } from 'node:path';
import { summarize } from '../core/auditor.js';
import { printResult } from '../core/output.js';

export async function doctor({ cwd, flags }) { 
  const issues = []; 
  
  // 1. Node Version Check
  const nodeVersion = process.versions.node;
  const major = parseInt(nodeVersion.split('.')[0], 10);
  if (major < 18) {
    issues.push({ id: 'node-version-too-old', title: `Node version ${nodeVersion} is too old.`, category: 'runtime', severity: 'error', suggestedFix: 'Upgrade to Node >= 18' });
  }

  // 2. Package.json
  if (!existsSync(resolve(cwd, 'package.json'))) {
    issues.push({ id: 'package-json-missing', title: 'package.json not found in current directory', category: 'runtime', severity: 'error', suggestedFix: 'Run from a project root.' });
  }
  
  // 3. Git Repo Check
  if (!existsSync(resolve(cwd, '.git'))) {
    issues.push({ id: 'git-repo-missing', title: 'Not a git repository.', category: 'runtime', severity: 'error', suggestedFix: 'Run `git init` to track changes safely.' });
  }

  // 4. Writable Check
  try { 
    accessSync(cwd, constants.W_OK); 
  } catch { 
    issues.push({ id: 'cwd-not-writable', title: 'Current directory is not writable', category: 'runtime', severity: 'error', suggestedFix: 'Fix permissions or choose another directory.' }); 
  }
  
  // 5. Artifacts Existence Check
  for (const f of ['PRODUCT.md', 'DESIGN.md', 'AGENT.md']) {
    if (!existsSync(resolve(cwd, f))) {
      issues.push({ id: `${f.toLowerCase()}-missing`, title: `${f} is not yet created.`, category: 'runtime', severity: 'info', suggestedFix: `Run \`npx vibe-design-md-architect init\` to create it.` });
    }
  }

  const result = summarize({ issues, generated: [], changed: [], repairs: [] }); 
  result.nextCommand = 'vibe-design-md-architect autopilot'; 
  printResult(result, flags); 
  return result; 
}
