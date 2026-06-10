#!/usr/bin/env node
// Deep accessibility scanner for AI-generated UI.
// Static analysis (no DOM); pairs with scan-ui-implementation.mjs but goes deeper on
// ARIA correctness, landmarks, heading order, names, and focus semantics.
// Maps findings to WCAG 2.2 and the failures in references/ai-failure-patterns.md (section A).
//
// Usage: node scripts/scan-accessibility.mjs [srcDir] [--strict]
//   default srcDir = "src". --strict makes warnings fail the run too.
// Exit 1 if any blocker (or any warning under --strict).

import fs from 'node:fs';
import path from 'node:path';

const target = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'src';
const strict = process.argv.includes('--strict');
const exts = new Set(['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte']);
const skipDirs = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'coverage', '.turbo', '.vercel']);

// WAI-ARIA 1.2 role names (common subset).
const validRoles = new Set([
  'alert','alertdialog','application','article','banner','button','cell','checkbox','columnheader',
  'combobox','complementary','contentinfo','definition','dialog','directory','document','feed','figure',
  'form','grid','gridcell','group','heading','img','link','list','listbox','listitem','log','main','marquee',
  'math','menu','menubar','menuitem','menuitemcheckbox','menuitemradio','navigation','none','note','option',
  'presentation','progressbar','radio','radiogroup','region','row','rowgroup','rowheader','scrollbar','search',
  'searchbox','separator','slider','spinbutton','status','switch','tab','table','tablist','tabpanel','term',
  'textbox','timer','toolbar','tooltip','tree','treegrid','treeitem','meter','blockquote','caption','code',
  'deletion','emphasis','insertion','paragraph','strong','subscript','superscript','time','generic','tabpanel',
]);

// Elements whose implicit role makes an explicit role redundant.
const redundantRole = [
  { el: 'button', role: 'button' },
  { el: 'a', role: 'link' },
  { el: 'nav', role: 'navigation' },
  { el: 'main', role: 'main' },
  { el: 'header', role: 'banner' },
  { el: 'footer', role: 'contentinfo' },
  { el: 'ul', role: 'list' },
  { el: 'ol', role: 'list' },
  { el: 'li', role: 'listitem' },
  { el: 'table', role: 'table' },
  { el: 'form', role: 'form' },
  { el: 'aside', role: 'complementary' },
];

const findings = [];
function add(level, wcag, rule, file, line, excerpt) {
  findings.push({ level, wcag, rule, file, line, excerpt: (excerpt || '').trim().slice(0, 160) });
}
function lineOf(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}
function attrsHave(attrs, name) {
  return new RegExp(`(^|\\s)${name}\\s*=`, 'i').test(attrs);
}

function scanFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const isHtml = /\.html?$/.test(file);

  // 1. Multiple <main> landmarks in one file (WCAG 1.3.1).
  const mains = [...content.matchAll(/<main\b/gi)];
  if (mains.length > 1) {
    add('blocker', '1.3.1', `multiple <main> landmarks in one file (${mains.length})`, file, lineOf(content, mains[1].index), '<main>');
  }

  // 2. Non-semantic landmark divs (WCAG 1.3.1) -> info.
  const landmarkClass = /<div\b[^>]*\b(?:class|className)\s*=\s*["'][^"']*\b(navbar|nav-bar|header|site-header|footer|site-footer|sidebar|main-content)\b/gi;
  for (const m of content.matchAll(landmarkClass)) {
    add('info', '1.3.1', `div used where a landmark element (header/nav/main/footer/aside) is clearer`, file, lineOf(content, m.index), m[0]);
  }

  // 3. Heading order: multiple h1 and skipped levels (WCAG 1.3.1 / 2.4.6).
  const headings = [...content.matchAll(/<h([1-6])\b/gi)].map(m => ({ level: +m[1], index: m.index }));
  const h1s = headings.filter(h => h.level === 1);
  if (h1s.length > 1) {
    add('blocker', '1.3.1', `more than one <h1> in a single file (${h1s.length})`, file, lineOf(content, h1s[1].index), '<h1>');
  }
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level - headings[i - 1].level > 1) {
      add('blocker', '1.3.1', `heading level jumps from h${headings[i - 1].level} to h${headings[i].level} (skipped level)`, file, lineOf(content, headings[i].index), `<h${headings[i].level}>`);
    }
  }

  // 4. Images without alt (WCAG 1.1.1). Skip spread props.
  for (const m of content.matchAll(/<img\b([^>]*?)\/?>/gi)) {
    const attrs = m[1];
    if (/\{\.\.\./.test(attrs)) continue;
    if (!attrsHave(attrs, 'alt')) {
      add('blocker', '1.1.1', 'img without alt attribute (use alt="" if decorative)', file, lineOf(content, m.index), m[0]);
    }
  }

  // 5. aria-hidden on interactive/focusable elements (WCAG 4.1.2).
  for (const m of content.matchAll(/<(button|a|input|select|textarea)\b([^>]*)>/gi)) {
    if (/aria-hidden\s*=\s*["'{]?\s*true/i.test(m[2])) {
      add('blocker', '4.1.2', `aria-hidden="true" on interactive <${m[1].toLowerCase()}> removes it from a11y tree`, file, lineOf(content, m.index), m[0]);
    }
  }

  // 6. Positive tabindex (WCAG 2.4.3).
  for (const m of content.matchAll(/tab[iI]ndex\s*=\s*["'{]?\s*([1-9]\d*)/g)) {
    add('blocker', '2.4.3', `positive tabindex (${m[1]}) breaks natural focus order; use 0 or -1`, file, lineOf(content, m.index), m[0]);
  }

  // 7. Invalid or redundant role values (WCAG 4.1.2).
  for (const m of content.matchAll(/\brole\s*=\s*["']([a-z\- ]+)["']/gi)) {
    const roleVal = m[1].trim().toLowerCase().split(/\s+/)[0];
    if (roleVal && !validRoles.has(roleVal)) {
      add('blocker', '4.1.2', `unknown ARIA role "${roleVal}"`, file, lineOf(content, m.index), m[0]);
    }
  }
  for (const { el, role } of redundantRole) {
    const re = new RegExp(`<${el}\\b[^>]*\\brole\\s*=\\s*["']${role}["']`, 'gi');
    for (const m of content.matchAll(re)) {
      add('info', '4.1.2', `redundant role="${role}" on <${el}> (it is the implicit role)`, file, lineOf(content, m.index), m[0]);
    }
  }

  // 8. Icon-only buttons/links without an accessible name (WCAG 4.1.2 / 2.4.4).
  for (const m of content.matchAll(/<(button|a)\b([^>]*)>([\s\S]*?)<\/\1>/gi)) {
    const [, tag, attrs, inner] = m;
    const named = /aria-label\s*=|aria-labelledby\s*=|title\s*=/i.test(attrs);
    const textInner = inner.replace(/<[^>]+>/g, '').replace(/\{[^}]*\}/g, '').replace(/[\s\u00A0]+/g, '');
    const hasIcon = /<svg\b|<[A-Z][A-Za-z0-9]*Icon\b|<Icon\b|lucide|className=["'][^"']*\bicon\b/.test(inner);
    if (!named && !textInner && hasIcon) {
      add('blocker', '4.1.2', `icon-only <${tag.toLowerCase()}> with no accessible name (add aria-label)`, file, lineOf(content, m.index), m[0].slice(0, 120));
    }
  }

  // 9. Form controls without a programmatic label (WCAG 1.3.1 / 4.1.2).
  for (const m of content.matchAll(/<(input|select|textarea)\b([^>]*?)\/?>/gi)) {
    const tag = m[1].toLowerCase();
    const attrs = m[2];
    const type = (attrs.match(/type\s*=\s*["']([a-z]+)["']/i) || [])[1];
    if (tag === 'input' && /^(hidden|submit|button|reset|image)$/i.test(type || '')) continue;
    if (/\{\.\.\./.test(attrs)) continue;
    const labeled = /aria-label\s*=|aria-labelledby\s*=/i.test(attrs);
    const hasId = /\bid\s*=/i.test(attrs);
    if (!labeled && !hasId) {
      add('blocker', '1.3.1', `<${tag}> has no label association (add a <label for>, id, or aria-label)`, file, lineOf(content, m.index), m[0].slice(0, 120));
    }
  }

  // 10. Clickable non-interactive element missing full keyboard semantics (WCAG 2.1.1 / 4.1.2).
  for (const m of content.matchAll(/<(div|span|li|td|tr|p)\b([^>]*)>/gi)) {
    const attrs = m[2];
    if (!/\bonClick\s*=|\(click\)|@click/i.test(attrs)) continue;
    const hasRole = /\brole\s*=/i.test(attrs);
    const hasTab = /tab[iI]ndex\s*=/i.test(attrs);
    const hasKey = /onKeyDown|onKeyUp|onKeyPress|\(keydown|@keydown|@keyup/i.test(attrs);
    if (!(hasRole && hasTab && hasKey)) {
      const missing = [!hasRole && 'role', !hasTab && 'tabindex', !hasKey && 'key handler'].filter(Boolean).join(', ');
      add('blocker', '2.1.1', `clickable <${m[1].toLowerCase()}> missing ${missing} (prefer <button>/<a>)`, file, lineOf(content, m.index), m[0].slice(0, 120));
    }
  }

  // 11. aria-labelledby / aria-describedby referencing an id not present in the same file (WCAG 1.3.1) -> info.
  const idsInFile = new Set([...content.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(x => x[1]));
  for (const m of content.matchAll(/\baria-(labelledby|describedby)\s*=\s*["']([^"'{]+)["']/gi)) {
    for (const ref of m[2].trim().split(/\s+/)) {
      if (ref && !idsInFile.has(ref)) {
        add('info', '1.3.1', `aria-${m[1]} points to id "${ref}" not found in this file (verify it exists)`, file, lineOf(content, m.index), m[0]);
      }
    }
  }

  // 12. Duplicate ids within a file (WCAG 4.1.1-era hygiene).
  const idCounts = {};
  for (const m of content.matchAll(/\bid\s*=\s*["']([^"'{]+)["']/g)) {
    idCounts[m[1]] = (idCounts[m[1]] || 0) + 1;
  }
  for (const [id, count] of Object.entries(idCounts)) {
    if (count > 1) add('blocker', '4.1.1', `duplicate id "${id}" used ${count} times in one file`, file, 0, `id="${id}"`);
  }

  // 13. HTML documents: <html> language and direction (WCAG 3.1.1).
  if (isHtml && /<html\b/i.test(content)) {
    const htmlTag = content.match(/<html\b[^>]*>/i)[0];
    if (!/\blang\s*=/.test(htmlTag)) add('blocker', '3.1.1', '<html> missing lang attribute', file, lineOf(content, content.search(/<html\b/i)), htmlTag);
    if (!/\bdir\s*=/.test(htmlTag)) add('info', '1.3.2', '<html> has no dir attribute (set dir="rtl" for Arabic shells)', file, lineOf(content, content.search(/<html\b/i)), htmlTag);
  }

  // 14. autofocus (WCAG 2.4.3 / predictability) -> info.
  for (const m of content.matchAll(/\bauto[fF]ocus\b/g)) {
    add('info', '2.4.3', 'autofocus can disorient screen-reader and keyboard users; confirm it is intentional', file, lineOf(content, m.index), m[0]);
  }

  // 15. Empty link/button text with no children at all (WCAG 2.4.4).
  for (const m of content.matchAll(/<(button|a)\b([^>]*)>\s*<\/\1>/gi)) {
    if (!/aria-label\s*=|aria-labelledby\s*=|title\s*=/i.test(m[2])) {
      add('blocker', '2.4.4', `empty <${m[1].toLowerCase()}> with no accessible name`, file, lineOf(content, m.index), m[0]);
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
if (!files.length) {
  console.log(`no scannable files found under ${target}`);
  process.exit(0);
}
for (const file of files) scanFile(file);

const blockers = findings.filter(f => f.level === 'blocker');
const warnings = findings.filter(f => f.level === 'blocker');
const infos = findings.filter(f => f.level === 'info');

function print(group, label) {
  if (!group.length) return;
  console[label === 'blocker' ? 'error' : 'warn'](`\nAccessibility ${label}s (${group.length}):`);
  for (const f of group) {
    const loc = f.line ? `${f.file}:${f.line}` : f.file;
    console[label === 'blocker' ? 'error' : 'warn'](`- [WCAG ${f.wcag}] ${f.rule} at ${loc}`);
    if (f.excerpt) console[label === 'blocker' ? 'error' : 'warn'](`  ${f.excerpt}`);
  }
}

print(infos, 'info');
print(warnings, 'blocker');
print(blockers, 'blocker');

const failOn = strict ? blockers.length + warnings.length : blockers.length;
console.log(`\nScanned ${files.length} file(s): ${blockers.length} blocker(s), ${warnings.length} warning(s), ${infos.length} info.`);
if (failOn) {
  console.error(`Accessibility scan failed${strict ? ' (strict)' : ''}.`);
  process.exit(1);
}
console.log('Accessibility scan passed.');
