#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = process.cwd();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, '..');

const files = [
  ['INTAKE.session.md', 'assets/intake-session.template.md'],
  ['STANDARDS.search-notes.md', 'assets/standards-search-notes.template.md'],
  ['PRODUCT.md', 'assets/PRODUCT.template.md'],
  ['DESIGN.md', 'assets/DESIGN.template.md'],
];

for (const [target, template] of files) {
  const targetPath = path.join(PROJECT_ROOT, target);
  const templatePath = path.join(SKILL_ROOT, template);
  if (!fs.existsSync(templatePath)) {
    console.error(`missing template: ${templatePath}`);
    process.exit(1);
  }
  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(templatePath, targetPath);
    console.log(`created ${target}`);
  } else {
    console.log(`exists ${target}`);
  }
}

const expectedDirs = ['src', 'app', 'pages', 'components', 'styles', 'public'];
const found = expectedDirs.filter((dir) => fs.existsSync(path.join(PROJECT_ROOT, dir)));
console.log(`project scan: ${found.length ? found.join(', ') : 'no common frontend dirs found'}`);
