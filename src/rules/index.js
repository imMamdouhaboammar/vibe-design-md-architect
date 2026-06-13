import { rule } from './utils.js';
import { productRules } from './product.js';
import { designRules } from './design.js';
import { placeholderRules } from './placeholders.js';
import { responsiveRules } from './responsive.js';
import { uxRules } from './ux.js';
import { accessibilityRules } from './accessibility.js';
import { securityRules } from './security.js';
import { agentRules } from './agent.js';
import { tasteRules } from './taste.js';

const docs = ['PRODUCT.md', 'DESIGN.md'];

// Implementation Readiness (File existence)
const readinessRules = [
  ...docs.map((file) => rule(
    `${file.toLowerCase().replace('.md','')}-missing`,
    `${file} is missing`,
    'implementation-readiness',
    'error',
    file,
    (ctx) => !ctx.files[file],
    `Create ${file}.`,
    'auto'
  )),
  rule(
    'agent-instructions-missing',
    'Agent instruction file is missing',
    'implementation-readiness',
    'error',
    'AGENTS.md',
    (ctx) => !ctx.files['AGENTS.md'] && !ctx.files['AGENT.md'],
    'Create AGENTS.md. Legacy AGENT.md is still accepted when already present.',
    'auto'
  )
];

export const rules = [
  ...readinessRules,
  ...productRules,
  ...designRules,
  ...placeholderRules,
  ...tasteRules,
  ...responsiveRules,
  ...uxRules,
  ...accessibilityRules,
  ...securityRules,
  ...agentRules
];
