#!/usr/bin/env node
// UI implementation scanner.
// Catches the AI-generated UI failures documented in references/ai-failure-patterns.md.
// blocker rules fail the scan (exit 1). warning rules are reported but do not fail.
import fs from 'node:fs';
import path from 'node:path';

const target = process.argv[2] || 'src';
const exts = new Set(['.js', '.jsx', '.ts', '.tsx', '.html', '.vue', '.svelte', '.css', '.scss', '.mdx']);
const skipDirs = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'coverage', '.turbo', '.vercel']);

// level: 'blocker' fails the run; 'blocker' is reported only.
const rules = [
  // F2 native popups
  { name: 'native browser popup: alert', level: 'blocker', pattern: /\b(?:window\.)?alert\s*\(/g },
  { name: 'native browser popup: confirm', level: 'blocker', pattern: /\b(?:window\.)?confirm\s*\(/g },
  { name: 'native browser popup: prompt', level: 'blocker', pattern: /\b(?:window\.)?prompt\s*\(/g },
  // A1 clickable non-interactive elements
  { name: 'clickable div instead of button/link (A1)', level: 'blocker', pattern: /<div[^>]*\bonClick\b/gi },
  { name: 'clickable span instead of button/link (A1)', level: 'blocker', pattern: /<span[^>]*\bonClick\b/gi },
  // A2/A4 focus removed with no replacement (warning: scanner cannot prove a focus-visible fallback exists)
  { name: 'focus outline removed, verify focus-visible fallback (A2/A4)', level: 'blocker', pattern: /outline:\s*['"]?none|outline-none/gi },
  // C2 placeholder / fake data
  { name: 'lorem ipsum placeholder content (C2)', level: 'blocker', pattern: /lorem\s+ipsum/gi },
  { name: 'fake data: John Doe / Jane Doe (C2)', level: 'blocker', pattern: /\b(John|Jane)\s+Doe\b/g },
  { name: 'fake data: example email (C2)', level: 'blocker', pattern: /\b[\w.]+@example\.(com|org|net)\b/gi },
  { name: 'fake data: Item 1/2/3 (C2)', level: 'blocker', pattern: /\bItem\s+1\b[\s\S]{0,40}\bItem\s+2\b/g },
  // B2 generic gradient
  { name: 'generic gradient identity (B2)', level: 'blocker', pattern: /bg-gradient|from-purple|to-blue|from-blue|to-purple|from-fuchsia|to-cyan|from-indigo|to-indigo|aurora|neon/gi },
  // B3 default font
  { name: 'default Inter font, no brand justification (B3)', level: 'blocker', pattern: /font-family:\s*['"]?Inter\b|font-\[Inter\]/gi },
  // E1 hardcoded values
  { name: 'hardcoded hex color outside tokens (E1)', level: 'blocker', pattern: /(?:color|background(?:-color)?|border-color|fill|stroke):\s*#[0-9a-fA-F]{3,8}\b/g },
  // D2 overflow trap
  { name: 'blanket overflow:hidden on layout container (D2)', level: 'blocker', pattern: /overflow:\s*hidden|overflow-hidden/gi },
  // decorative glass default
  { name: 'decorative glass default (anti-slop)', level: 'blocker', pattern: /glassmorphism|backdrop-blur|bg-white\/10|bg-black\/10/gi },
  // emoji as UI
  { name: 'emoji used in UI source (icon system)', level: 'blocker', pattern: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu },
  // sparkle / magic icons / brain icons
  { name: 'sparkle, brain, or magic icon default (anti-slop)', level: 'blocker', pattern: /\b(Sparkles?|Wand2?|MagicWand|Starburst|Glitter|Robot|Brain)\b/g },
  // V1 viewport: fixed 100vw wrapper may cause horizontal overflow
  { name: 'fixed 100vw wrapper may cause horizontal overflow (V1)', level: 'blocker', pattern: /\b(width:\s*100vw|w-screen)\b/gi },
  // V2 viewport: blind 100vh full-page height
  { name: 'blind 100vh full-page height (V2)', level: 'blocker', pattern: /\b(height:\s*100vh|h-screen)\b/gi },
  // V3 viewport: fixed auth card width without responsive max
  { name: 'fixed auth card width without responsive max (V3)', level: 'blocker', pattern: /\.(auth-card|login-card|signup-card)[^{]{0,80}\{[^}]*(width:\s*[4-9]\d\dpx)/gi },
  // V4 Tailwind: h-screen used without dvh/min-h fallback
  { name: 'Tailwind h-screen used without dvh/min-h fallback (V4)', level: 'blocker', pattern: /\bh-screen\b/g },
  // V5 Tailwind: w-screen with padding risk
  { name: 'Tailwind w-screen with padding risk (V5)', level: 'blocker', pattern: /\bw-screen\b/g },
  // M1 modal: dialog/modal without aria-labelledby or aria-label
  { name: 'modal/dialog without accessible name (M1)', level: 'blocker', pattern: /role\s*=\s*["']dialog["'][^>]{0,200}(?!aria-label)/gi },
  // M2 modal: placeholder used without visible label nearby (heuristic)
  { name: 'input with placeholder but potentially missing label (M2)', level: 'blocker', pattern: /<input[^>]*placeholder\s*=[^>]*(?!<label)/gi },
  // M3 modal: close button with small size risk
  { name: 'close button may have insufficient target size (M3)', level: 'blocker', pattern: /\b(w-4|w-5|h-4|h-5|w-\[16px\]|h-\[16px\]|w-\[20px\]|h-\[20px\])\b[^"']*close/gi },
  // M4 modal: fixed modal width without responsive max
  { name: 'fixed modal width without responsive max (M4)', level: 'blocker', pattern: /\.(modal|dialog|drawer)[^{]{0,80}\{[^}]*(width:\s*[4-9]\d\dpx)/gi },
  // O1 overlay: manual fixed toast in page component
  { name: 'manual fixed toast in page component (O1)', level: 'blocker', pattern: /position:\s*fixed[\s\S]{0,160}(toast|snackbar|notification|success-message)/i },
  // O2 overlay: hardcoded bottom-left/right toast placement
  { name: 'hardcoded toast placement (O2)', level: 'blocker', pattern: /(bottom:\s*\d+px[\s\S]{0,120}(left|right):\s*\d+px[\s\S]{0,60}(toast|snackbar|notification))|((toast|snackbar|notification)[\s\S]{0,120}bottom:\s*\d+px[\s\S]{0,60}(left|right):\s*\d+px)/i },
  // O3 overlay: transparent toast surface
  { name: 'transparent toast surface (O3)', level: 'blocker', pattern: /(toast|snackbar|notification)[\s\S]{0,120}(bg-white\/|bg-green\/|rgba\([^)]*,\s*0\.[0-5]\))/i },
  // O4 overlay: direct z-index in toast/overlay
  { name: 'direct z-index in toast or overlay (O4)', level: 'blocker', pattern: /(toast|snackbar|notification)[\s\S]{0,120}(z-index:\s*\d+|z-\[\d+\])/i },
  // S1 sensitive: exposed API key or secret token pattern
  { name: 'exposed secret token pattern in display (S1)', level: 'blocker', pattern: /\b(sk_live_|sk_test_|pk_live_|pk_test_|whsec_|ghp_|gho_|glpat-)[a-zA-Z0-9]{8,}/g },
];

// Heuristic multi-line rule: onClick on a custom element with no nearby key handler (A2).
function scanOnClickWithoutKey(content, file, findings) {
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (/\bonClick\s*=/.test(lines[i]) && /<(div|span|li|td|tr)\b/i.test(lines[i])) {
      const windowText = lines.slice(Math.max(0, i - 1), i + 3).join('\n');
      if (!/onKeyDown|onKeyUp|onKeyPress|role=/.test(windowText)) {
        findings.push({ file, line: i + 1, level: 'blocker', rule: 'onClick on non-interactive element without keyboard handler (A2)', excerpt: lines[i].trim().slice(0, 160) });
      }
    }
  }
}

// Heuristic: blanket overflow:hidden on root/page-level CSS selectors.
function scanRootOverflowHidden(content, file, findings) {
  const rootPatterns = /(?:^|\s|,)\s*(html|body|#root|#app|\.page|\.auth-page|main)\s*\{[^}]*overflow\s*:\s*hidden/gim;
  let match;
  while ((match = rootPatterns.exec(content)) !== null) {
    const lineNum = content.slice(0, match.index).split(/\r?\n/).length;
    findings.push({ file, line: lineNum, level: 'blocker', rule: 'blanket overflow:hidden on root/page shell (V6)', excerpt: match[0].trim().slice(0, 160) });
  }
}

// Heuristic: Tailwind root overflow-hidden freeze on min-h-screen or h-screen wrapper.
function scanTailwindRootOverflowFreeze(content, file, findings) {
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/<(main|div|section)\b/i.test(line) && /className\s*=\s*["'][^"']*(min-h-screen|h-screen)[^"']*overflow-hidden/i.test(line)) {
      findings.push({ file, line: i + 1, level: 'blocker', rule: 'Tailwind root overflow-hidden freeze risk (V7)', excerpt: line.trim().slice(0, 160) });
    }
  }
}

// Heuristic: modal/dialog element without focus trap indicators.
function scanModalWithoutFocusTrap(content, file, findings) {
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/role\s*=\s*["']dialog["']/i.test(line) || /\bDialog\b|\bModal\b/.test(line) && /</.test(line)) {
      const windowText = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 15)).join('\n');
      if (!/FocusTrap|focus-trap|trapFocus|useFocusTrap|createFocusTrap|FocusScope|inert|aria-modal/i.test(windowText)) {
        findings.push({ file, line: i + 1, level: 'blocker', rule: 'modal/dialog without focus trap indicator (M5)', excerpt: line.trim().slice(0, 160) });
      }
    }
  }
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) walk(full, files);
    } else if (exts.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(target);
const findings = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    for (const rule of rules) {
      rule.pattern.lastIndex = 0;
      if (rule.pattern.test(line)) {
        findings.push({ file, line: index + 1, level: rule.level, rule: rule.name, excerpt: line.trim().slice(0, 160) });
      }
    }
  }
  scanOnClickWithoutKey(content, file, findings);
  scanRootOverflowHidden(content, file, findings);
  scanTailwindRootOverflowFreeze(content, file, findings);
  scanModalWithoutFocusTrap(content, file, findings);
}

if (!files.length) {
  console.log(`no files found under ${target}`);
  process.exit(0);
}

const blockers = findings.filter(f => f.level === 'blocker');
const warnings = findings.filter(f => f.level === 'blocker');

if (warnings.length) {
  console.warn(`UI scan warnings (${warnings.length})`);
  for (const f of warnings) {
    console.warn(`- [warn] ${f.rule} at ${f.file}:${f.line}`);
    console.warn(`  ${f.excerpt}`);
  }
}

if (blockers.length) {
  console.error(`UI implementation scan failed (${blockers.length} blockers)`);
  for (const f of blockers) {
    console.error(`- ${f.rule} at ${f.file}:${f.line}`);
    console.error(`  ${f.excerpt}`);
  }
  process.exit(1);
}

console.log(`UI implementation scan passed${warnings.length ? ` (${warnings.length} warnings)` : ''}`);
