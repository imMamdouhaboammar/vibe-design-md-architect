import { rule, section, has } from './utils.js';

export const productRules = [
  rule('missing-target-users', 'PRODUCT.md needs target users', 'product-clarity', 'error', 'PRODUCT.md', (ctx) => {
    return ctx.files['PRODUCT.md'] && !has(ctx.files['PRODUCT.md'], section(['Target User', 'Target Audience', 'Personas', 'ICP']));
  }, 'Add a Target Users section.', 'auto'),
  
  rule('missing-acceptance-criteria', 'PRODUCT.md needs acceptance criteria', 'product-clarity', 'error', 'PRODUCT.md', (ctx) => {
    return ctx.files['PRODUCT.md'] && !has(ctx.files['PRODUCT.md'], section(['Acceptance Criteria', 'Success Criteria']));
  }, 'Add acceptance criteria.', 'auto'),
  
  rule('missing-non-goals', 'PRODUCT.md needs non-goals', 'risk-control', 'error', 'PRODUCT.md', (ctx) => {
    return ctx.files['PRODUCT.md'] && !has(ctx.files['PRODUCT.md'], section(['Non-Goal', 'Out of Scope', 'Anti-Goals']));
  }, 'Add non-goals to protect scope.', 'auto')
];
